import { allCompanyNames } from './companyDetail'

/** Outreach pipeline stages — kanban board (Figma 139:2340). */
export type StageKey = 'contacted' | 'iaf-filled' | 'iaf-opened' | 'iaf-closed' | 'shortlist' | 'interviews' | 'selections'

export const STAGES: { key: StageKey; label: string[] }[] = [
  { key: 'contacted', label: ['Contacted'] },
  { key: 'iaf-filled', label: ['IAF Filled'] },
  { key: 'iaf-opened', label: ['IAF Opened'] },
  { key: 'iaf-closed', label: ['IAF Closed'] },
  { key: 'shortlist', label: ['Shortlist released'] },
  { key: 'interviews', label: ['Interviews', 'Conducted'] },
  { key: 'selections', label: ['Selections', 'out'] },
]

/** Starting board. Company names follow the Figma frame (duplicates there are placeholders, so they're made unique). */
export const initialBoard: Record<StageKey, string[]> = {
  contacted: [
    'BCG', 'IBM', 'Google', 'Microsoft', 'Apple', 'Amazon', 'Tesla', 'Facebook', 'NVIDIA', 'Netflix', 'Salesforce', 'Adobe',
    'Quora', 'Freies LTD.', 'Azure Ai', 'HCL', 'Tech Mahindra', 'Cognizant', 'Zomato', 'Ola', 'Paytm', 'Reliance',
    'Tata Group', 'Mahindra', 'Bain', 'TCS', 'Atlassian', 'Bosch',
  ],
  'iaf-filled': ['Oracle', 'SAP', 'Intel', 'Zoom', 'Uber', 'Twitter', 'Spotify', 'LinkedIn', 'Snap', 'Pinterest', 'Slack', 'Dropbox'],
  'iaf-opened': ['Qualcomm', 'Cisco', 'Siemens', 'ABB', 'Capgemini'],
  'iaf-closed': ['Deloitte', 'KPMG', 'EY', 'PwC', 'Accenture'],
  shortlist: ['Flipkart', 'Swiggy', 'Meesho'],
  interviews: ['AMD', 'Wipro'],
  selections: [],
}

export type BoardScope = 'mine' | 'all'

/**
 * Board for every company in the portal (Companies → All): the "My Companies" board plus
 * every other known company, placed in a stage deterministically (weighted to early stages).
 */
export function allCompaniesBoard(): Record<StageKey, string[]> {
  const board = Object.fromEntries(
    Object.entries(initialBoard).map(([k, v]) => [k, [...v]]),
  ) as Record<StageKey, string[]>
  const placed = new Set(Object.values(board).flat())
  const weights: [StageKey, number][] = [
    ['contacted', 40],
    ['iaf-filled', 22],
    ['iaf-opened', 12],
    ['iaf-closed', 10],
    ['shortlist', 8],
    ['interviews', 5],
    ['selections', 3],
  ]
  const total = weights.reduce((a, [, w]) => a + w, 0)
  for (const name of allCompanyNames) {
    if (placed.has(name)) continue
    let h = [...name].reduce((x, c) => (x * 31 + c.charCodeAt(0)) >>> 0, 11) % total
    for (const [k, w] of weights) {
      if (h < w) {
        board[k].push(name)
        break
      }
      h -= w
    }
  }
  return board
}
