import { useEffect, useMemo, useRef, useState, type CSSProperties } from 'react'
import {
  ALL_YEARS,
  CHART_YEARS,
  CURRENT_YEAR,
  ELIGIBILITY_PLACEHOLDER,
  allCompanyNames,
  hiresFor,
  timelineForYear,
  type CompanyProfile,
} from '../data/companyDetail'
import { usePortal } from '../state/portal'
import searchIcon from '../assets/icons/search.svg'
import chevronBack from '../assets/icons/chevron-back.svg'
import chevronDown from '../assets/icons/cd-chevron-down.svg'
import keyDot from '../assets/icons/cd-key-dot.svg'
import yearDivider from '../assets/icons/cd-year-divider.svg'
import yearDividerLast from '../assets/icons/cd-year-divider-last.svg'
import './CompanyDetail.css'

const Y_TICKS = [18, 15, 12, 9, 6, 3]
const MAX = 18
const PLOT_H = 196 // px for 18 hires (bar 2022 in Figma)
const EMPTY: CompanyProfile = { selections: '', slot: '', eligibility: '' }

type Props = { name: string; onBack: () => void }

/**
 * Company detail page — view (139:4571) and edit (139:4229) states.
 * A company without saved key notes opens in edit mode; SAVE switches to the view with an Edit button.
 */
