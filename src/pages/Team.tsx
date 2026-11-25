import { useRef, useState } from 'react'
import { ME, ROLES, team, type Role } from '../data/team'
import { useChat } from '../components/chat/ChatContext'
import ScrollTrack from '../components/ScrollTrack'
import { usePortal } from '../state/portal'
import { ChatIcon } from '../components/chat/icons'
import searchIcon from '../assets/icons/search.svg'
import toggleBg from '../assets/icons/view-toggle-bg.svg'
import usersIcon from '../assets/icons/users.svg'
import dotIntern from '../assets/icons/legend-dot-intern.svg'
import dotApc from '../assets/icons/legend-dot-apc.svg'
import dotCc from '../assets/icons/legend-dot-cc.svg'
import './Team.css'

const DOT: Record<Role, string> = { intern: dotIntern, apc: dotApc, cc: dotCc }
const ROLE_KEYS: Role[] = ['intern', 'apc', 'cc']

type View = 'table' | 'cards'

export default function Team() {
  const { openChat } = useChat()
  const { openMember } = usePortal()
  const [query, setQuery] = useState('')
  const [role, setRole] = useState<Role | null>(null)
  /* Grid icon (purple in Figma) = the data grid/table shown in the design; list icon = card list */
  const [view, setView] = useState<View>('table')
  const rowsRef = useRef<HTMLDivElement>(null)

  const q = query.trim().toLowerCase()
  const rows = team.filter(
    (m) => (!role || m.role === role) && (!q || `${m.name} ${m.companies}`.toLowerCase().includes(q)),
  )
  const toggleRole = (r: Role) => setRole((x) => (x === r ? null : r))

  return (
    <main className="team-page">
      <p className="team-title">Placement Team</p>

      {/* View toggles (263:3140 / 263:3147) */}
      <button
        type="button"
        className={`team-toggle team-toggle--grid ${view === 'table' ? 'is-active' : ''}`}
        aria-label="Table view"
        aria-pressed={view === 'table'}
        title="Table view"
        onClick={() => setView('table')}
      >
        <img src={toggleBg} alt="" width={46} height={46} />
        <span className="team-toggle__grid">
          <span />
          <span />
          <span />
          <span />
        </span>
      </button>
      <button
        type="button"
        className={`team-toggle team-toggle--list ${view === 'cards' ? 'is-active' : ''}`}
        aria-label="Card list view"
        aria-pressed={view === 'cards'}
        title="Card view"
        onClick={() => setView('cards')}
      >
        <img src={toggleBg} alt="" width={46} height={46} />
        <span className="team-toggle__list">
          <span />
          <span />
        </span>
      </button>

      {/* Role filter chips (263:3131) — the search field overlaps the first one, as in Figma */}
      <div className="team-roles">
        {ROLE_KEYS.map((r, i) => (
          <button
            key={r}
            type="button"
            className={`team-role team-role--${r} ${i === 0 ? 'team-role--first' : ''} ${role === r ? 'is-active' : ''}`}
            aria-pressed={role === r}
            onClick={() => toggleRole(r)}
          >
            {ROLES[r].plural}
          </button>
        ))}
      </div>
      <div className="team-fade" aria-hidden />

      <label className="team-search">
        <img src={searchIcon} alt="" width={16} height={16} />
        <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search" />
      </label>

      {/* Role legend (263:3302) — also works as a filter */}
      <div className="team-legend">
        {ROLE_KEYS.map((r) => (
          <button
            key={r}
            type="button"
            className={`team-legend__pill team-legend__pill--${r} ${role === r ? 'is-active' : ''}`}
            aria-pressed={role === r}
            onClick={() => toggleRole(r)}
          >
            <img src={DOT[r]} alt="" width={8} height={8} />
            {ROLES[r].label}
          </button>
        ))}
      </div>

      {/* Table (263:3153) */}
      <section className={`team-table ${view === 'cards' ? 'is-cards' : ''}`}>
        <div className="team-table__head">
          <p className="team-col-name">Name</p>
          <p className="team-col-role">Role</p>
          <p className="team-col-companies">Companies Handled</p>
        </div>
        <div className="team-table__rows" ref={rowsRef}>
          {rows.map((m) => (
            <div key={m.name} className="team-row">
              <div className="team-col-name team-person">
                <span className="team-avatar">
                  <img src={usersIcon} alt="" width={20} height={20} />
                </span>
                <p>
                  <button
                    type="button"
                    className="co-link"
                    title={m.name === ME ? 'Open your dashboard' : `Open ${m.name}'s dashboard`}
                    onClick={() => openMember(m.name)}
                  >
                    {m.name}
                  </button>
                  {m.name === ME && <span className="team-you"> (you)</span>}
                </p>
              </div>
              <div className="team-col-role">
                <span className={`team-badge team-badge--${m.role}`}>{ROLES[m.role].label}</span>
              </div>
              <div className="team-col-companies">
                <p>{m.companies}</p>
              </div>
              {m.name !== ME && (
                <button
                  type="button"
                  className="team-row__chat"
                  aria-label={`Message ${m.name}`}
                  title={`Message ${m.name}`}
                  onClick={() => openChat(m.name)}
                >
                  <ChatIcon />
                </button>
              )}
            </div>
          ))}
          {rows.length === 0 && <p className="team-empty">No team members match.</p>}
        </div>
        <ScrollTrack
          target={rowsRef}
          variant="team"
          style={{ right: 7, top: 55, bottom: 16 }}
          watch={`${view}-${rows.length}`}
        />
      </section>
    </main>
  )
}
