import { createContext, useContext } from 'react'
import type { NavDestination } from '../components/Sidebar'
import type { TimelineEntry } from '../data/companies'
import type { CompanyProfile } from '../data/companyDetail'

/** `base` = the row's starting timeline, so the "Mail sent" entry is appended to it */
export type MailRequest = { to: string; company: string; rowId: string; base: TimelineEntry[] }
export type CompaniesTabReq = 'all' | 'assigned' | 'self'

type Portal = {
  /** per-row contact history, shared by Home and Companies */
  history: Record<string, TimelineEntry[]>
  addEntry: (id: string, base: TimelineEntry[], text: string) => void
  /** open the AI mail plugin */
  openMail: (m: MailRequest) => void
  navigate: (page: NavDestination, opts?: { companiesTab?: CompaniesTabReq }) => void
  toast: (msg: string) => void
  /** open the company detail page (Figma 139:4571 / 139:4229) */
  openCompany: (name: string) => void
  profiles: Record<string, CompanyProfile>
  saveProfile: (name: string, p: CompanyProfile) => void
  /** open a coordinator's dashboard (Home layout with their stats) */
  openMember: (name: string) => void
  /** open the outreach kanban board (Figma 139:2340) — my companies or all companies */
  openBoard: (opts?: { scope?: 'mine' | 'all'; from?: 'home' | 'companies' }) => void
}

export const PortalContext = createContext<Portal>({
  history: {},
  addEntry: () => {},
  openMail: () => {},
  navigate: () => {},
  toast: () => {},
  openCompany: () => {},
  profiles: {},
  saveProfile: () => {},
  openMember: () => {},
  openBoard: () => {},
})
export const usePortal = () => useContext(PortalContext)

export const today = () => {
  const d = new Date()
  return `${d.getDate()}/${String(d.getMonth() + 1).padStart(2, '0')}/${d.getFullYear()}`
}
