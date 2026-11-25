import type { CompanyStatus } from '../components/StatusPill'

export const profile = {
  name: 'Ravi Hari',
  role: 'Internship Coordinator',
  department: 'Aerospace B.tech',
  year: '3rd year',
}

export const rings = [
  { key: 'uncontacted', label: 'Uncontacted', value: '54%', left: 205.81, valueX: 266.42, labelX: 262.69, color: 'var(--text-default-alt-13)' },
  { key: 'iaf', label: 'IAF Filled', value: '104', left: 372.81, valueX: 432.92, labelX: 429.69, color: 'var(--text-default-alt-10)' },
  { key: 'self', label: 'Self allotment', value: '25', left: 549, valueX: 609.61, labelX: 605.88, color: 'var(--text-default-alt-10)' },
  { key: 'resumes', label: 'Resumes verified', value: '84%', left: 714, valueX: 774.58, labelX: 773.73, color: 'var(--text-default-alt-14)' },
] as const

/** Funnel bars — geometry straight from Figma. */
export const funnel = [
  { label: ['Alloted Companies'], value: 150, left: 194, width: 103, height: 107, top: 566, opacity: 1, valueLeft: 229.19, valueTop: 605.13, captionLeft: 194 },
  { label: ['Companies Contacted'], value: 100, left: 303, width: 103, height: 68, top: 605, opacity: 0.8, valueLeft: 338.88, valueTop: 628.11, captionLeft: 302.52 },
  { label: ['Iaf', 'Filled'], value: 60, left: 411.04, width: 103.411, height: 48.514, top: 624.49, opacity: 0.5, valueLeft: 440.4, valueTop: 638.53, captionLeft: 411.04 },
  { label: ['Shortlist Released'], value: 20, left: 519.55, width: 103.411, height: 33.194, top: 639.81, opacity: 0.4, valueLeft: 552.75, valueTop: 646.19, captionLeft: 519.55 },
  { label: ['Interview Conducted'], value: 0, left: 628.07, width: 103.411, height: 17.874, top: 655.13, opacity: 0.2, valueLeft: 662.54, valueTop: 630.87, captionLeft: 628.07 },
  { label: ['Offers', 'released'], value: 0, left: 736.59, width: 103.411, height: 17.874, top: 655.13, opacity: 0.1, valueLeft: 774.89, valueTop: 630.87, captionLeft: 736.59 },
]

export const notes = [
  { company: 'Boston consulting group', note: 'Call at 3pm to extend shortlist', height: 53, noteLeft: 300 },
  { company: 'McKinsey & Company', note: 'Send updated proposal by Friday', height: 52, noteLeft: 300 },
  { company: 'Deloitte', note: 'Schedule meeting for next week', height: 53, noteLeft: 299 },
]

export type ChipKey = 'contacted' | 'iaf-filled' | 'shortlist' | 'reject' | 'interviews'

export const chips: { key: ChipKey; label: string; count: number }[] = [
  { key: 'contacted', label: 'Contacted ', count: 4 },
  { key: 'iaf-filled', label: 'IAF Filled', count: 3 },
  { key: 'shortlist', label: 'Shortlist Released', count: 3 },
  { key: 'reject', label: 'Reject', count: 3 },
  { key: 'interviews', label: 'Interviews Conducted', count: 3 },
]

export type CompanyRow = {
  id: number
  name: string
  date: string
  comment: string
  status: CompanyStatus
}

export const myCompanies: CompanyRow[] = [
  { id: 1, name: 'PwC', date: '16/03/2026', comment: 'Campus team asked for last year’s placement report', status: 'iaf-filled' },
  { id: 2, name: 'McKinsey & Company', date: '19/03/2026', comment: 'Wants the resume book by 25th March', status: 'iaf-filled' },
  { id: 3, name: 'BCG', date: '13/03/2026', comment: 'HR confirmed they will be coming for the season', status: 'contacted' },
  { id: 4, name: 'Deloitte', date: '14/03/2026', comment: 'Budget approved for 12 analyst roles', status: 'iaf-filled' },
  { id: 5, name: 'KPMG', date: '17/03/2026', comment: 'Call with the regional HR lead on Friday', status: 'contacted' },
  { id: 6, name: 'Reliance Jio', date: '06/03/2026', comment: 'Mail bounced — finding a new point of contact', status: 'uncontacted' },
  { id: 7, name: 'Accenture', date: '18/03/2026', comment: 'Final headcount expected by the end of the month', status: 'contacted' },
  { id: 8, name: 'Hindustan Unilever', date: '12/03/2026', comment: 'Interested in the supply chain profile', status: 'contacted' },
  { id: 9, name: 'Airbus', date: '05/03/2026', comment: 'Aero structures internship — waiting on JD', status: 'uncontacted' },
  { id: 10, name: 'Amazon', date: '20/03/2026', comment: 'SDE intern test dates shared with students', status: 'iaf-filled' },
]
