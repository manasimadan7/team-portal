import { useEffect, useMemo, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { useFrame } from './Frame'
import './TagPicker.css'

type Props = {
  anchor: HTMLElement
  members: string[]
  selected: string[]
  onChange: (next: string[]) => void
  onClose: () => void
}

/**
 * Type-ahead popover to tag placement-team members on a company.
 * Rendered into the artboard (portal) so it isn't clipped by the scrolling list;
 * positioned in artboard px under the anchor button.
 */
export default function TagPicker({ anchor, members, selected, onChange, onClose }: Props) {
  const ref = useRef<HTMLDivElement>(null)
  const [query, setQuery] = useState('')
  const [hi, setHi] = useState(0)
  const frame = anchor.closest('.frame') as HTMLElement
  const { scale, mobile } = useFrame()

  const pos = useMemo(() => {
    const f = frame.getBoundingClientRect()
    const a = anchor.getBoundingClientRect()
    const s = mobile ? 1 : scale
    const width = 260
    const maxLeft = f.width / s - width - 12
    return {
      left: Math.max(12, Math.min((a.left - f.left) / s - 70, maxLeft)),
      top: (a.bottom - f.top) / s + 8,
    }
  }, [anchor, frame, scale, mobile])

  const matches = members.filter(
    (m) => !selected.includes(m) && m.toLowerCase().includes(query.trim().toLowerCase()),
  )

  useEffect(() => setHi(0), [query])

  useEffect(() => {
    const onDown = (e: MouseEvent) => {
      if (!ref.current?.contains(e.target as Node) && !anchor.contains(e.target as Node)) onClose()
    }
    document.addEventListener('mousedown', onDown)
    return () => document.removeEventListener('mousedown', onDown)
  }, [anchor, onClose])

  const add = (name: string) => {
    onChange([...selected, name])
    setQuery('')
  }

  return createPortal(
    <div
      ref={ref}
      className="tag-picker"
      style={{ left: pos.left, top: pos.top }}
      role="dialog"
      aria-label="Tag team members"
    >
      {selected.length > 0 && (
        <div className="tag-picker__chips">
          {selected.map((n) => (
            <span key={n} className="tag-picker__chip">
              {n}
              <button type="button" aria-label={`Remove ${n}`} onClick={() => onChange(selected.filter((x) => x !== n))}>
                ×
              </button>
            </span>
          ))}
        </div>
      )}
      <input
        autoFocus
        className="tag-picker__input"
        placeholder="Type a team member's name"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === 'ArrowDown') {
            e.preventDefault()
            setHi((h) => Math.min(h + 1, matches.length - 1))
          } else if (e.key === 'ArrowUp') {
            e.preventDefault()
            setHi((h) => Math.max(h - 1, 0))
          } else if (e.key === 'Enter' && matches[hi]) {
            add(matches[hi])
          } else if (e.key === 'Backspace' && !query && selected.length) {
            onChange(selected.slice(0, -1))
          } else if (e.key === 'Escape') {
            onClose()
          }
        }}
      />
      <ul className="tag-picker__list" role="listbox">
        {matches.map((m, i) => (
          <li
            key={m}
            role="option"
            aria-selected={i === hi}
            className={i === hi ? 'is-hi' : ''}
            onMouseEnter={() => setHi(i)}
            onMouseDown={(e) => {
              e.preventDefault()
              add(m)
            }}
          >
            <span className="tag-picker__avatar">{m.split(' ').map((p) => p[0]).join('')}</span>
            {m}
          </li>
        ))}
        {matches.length === 0 && <li className="tag-picker__empty">No matching team member</li>}
      </ul>
    </div>,
    frame,
  )
}
