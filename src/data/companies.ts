import type { ChipKey } from './home'
import { team } from './team'

export type CompaniesTab = 'all' | 'assigned' | 'self'

/** Status dot colours exported from Figma: orange = contacted, green = IAF filled, red = reject. */
export type CompanyDot = 'contacted' | 'iaf-filled' | 'reject'

export type Company = {
  id: string
  name: string
  date: string
  lines: [string, string]
  status: CompanyDot
  /** number of team members assigned (person icons on the All tab) */
  team: number
  /** assigned to me (shows on the Assigned tab) */
  mine?: boolean
}

/** Rows for frames 282:10824 (All) and 285:11321 (Assigned) — dummy data, one row per company. */
export const companies: Company[] = [
  { id: 'bcg', name: 'BCG', date: '13/03/2026', lines: ['HR has confirmed they will be coming for the season', 'Pre-placement talk pencilled in for the first week of August.'], status: 'contacted', team: 3, mine: true },
  { id: 'accenture', name: 'Accenture', date: '18/03/2026', lines: ['Research team is finalizing the numbers', 'Final headcount expected by the end of the month.'], status: 'iaf-filled', team: 3, mine: true },
  { id: 'deloitte', name: 'Deloitte', date: '14/03/2026', lines: ['Budget approved for 12 analyst roles this season', 'JD for the risk advisory profile to follow.'], status: 'iaf-filled', team: 1, mine: true },
  { id: 'pwc', name: 'PwC', date: '16/03/2026', lines: ['Campus team asked for last year’s placement report', 'Sent the brochure — awaiting dates.'], status: 'contacted', team: 2, mine: true },
  { id: 'kpmg', name: 'KPMG', date: '17/03/2026', lines: ['Tax & regulatory team keen on dual-degree students', 'Call scheduled with the regional HR lead on Friday.'], status: 'iaf-filled', team: 2, mine: true },
  { id: 'ey', name: 'EY', date: '11/03/2026', lines: ['Hiring freeze for the consulting vertical this cycle', 'Revisit in the winter session.'], status: 'reject', team: 1, mine: true },
  { id: 'mckinsey', name: 'McKinsey & Company', date: '19/03/2026', lines: ['Business analyst role confirmed, 3 interview rounds', 'Wants the resume book by 25th March.'], status: 'iaf-filled', team: 2, mine: true },
  { id: 'google', name: 'Google', date: '12/03/2026', lines: ['STEP internship open for 2nd and 3rd years', 'Online assessment link shared with the team.'], status: 'iaf-filled', team: 3 },
  { id: 'microsoft', name: 'Microsoft', date: '10/03/2026', lines: ['Engage programme slots confirmed for 40 students', 'Coding round on HackerRank, dates TBD.'], status: 'contacted', team: 2 },
  { id: 'goldman', name: 'Goldman Sachs', date: '15/03/2026', lines: ['Quant strats team interested in Maths & CS', 'Needs CPI cut-off confirmation from us.'], status: 'contacted', team: 2 },
  { id: 'tata-motors', name: 'Tata Motors', date: '09/03/2026', lines: ['Core mechanical and EV roles this year', 'Plant visit offered for shortlisted students.'], status: 'iaf-filled', team: 1 },
  { id: 'bain', name: 'Bain & Company', date: '08/03/2026', lines: ['Associate consultant intern — 2 seats only', 'Case interviews in person on campus.'], status: 'contacted', team: 1 },
  { id: 'flipkart', name: 'Flipkart', date: '20/03/2026', lines: ['Product & SDE intern roles; PPO-linked', 'HR asked to move the test to a weekend.'], status: 'iaf-filled', team: 2 },
  { id: 'zomato', name: 'Zomato', date: '07/03/2026', lines: ['No hiring for interns this season', 'Will share full-time JD in July.'], status: 'reject', team: 1 },
  { id: 'isro', name: 'ISRO', date: '05/03/2026', lines: ['Research internships for aerospace students', 'Applications go through their portal — sharing link.'], status: 'contacted', team: 1 },
  { id: 'jane-street', name: 'Jane Street', date: '21/03/2026', lines: ['Trading intern role, very small batch', 'Puzzle round first, then two onsite rounds.'], status: 'contacted', team: 3 },
]

/** Status chips on All / Assigned (counts as designed). */
export const statusChips: { key: ChipKey; label: string; count: number }[] = [
  { key: 'contacted', label: 'Contacted ', count: 4 },
  { key: 'iaf-filled', label: 'IAF Filled', count: 3 },
  { key: 'shortlist', label: 'Shortlist Released', count: 3 },
  { key: 'reject', label: 'Reject', count: 3 },
  { key: 'interviews', label: 'Interviews Conducted', count: 3 },
]

export type Category = 'Design' | 'Consult' | 'Mechanical' | 'Software' | 'Research' | 'Quant'

/** Category chips on Self Allot (282:10076) — geometry varies per chip in Figma. */
export const categoryChips: { key: Category; count: number; variant: string }[] = [
  { key: 'Design', count: 4, variant: 'a' },
  { key: 'Consult', count: 3, variant: 'b' },
  { key: 'Mechanical', count: 3, variant: 'c' },
  { key: 'Software', count: 3, variant: 'd' },
  { key: 'Research', count: 3, variant: 'd' },
  { key: 'Quant', count: 3, variant: 'e' },
]

export const SELF_ALLOT_TOTAL = 25

export type Contact = { name: string; phone: string; email: string }

export type OpenCompany = {
  id: string
  name: string
  date: string
  tags: Category[]
  source: string
  /** job descriptions per tag + where the listing was found (expanded state 282:10217) */
  roles: { tag: Category; text: string; via: 'web' | 'linkedin' }[]
  contacts: Contact[]
}

