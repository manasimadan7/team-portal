import homeActive from '../assets/icons/nav-home.svg'
import homeInactive from '../assets/icons/nav-home-inactive.svg'
import resumeInactive from '../assets/icons/nav-resume.svg'
import resumeActive from '../assets/icons/nav-resume-active.svg'
import teamIcon from '../assets/icons/nav-team.svg'
import teamActive from '../assets/icons/nav-team-active.svg'
import companiesIcon from '../assets/icons/nav-companies.svg'
import companiesActive from '../assets/icons/nav-companies-active.svg'
import './Sidebar.css'

export type NavDestination = 'home' | 'resume' | 'team' | 'companies'

type ItemState = { icon: string; left: number; top?: number }

/**
 * Geometry from the Figma "Sidebar navigation" component set (182:1301).
 * The active icon is dark and shifts right to sit centred in the white indicator.
 * Team / Companies active variants are not exported yet — they fall back to the inactive icon.
 */
const ITEMS: {
  id: NavDestination
  label: string
  size: number
  top: number
  inactive: ItemState
  active: ItemState
}[] = [
  { id: 'home', label: 'Home', size: 40, top: 163, inactive: { icon: homeInactive, left: 53 }, active: { icon: homeActive, left: 57 } },
  { id: 'resume', label: 'Resume', size: 32, top: 292, inactive: { icon: resumeInactive, left: 58 }, active: { icon: resumeActive, left: 65 } },
  { id: 'team', label: 'Team', size: 37, top: 398, inactive: { icon: teamIcon, left: 53 }, active: { icon: teamActive, left: 62, top: 397 } },
  { id: 'companies', label: 'Companies', size: 36, top: 493, inactive: { icon: companiesIcon, left: 53 }, active: { icon: companiesActive, left: 62, top: 492 } },
]

const INDICATOR = 131 // white circle incl. 11px border

type Props = {
  active: NavDestination
  onNavigate: (d: NavDestination) => void
}

export default function Sidebar({ active, onNavigate }: Props) {
  const current = ITEMS.find((i) => i.id === active)!
  const centerY = current.top + current.size / 2

  return (
    <nav className="sidebar" aria-label="Main">
      <div
        className="sidebar__indicator"
        style={{ top: centerY - INDICATOR / 2 }}
        aria-hidden
      />
      {ITEMS.map((item) => {
        const state = item.id === active ? item.active : item.inactive
        return (
          <button
            key={item.id}
            type="button"
            className="sidebar__item"
            style={{ left: state.left, top: state.top ?? item.top, width: item.size, height: item.size }}
            aria-label={item.label}
            aria-current={item.id === active ? 'page' : undefined}
            onClick={() => onNavigate(item.id)}
          >
            <img src={state.icon} alt="" width={item.size} height={item.size} />
            {/* label shows only in the phone tab bar */}
            <span className="sidebar__label" aria-hidden>
              {item.label}
            </span>
          </button>
        )
      })}
    </nav>
  )
}
