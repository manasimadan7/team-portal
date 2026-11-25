import type { Ref } from 'react'
import type { TimelineEntry } from '../data/companies'
import { today } from '../state/portal'
import './CompanyHistory.css'

type Props = {
  entries: TimelineEntry[]
  onAdd: (text: string) => void
  inputRef?: Ref<HTMLInputElement>
  compact?: boolean
}

/** Contact history timeline + "log an update" input (approx. Figma 139:1979). */
export default function CompanyHistory({ entries, onAdd, inputRef, compact }: Props) {
  return (
    <div className={`co-history ${compact ? 'co-history--compact' : ''}`}>
      <div className="co-history__list">
        {entries.map((e, i) => (
          <div key={i} className="co-history__row">
            <p className="co-history__date">{e.date}</p>
            <div className="co-history__text">
              {e.text.map((t, j) => (
                <p key={j}>{t}</p>
              ))}
            </div>
          </div>
        ))}
        <form
          className="co-history__row"
          onSubmit={(ev) => {
            ev.preventDefault()
            const input = ev.currentTarget.elements.namedItem('note') as HTMLInputElement
            if (!input.value.trim()) return
            onAdd(input.value.trim())
            input.value = ''
          }}
        >
          <p className="co-history__date">{today()}</p>
          <input
            ref={inputRef}
            name="note"
            className="co-history__input"
            placeholder="Add an update and press Enter"
            aria-label="New update"
          />
        </form>
      </div>
    </div>
  )
}