/** Dummy job descriptions per category (Self Allot expanded state). */
const JD: Record<Category, (co: string) => string> = {
  Design: (co) =>
    `${co} is looking for a detail-oriented design intern to craft product and brand visuals across web and mobile. You will work with product managers and engineers, run quick usability tests and ship polished UI in Figma.`,
  Consult: (co) =>
    `Join ${co} as a summer business analyst. Work on client problems in strategy and operations, build models in Excel, synthesise research into crisp slides and present to engagement managers.`,
  Mechanical: (co) =>
    `${co} is hiring mechanical interns for design and manufacturing. Expect CAD (SolidWorks/CATIA), FEA, shop-floor exposure and a live project with the vehicle or plant engineering team.`,
  Software: (co) =>
    `Software engineering intern at ${co}: build and ship features on a production codebase, write tests, take part in code reviews. Strong DSA and one of Java, C++, Go or Python expected.`,
  Research: (co) =>
    `${co} research internship for students interested in ML, systems or applied science. You'll read papers, run experiments and write up results with a mentor from the research team.`,
  Quant: (co) =>
    `Quantitative research / trading intern at ${co}. Probability, statistics and programming heavy. Expect puzzles, market-making games and a project on real market data.`,
}

const POC_NAMES = ['Sheela Rao', 'Neha Kapoor', 'Arjun Mehta', 'Priya Nair', 'Rahul Verma', 'Ananya Iyer', 'Karan Shah', 'Divya Menon']
const pocsFor = (co: string, i: number): Contact[] => {
  const domain = co.toLowerCase().replace(/[^a-z]/g, '')
  return [0, 1].map((k) => {
    const name = POC_NAMES[(i * 2 + k) % POC_NAMES.length]
    return {
      name,
      phone: `98${String(210 + i * 37 + k * 11).padStart(3, '0')} ${String(41000 + i * 4219 + k * 731).slice(-5)}`,
      email: `${name.split(' ')[0].toLowerCase()}.${k ? 'talent' : 'campus'}@${domain}.com`,
    }
  })
}

const openRow = (i: number, id: string, name: string, date: string, tags: Category[]): OpenCompany => ({
  id,
  name,
  date,
  tags,
  source: '#',
  roles: tags.map((tag, k) => ({ tag, text: JD[tag](name), via: k % 2 ? 'linkedin' : 'web' })),
  contacts: pocsFor(name, i),
})

/** Rows for frame 282:10068 (Self Allot) — dummy unclaimed companies. */
export const openCompanies: OpenCompany[] = [
  openRow(0, 'o-quora', 'Quora', '13/03/2026', ['Software', 'Research']),
  openRow(1, 'o-adobe', 'Adobe', '12/03/2026', ['Design', 'Software']),
  openRow(2, 'o-freies', 'Freies LTD.', '11/03/2026', ['Mechanical']),
  openRow(3, 'o-azure', 'Azure AI', '14/03/2026', ['Research', 'Software']),
  openRow(4, 'o-cred', 'CRED', '15/03/2026', ['Design']),
  openRow(5, 'o-oliver', 'Oliver Wyman', '10/03/2026', ['Consult']),
  openRow(6, 'o-tower', 'Tower Research', '16/03/2026', ['Quant', 'Software']),
  openRow(7, 'o-bosch', 'Bosch', '09/03/2026', ['Mechanical', 'Research']),
  openRow(8, 'o-razorpay', 'Razorpay', '17/03/2026', ['Software', 'Design']),
  openRow(9, 'o-ola-electric', 'Ola Electric', '08/03/2026', ['Mechanical']),
  openRow(10, 'o-kearney', 'Kearney', '18/03/2026', ['Consult']),
  openRow(11, 'o-worldquant', 'WorldQuant', '19/03/2026', ['Quant', 'Research']),
]

/** Placement team members that can be tagged — the Team page roster (263:3130). */
export const teamMembers = team.map((m) => m.name)

export type TimelineEntry = { date: string; text: string[] }

/** Contact history shown when an All / Assigned row is expanded (139:1979). */
export const timelines: Record<string, TimelineEntry[]> = {
  accenture: [
    { date: '1/03/2026', text: ['No response'] },
    { date: '2/03/2026', text: ['Deciding on requirement'] },
    { date: '9/03/2026', text: ['Design team reviewing numbers'] },
    { date: '18/03/2026', text: ['Research team is finalizing the Numbers', 'Final report expected by the end of the month.'] },
  ],
}
const OPENERS = [
  ['No response', 'Shared placement brochure'],
  ['Cold mail sent to campus team', 'Follow-up call — asked for stats'],
  ['Met at the alumni meet', 'Introduced to the HR lead'],
  ['LinkedIn outreach to recruiter', 'Shared JD template and dates'],
]
export const defaultTimeline = (c: Company): TimelineEntry[] => {
  const o = OPENERS[[...c.id].reduce((h, ch) => h + ch.charCodeAt(0), 0) % OPENERS.length]
  return [
    { date: '1/03/2026', text: [o[0]] },
    { date: '4/03/2026', text: [o[1]] },
    { date: c.date.replace(/^0/, ''), text: [...c.lines] },
  ]
}

/** Recipient used by the mail composer (293:11993 shows carrier.hire@mail.com for Accenture). */
export const companyEmail = (name: string) =>
  name === 'Accenture' ? 'carrier.hire@mail.com' : `careers@${name.toLowerCase().replace(/[^a-z]/g, '')}.com`
