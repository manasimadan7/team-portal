import { useEffect, useMemo, useRef, useState } from 'react'
import { ME, ROLES, roleOf, team } from '../../data/team'
import { BackIcon, ChatIcon, CloseIcon, SendIcon, SpaceIcon } from './icons'
import { usePortal } from '../../state/portal'
import './Chat.css'

/**
 * In-app team chat (Google-Chat-style plugin) — not in Figma; styled with the portal tokens.
 * Conversations: one space for the whole placement team + a DM per member.
 * Replies are simulated so the prototype feels live. State persists in localStorage.
 */

export const SPACE = 'space:placement-team'
type Msg = { id: string; from: string; text: string; at: number }
type Store = { msgs: Record<string, Msg[]>; unread: Record<string, number> }

const KEY = 'pp-chat-v1'
const min = 60_000
const now = Date.now()
const seed: Store = {
  msgs: {
    [SPACE]: [
      { id: 's1', from: 'Meera Joshi', text: 'BCG pre-placement talk is confirmed for Monday, 11am.', at: now - 95 * min },
      { id: 's2', from: 'Priya Nair', text: 'Flipkart shortlist is out — 18 students 🎉', at: now - 40 * min },
      { id: 's3', from: 'Rohan Gupta', text: 'Goldman wants to move interview slots to Thursday. Can anyone cover the morning?', at: now - 12 * min },
    ],
    'Priya Nair': [{ id: 'p1', from: 'Priya Nair', text: 'Hey Ravi, can you share the Google JD when you get a sec?', at: now - 25 * min }],
    'Arjun Mehta': [
      { id: 'a1', from: ME, text: 'Did Infosys confirm the dates?', at: now - 180 * min },
      { id: 'a2', from: 'Arjun Mehta', text: 'Yes — 14th to 16th. IAF filled too.', at: now - 170 * min },
    ],
  },
  unread: { [SPACE]: 2, 'Priya Nair': 1 },
}

const REPLIES = [
  'On it!',
  'Sure, I’ll update the tracker.',
  'Thanks — will check and get back to you.',
  'Sounds good 👍',
  'Can we sync at 4?',
  'Noted. I’ll loop in the company POC.',
]

const load = (): Store => {
  try {
    const raw = localStorage.getItem(KEY)
    if (raw) return JSON.parse(raw) as Store
  } catch {
    /* storage unavailable */
  }
  return seed
}

const lastMsg = (s: Store, id: string): Msg | undefined => {
  const list = s.msgs[id]
  return list && list.length ? list[list.length - 1] : undefined
}
const initials =(n: string) => n.split(' ').map((p) => p[0]).join('').slice(0, 2)
const time = (t: number) => new Date(t).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
const titleOf = (id: string) => (id === SPACE ? 'Placement Team' : id)

function Avatar({ id, size = 36 }: { id: string; size?: number }) {
  if (id === SPACE)
    return (
      <span className="chat-avatar chat-avatar--space" style={{ width: size, height: size }}>
        <SpaceIcon />
      </span>
    )
  return (
    <span className={`chat-avatar chat-avatar--${roleOf(id) ?? 'intern'}`} style={{ width: size, height: size }}>
      {initials(id)}
    </span>
  )
}

type Props = { requested: { id: string; n: number } | null }