export default function CompanyDetail({ name, onBack }: Props) {
  const { profiles, saveProfile, openCompany, toast } = usePortal()
  const saved = profiles[name]
  const [editing, setEditing] = useState(!saved)
  const [draft, setDraft] = useState<CompanyProfile>(saved ?? EMPTY)
  const [year, setYear] = useState(CURRENT_YEAR)
  const [yearsOpen, setYearsOpen] = useState(false)
  const [query, setQuery] = useState('')
  const [suggestOpen, setSuggestOpen] = useState(false)
  const yearsRef = useRef<HTMLDivElement>(null)

  // Reset when switching to another company
  useEffect(() => {
    setEditing(!profiles[name])
    setDraft(profiles[name] ?? EMPTY)
    setYear(CURRENT_YEAR)
    setYearsOpen(false)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [name])

  useEffect(() => {
    if (!yearsOpen) return
    const close = (e: MouseEvent) => {
      if (!yearsRef.current?.contains(e.target as Node)) setYearsOpen(false)
    }
    document.addEventListener('mousedown', close)
    return () => document.removeEventListener('mousedown', close)
  }, [yearsOpen])

  const hires = hiresFor(name)
  const entries = timelineForYear(year)
  const otherYears = ALL_YEARS.filter((y) => y !== year)

  const suggestions = useMemo(() => {
    const q = query.trim().toLowerCase()
    if (!q) return []
    return allCompanyNames.filter((n) => n.toLowerCase().includes(q) && n !== name).slice(0, 6)
  }, [query, name])

  const go = (n: string) => {
    setQuery('')
    setSuggestOpen(false)
    openCompany(n)
  }

  const eligibilityLines = (saved?.eligibility ?? '')
    .split('\n')
    .map((l) => l.trim())
    .filter(Boolean)

  const save = () => {
    saveProfile(name, {
      selections: draft.selections.trim(),
      slot: draft.slot.trim(),
      eligibility: draft.eligibility.trim(),
    })
    setEditing(false)
    toast(`${name} key notes saved`)
  }

  return (
    <main className="cd-page">
      {/* Header (139:4695 / 4696 / 4697) */}
      <button type="button" className="cd-back ib" aria-label="Back" title="Back" onClick={onBack}>
        <img src={chevronBack} alt="" width={24} height={24} />
      </button>
      <button type="button" className="cd-crumb" onClick={onBack}>
        Companies
      </button>
      <form
        className="cd-search"
        role="search"
        onSubmit={(e) => {
          e.preventDefault()
          if (suggestions[0]) go(suggestions[0])
        }}
      >
        <img src={searchIcon} alt="" width={16} height={16} />
        <input
          value={query}
          placeholder="Search"
          aria-label="Search companies"
          onChange={(e) => {
            setQuery(e.target.value)
            setSuggestOpen(true)
          }}
          onFocus={() => setSuggestOpen(true)}
          onBlur={() => setTimeout(() => setSuggestOpen(false), 120)}
        />
        {suggestOpen && suggestions.length > 0 && (
          <ul className="cd-suggest" role="listbox">
            {suggestions.map((s) => (
              <li key={s} role="option" aria-selected={false} onMouseDown={(e) => e.preventDefault()} onClick={() => go(s)}>
                {s}
              </li>
            ))}
          </ul>
        )}
      </form>

      {/* Card (139:4573) */}
      <section className="cd-card">
        <h1 className="cd-name">{name}</h1>

        {/* Chart — No. of students hired per year */}
        <div className="cd-chart" aria-label={`Students hired by ${name} per year`}>
          <img src={keyDot} alt="" width={10} height={10} className="cd-chart__key" />
          <p className="cd-chart__ylabel">No. of students hired</p>
          {Y_TICKS.map((t, i) => (
            <div key={t} className="cd-chart__row" style={{ top: 115 + 31.933 * i }}>
              <span>{t}</span>
              {i > 0 && <i />}
            </div>
          ))}
          <div className="cd-chart__row cd-chart__row--zero">
            <span>0</span>
          </div>
          <div className="cd-chart__outline" />
          <span className="cd-chart__x0">0</span>
          {CHART_YEARS.map((y, i) => {
            const h = (hires[i] / MAX) * PLOT_H
            const left = 295 + 237 * i
            return (
              <div key={y}>
                <span className="cd-chart__vline" style={{ left }} />
                <button
                  type="button"
                  className={`cd-chart__bar ${year === y ? 'is-on' : ''}`}
                  style={{ left, top: 325 - h, height: h, ['--w' as string]: (hires[i] / MAX) * 100 } as CSSProperties}
                  aria-label={`${y}: ${hires[i]} students hired`}
                  title={`${y}: ${hires[i]} hired`}
                  onClick={() => setYear(y)}
                />
                <button
                  type="button"
                  className={`cd-chart__year ${year === y ? 'is-on' : ''}`}
                  style={{ left: left - 20 }}
                  onClick={() => setYear(y)}
                >
                  {y}
                </button>
              </div>
            )
          })}
          <p className="cd-chart__xlabel">Year</p>
        </div>

        {/* Timeline card with year picker (139:4638) */}
        <div className="cd-timeline">
          <div className="cd-years" ref={yearsRef}>
            {yearsOpen && (
              <ul className="cd-years__list" role="listbox" aria-label="Choose year">
                {otherYears.map((y, i) => (
                  <li key={y}>
                    <button
                      type="button"
                      role="option"
                      aria-selected={false}
                      onClick={() => {
                        setYear(y)
                        setYearsOpen(false)
                      }}
                    >
                      {y}
                    </button>
                    <img src={i === otherYears.length - 1 ? yearDividerLast : yearDivider} alt="" width={141} height={2} />
                  </li>
                ))}
              </ul>
            )}
            <button
              type="button"
              className={`cd-years__chip ${yearsOpen ? 'is-open' : ''}`}
              aria-haspopup="listbox"
              aria-expanded={yearsOpen}
              onClick={() => setYearsOpen((o) => !o)}
            >
              <span>{year}</span>
              <img src={chevronDown} alt="" width={24} height={24} />
            </button>
          </div>
          <div className="cd-timeline__list">
            {entries.map((e, i) => (
              <div key={i} className="cd-timeline__row">
                <p className="cd-timeline__date">{e.date}</p>
                <div className="cd-timeline__text">
                  {e.text.map((t, j) => (
                    <p key={j}>{t}</p>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Key notes — view (139:4669) / edit (139:4327) */}
        <div className={`cd-notes ${editing ? 'is-editing' : ''}`}>
          <p className="cd-notes__title">Key Notes</p>
          {editing ? (
            <>
              <div className="cd-notes__fields">
                <label>
                  <span>Selections:</span>
                  <input
                    value={draft.selections}
                    inputMode="numeric"
                    aria-label="Selections"
                    onChange={(e) => setDraft({ ...draft, selections: e.target.value })}
                    autoFocus
                  />
                </label>
                <label>
                  <span>Slot:</span>
                  <input
                    value={draft.slot}
                    aria-label="Slot"
                    onChange={(e) => setDraft({ ...draft, slot: e.target.value })}
                  />
                </label>
              </div>
              <div className="cd-notes__editor">
                <textarea
                  value={draft.eligibility}
                  placeholder={ELIGIBILITY_PLACEHOLDER(name)}
                  aria-label="Eligibility criteria"
                  onChange={(e) => setDraft({ ...draft, eligibility: e.target.value })}
                />
              </div>
              <div className="cd-notes__actions">
                {saved && (
                  <button
                    type="button"
                    className="cd-btn cd-btn--ghost"
                    onClick={() => {
                      setDraft(saved)
                      setEditing(false)
                    }}
                  >
                    CANCEL
                  </button>
                )}
                <button type="button" className="cd-btn" onClick={save}>
                  SAVE
                </button>
              </div>
            </>
          ) : (
            <>
              <div className="cd-notes__values">
                <p>
                  <span>Selections: </span>
                  <b>{saved?.selections || '—'}</b>
                </p>
                <p>
                  <span>Slot:</span>
                  <b> {saved?.slot || '—'}</b>
                </p>
              </div>
              {eligibilityLines.length > 0 && (
                <div className="cd-notes__eligibility">
                  <p>{eligibilityLines[0]}</p>
                  {eligibilityLines.length > 1 && (
                    <ul>
                      {eligibilityLines.slice(1).map((l, i) => (
                        <li key={i}>{l.replace(/^[-•*]\s*/, '')}</li>
                      ))}
                    </ul>
                  )}
                </div>
              )}
              <div className="cd-notes__actions">
                <button
                  type="button"
                  className="cd-btn cd-btn--edit"
                  onClick={() => {
                    setDraft(saved ?? EMPTY)
                    setEditing(true)
                  }}
                >
                  EDIT
                </button>
              </div>
            </>
          )}
        </div>
      </section>
    </main>
  )
}
