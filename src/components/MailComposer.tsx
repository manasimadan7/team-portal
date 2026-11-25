import { useEffect, useRef, useState } from 'react'
import { useFrame } from './Frame'
import composeChrome from '../assets/images/mail-compose.png'
import agentIcon from '../assets/icons/agent-icon.svg'
import './MailComposer.css'

type Props = {
  to: string
  company: string
  onSend: (subject: string) => void
  onClose: () => void
}

type Phase = 'drafting' | 'suggested' | 'accepted'

const DRAFT_MS = 1800

/**
 * Mail plugin with AI-drafted invite (frames 293:11993 → 293:12221 → 293:12440).
 *  drafting  — body is being written (ghost text reveals), agent card shows a loading shimmer
 *  suggested — draft complete (still ghost), agent card shows its note
 *  accepted  — user clicked into / tabbed into the body: draft becomes real, editable text
 */
export default function MailComposer({ to, company, onSend, onClose }: Props) {
  const [phase, setPhase] = useState<Phase>('drafting')
  const [minimized, setMinimized] = useState(false)
  const [toValue, setTo] = useState(to)
  const [subject, setSubject] = useState('Invitation for IITB Placement drive')
  const bodyRef = useRef<HTMLDivElement>(null)
  const { mobile, vw } = useFrame()
  /* On phones the design-px window is scaled down to fit the screen width */
  const composerStyle = mobile
    ? { transform: `translateX(-50%) scale(${Math.min(1, (vw - 16) / 570)})` }
    : undefined
  const agentStyle = mobile ? { transform: `translateX(-50%) scale(${Math.min(0.85, (vw - 24) / 290)})` } : undefined

  useEffect(() => {
    setPhase('drafting')
    setTo(to)
    const t = setTimeout(() => setPhase('suggested'), DRAFT_MS)
    return () => clearTimeout(t)
  }, [to, company])

  const accept = () => {
    if (phase !== 'accepted') setPhase('accepted')
  }

  return (
    <>
      {/* AI agent card (293:12383 / 12384 / 12387) */}
      {!minimized && (
        <div className="agent-card" role="status" aria-live="polite" style={agentStyle}>
          <img src={agentIcon} alt="" width={59.4284} height={60.6665} className="agent-card__icon" />
          {phase === 'drafting' ? (
            <div className="agent-card__thinking" aria-label="Agent is drafting">
              <span style={{ width: 172 }} />
              <span style={{ width: 150 }} />
              <span style={{ width: 120 }} />
            </div>
          ) : (
            <p className="agent-card__note">New Poc is assigned : advisable to send invite again for fresh context</p>
          )}
        </div>
      )}

      {/* Compose window (293:12388) */}
      <div
        className={`composer ${minimized ? 'is-min' : ''}`}
        role="dialog"
        aria-label={`Email ${company}`}
        style={composerStyle}
      >
        <img src={composeChrome} alt="" className="composer__chrome" width={569.774} height={538.79} />

        <div className="composer__title" onClick={() => minimized && setMinimized(false)}>
          {subject || 'New Message'}
        </div>
        <button type="button" className="composer__icon" style={{ left: 477.7 }} aria-label="Minimise" onClick={() => setMinimized((m) => !m)} />
        <button type="button" className="composer__icon" style={{ left: 507.8 }} aria-label="Expand" onClick={() => setMinimized(false)} />
        <button type="button" className="composer__icon" style={{ left: 533.6 }} aria-label="Close" onClick={onClose} />

        {!minimized && (
          <>
            <label className="composer__field" style={{ top: 44 }}>
              <span className="sr-only">To</span>
              <input value={toValue} onChange={(e) => setTo(e.target.value)} />
            </label>
            <label className="composer__field" style={{ top: 87 }}>
              <span className="sr-only">Subject</span>
              <input value={subject} onChange={(e) => setSubject(e.target.value)} />
            </label>

            <div className="composer__body-wrap">
              <div
                ref={bodyRef}
                className={`composer__body composer__body--${phase}`}
                contentEditable
                suppressContentEditableWarning
                spellCheck={phase === 'accepted'}
                onFocus={accept}
                onMouseDown={accept}
                onKeyDown={(e) => {
                  if (e.key === 'Tab' && phase !== 'accepted') {
                    e.preventDefault()
                    accept()
                  }
                }}
              >
                <p>Dear Sir/Madam,</p>
                <p>Greetings from IITB!</p>
                <p>&#8203;</p>
                <p>
                  We take immense pride in introducing our institution as one of the premier centers for higher education,
                  dedicated to nurturing skilled, industry-ready professionals. Our academic programs combine rigorous
                  theoretical knowledge with hands-on practical training.
                </p>
                <p>&#8203;</p>
                <p>
                  We are pleased to invite <b>{company}</b> to participate in our upcoming Campus Placement Drive for the
                  batch graduating in [Year/Month].
                </p>
                <p>
                  Our students specialize in [mention disciplines/courses, e.g., B.Tech Computer Science, MBA, B.Com, etc.]
                  and possess strong analytical, technical, and interpersonal skills.
                </p>
                <p>
                  To make the recruitment process seamless, our Training and Placement Cell will provide all necessary
                  infrastructural support, including:
                </p>
                <ul>
                  <li>Auditoriums and seminar halls for Pre-Placement Talks (PPT)</li>
                  <li>Dedicated computer labs for online/written aptitude tests</li>
                  <li>Private rooms for group discussions and personal interviews</li>
                  <li>Virtual hiring coordination (if preferred)</li>
                </ul>
                <p>
                  We have attached our Placement Brochure herewith, which includes detailed profiles of our graduating
                  students and academic curriculum.
                </p>
              </div>
            </div>

            <button
              type="button"
              className="composer__send"
              aria-label="Send"
              disabled={phase === 'drafting'}
              onClick={() => onSend(subject)}
            />
            <button type="button" className="composer__trash" aria-label="Discard draft" onClick={onClose} />
          </>
        )}
      </div>
    </>
  )
}
