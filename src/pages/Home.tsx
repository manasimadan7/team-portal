import { useEffect, useMemo, useRef, useState } from 'react'
import StatusPill, { type CompanyStatus } from '../components/StatusPill'
import ScrollTrack from '../components/ScrollTrack'
import CompanyHistory from '../components/CompanyHistory'
import {
  chips,
  funnel as myFunnel,
  myCompanies,
  notes as seedNotes,
  profile as myProfile,
  rings as myRings,
  type ChipKey,
  type CompanyRow,
} from '../data/home'
import { companyEmail, type TimelineEntry } from '../data/companies'
import { memberDashboard, type FunnelBar } from '../data/memberDashboard'
import { usePortal } from '../state/portal'
import { useChat } from '../components/chat/ChatContext'
import { ChatIcon } from '../components/chat/icons'
import chevronBack from '../assets/icons/chevron-back.svg'

import avatar from '../assets/icons/avatar.svg'
import ringUncontacted from '../assets/icons/ring-uncontacted.svg'
import ringIaf from '../assets/icons/ring-iaf-filled.svg'
import ringSelf from '../assets/icons/ring-self-allotment.svg'
import ringResumes from '../assets/icons/ring-resumes-verified.svg'
import plusLg from '../assets/icons/plus-lg.svg'
import arrowUpRightSm from '../assets/icons/arrow-up-right-sm.svg'
import searchIcon from '../assets/icons/search.svg'
import tableIcon from '../assets/icons/table.svg'
import addIcon from '../assets/icons/add.svg'
import mailIcon from '../assets/icons/mail.svg'
import editIcon from '../assets/icons/edit.svg'
import dropDownIcon from '../assets/icons/arrow-drop-down.svg'
import '../components/StatusChips.css'
import './Home.css'

const RING_IMG: Record<string, string> = {
  uncontacted: ringUncontacted,
  iaf: ringIaf,
  self: ringSelf,
  resumes: ringResumes,
}

const STATUS_OPTIONS: { key: CompanyStatus; label: string }[] = [
  { key: 'uncontacted', label: 'Uncontacted' },
  { key: 'contacted', label: 'Contacted' },
  { key: 'iaf-filled', label: 'IAF Filled' },
]

type View = 'list' | 'table'

const pct = (v: number, of: number) => (of > 0 ? `${Math.round((v / of) * 100)}%` : '—')

type Props = {
  /** show another coordinator's dashboard (same layout as Home) */
  memberName?: string
  onBack?: () => void
}