export default function Chat({ requested }: Props) {
  const { openMember } = usePortal()
  const [open, setOpen] = useState(false)
  const [active, setActive] = useState<string | null>(null)
  const [store, setStore] = useState<Store>(load)
  const [draft, setDraft] = useState('')
  const [filter, setFilter] = useState('')
  const [typing, setTyping] = useState<Record<string, string>>({})
  const listRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    try {
      localStorage.setItem(KEY, JSON.stringify(store))
    } catch {
      /* ignore */
    }
  }, [store])

  // Another page asked to open a conversation
  useEffect(() => {
    if (requested) {
      setOpen(true)
      setActive(requested.id)
    }
  }, [requested])

  // Opening a thread marks it read and focuses the composer
  useEffect(() => {
    if (!open || !active) return
    setStore((s) => (s.unread[active] ? { ...s, unread: { ...s.unread, [active]: 0 } } : s))
    inputRef.current?.focus()
  }, [open, active])

  const thread = active ? store.msgs[active] ?? [] : []
  useEffect(() => {
    listRef.current?.scrollTo({ top: listRef.current.scrollHeight })
  }, [thread.length, active, typing])

  const totalUnread = Object.values(store.unread).reduce((a, b) => a + b, 0)

  const conversations = useMemo(() => {
    const people = team.map((m) => m.name).filter((n) => n !== ME)
    const last = (id: string) => lastMsg(store, id)?.at ?? 0
    const dms = [...people].sort((a, b) => last(b) - last(a) || a.localeCompare(b))
    const f = filter.trim().toLowerCase()
    return { dms: dms.filter((n) => !f || n.toLowerCase().includes(f)), spaceVisible: !f || 'placement team'.includes(f) }
  }, [store, filter])

  const push = (id: string, m: Msg, countUnread: boolean) =>
    setStore((s) => ({
      msgs: { ...s.msgs, [id]: [...(s.msgs[id] ?? []), m] },
      unread: countUnread ? { ...s.unread, [id]: (s.unread[id] ?? 0) + 1 } : s.unread,
    }))

  const send = () => {
    const text = draft.trim()
    if (!text || !active) return
    const id = active
    push(id, { id: crypto.randomUUID(), from: ME, text, at: Date.now() }, false)
    setDraft('')

    // simulated reply
    const responder =
      id === SPACE ? team.filter((m) => m.name !== ME)[Math.floor(Math.random() * (team.length - 1))].name : id
    setTimeout(() => setTyping((t) => ({ ...t, [id]: responder })), 700)
    setTimeout(() => {
      setTyping((t) => {
        const n = { ...t }
        delete n[id]
        return n
      })
      const reading = document.querySelector(`[data-chat-thread="${CSS.escape(id)}"]`) !== null
      push(id, { id: crypto.randomUUID(), from: responder, text: REPLIES[Math.floor(Math.random() * REPLIES.length)], at: Date.now() }, !reading)
    }, 2200)
  }

  const row = (id: string) => {
    const last = lastMsg(store, id)
    const unread = store.unread[id] ?? 0
    return (
      <button key={id} type="button" className={`chat-conv ${unread ? 'is-unread' : ''}`} onClick={() => setActive(id)}>
        <Avatar id={id} />
        <span className="chat-conv__body">
          <span className="chat-conv__top">
            <span className="chat-conv__name">{titleOf(id)}</span>
            {last && <span className="chat-conv__time">{time(last.at)}</span>}
          </span>
          <span className="chat-conv__preview">
            {typing[id]
              ? 'typing…'
              : last
                ? `${last.from === ME ? 'You: ' : id === SPACE ? `${last.from.split(' ')[0]}: ` : ''}${last.text}`
                : id === SPACE
                  ? 'Team space'
                  : ROLES[roleOf(id) ?? 'intern'].label}
          </span>
        </span>
        {unread > 0 && <span className="chat-badge">{unread}</span>}
      </button>
    )
  }

  return (
    <>
      <button
        type="button"
        className={`chat-launcher ${open ? 'is-open' : ''}`}
        aria-label={open ? 'Close chat' : `Open chat${totalUnread ? `, ${totalUnread} unread` : ''}`}
        onClick={() => setOpen((o) => !o)}
      >
        {open ? <CloseIcon size={24} /> : <ChatIcon size={26} />}
        {!open && totalUnread > 0 && <span className="chat-badge chat-badge--launcher">{totalUnread}</span>}
      </button>

      {open && (
        <section className="chat-panel" aria-label="Team chat">
          <header className="chat-head">
            {active ? (
              <>
                <button type="button" className="chat-icon-btn" aria-label="Back to conversations" onClick={() => setActive(null)}>
                  <BackIcon />
                </button>
                <Avatar id={active} size={34} />
                <div className="chat-head__titles">
                  {active === SPACE ? (
                    <p className="chat-head__title">{titleOf(active)}</p>
                  ) : (
                    <button
                      type="button"
                      className="chat-head__title co-link"
                      title={`Open ${active}'s dashboard`}
                      onClick={() => openMember(active)}
                    >
                      {active}
                    </button>
                  )}
                  <p className="chat-head__sub">
                    {active === SPACE ? `${team.length} members` : ROLES[roleOf(active) ?? 'intern'].label}
                  </p>
                </div>
              </>
            ) : (
              <div className="chat-head__titles chat-head__titles--root">
                <p className="chat-head__title">Chat</p>
                <p className="chat-head__sub">Placement team</p>
              </div>
            )}
            <button type="button" className="chat-icon-btn" aria-label="Close chat" onClick={() => setOpen(false)}>
              <CloseIcon />
            </button>
          </header>

          {!active ? (
            <div className="chat-list">
              <input
                className="chat-search"
                placeholder="Search people"
                value={filter}
                onChange={(e) => setFilter(e.target.value)}
              />
              {conversations.spaceVisible && (
                <>
                  <p className="chat-section">Spaces</p>
                  {row(SPACE)}
                </>
              )}
              <p className="chat-section">Direct messages</p>
              {conversations.dms.map(row)}
              {conversations.dms.length === 0 && <p className="chat-empty">No one by that name</p>}
            </div>
          ) : (
            <>
              <div className="chat-thread" ref={listRef} data-chat-thread={active}>
                {thread.length === 0 && (
                  <p className="chat-empty">Say hi to {active.split(' ')[0]} 👋</p>
                )}
                {thread.map((m, i) => {
                  const mine = m.from === ME
                  const showName = active === SPACE && !mine && thread[i - 1]?.from !== m.from
                  return (
                    <div key={m.id} className={`chat-msg ${mine ? 'is-mine' : ''}`}>
                      {showName && <span className="chat-msg__name">{m.from}</span>}
                      <span className="chat-msg__bubble">{m.text}</span>
                      <span className="chat-msg__time">{time(m.at)}</span>
                    </div>
                  )
                })}
                {typing[active] && (
                  <div className="chat-msg">
                    {active === SPACE && <span className="chat-msg__name">{typing[active]}</span>}
                    <span className="chat-msg__bubble chat-typing" aria-label="typing">
                      <i />
                      <i />
                      <i />
                    </span>
                  </div>
                )}
              </div>
              <form
                className="chat-compose"
                onSubmit={(e) => {
                  e.preventDefault()
                  send()
                }}
              >
                <input
                  ref={inputRef}
                  value={draft}
                  onChange={(e) => setDraft(e.target.value)}
                  placeholder={`Message ${active === SPACE ? 'Placement Team' : active.split(' ')[0]}`}
                />
                <button type="submit" className="chat-send" aria-label="Send" disabled={!draft.trim()}>
                  <SendIcon />
                </button>
              </form>
            </>
          )}
        </section>
      )}
    </>
  )
}
