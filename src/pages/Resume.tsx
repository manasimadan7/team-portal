import { useMemo, useRef, useState } from 'react'
import ResumePointCard from '../components/ResumePointCard'
import ScrollTrack from '../components/ScrollTrack'
import { TOTAL_STUDENTS, initialPoints, students, type ResumePoint } from '../data/resume'

import glowTop from '../assets/icons/glow-top.svg'
import glowWide from '../assets/icons/glow-wide.svg'
import glowBottom from '../assets/icons/glow-bottom.svg'
import dividerStudent from '../assets/icons/divider-student.svg'
import edit3 from '../assets/icons/edit-3.svg'
import paperclipChip from '../assets/icons/paperclip-chip.svg'
import paperclipLabel from '../assets/icons/paperclip-label.svg'
import feedbackIcon from '../assets/icons/feedback.svg'
import minusIcon from '../assets/icons/minus.svg'
import addIcon from '../assets/icons/add-sm.svg'
import './Resume.css'

const ZOOM_MIN = 50
const ZOOM_MAX = 200
const ZOOM_STEP = 10


export default function Resume() {
  const [points, setPoints] = useState(initialPoints)
  const [student, setStudent] = useState(students[0])
  const [selectedId, setSelectedId] = useState<string>(`0-w2`)
  const [feedbackId, setFeedbackId] = useState<string | null>(null)
  const [drafts, setDrafts] = useState<Record<string, string>>({})
  const [zoom, setZoom] = useState(100)
  /** phone only: students drawer (left) and the proof / attachment sheet */
  const [drawer, setDrawer] = useState(false)
  const [proof, setProof] = useState(false)
  const studentsRef = useRef<HTMLDivElement>(null)
  const reviewRef = useRef<HTMLDivElement>(null)

  const list = points[student]
  const work = list.filter((p) => p.section === 'work')
  const pors = list.filter((p) => p.section === 'por')
  const selected = list.find((p) => p.id === selectedId) ?? list[0]

  const verified = useMemo(
    () => Object.values(points).filter((ps) => ps.every((p) => p.status === 'approved')).length,
    [points],
  )

  const update = (id: string, patch: Partial<ResumePoint>) =>
    setPoints((all) => ({
      ...all,
      [student]: all[student].map((p) => (p.id === id ? { ...p, ...patch } : p)),
    }))

  const pickStudent = (name: string) => {
    setStudent(name)
    setSelectedId(points[name][0].id)
    setFeedbackId(null)
    setZoom(100)
    setDrawer(false)
  }

  const renderCard = (p: ResumePoint) => (
    <ResumePointCard
      key={p.id}
      company={p.company}
      description={p.description}
      status={p.status}
      selected={p.id === selected.id}
      feedbackOpen={feedbackId === p.id}
      feedback={drafts[p.id] ?? ''}
      onSelect={() => setSelectedId(p.id)}
      onApprove={() => {
        update(p.id, { status: 'approved' })
        if (feedbackId === p.id) setFeedbackId(null)
      }}
      onUnapprove={() => update(p.id, { status: 'pending' })}
      onToggleFeedback={() => {
        setSelectedId(p.id)
        setFeedbackId(feedbackId === p.id ? null : p.id)
      }}
      onFeedbackChange={(v) => setDrafts((d) => ({ ...d, [p.id]: v }))}
      onSendFeedback={() => setFeedbackId(null)}
      onOpenAttachment={() => {
        setSelectedId(p.id)
        setZoom(100)
        setProof(true)
      }}
    />
  )

  return (
    <main className={`resume ${drawer ? 'is-drawer' : ''} ${proof ? 'is-proof' : ''}`}>
      {/* Bottom-left decoration (310:14320 / 310:14321) */}
      <div className="resume__fade" aria-hidden />
      <img src={glowBottom} alt="" className="glow glow--bottom" width={1142.85} height={530.607} aria-hidden />

      <p className="resume__title">Resume</p>

      {/* phone only: current student + opener for the students drawer */}
      <button type="button" className="resume__who" aria-expanded={drawer} onClick={() => setDrawer(true)}>
        <span className="resume__who-burger" aria-hidden>
          <i />
          <i />
          <i />
        </span>
        <span className="resume__who-text">
          <small>Reviewing</small>
          {student}
        </span>
        <span className="resume__who-change">Change</span>
      </button>
      <div className="resume__scrim" aria-hidden onClick={() => setDrawer(false)} />
      <div className="resume__counter">
        <p>
          {verified}/{TOTAL_STUDENTS}
        </p>
      </div>

      {/* ---------- Assigned students (313:14972) ---------- */}
      <section className="students">
        <p className="students__title">Assigned Students</p>
        <button type="button" className="students__close" aria-label="Close students" onClick={() => setDrawer(false)}>
          ×
        </button>
        <div className="students__list" ref={studentsRef}>
          {students.map((name) => (
            <button
              key={name}
              type="button"
              className={`student ${name === student ? 'is-active' : ''}`}
              aria-pressed={name === student}
              onClick={() => pickStudent(name)}
            >
              {name === student && <span className="student__pill" aria-hidden />}
              <span className="student__name">{name}</span>
              <img src={dividerStudent} alt="" width={194} height={1} />
            </button>
          ))}
        </div>
        <ScrollTrack target={studentsRef} variant="resume" style={{ left: 200, top: 81, bottom: 16 }} />
      </section>

      {/* ---------- Review panel (310:14337) ---------- */}
      <section className="review">
        <img src={glowTop} alt="" className="glow glow--top" width={1128.16} height={617.443} aria-hidden />
        <img src={glowWide} alt="" className="glow glow--wide" width={568.164} height={1751.23} aria-hidden />

        <ScrollTrack
          target={reviewRef}
          variant="resume"
          style={{ left: 24.5, top: 23, bottom: 16 }}
          watch={`${student}-${feedbackId}-${list.map((p) => p.status).join()}`}
        />

        <div className="review__list" ref={reviewRef}>
          <p className="review__heading">Work experience</p>
          <div className="review__cards">{work.map(renderCard)}</div>
          <p className="review__heading">PORs</p>
          {pors.map(renderCard)}
        </div>

        {/* Floating quick actions (310:14342 / 310:14344) */}
        <button
          type="button"
          className="review__fab review__fab--attach"
          aria-label="Show attachment for the selected point"
          title="Show attachment"
          onClick={() => setZoom(100)}
        >
          <img src={paperclipChip} alt="" width={17} height={17} />
        </button>
        <button
          type="button"
          className="review__fab review__fab--edit"
          aria-label="Write feedback on the selected point"
          title="Feedback"
          onClick={() => selected.status !== 'approved' && setFeedbackId(selected.id)}
        >
          <img src={edit3} alt="" width={17} height={17} />
        </button>

        {/* ---------- Attachment viewer (310:14346) ---------- */}
        <div className="viewer">
          <button type="button" className="viewer__close" aria-label="Close proof" onClick={() => setProof(false)}>
            ×
          </button>
          <div className="viewer__label">
            <img src={paperclipLabel} alt="" width={17} height={17} />
            <p>Attachment</p>
          </div>
          <p className="viewer__company">{selected.company}</p>

          <button
            type="button"
            className="viewer__btn viewer__btn--feedback"
            aria-label="Give feedback on this point"
            title={selected.status === 'approved' ? 'Already approved' : 'Feedback'}
            disabled={selected.status === 'approved'}
            onClick={() => setFeedbackId(selected.id)}
          >
            <img src={feedbackIcon} alt="" width={18} height={17} />
          </button>
          <button
            type="button"
            className="viewer__btn viewer__btn--minus"
            aria-label="Zoom out"
            disabled={zoom <= ZOOM_MIN}
            onClick={() => setZoom((z) => Math.max(ZOOM_MIN, z - ZOOM_STEP))}
          >
            <img src={minusIcon} alt="" width={18} height={18} />
          </button>
          <button
            type="button"
            className="viewer__btn viewer__btn--add"
            aria-label="Zoom in"
            disabled={zoom >= ZOOM_MAX}
            onClick={() => setZoom((z) => Math.min(ZOOM_MAX, z + ZOOM_STEP))}
          >
            <img src={addIcon} alt="" width={20} height={20} />
          </button>
          <button type="button" className="viewer__zoom" aria-label="Reset zoom" onClick={() => setZoom(100)}>
            <p>{zoom}%</p>
          </button>

          <div className="viewer__doc">
            <img
              src={selected.attachment}
              alt={`${selected.company} attachment`}
              style={{ width: 528 * (zoom / 100), height: 685 * (zoom / 100), ['--z' as string]: zoom / 100 }}
            />
          </div>
        </div>
      </section>
    </main>
  )
}
