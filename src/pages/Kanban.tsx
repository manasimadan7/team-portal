import { useEffect, useRef, useState } from 'react'
import { STAGES, allCompaniesBoard, initialBoard, type BoardScope, type StageKey } from '../data/kanban'
import { usePortal } from '../state/portal'
import searchIcon from '../assets/icons/search.svg'
import toggleBg from '../assets/icons/view-toggle-bg.svg'
import activeBg from '../assets/icons/kb-toggle-active-bg.svg'
import tableIcon from '../assets/icons/kb-table.svg'
import addIcon from '../assets/icons/kb-add.svg'
import columnBody from '../assets/icons/kb-column-body.svg'
import columnBodyShort from '../assets/icons/kb-column-body-short.svg'
import { CURRENT_YEAR, ELIGIBILITY_PLACEHOLDER, timelineForYear } from '../data/companyDetail'
import headerFirst from '../assets/icons/kb-header-first.svg'
import header from '../assets/icons/kb-header.svg'
import badgeUsers from '../assets/icons/kb-badge-users.svg'
import './Kanban.css'

/**
 * One board for every company survives navigation while the app is open.
 * "My Companies" shows only the user's own companies; "All Companies" shows everything —
 * so a move on either board shows up on both.
 */
let saved: Record<StageKey, string[]> = allCompaniesBoard()
const mine = new Set(Object.values(initialBoard).flat())
const savedSelected: Record<BoardScope, string | null> = { mine: null, all: null }

type Props = { scope?: BoardScope; onList: () => void; onGrid: () => void }

/**
 * Outreach kanban (Figma 139:2340): one column per stage, every company a badge.
 * Drag a badge to another column to move it; click a company to expand its details.
 */
