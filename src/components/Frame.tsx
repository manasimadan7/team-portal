import { createContext, useContext, useEffect, useState, type ReactNode } from 'react'
import './Frame.css'

/** Figma artboard: MacBook Pro 16" */
export const FRAME_W = 1728
export const FRAME_H = 1117
/** Below this viewport width the artboard is replaced by a fluid phone layout. */
export const MOBILE_MAX = 899

type FrameInfo = { scale: number; mobile: boolean; vw: number }
const FrameContext = createContext<FrameInfo>({ scale: 1, mobile: false, vw: FRAME_W })
export const useFrame = () => useContext(FrameContext)

const measure = (): FrameInfo => {
  const vw = window.innerWidth
  const mobile = vw <= MOBILE_MAX
  if (mobile) return { scale: 1, mobile, vw }
  const pad = 24
  return {
    scale: Math.min((vw - pad * 2) / FRAME_W, (window.innerHeight - pad * 2) / FRAME_H),
    mobile,
    vw,
  }
}

/**
 * Desktop/tablet: renders the 1728×1117 artboard at exact design coordinates and
 * scales it uniformly to fit the window.
 * Phone (≤ 899px): no scaling — pages reflow via their `@media (max-width: 899px)` rules.
 */
export default function Frame({ children }: { children: ReactNode }) {
  const [info, setInfo] = useState<FrameInfo>(measure)

  useEffect(() => {
    const fit = () => setInfo(measure())
    const mq = window.matchMedia(`(max-width: ${MOBILE_MAX}px)`)
    window.addEventListener('resize', fit)
    mq.addEventListener('change', fit)
    return () => {
      window.removeEventListener('resize', fit)
      mq.removeEventListener('change', fit)
    }
  }, [])

  const { scale, mobile } = info

  return (
    <FrameContext.Provider value={info}>
      <div className={`frame-viewport ${mobile ? 'is-mobile' : ''}`}>
        <div
          className="frame-sizer"
          style={mobile ? undefined : { width: FRAME_W * scale, height: FRAME_H * scale }}
        >
          <div className="frame" style={mobile ? undefined : { transform: `scale(${scale})` }}>
            {children}
          </div>
        </div>
      </div>
    </FrameContext.Provider>
  )
}