export default function Home({ memberName, onBack }: Props) {
  const { history, addEntry, openMail, navigate, toast, openCompany, openBoard } = usePortal()
  const { openChat } = useChat()
  const dash = useMemo(() => (memberName ? memberDashboard(memberName) : null), [memberName])
  const profile = dash?.profile ?? myProfile
  const rings = dash?.rings ?? myRings
  const funnel: FunnelBar[] = dash?.funnel ?? myFunnel
  const firstName = profile.name.split(' ')[0]
  const [rows, setRows] = useState<CompanyRow[]>(dash?.rows ?? myCompanies)
  const [query, setQuery] = useState('')
  const [chip, setChip] = useState<ChipKey | null>(null)
  const [view, setView] = useState<View>('list')
  const [expanded, setExpanded] = useState<number | null>(null)
  const [focusNote, setFocusNote] = useState(false)
  const [adding, setAdding] = useState(false)
  const [notes, setNotes] = useState(dash?.notes ?? seedNotes.map((n) => ({ company: n.company.trim(), note: n.note })))
  const [noteForm, setNoteForm] = useState(false)
  /** funnel interaction: hovered/focused bar previews, clicked bar stays pinned (touch) */
  const [hotBar, setHotBar] = useState<number | null>(null)
  const [pinnedBar, setPinnedBar] = useState<number | null>(null)
  const activeBar = hotBar ?? pinnedBar
  const listRef = useRef<HTMLDivElement>(null)
  const noteInput = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (focusNote && noteInput.current) {
      noteInput.current.focus()
      setFocusNote(false)
    }
  }, [focusNote, expanded])

  const counts = useMemo(
    () => ({
      contacted: rows.filter((r) => r.status === 'contacted').length,
      'iaf-filled': rows.filter((r) => r.status === 'iaf-filled').length,
    }),
    [rows],
  )

  const visible = useMemo(() => {
    const q = query.trim().toLowerCase()
    return rows.filter((c) => {
      if (chip && c.status !== chip) return false
      if (q && !`${c.name} ${c.comment}`.toLowerCase().includes(q)) return false
      return true
    })
  }, [rows, query, chip])

  const baseOf = (c: CompanyRow): TimelineEntry[] => [{ date: c.date.replace(/^0/, ''), text: [c.comment] }]
  const rowId = (c: CompanyRow) => `home-${c.id}`

  return (
    <main className={`home ${dash ? 'home--member' : ''}`}>
      {/* ---------- Coordinator view header (not in Figma) ---------- */}
      {dash && (
        <div className="member-bar">
          <button type="button" className="member-bar__back ib" aria-label="Back to Placement Team" title="Back" onClick={onBack}>
            <img src={chevronBack} alt="" width={24} height={24} />
          </button>
          <button type="button" className="member-bar__crumb" onClick={onBack}>
            Placement Team
          </button>
          <span className="member-bar__sep">/</span>
          <span className="member-bar__name">{profile.name}</span>
          <span className={`team-badge team-badge--${dash.member.role}`}>{profile.role}</span>
          <button type="button" className="member-bar__msg" onClick={() => openChat(profile.name)}>
            <ChatIcon size={16} />
            Message {firstName}
          </button>
        </div>
      )}

      {/* ---------- Profile card ---------- */}
      <section className="profile">
        <img src={avatar} alt="" width={94} height={94} className="profile__avatar" />
        <div className="profile__card">
          <div className="profile__head t-24-regular">
            <p>{profile.name}</p>
            <p className="profile__role">{profile.role}</p>
          </div>
          <p className="profile__line">{profile.department}</p>
          <p className="profile__line">{profile.year}</p>
        </div>
      </section>

      {/* ---------- Ring stats ---------- */}
      <div className="rings">
        {rings.map((r) => (
          <div key={r.key} className="ring-item">
            <img
              src={RING_IMG[r.key]}
              alt=""
              className="ring"
              style={{ left: r.left }}
              width={114.824}
              height={114.824}
            />
            <p className="ring__value" style={{ left: r.valueX, color: r.color }}>
              {r.value}
            </p>
            <p className="ring__label" style={{ left: r.labelX }}>
              {r.label}
            </p>
          </div>
        ))}
      </div>

      {/* ---------- Funnel bars ---------- */}
      <div className={`funnel ${activeBar !== null ? 'has-active' : ''}`} onMouseLeave={() => setHotBar(null)}>
        <p className="funnel__title">Outreach funnel</p>
        {funnel.map((b, i) => (
          <div key={i} className={`funnel-col ${activeBar === i ? 'is-active' : ''}`}>
            {/* hit area spanning the bar column + caption: hover/focus previews, click pins */}
            <button
              type="button"
              className="funnel-hit"
              style={{ left: b.left, width: b.width }}
              aria-label={`${b.label.join(' ')}: ${b.value}`}
              aria-pressed={pinnedBar === i}
              onMouseEnter={() => setHotBar(i)}
              onFocus={() => setHotBar(i)}
              onBlur={() => setHotBar(null)}
              onClick={() => {
                // second tap on the pinned bar closes it (touch has no mouseleave)
                if (pinnedBar === i) {
                  setPinnedBar(null)
                  setHotBar(null)
                } else setPinnedBar(i)
              }}
            />
            {activeBar === i && (
              <div
                className={`funnel-tip ${i >= funnel.length - 2 ? 'funnel-tip--end' : i < 2 ? 'funnel-tip--start' : ''}`}
                style={{ left: b.left + b.width / 2, top: b.top - 10 }}
                role="status"
              >
                <p className="funnel-tip__title">{b.label.join(' ')}</p>
                <p className="funnel-tip__value">{b.value}</p>
                <p className="funnel-tip__row">
                  <span>Of allotted</span>
                  <b>{pct(b.value, funnel[0].value)}</b>
                </p>
                {i > 0 && (
                  <p className="funnel-tip__row">
                    <span title={`From ${funnel[i - 1].label.join(' ')}`}>From previous stage</span>
                    <b>{pct(b.value, funnel[i - 1].value)}</b>
                  </p>
                )}
                {i < funnel.length - 1 && (
                  <p className="funnel-tip__row funnel-tip__row--muted">
                    <span>Drop-off to next</span>
                    <b>{Math.max(0, b.value - funnel[i + 1].value)}</b>
                  </p>
                )}
              </div>
            )}
            <div className="bar-wrap">
              <div
                className="bar"
                style={{ left: b.left, top: b.top, width: b.width, height: b.height, opacity: b.opacity }}
              />
              <p
                className={`bar__value ${(b.empty ?? b.value === 0) ? 'bar__value--empty' : ''} ${b.centered ? 'bar__value--center' : ''}`}
                style={{ left: b.valueLeft, top: b.valueTop }}
              >
                {b.value}
              </p>
            </div>
            <div className="bar__caption" style={{ left: b.captionLeft }}>
              <p>
                {b.label.map((l, j) => (
                  <span key={j}>{l}</span>
                ))}
              </p>
            </div>
          </div>
        ))}
      </div>

      {/* ---------- Notes ---------- */}
      <section className="notes">
        <p className="notes__title t-24-regular">Notes</p>
        <button
          type="button"
          className={`notes__open ib ${noteForm ? 'is-on' : ''}`}
          aria-label={noteForm ? 'Close new note' : 'Add a note'}
          aria-expanded={noteForm}
          onClick={() => setNoteForm((v) => !v)}
        >
          <img src={plusLg} alt="" width={44} height={44} />
        </button>
        <div className="notes__list">
          {noteForm && (
            <form
              className="notes__form"
              onSubmit={(e) => {
                e.preventDefault()
                const f = e.currentTarget
                const company = (f.elements.namedItem('company') as HTMLInputElement).value.trim()
                const note = (f.elements.namedItem('note') as HTMLInputElement).value.trim()
                if (!company || !note) return
                setNotes((n) => [{ company, note }, ...n])
                f.reset()
                setNoteForm(false)
              }}
            >
              <input name="company" placeholder="Company" aria-label="Company" autoFocus />
              <input name="note" placeholder="Note" aria-label="Note" />
              <button type="submit" className="btn-primary">
                Add
              </button>
            </form>
          )}
          {notes.map((n, i) => (
            <div key={`${n.company}-${i}`} className="notes__row">
              <p className="notes__company">{n.company}</p>
              <p className="notes__text">{n.note}</p>
              <button
                type="button"
                className="notes__done"
                aria-label={`Mark "${n.note}" done`}
                title="Mark done"
                onClick={() => setNotes((all) => all.filter((_, j) => j !== i))}
              >
                ✓
              </button>
            </div>
          ))}
          {notes.length === 0 && <p className="notes__empty">All caught up.</p>}
        </div>
      </section>

      {/* ---------- My Companies ---------- */}
      <section className="companies">
        <div className="companies__header">
          <p className="t-24-regular companies__title">{dash ? `${firstName}'s Companies` : 'My Companies'}</p>

          <label className="search">
            <img src={searchIcon} alt="" width={16} height={16} />
            <input type="text" placeholder="Search" value={query} onChange={(e) => setQuery(e.target.value)} />
          </label>

          {/* List | Kanban toggle (replaces Figma's two round icons — same glyphs) */}
          <div className="view-switch" role="group" aria-label="View">
            <button
              type="button"
              className="view-switch__opt is-active"
              aria-pressed
              title="List view"
              onClick={() => setView('list')}
            >
              <span className="view-switch__bars" aria-hidden>
                <span />
                <span />
              </span>
              List
            </button>
            <button
              type="button"
              className="view-switch__opt"
              aria-pressed={false}
              title="Kanban board — outreach status"
              onClick={() => openBoard({ scope: dash ? 'all' : 'mine', from: 'home' })}
            >
              <img src={tableIcon} alt="" width={16} height={16} />
              Kanban
            </button>
          </div>

          <button
            type="button"
            className={`add-company ${adding ? 'is-on' : ''}`}
            aria-expanded={adding}
            onClick={() => setAdding((a) => !a)}
          >
            <span>Add Company</span>
            <img src={addIcon} alt="" width={17.57} height={17.57} />
          </button>

          <button
            type="button"
            className="companies__open ib"
            aria-label="Open Companies page"
            title="Open Companies"
            onClick={() => navigate('companies', { companiesTab: 'assigned' })}
          >
            <img src={arrowUpRightSm} alt="" width={32} height={32} />
          </button>
        </div>

        {adding && (
          <form
            className="add-form"
            onSubmit={(e) => {
              e.preventDefault()
              const f = e.currentTarget
              const name = (f.elements.namedItem('name') as HTMLInputElement).value.trim()
              const comment = (f.elements.namedItem('comment') as HTMLInputElement).value.trim()
              if (!name) return
              const d = new Date()
              const date = `${String(d.getDate()).padStart(2, '0')}/${String(d.getMonth() + 1).padStart(2, '0')}/${d.getFullYear()}`
              setRows((r) => [
                { id: Date.now(), name, date, comment: comment || 'Added to my companies', status: 'uncontacted' },
                ...r,
              ])
              setAdding(false)
              listRef.current?.scrollTo({ top: 0, behavior: 'smooth' })
              toast(`${name} added to ${dash ? `${firstName}'s` : 'My'} Companies`)
            }}
          >
            <p className="add-form__title">Add a company</p>
            <input name="name" placeholder="Company name" aria-label="Company name" autoFocus />
            <input name="comment" placeholder="First note (optional)" aria-label="First note" />
            <div className="add-form__actions">
              <button type="button" className="btn-ghost" onClick={() => setAdding(false)}>
                Cancel
              </button>
              <button type="submit" className="btn-primary">
                Add
              </button>
            </div>
          </form>
        )}

        <div className="chips">
          {chips.map((c) => (
            <button
              key={c.key}
              type="button"
              className={`chip chip--${c.key} ${chip === c.key ? 'is-active' : ''}`}
              aria-pressed={chip === c.key}
              onClick={() => setChip(chip === c.key ? null : c.key)}
            >
              <p>{c.label}</p>
              <span className="chip__count">
                <p>{c.key === 'contacted' || c.key === 'iaf-filled' ? counts[c.key] : c.count}</p>
              </span>
            </button>
          ))}
        </div>

        <div ref={listRef} className={`companies__list ${view === 'table' ? 'is-compact' : ''}`}>
          {visible.map((c) => {
            const open = expanded === c.id
            const id = rowId(c)
            const entries = history[id] ?? baseOf(c)
            return (
              <div key={c.id} className={`company-item ${open ? 'is-open' : ''}`}>
                <div className="company-row">
                  <div className="company-row__text">
                    <p className="company-row__headline">
                      <button type="button" className="co-link" title={`Open ${c.name}`} onClick={() => openCompany(c.name)}>{c.name}</button>
                      <span className="company-row__date">{c.date}</span>
                    </p>
                    <div className="company-row__supporting">
                      <p>{c.comment}</p>
                    </div>
                  </div>
                  <div className="company-row__right">
                    {/* the pill itself changes status (the dropdown no longer repeats it) */}
                    <button
                      type="button"
                      className="status-cycle"
                      title="Click to change status"
                      aria-label={`Status: ${STATUS_OPTIONS.find((o) => o.key === c.status)?.label}. Click to change`}
                      onClick={() => {
                        const i = STATUS_OPTIONS.findIndex((o) => o.key === c.status)
                        const next = STATUS_OPTIONS[(i + 1) % STATUS_OPTIONS.length]
                        setRows((rs) => rs.map((r) => (r.id === c.id ? { ...r, status: next.key } : r)))
                      }}
                    >
                      <StatusPill status={c.status} />
                    </button>
                    <div className="company-row__actions">
                      <button
                        type="button"
                        className="ib"
                        aria-label={`Email ${c.name}`}
                        onClick={() => openMail({ to: companyEmail(c.name), company: c.name, rowId: id, base: baseOf(c) })}
                      >
                        <img src={mailIcon} alt="" width={33} height={33} />
                      </button>
                      <button
                        type="button"
                        className="ib"
                        aria-label={`Add an update for ${c.name}`}
                        onClick={() => {
                          setExpanded(c.id)
                          setFocusNote(true)
                        }}
                      >
                        <img src={editIcon} alt="" width={27} height={27} />
                      </button>
                      <button
                        type="button"
                        className="ib company-row__toggle"
                        aria-label={open ? 'Collapse' : 'Expand'}
                        aria-expanded={open}
                        onClick={() => setExpanded(open ? null : c.id)}
                      >
                        <img src={dropDownIcon} alt="" width={37} height={37} />
                      </button>
                    </div>
                  </div>
                </div>

                {open && (
                  <div className="company-item__more">
                    <CompanyHistory
                      compact
                      entries={entries}
                      inputRef={noteInput}
                      onAdd={(t) => addEntry(id, entries, t)}
                    />
                  </div>
                )}
              </div>
            )
          })}
          {visible.length === 0 && <p className="companies__empty">No companies match.</p>}
        </div>

        <ScrollTrack target={listRef} variant="home" style={{ left: 773, top: 169, bottom: 16 }} watch={visible.length} />
      </section>
    </main>
  )
}
