import './StatusPill.css'

export type CompanyStatus = 'contacted' | 'iaf-filled' | 'uncontacted'

const LABELS: Record<CompanyStatus, string> = {
  contacted: 'contacted',
  'iaf-filled': 'Iaf Filled',
  uncontacted: 'Uncontacted',
}

/** Figma component "Frame 2687" — variants Default / contacted2 / contacted3. */
export default function StatusPill({ status }: { status: CompanyStatus }) {
  return (
    <div className={`status-pill status-pill--${status}`}>
      <p>{LABELS[status]}</p>
    </div>
  )
}
