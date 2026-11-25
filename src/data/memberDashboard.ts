import type { CompanyStatus } from '../components/StatusPill'
import { funnel as designFunnel, rings as designRings, type CompanyRow } from './home'
import { ROLES, team } from './team'

/**
 * Per-coordinator dashboard data, shaped like the Home page (263:1720) so the same
 * layout can show anyone on the placement team. Values are generated deterministically
 * from the person's name (prototype data).
 */

const hash = (s: string) => [...s].reduce((h, c) => (h * 33 + c.charCodeAt(0)) >>> 0, 5381)
const pick = <T,>(arr: readonly T[], n: number) => arr[n % arr.length]

const DEPARTMENTS = ['Aerospace B.tech', 'Computer Science B.tech', 'Mechanical B.tech', 'Electrical B.tech', 'Chemical B.tech', 'Civil B.tech', 'Metallurgy B.tech', 'Engineering Physics B.tech']
const YEARS = ['2nd year', '3rd year', '4th year', '5th year (Dual Degree)']
const COMMENTS = [
  'HR confirmed the visit dates for this season',
  'Waiting on the job description from the team',
  'IAF shared — follow up by Friday',
  'Shortlist expected next week',
  'Pre-placement talk slot being finalised',
  'No response yet, try the alternate POC',
]
const NOTES = ['Call at 3pm to extend shortlist', 'Send updated proposal by Friday', 'Schedule meeting for next week', 'Share the student resume book', 'Confirm interview panel size']
const STATUSES: CompanyStatus[] = ['contacted', 'iaf-filled', 'uncontacted', 'contacted', 'iaf-filled']

/** Bar height for a value, interpolated through the Figma bars (0→17.874 … 150→107). */
const H_POINTS: [number, number][] = [
  [0, 17.874],
  [20, 33.194],
  [60, 48.514],
  [100, 68],
  [150, 107],
]
const barHeight = (v: number) => {
  for (let i = 1; i < H_POINTS.length; i++) {
    const [v0, h0] = H_POINTS[i - 1]
    const [v1, h1] = H_POINTS[i]
    if (v <= v1) return h0 + ((v - v0) / (v1 - v0)) * (h1 - h0)
  }
  return 107
}
const BAR_BOTTOM = 673

export type FunnelBar = (typeof designFunnel)[number] & { centered?: boolean; empty?: boolean }

export function memberDashboard(name: string) {
  const m = team.find((t) => t.name === name)!
  const h = hash(name)
  const r = (k: number, mod: number) => ((h >>> (k * 3)) ^ (h >>> 7)) % mod

  // Funnel: allotted → contacted → IAF → shortlist → interviews → offers
  const allotted = 60 + r(1, 91) // 60–150
  const contacted = Math.round(allotted * (0.5 + r(2, 30) / 100))
  const iaf = Math.round(contacted * (0.4 + r(3, 30) / 100))
  const shortlist = Math.round(iaf * (0.2 + r(4, 30) / 100))
  const interviews = Math.round(shortlist * (r(5, 70) / 100))
  const offers = Math.round(interviews * (r(6, 60) / 100))
  const values = [allotted, contacted, iaf, shortlist, interviews, offers]

  const funnel: FunnelBar[] = designFunnel.map((b, i) => {
    const v = values[i]
    const height = barHeight(v)
    const top = BAR_BOTTOM - height
    const inside = height >= 30
    return {
      ...b,
      value: v,
      height,
      top,
      valueLeft: b.left + b.width / 2,
      valueTop: inside ? top + height / 2 - 9.6 : top - 24,
      centered: true,
      empty: !inside,
    }
  })

  const rings = designRings.map((ring) => {
    const value =
      ring.key === 'uncontacted'
        ? `${Math.round(((allotted - contacted) / allotted) * 100)}%`
        : ring.key === 'iaf'
          ? String(iaf)
          : ring.key === 'self'
            ? String(5 + r(7, 30))
            : `${55 + r(8, 45)}%`
    return { ...ring, value }
  })

  const names = m.companies.split(',').map((s) => s.trim())
  const rows: CompanyRow[] = names.map((c, i) => ({
    id: (h % 100000) * 10 + i,
    name: c,
    date: `${String(10 + ((h >>> i) % 18)).padStart(2, '0')}/03/2026`,
    comment: pick(COMMENTS, r(i + 1, 97)),
    status: pick(STATUSES, r(i + 2, 89)),
  }))

  const notes = names.slice(0, 3).map((c, i) => ({ company: c, note: pick(NOTES, r(i + 4, 83)) }))

  return {
    member: m,
    profile: {
      name: m.name,
      role: ROLES[m.role].label,
      department: pick(DEPARTMENTS, r(9, 97)),
      year: pick(YEARS, r(10, 89)),
    },
    rings,
    funnel,
    rows,
    notes,
  }
}