export default function Kanban({ scope = 'mine', onList, onGrid }: Props) {
  const { openCompany, toast, profiles, history } = usePortal()
  /** expanded state (139:3016): the company whose details show under the board */
  const [selected, setSelected] = useState<string | null>(savedSelected[scope])
  const [fullBoard, setBoard] = useState(saved)
  const board =
    scope === 'all'
      ? fullBoard
      : (Object.fromEntries(
          Object.entries(fullBoard).map(([k, v]) => [k, v.filter((n) => mine.has(n))]),
        ) as Record<StageKey, string[]>)
  const [query, setQuery] = useState('')
  const [dragging, setDragging] = useState<{ name: string; from: StageKey } | null>(null)
  const [over, setOver] = useState<StageKey | null>(null)
  const [adding, setAdding] = useState(false)
  /** tap-to-move (phones / keyboard): company whose stage picker is open */
  const [moving, setMoving] = useState<{ name: string; from: StageKey } | null>(null)
  const scrollRef = useRef<HTMLDivElement>(null)
  const [hbar, setHbar] = useState({ ratio: 1, pos: 0 })

  useEffect(() => {
    saved = fullBoard
  }, [fullBoard])

  useEffect(() => {
    savedSelected[scope] = selected
    if (!selected) return
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && setSelected(null)
    window.addEventListener('keydown', onKey)
    // bring the highlighted badge into view inside its column
    document.querySelector('.kb-badge.is-selected')?.scrollIntoView({ block: 'nearest', inline: 'nearest' })
    return () => window.removeEventListener('keydown', onKey)
  }, [selected])

  const toggleSelect = (name: string) => setSelected((s) => (s === name ? null : name))
  const selectedStage = selected ? STAGES.find((st) => board[st.key].includes(selected)) : undefined
  const remarks = selected ? (profiles[selected]?.eligibility || ELIGIBILITY_PLACEHOLDER(selected)) : ''
  const remarkLines = remarks.split('\n').map((l) => l.trim()).filter(Boolean)
  const entries = selected ? [...timelineForYear(CURRENT_YEAR), ...(history[`kb-${selected}`] ?? [])] : []

  // horizontal scrollbar (Figma 139:2370: 16px #D1CFFF pill)
  useEffect(() => {
    const el = scrollRef.current
    if (!el) return
    const update = () =>
      setHbar({
        ratio: Math.min(1, el.clientWidth / el.scrollWidth),
        pos: el.scrollWidth > el.clientWidth ? el.scrollLeft / (el.scrollWidth - el.clientWidth) : 0,
      })
    update()
    el.addEventListener('scroll', update, { passive: true })
    const ro = new ResizeObserver(update)
    ro.observe(el)
    return () => {
      el.removeEventListener('scroll', update)
      ro.disconnect()
    }
  }, [])

  const q = query.trim().toLowerCase()

  const move = (name: string, from: StageKey, to: StageKey) => {
    if (from === to) return
    setBoard((b) => ({ ...b, [from]: b[from].filter((n) => n !== name), [to]: [name, ...b[to]] }))
    const label = STAGES.find((s) => s.key === to)!.label.join(' ')
    toast(`${name} moved to ${label}`)
  }

  const TRACK = 1219 // px, so the thumb matches Figma's 813px at the starting scroll width
  const thumbW = Math.max(60, hbar.ratio * TRACK)

  const onThumbDown = (e: React.PointerEvent<HTMLDivElement>) => {
    const el = scrollRef.current
    if (!el) return
    e.preventDefault()
    const track = e.currentTarget.parentElement!
    const rect = track.getBoundingClientRect()
    const scale = rect.width / track.clientWidth
    const startX = e.clientX
    const start = el.scrollLeft
    const travel = (rect.width - thumbW * scale) || 1
    const range = el.scrollWidth - el.clientWidth
    const moveH = (ev: PointerEvent) => (el.scrollLeft = start + ((ev.clientX - startX) / travel) * range)
    const up = () => {
      window.removeEventListener('pointermove', moveH)
      window.removeEventListener('pointerup', up)
    }
    window.addEventListener('pointermove', moveH)
    window.addEventListener('pointerup', up)
  }

  return (
    <main className={`kb-page ${selected ? 'is-expanded' : ''}`}>
      <p className="kb-title">{scope === 'all' ? 'All Companies' : 'My Companies'}</p>

      <label className="kb-search">
        <img src={searchIcon} alt="" width={16} height={16} />
        <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search" aria-label="Search companies on the board" />
      </label>

      <button type="button" className={`kb-add ${adding ? 'is-on' : ''}`} aria-expanded={adding} onClick={() => setAdding((a) => !a)}>
        <span>Add Company</span>
        <img src={addIcon} alt="" width={24} height={24} />
      </button>
      {adding && (
        <form
          className="kb-add-form"
          onSubmit={(e) => {
            e.preventDefault()
            const input = e.currentTarget.elements.namedItem('name') as HTMLInputElement
            const name = input.value.trim()
            if (!name) return
            if (scope === 'mine') mine.add(name)
            setBoard((b) => ({ ...b, contacted: [name, ...b.contacted.filter((n) => n !== name)] }))
            setAdding(false)
            scrollRef.current?.scrollTo({ left: 0, behavior: 'smooth' })
            toast(`${name} added to Contacted`)
          }}
        >
          <input name="name" placeholder="Company name" aria-label="Company name" autoFocus />
          <button type="submit" className="btn-primary">
            Add
          </button>
        </form>
      )}

      {/* View toggles (139:2349 / 2356 / 2361) — kanban active */}
      <button type="button" className="kb-toggle" style={{ left: 1498 }} aria-label="Grid view — Companies page" title="Companies (cards)" onClick={onGrid}>
        <img src={toggleBg} alt="" width={46} height={46} />
        <span className="kb-toggle__grid">
          <span />
          <span />
          <span />
          <span />
        </span>
      </button>
      <button type="button" className="kb-toggle" style={{ left: 1565 }} aria-label="Switch to list view" title="List view" onClick={onList}>
        <img src={toggleBg} alt="" width={46} height={46} />
        <span className="kb-toggle__list">
          <span />
          <span />
        </span>
      </button>
      <button type="button" className="kb-toggle kb-toggle--active" style={{ left: 1632 }} aria-label="Kanban view" aria-pressed title="Kanban view">
        <img src={activeBg} alt="" width={54} height={54} className="kb-toggle__activebg" />
        <img src={tableIcon} alt="" width={25} height={25} className="kb-toggle__icon" />
      </button>

      {/* Board */}
      <div className="kb-mask" aria-hidden />
      <div className="kb-scroll" ref={scrollRef}>
        <div className="kb-board">
          {STAGES.map((s, i) => {
            const items = board[s.key]
            return (
              <section
                key={s.key}
                className={`kb-col ${i === 0 ? 'kb-col--first' : ''} ${over === s.key && dragging?.from !== s.key ? 'is-over' : ''}`}
                style={{ zIndex: STAGES.length - i }}
                aria-label={`${s.label.join(' ')}: ${items.length}`}
                onDragOver={(e) => {
                  if (!dragging) return
                  e.preventDefault()
                  setOver(s.key)
                }}
                onDragLeave={(e) => {
                  if (!e.currentTarget.contains(e.relatedTarget as Node)) setOver(null)
                }}
                onDrop={(e) => {
                  e.preventDefault()
                  if (dragging) move(dragging.name, dragging.from, s.key)
                  setDragging(null)
                  setOver(null)
                }}
              >
                <img
                  src={selected ? columnBodyShort : columnBody}
                  alt=""
                  width={312}
                  height={selected ? 319 : 686}
                  className="kb-col__body"
                />
                <img
                  src={i === 0 ? headerFirst : header}
                  alt=""
                  width={i === 0 ? 357.369 : 356.369}
                  height={112}
                  className="kb-col__head"
                />
                <div className={`kb-col__label ${s.label.length > 1 ? 'is-two-line' : ''}`}>
                  <p className="kb-col__title">
                    {s.label.map((l, j) => (
                      <span key={j}>{l}</span>
                    ))}
                  </p>
                  <p className="kb-col__count">{items.length}</p>
                </div>
                <div className="kb-col__card">
                  <div className="kb-grid">
                    {items.map((name) => {
                      const hit = !q || name.toLowerCase().includes(q)
                      return (
                        <div
                          key={name}
                          className={`kb-badge ${hit ? '' : 'is-dim'} ${q && hit ? 'is-hit' : ''} ${dragging?.name === name ? 'is-dragging' : ''} ${selected === name ? 'is-selected' : ''}`}
                          draggable
                          onDragStart={(e) => {
                            e.dataTransfer.effectAllowed = 'move'
                            e.dataTransfer.setData('text/plain', name)
                            setDragging({ name, from: s.key })
                          }}
                          onDragEnd={() => {
                            setDragging(null)
                            setOver(null)
                          }}
                        >
                          <button
                            type="button"
                            className="kb-badge__logo"
                            aria-label={`Show ${name} details`}
                            aria-pressed={selected === name}
                            onClick={() => toggleSelect(name)}
                          >
                            <img src={badgeUsers} alt="" width={40} height={40} />
                          </button>
                          <button type="button" className="kb-badge__name co-link" aria-pressed={selected === name} onClick={() => toggleSelect(name)}>
                            {name}
                          </button>
                          <button
                            type="button"
                            className="kb-badge__move"
                            aria-label={`Move ${name} to another stage`}
                            onClick={() => setMoving({ name, from: s.key })}
                          >
                            Move
                          </button>
                        </div>
                      )
                    })}
                  </div>
                  {items.length === 0 && <p className="kb-empty">Drop a company here</p>}
                </div>
              </section>
            )
          })}
        </div>
      </div>

      {/* Expanded company details (139:3044) */}
      {selected && (
        <section className="kb-detail" aria-label={`${selected} details`}>
          <div className="kb-detail__head">
            <p className="kb-detail__name">{selected}</p>
            {selectedStage && <p className="kb-detail__stage">{selectedStage.label.join(' ')}</p>}
            <button type="button" className="kb-detail__open" onClick={() => openCompany(selected)}>
              Open company page ↗
            </button>
          </div>
          <div className="kb-detail__timeline">
            {entries.map((e, i) => (
              <div key={i} className="kb-detail__row">
                <p className="kb-detail__date">{e.date}</p>
                <div className="kb-detail__text">
                  {e.text.map((t, j) => (
                    <p key={j}>{t}</p>
                  ))}
                </div>
              </div>
            ))}
          </div>
          <div className="kb-remarks">
            <p className="kb-remarks__title">Remarks</p>
            <div className="kb-remarks__body">
              <p>{remarkLines[0]}</p>
              {remarkLines.length > 1 && (
                <ul>
                  {remarkLines.slice(1).map((l, i) => (
                    <li key={i}>{l.replace(/^[-•*]\s*/, '')}</li>
                  ))}
                </ul>
              )}
            </div>
            <button type="button" className="kb-remarks__edit" onClick={() => openCompany(selected)}>
              Edit
            </button>
          </div>
          <button type="button" className="kb-detail__close ib" aria-label="Close details" title="Close (Esc)" onClick={() => setSelected(null)}>
            ×
          </button>
        </section>
      )}

      {moving && (
        <div className="kb-sheet-backdrop" onClick={() => setMoving(null)}>
          <div
            className="kb-sheet"
            role="dialog"
            aria-label={`Move ${moving.name}`}
            onClick={(e) => e.stopPropagation()}
          >
            <p className="kb-sheet__title">
              Move <b>{moving.name}</b> to…
            </p>
            <div className="kb-sheet__list">
              {STAGES.map((st) => (
                <button
                  key={st.key}
                  type="button"
                  className={`kb-sheet__opt ${st.key === moving.from ? 'is-current' : ''}`}
                  disabled={st.key === moving.from}
                  onClick={() => {
                    move(moving.name, moving.from, st.key)
                    setMoving(null)
                  }}
                  autoFocus={st.key !== moving.from && STAGES.findIndex((x) => x.key === moving.from) + 1 === STAGES.indexOf(st)}
                >
                  <span>{st.label.join(' ')}</span>
                  <span className="kb-sheet__count">{st.key === moving.from ? 'Current' : board[st.key].length}</span>
                </button>
              ))}
            </div>
            <button type="button" className="btn-ghost kb-sheet__cancel" onClick={() => setMoving(null)}>
              Cancel
            </button>
          </div>
        </div>
      )}

      <div className="kb-hbar" aria-hidden style={{ opacity: hbar.ratio < 1 ? 1 : 0 }}>
        <div
          className="kb-hbar__thumb"
          style={{ width: thumbW, transform: `translateX(${hbar.pos * (TRACK - thumbW)}px)` }}
          onPointerDown={onThumbDown}
        />
      </div>
    </main>
  )
}
