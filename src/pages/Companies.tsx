import { useEffect, useMemo, useRef, useState } from 'react'
import {
  categoryChips,
  companies,
  companyEmail,
  defaultTimeline,
  openCompanies,
  statusChips,
  teamMembers,
  timelines,
  type Category,
  type Company,
  type CompaniesTab,
  type OpenCompany,
  type TimelineEntry,
} from '../data/companies'
import type { ChipKey } from '../data/home'
import TagPicker from '../components/TagPicker'
import ScrollTrack from '../components/ScrollTrack'
import CompanyHistory from '../components/CompanyHistory'
import { usePortal } from '../state/portal'

import searchIcon from '../assets/icons/search.svg'
import dotContacted from '../assets/icons/dot-a.svg'
import dotIaf from '../assets/icons/dot-b.svg'
import dotReject from '../assets/icons/dot-c.svg'
import arrowDrop from '../assets/icons/co-arrow-drop.svg'
import arrowDropSelf from '../assets/icons/co-arrow-drop-self.svg'
import phoneIcon from '../assets/icons/co-phone.svg'
import mailIcon from '../assets/icons/co-mail.svg'
import mailActive from '../assets/icons/co-mail-active.svg'
import editIcon from '../assets/icons/co-edit.svg'
import personIcon from '../assets/icons/perm-identity.svg'
import tableRows from '../assets/icons/table-rows.svg'
import kanbanIcon from '../assets/icons/kb-table.svg'
import contactPhone from '../assets/icons/contact-phone.svg'
import contactMail from '../assets/icons/contact-mail.svg'
import sourceWeb from '../assets/images/source-web.png'
import sourceLinkedin from '../assets/images/source-linkedin.png'
import '../components/StatusChips.css'
import './Companies.css'

const DOTS: Record<string, string> = { contacted: dotContacted, 'iaf-filled': dotIaf, reject: dotReject }

const TABS: { key: CompaniesTab; label: string; width: number }[] = [
  { key: 'all', label: 'All', width: 59.833 },
  { key: 'assigned', label: 'Assigned', width: 137.617 },
  { key: 'self', label: 'Self Allot', width: 133.129 },
]
/** Active pill geometry per tab, straight from the three Figma frames. */
const PILL: Record<CompaniesTab, { left: number; top: number; width: number }> = {
  all: { left: 10, top: 6, width: 69 },
  assigned: { left: 103, top: 6.42, width: 138 },
  self: { left: 267, top: 6, width: 141 },
}

type AssignedCompany = Company | (Omit<Company, 'status'> & { status: 'new' })

const sourceUrl = (name: string) => `https://www.google.com/search?q=${encodeURIComponent(`${name} careers`)}`

