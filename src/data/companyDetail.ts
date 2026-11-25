import { companies, openCompanies, type TimelineEntry } from './companies'
import { myCompanies } from './home'
import { team } from './team'

/** Hiring history shown in the bar chart (Figma 139:4571 — Accenture values read off the bars). */
export const CHART_YEARS = [2021, 2022, 2023, 2024, 2025]
export const CURRENT_YEAR = 2026
export const ALL_YEARS = [...CHART_YEARS, CURRENT_YEAR]

const hash = (s: string) => [...s].reduce((h, c) => (h * 31 + c.charCodeAt(0)) >>> 0, 7)

export function hiresFor(name: string): number[] {
  if (name === 'Accenture') return [15, 18, 11, 9, 12]
  const h = hash(name)
  return CHART_YEARS.map((_, i) => 4 + ((h >> (i * 3)) % 15))
}

/** Contact timeline for a given year (design shows the same cadence for each year). */
const TEMPLATE: { day: string; text: string[] }[] = [
  { day: '1/03', text: ['No response'] },
  { day: '2/03', text: ['Deciding on requirement'] },
  { day: '9/03', text: ['Design team reviewing numbers'] },
  { day: '18/03', text: ['Research team is finalizing the Numbers', 'Final report expected by the end of the month.'] },
  { day: '28/03', text: ['IAF Filled'] },
]
export const timelineForYear = (year: number): TimelineEntry[] =>
  TEMPLATE.map((t) => ({ date: `${t.day}/${year}`, text: t.text }))

/** Every company name that can be opened / searched. */
export const allCompanyNames = Array.from(
  new Set([
    ...companies.map((c) => c.name),
    ...openCompanies.map((c) => c.name),
    ...myCompanies.map((c) => c.name),
    ...team.flatMap((m) => m.companies.split(',').map((s) => s.trim())),
  ]),
).sort((a, b) => a.localeCompare(b))

export type CompanyProfile = { selections: string; slot: string; eligibility: string }

/** Placeholder copy shown in the empty eligibility editor (139:4331). */
export const ELIGIBILITY_PLACEHOLDER = (name: string) =>
  [
    'Eligibility Criteria',
    'Academic Threshold: Minimum 60% or 6.5 CGPA in current graduation/post-graduation with no active backlogs at the time of application.',
    'Education Gap: Maximum 1 year of total academic gap (allowed only between 10th and graduation; no gaps permitted during the degree program).',
    `Prior Application: Minimum 3-month cooling-off period if previously evaluated in an ${name} recruitment drive.`,
  ].join('\n')
