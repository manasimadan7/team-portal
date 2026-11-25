import { useState } from 'react'
import feedbackPen from '../assets/icons/feedback-pen.svg'
import approveTick from '../assets/icons/approve-tick.svg'
import paperclip from '../assets/icons/paperclip-card.svg'
import checkFaint from '../assets/icons/check-faint.svg'
import checkApproved from '../assets/icons/check-approved.svg'
import sendIcon from '../assets/icons/send.svg'
import './ResumePointCard.css'

export type PointStatus = 'pending' | 'approved'

type Props = {
  company: string
  description: string
  status: PointStatus
  selected: boolean
  feedbackOpen: boolean
  feedback: string
  onSelect: () => void
  onApprove: () => void
  onUnapprove: () => void
  onToggleFeedback: () => void
  onFeedbackChange: (v: string) => void
  onSendFeedback: () => void
  onOpenAttachment: () => void
}

/**
 * Figma component "Frame 2692" (310:14504)
 *  Default  = pending (180h)      → Feedback / Approve / attachment
 *  Variant2 = approved (128h)     → green check, actions hidden
 *  Variant3 = feedback open (334h) → feedback box with send
 */
export default function ResumePointCard(p: Props) {
  const [focused, setFocused] = useState(false)
  const approved = p.status === 'approved'
  const variant = approved ? 'approved' : p.feedbackOpen ? 'feedback' : 'pending'

  return (
    <div
      className={`rp-card rp-card--${variant} ${p.selected ? 'is-selected' : ''}`}
      onClick={p.onSelect}
    >
      {!approved && <div className="rp-card__glow" aria-hidden />}

      <p className="rp-card__title">{p.company}</p>
      <p className="rp-card__desc">{p.description}</p>

      {approved ? (
        <button
          type="button"
          className="rp-card__check rp-card__check--approved"
          aria-label="Approved — click to undo"
          onClick={(e) => {
            e.stopPropagation()
            p.onUnapprove()
          }}
        >
          <img src={checkApproved} alt="" width={27} height={27} />
        </button>
      ) : (
        <img src={checkFaint} alt="" width={25} height={19} className="rp-card__check rp-card__check--faint" />
      )}

      <div className="rp-card__actions" aria-hidden={approved}>
        <button
          type="button"
          className="rp-btn rp-btn--feedback"
          tabIndex={approved ? -1 : 0}
          aria-expanded={p.feedbackOpen}
          onClick={(e) => {
            e.stopPropagation()
            p.onToggleFeedback()
          }}
        >
          <img src={feedbackPen} alt="" width={24} height={24} />
          <span>Feedback</span>
        </button>
        <button
          type="button"
          className="rp-btn rp-btn--approve"
          tabIndex={approved ? -1 : 0}
          onClick={(e) => {
            e.stopPropagation()
            p.onApprove()
          }}
        >
          <img src={approveTick} alt="" width={13} height={10} />
          <span>Approve</span>
        </button>
        <button
          type="button"
          className="rp-btn rp-btn--clip"
          tabIndex={approved ? -1 : 0}
          aria-label="View attachment"
          onClick={(e) => {
            e.stopPropagation()
            p.onOpenAttachment()
          }}
        >
          <img src={paperclip} alt="" width={17} height={17} />
        </button>
      </div>

      {p.feedbackOpen && !approved && (
        <div className={`rp-card__feedback ${focused ? 'is-focused' : ''}`} onClick={(e) => e.stopPropagation()}>
          <textarea
            value={p.feedback}
            placeholder="Attach email threads asw."
            onChange={(e) => p.onFeedbackChange(e.target.value)}
            onFocus={() => setFocused(true)}
            onBlur={() => setFocused(false)}
            autoFocus
          />
          <button type="button" className="rp-card__send" aria-label="Send feedback" onClick={p.onSendFeedback}>
            <img src={sendIcon} alt="" width={24} height={24} />
          </button>
        </div>
      )}
    </div>
  )
}