export default function Companies({ initialTab = 'all', onTabChange }: { initialTab?: CompaniesTab; onTabChange?: (t: CompaniesTab) => void }) {
  const { history, addEntry, openMail, openCompany, openBoard } = usePortal()
  const [tab, setTab] = useState<CompaniesTab>(initialTab)
  const [query, setQuery] = useState('')
  const [status, setStatus] = useState<ChipKey | null>(null)
  const [category, setCategory] = useState<Category | null>(null)
  const [claimed, setClaimed] = useState<string[]>([])
  const [tagged, setTagged] = useState<Record<string, string[]>>({})
  const [tagFor, setTagFor] = useState<{ id: string; el: HTMLElement } | null>(null)
  const [expanded, setExpanded] = useState<string | null>(null)
  const noteInput = useRef<HTMLInputElement>(null)
  const listRef = useRef<HTMLDivElement>(null)
  const [focusNote, setFocusNote] = useState(false)

  useEffect(() => {
    if (focusNote && noteInput.current) {
      noteInput.current.focus()
      setFocusNote(false)
    }
  }, [focusNote, expanded])

  const switchTab = (t: CompaniesTab) => {
    setTab(t)
    onTabChange?.(t)
    setQuery('')
    setStatus(null)
    setCategory(null)
    setExpanded(null)
    setTagFor(null)
  }

  const q = query.trim().toLowerCase()

  const assigned: AssignedCompany[] = useMemo(
    () => [
      ...companies.filter((c) => c.mine),
      ...openCompanies
        .filter((o) => claimed.includes(o.id))
        .map((o) => ({
          id: o.id,
          name: o.name,
          date: o.date,
          lines: ['Claimed via self allotment', o.tags.join(' · ')] as [string, string],
          status: 'new' as const,
          team: 1,
        })),
    ],
    [claimed],
  )

  const tabRows = tab === 'all' ? companies : assigned
  /** live chip counts for the statuses rows carry; pipeline-only stages keep the designed counts */
  const statusCount = (k: ChipKey) =>
    k === 'contacted' || k === 'iaf-filled' || k === 'reject'
      ? tabRows.filter((c) => c.status === k).length
      : (statusChips.find((s) => s.key === k)?.count ?? 0)

  const rows = tabRows.filter(
    (c) =>
      (!status || c.status === status) &&
      (!q || `${c.name} ${c.lines.join(' ')}`.toLowerCase().includes(q)),
  )

  const openRows = openCompanies.filter(
    (o) => (!category || o.tags.includes(category)) && (!q || o.name.toLowerCase().includes(q)),
  )

  const baseFor = (c: AssignedCompany): TimelineEntry[] =>
    timelines[c.id.replace(/-2$/, '')] ?? defaultTimeline(c as Company)
  const timelineFor = (c: AssignedCompany) => history[c.id] ?? baseFor(c)

  const onScroll = () => setTagFor(null)

  const toggle = (id: string) => setExpanded((x) => (x === id ? null : id))

  const tagLabel = (id: string) => {
    const t = tagged[id] ?? []
    if (!t.length) return 'Tag'
    const first = `@${t[0].split(' ')[0]}`
    return t.length > 1 ? `${first} +${t.length - 1}` : first
  }

  const toggleClaim = (id: string) =>
    setClaimed((cs) => (cs.includes(id) ? cs.filter((x) => x !== id) : [...cs, id]))

  const openActions = (o: OpenCompany) => {
    const isClaimed = claimed.includes(o.id)
    const hasTags = (tagged[o.id] ?? []).length > 0
    return (
      <div className="open-row__actions">
        <button
          type="button"
          className={`open-btn open-btn--tag ${hasTags ? 'has-tags' : ''}`}
          title={hasTags ? (tagged[o.id] ?? []).join(', ') : 'Tag a team member'}
          aria-expanded={tagFor?.id === o.id}
          onClick={(e) => {
            e.stopPropagation()
            const el = e.currentTarget
            setTagFor((t) => (t?.id === o.id ? null : { id: o.id, el }))
          }}
        >
          <span>{tagLabel(o.id)}</span>
        </button>
        <button
          type="button"
          className={`open-btn open-btn--claim ${isClaimed ? 'is-claimed' : ''}`}
          aria-pressed={isClaimed}
          onClick={(e) => {
            e.stopPropagation()
            toggleClaim(o.id)
          }}
        >
          {isClaimed ? 'Claimed' : 'Claim'}
        </button>
        <a
          className="open-row__source"
          href={sourceUrl(o.name)}
          target="_blank"
          rel="noopener noreferrer"
          title={`Open ${o.name} job source in a new tab`}
          onClick={(e) => e.stopPropagation()}
        >
          Source
        </a>
      </div>
    )
  }

  const pill = PILL[tab]

  return (
    <main className="companies-page">
      <p className="cp-title">Companies</p>

      {/* Segmented control (282:10982) */}
      <div className="segmented" role="tablist">
        <div className="segmented__pill" style={{ left: pill.left, top: pill.top, width: pill.width }} aria-hidden />
        <div className="segmented__items">
          {TABS.map((t) => (
            <button
              key={t.key}
              type="button"
              role="tab"
              aria-selected={tab === t.key}
              className={`segmented__item ${tab === t.key ? 'is-active' : ''}`}
              style={{ width: t.width }}
              onClick={() => switchTab(t.key)}
            >
              {t.label}
            </button>
          ))}
        </div>
      </div>

      <button
        type="button"
        className="cp-icon-btn cp-icon-btn--list is-active"
        aria-label="List view"
        aria-pressed
        title="List view"
        onClick={() => listRef.current?.scrollTo({ top: 0, behavior: 'smooth' })}
      >
        <img src={tableRows} alt="" width={38} height={38} style={{ left: 10, top: 9 }} />
      </button>
      <button
        type="button"
        className="cp-icon-btn cp-icon-btn--kanban"
        aria-label={tab === 'self' ? 'Kanban view (not available for Self Allot)' : `Kanban view of ${tab === 'all' ? 'all companies' : 'my companies'}`}
        title={tab === 'self' ? 'Kanban is available on All and Assigned' : 'Kanban view'}
        disabled={tab === 'self'}
        onClick={() => openBoard({ scope: tab === 'all' ? 'all' : 'mine', from: 'companies' })}
      >
        <img src={kanbanIcon} alt="" width={28} height={28} style={{ left: 15, top: 14.5 }} />
      </button>
      <span className="cp-icon-cap" style={{ left: 1558 }} aria-hidden>
        List
      </span>
      <span className={`cp-icon-cap ${tab === 'self' ? 'is-off' : ''}`} style={{ left: 1625 }} aria-hidden>
        Kanban
      </span>

      {/* ---------- Panel (282:10827) ---------- */}
      <section className="cp-panel">
        {tab !== 'self' ? (
          <div className="cp-toolbar" style={{ left: 58 }}>
            <label className="cp-search cp-search--outlined">
              <img src={searchIcon} alt="" width={16} height={16} />
              <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search" />
            </label>
            <div className="cp-chips">
              {statusChips.map((c) => (
                <button
                  key={c.key}
                  type="button"
                  className={`chip chip--${c.key} ${status === c.key ? 'is-active' : ''}`}
                  aria-pressed={status === c.key}
                  onClick={() => setStatus(status === c.key ? null : c.key)}
                >
                  <p>{c.label}</p>
                  <span className="chip__count">
                    <p>{statusCount(c.key)}</p>
                  </span>
                </button>
              ))}
            </div>
          </div>
        ) : (
          <div className="cp-toolbar" style={{ left: 40, width: 1439 }}>
            <label className="cp-search">
              <img src={searchIcon} alt="" width={16} height={16} />
              <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search" />
            </label>
            <div className="cp-chips">
              <button
                type="button"
                className={`chip cat-chip cat-chip--total ${category === null ? '' : 'is-dim'}`}
                aria-label="Show all categories"
                onClick={() => setCategory(null)}
              >
                <span className="chip__count">
                  <p>{openCompanies.length}</p>
                </span>
              </button>
              {categoryChips.map((c) => (
                <button
                  key={c.key}
                  type="button"
                  className={`chip cat-chip cat-chip--${c.variant} ${category === c.key ? 'is-active' : ''}`}
                  aria-pressed={category === c.key}
                  onClick={() => setCategory(category === c.key ? null : c.key)}
                >
                  <p>{c.key === 'Design' ? 'Design ' : c.key}</p>
                  <span className="chip__count">
                    <p>{openCompanies.filter((o) => o.tags.includes(c.key)).length}</p>
                  </span>
                </button>
              ))}
            </div>
          </div>
        )}

        <ScrollTrack
          target={listRef}
          variant="companies"
          style={{ left: 1404, top: tab === 'self' ? 96 : 110, bottom: 24 }}
          watch={`${tab}-${expanded}-${rows.length}-${openRows.length}`}
        />

        {tab !== 'self' ? (
          <div key={tab} ref={listRef} className="cp-list cp-list--rows" onScroll={onScroll}>
            {rows.map((c) => {
              const isOpen = expanded === c.id
              const entries = timelineFor(c)
              return (
                <div key={c.id} className={`co-row ${isOpen ? 'is-expanded' : ''}`}>
                  <div className="co-row__main">
                    <div className="co-row__list">
                      <div className="co-row__state">
                        <div className="co-row__content">
                          <p className="co-row__title">
                            <button type="button" className="co-link co-row__name" title={`Open ${c.name}`} onClick={() => openCompany(c.name)}>{c.name}</button>{' '}
                            <span className="co-row__date">{c.date}</span>
                          </p>
                          <div className="co-row__support">
                            <p>{c.lines[0]}</p>
                            <p>{c.lines[1]}</p>
                          </div>
                        </div>
                        {c.status !== 'new' && <img src={DOTS[c.status]} alt={c.status} width={16} height={16} />}
                        {c.status === 'new' && <span className="co-row__dot-placeholder" />}
                      </div>
                    </div>

                    <div className="co-row__actions">
                      {tab === 'assigned' && (
                        <>
                          <a href="tel:0101001010" aria-label={`Call ${c.name}`} title="Call 01010 01010">
                            <img src={phoneIcon} alt="" width={26} height={25} />
                          </a>
                          <button
                            type="button"
                            className="co-row__mail"
                            aria-label={`Email ${c.name}`}
                            onClick={() =>
                              openMail({ to: companyEmail(c.name), company: c.name, rowId: c.id, base: entries })
                            }
                          >
                            <img src={mailIcon} alt="" width={38} height={37} />
                            <img src={mailActive} alt="" width={38} height={37} className="co-row__mail-hover" />
                          </button>
                          <button
                            type="button"
                            aria-label={`Add an update for ${c.name}`}
                            onClick={() => {
                              setExpanded(c.id)
                              setFocusNote(true)
                            }}
                          >
                            <img src={editIcon} alt="" width={31} height={31} />
                          </button>
                        </>
                      )}
                      <button
                        type="button"
                        className="co-row__toggle"
                        aria-label={isOpen ? 'Collapse' : 'Expand'}
                        aria-expanded={isOpen}
                        onClick={() => toggle(c.id)}
                      >
                        <img src={arrowDrop} alt="" width={57} height={57} />
                      </button>
                    </div>

                    {tab === 'all' && (
                      <div className="co-row__team" aria-label={`${c.team} team members`}>
                        {Array.from({ length: c.team }).map((_, i) => (
                          <img key={i} src={personIcon} alt="" width={32} height={32} />
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Expanded: contact history (approx. 139:1979) */}
                  {isOpen && (
                    <CompanyHistory entries={entries} inputRef={noteInput} onAdd={(t) => addEntry(c.id, entries, t)} />
                  )}
                </div>
              )
            })}
            {rows.length === 0 && <p className="cp-empty">No companies match.</p>}
          </div>
        ) : (
          <div key="self" ref={listRef} className="cp-list cp-list--open" onScroll={onScroll}>
            {openRows.map((o) =>
              expanded === o.id ? (
                /* Expanded open company (282:10217) */
                <div key={o.id} className="open-row is-expanded">
                  <p className="open-row__title open-row__title--expanded">
                    <button type="button" className="co-link open-row__name" title={`Open ${o.name}`} onClick={() => openCompany(o.name)}>{o.name}</button>{' '}
                    <span className="open-row__date">{o.date}</span>
                  </p>
                  <button
                    type="button"
                    className="open-row__drop open-row__drop--expanded"
                    aria-label="Collapse"
                    aria-expanded
                    onClick={() => toggle(o.id)}
                  >
                    <img src={arrowDropSelf} alt="" width={57} height={57} />
                  </button>

                  <div className="open-jd">
                    {o.roles.map((r) => (
                      <div key={r.tag} className="open-jd__row">
                        <span className={`open-jd__tag open-jd__tag--${r.tag.toLowerCase()}`}>
                          <span>{r.tag === 'Design' ? 'Design ' : r.tag}</span>
                        </span>
                        <p className="open-jd__text">{r.text}</p>
                      </div>
                    ))}
                  </div>
                  {o.roles.map((r, i) => (
                    <img
                      key={r.tag}
                      src={r.via === 'web' ? sourceWeb : sourceLinkedin}
                      alt={r.via === 'web' ? 'Found on company site' : 'Found on LinkedIn'}
                      className="open-jd__via"
                      width={13}
                      height={13}
                      style={{ top: i === 0 ? 78 : 138 }}
                    />
                  ))}

                  {o.contacts.map((p, i) => (
                    <div key={i} className={`poc poc--${i}`}>
                      <p className="poc__name">{p.name}</p>
                      <a className="poc__line poc__line--phone" href={`tel:${p.phone.replace(/\s/g, '')}`} title="Call">
                        <img src={contactPhone} alt="" width={19} height={19} />
                        <span>{p.phone}</span>
                      </a>
                      <button
                        type="button"
                        className="poc__line poc__line--mail"
                        onClick={() => openMail({ to: p.email, company: o.name, rowId: o.id, base: [] })}
                      >
                        <img src={contactMail} alt="" width={28} height={28} />
                        <span>{p.email}</span>
                      </button>
                    </div>
                  ))}

                  <div className="open-row__actions-expanded">{openActions(o)}</div>
                </div>
              ) : (
                <div key={o.id} className="open-row">
                  <div className="open-row__inner">
                    <p className="open-row__title">
                      <button type="button" className="co-link open-row__name" title={`Open ${o.name}`} onClick={() => openCompany(o.name)}>{o.name}</button>{' '}
                      <span className="open-row__date">{o.date}</span>
                    </p>
                    <div className="open-row__right">
                      <div className="open-row__tags">
                        {o.tags.map((t) => (
                          <span key={t} className={`open-tag open-tag--${t.toLowerCase()}`}>
                            <span>{t === 'Design' ? 'Design ' : t}</span>
                          </span>
                        ))}
                      </div>
                      {openActions(o)}
                    </div>
                  </div>
                  <button
                    type="button"
                    className="open-row__drop"
                    aria-label="Expand"
                    aria-expanded={false}
                    onClick={() => toggle(o.id)}
                  >
                    <img src={arrowDropSelf} alt="" width={57} height={57} />
                  </button>
                </div>
              ),
            )}
            {openRows.length === 0 && <p className="cp-empty">No companies in this category.</p>}
          </div>
        )}
      </section>

      {tagFor && (
        <TagPicker
          anchor={tagFor.el}
          members={teamMembers}
          selected={tagged[tagFor.id] ?? []}
          onChange={(next) => setTagged((t) => ({ ...t, [tagFor.id]: next }))}
          onClose={() => setTagFor(null)}
        />
      )}
    </main>
  )
}
