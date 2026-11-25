import { useEffect, useState } from 'react'
import logoBg from '../assets/icons/logo-bg.svg'
import logoFlower from '../assets/icons/logo-flower.svg'
import logoDiamond from '../assets/icons/logo-diamond.svg'
import './Splash.css'

const KEY = 'pp-splash-seen'
const SHOW_MS = 2600
const FADE_MS = 900 // matches the zoom-out exit in Splash.css

/**
 * Splash screen built from the agent logo (Figma 293:12215).
 * The flower spins clockwise while the diamond spins anticlockwise.
 * Shown once per browser session; click / tap / any key skips it.
 */
export default function Splash() {
  /** `?splash` in the URL replays the splash and holds it until clicked (for reviews/demos) */
  const [hold] = useState(() => new URLSearchParams(window.location.search).has('splash'))
  const [phase, setPhase] = useState<'show' | 'fade' | 'done'>(() => {
    if (hold) return 'show'
    try {
      return sessionStorage.getItem(KEY) ? 'done' : 'show'
    } catch {
      return 'show'
    }
  })

  const [pushing, setPushing] = useState(false)
  useEffect(() => {
    // start the push-in just after first paint so the transition runs from scale(1)
    // (a timeout rather than rAF, which never fires while the tab is in the background)
    const id = setTimeout(() => setPushing(true), 40)
    return () => clearTimeout(id)
  }, [])

  useEffect(() => {
    if (phase !== 'show') return
    const t = hold ? undefined : setTimeout(() => setPhase('fade'), SHOW_MS)
    const skip = () => setPhase('fade')
    window.addEventListener('keydown', skip)
    return () => {
      clearTimeout(t)
      window.removeEventListener('keydown', skip)
    }
  }, [phase])

  useEffect(() => {
    if (phase !== 'fade') return
    try {
      sessionStorage.setItem(KEY, '1')
    } catch {
      /* storage unavailable */
    }
    const t = setTimeout(() => setPhase('done'), FADE_MS)
    return () => clearTimeout(t)
  }, [phase])

  if (phase === 'done') return null

  return (
    <div
      className={`splash ${pushing ? 'is-pushing' : ''} ${phase === 'fade' ? 'is-fading' : ''}`}
      role="status"
      aria-label="Loading Placement Portal"
      onClick={() => setPhase('fade')}
    >
      <div className="splash__glow" aria-hidden />
      <div className="splash__logo" aria-hidden>
        {/* zoom wrapper: slow push-in while spinning, then a dive into the flower on exit */}
        <div className="splash__zoom">
          <img src={logoBg} alt="" className="splash__layer" />
          <img src={logoFlower} alt="" className="splash__layer splash__flower" />
          <img src={logoDiamond} alt="" className="splash__layer splash__diamond" />
        </div>
      </div>
      <p className="splash__title">Placement Portal</p>
      <p className="splash__sub">Placement team workspace</p>
      <div className="splash__dots" aria-hidden>
        <i />
        <i />
        <i />
      </div>
    </div>
  )
}
