import { useEffect, useState, type ReactNode } from 'react'
import { MOBILE_MAX } from './Frame'
import './DevicePreview.css'

type Device = 'desktop' | 'phone'
const KEY = 'pp-device'
const PHONE = { w: 390, h: 844 }
const STATUS_H = 44

const read = (): Device => {
  try {
    return localStorage.getItem(KEY) === 'phone' ? 'phone' : 'desktop'
  } catch {
    return 'desktop'
  }
}

/** True inside the phone preview's iframe — the app renders on its own there. */
export const isEmbedded = () => new URLSearchParams(window.location.search).has('embed')

/**
 * Prototype-only Desktop / Phone switch (not part of the product UI).
 * Phone mode loads the same app in a 390×844 iframe, so the real `@media (max-width: 899px)`
 * phone layout kicks in exactly as it would on a device. Hidden when the window is already
 * phone-sized. The choice is remembered per browser.
 */
export default function DevicePreview({ children }: { children: ReactNode }) {
  const [device, setDevice] = useState<Device>(read)
  const [wide, setWide] = useState(() => window.innerWidth > MOBILE_MAX)
  const [fit, setFit] = useState(1)

  useEffect(() => {
    const onResize = () => {
      setWide(window.innerWidth > MOBILE_MAX)
      // scale the phone down if the window is too short for it (bezel + label ≈ 110px)
      setFit(Math.min(1, (window.innerHeight - 110) / (PHONE.h + 28)))
    }
    onResize()
    window.addEventListener('resize', onResize)
    return () => window.removeEventListener('resize', onResize)
  }, [])

  const choose = (d: Device) => {
    setDevice(d)
    try {
      localStorage.setItem(KEY, d)
    } catch {
      /* storage unavailable */
    }
  }

  const phone = wide && device === 'phone'
  // same page + ?embed (keeps any host path/query, so it also works when published)
  const src = (() => {
    const u = new URL(window.location.href)
    u.searchParams.set('embed', '')
    u.searchParams.delete('splash')
    return u.toString()
  })()

  return (
    <>
      {phone ? (
        <div className="device-stage">
          <div className="device-phone" style={{ transform: `scale(${fit})` }}>
            <div className="device-phone__notch" aria-hidden />
            {/* status-bar strip under the notch, then the app viewport */}
            <div className="device-phone__display">
              <iframe title="Phone preview" src={src} width={PHONE.w} height={PHONE.h - STATUS_H} className="device-phone__screen" />
            </div>
          </div>
          <p className="device-stage__label">
            Phone preview · {PHONE.w} × {PHONE.h}
          </p>
        </div>
      ) : (
        children
      )}

      {wide && (
        <div className="device-toggle" role="group" aria-label="Preview device">
          <button type="button" className={device === 'desktop' ? 'is-on' : ''} aria-pressed={device === 'desktop'} onClick={() => choose('desktop')}>
            <svg width="16" height="16" viewBox="0 0 24 24" aria-hidden>
              <path fill="currentColor" d="M4 5h16a1 1 0 0 1 1 1v10a1 1 0 0 1-1 1h-6v2h3v2H7v-2h3v-2H4a1 1 0 0 1-1-1V6a1 1 0 0 1 1-1Zm1 2v8h14V7H5Z" />
            </svg>
            Desktop
          </button>
          <button type="button" className={device === 'phone' ? 'is-on' : ''} aria-pressed={device === 'phone'} onClick={() => choose('phone')}>
            <svg width="16" height="16" viewBox="0 0 24 24" aria-hidden>
              <path fill="currentColor" d="M8 2h8a2 2 0 0 1 2 2v16a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2Zm0 2v16h8V4H8Zm3 13h2v2h-2v-2Z" />
            </svg>
            Phone
          </button>
        </div>
      )}
    </>
  )
}
