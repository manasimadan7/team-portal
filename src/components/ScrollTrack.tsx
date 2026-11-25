import { useEffect, useRef, useState, type CSSProperties, type RefObject } from 'react'
import './ScrollTrack.css'

type Variant = 'home' | 'companies' | 'resume' | 'team'

type Props = {
  /** the element that actually scrolls */
  target: RefObject<HTMLElement | null>
  variant: Variant
  /** placement of the track in its positioned parent (design px) */
  style: CSSProperties
  /** re-measure when this changes (e.g. list contents) */
  watch?: unknown
}

/**
 * Real scrollbar drawn in the Figma style: the track spans the whole scroll viewport,
 * the thumb is sized to the visible fraction of the content, follows scrolling,
 * can be dragged, and clicking the track pages to that spot. Hidden when nothing scrolls.
 */
export default function ScrollTrack({ target, variant, style, watch }: Props) {
  const trackRef = useRef<HTMLDivElement>(null)
  const [m, setM] = useState({ ratio: 1, pos: 0, show: false })
  const [dragging, setDragging] = useState(false)

  useEffect(() => {
    const el = target.current
    if (!el) return
    const update = () => {
      const { scrollTop, scrollHeight, clientHeight } = el
      const show = scrollHeight > clientHeight + 1
      setM({
        ratio: Math.min(1, clientHeight / scrollHeight),
        pos: show ? scrollTop / (scrollHeight - clientHeight) : 0,
        show,
      })
    }
    update()
    el.addEventListener('scroll', update, { passive: true })
    const ro = new ResizeObserver(update)
    ro.observe(el)
    const mo = new MutationObserver(() => {
      update()
      Array.from(el.children).forEach((c) => ro.observe(c))
    })
    mo.observe(el, { childList: true, subtree: true })
    Array.from(el.children).forEach((c) => ro.observe(c))
    return () => {
      el.removeEventListener('scroll', update)
      ro.disconnect()
      mo.disconnect()
    }
  }, [target, watch])

  const trackH = trackRef.current?.clientHeight ?? 0
  const thumbH = Math.max(36, m.ratio * trackH)
  const top = m.pos * Math.max(0, trackH - thumbH)

  const scrollToRatio = (r: number) => {
    const el = target.current
    if (!el) return
    el.scrollTop = r * (el.scrollHeight - el.clientHeight)
  }

  const onThumbDown = (e: React.PointerEvent<HTMLDivElement>) => {
    e.preventDefault()
    e.stopPropagation()
    const el = target.current
    const track = trackRef.current
    if (!el || !track) return
    const startY = e.clientY
    const startTop = el.scrollTop
    const rect = track.getBoundingClientRect() // screen px (accounts for artboard scale)
    const scale = rect.height / track.clientHeight
    const travel = (rect.height - thumbH * scale) || 1
    const range = el.scrollHeight - el.clientHeight
    setDragging(true)
    const move = (ev: PointerEvent) => {
      el.scrollTop = startTop + ((ev.clientY - startY) / travel) * range
    }
    const up = () => {
      setDragging(false)
      window.removeEventListener('pointermove', move)
      window.removeEventListener('pointerup', up)
    }
    window.addEventListener('pointermove', move)
    window.addEventListener('pointerup', up)
  }

  const onTrackDown = (e: React.PointerEvent<HTMLDivElement>) => {
    const rect = trackRef.current!.getBoundingClientRect()
    const scale = rect.height / trackRef.current!.clientHeight
    const y = (e.clientY - rect.top) / scale - thumbH / 2
    scrollToRatio(Math.max(0, Math.min(1, y / Math.max(1, trackH - thumbH))))
  }

  return (
    <div
      ref={trackRef}
      className={`strack strack--${variant} ${m.show ? '' : 'is-hidden'} ${dragging ? 'is-dragging' : ''}`}
      style={style}
      onPointerDown={onTrackDown}
      aria-hidden
    >
      <div className="strack__thumb" style={{ height: thumbH, transform: `translateY(${top}px)` }} onPointerDown={onThumbDown} />
    </div>
  )
}
