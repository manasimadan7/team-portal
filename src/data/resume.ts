import type { PointStatus } from '../components/ResumePointCard'
import sampleAttachment from '../assets/images/attachment-sample.png'

export const TOTAL_STUDENTS = 150

export const students = [
  'Ravi Prasad', 'Aditi Sharma', 'Vikram Singh', 'Neha Gupta', 'Rohit Mehta', 'Pooja Verma',
  'Anil Kumar', 'Sita Rao', 'Kiran Choudhary', 'Alok Mishra', 'Deepika Joshi', 'Ramesh Iyer',
  'Sanjay Bansal', 'Megha Nair', 'Rajesh Yadav', 'Priya Sethi', 'Kunal Dave', 'Sneha Kapoor',
  'Aditya Verma', 'Nisha Jain', 'Tarun Saxena', 'Sonam Agarwal', 'Manoj Tiwari', 'Kavita Bhatia',
  'Rohan Nanda', 'Geeta Chatterjee', 'Ashok Shah', 'Sakshi Mehta',
]

export type ResumePoint = {
  id: string
  section: 'work' | 'por'
  company: string
  description: string
  status: PointStatus
  attachment: string
}

const SAMPLES = [
  { company: 'Microsoft', description: 'Worked on xzy plaform whithin xzy team. work was deployed and sent across multiple divisions tod o somthing.' },
  { company: 'Google', description: 'Collaborated on the development of a new search algorithm with the AI team. Implemented features that improved user experience across multiple platforms.' },
  { company: 'Apple', description: 'Contributed to the design of a new interface for iOS applications. Worked closely with UX researchers to enhance usability for diverse user groups.' },
  { company: 'Amazon', description: 'Engaged in the optimization of the logistics software within the operations team. Focused on automating processes to increase efficiency across global warehouses.' },
]

/** First student mirrors the Figma frame exactly; the rest reuse the design's sample copy. */
export function initialPoints(): Record<string, ResumePoint[]> {
  const out: Record<string, ResumePoint[]> = {}
  students.forEach((name, si) => {
    const pick = (k: number) => (si === 0 ? SAMPLES[0] : SAMPLES[(si + k) % SAMPLES.length])
    const work: ResumePoint[] = [0, 1, 2, 3].map((k) => ({
      id: `${si}-w${k}`,
      section: 'work',
      ...pick(k),
      status: si === 0 && k < 2 ? 'approved' : 'pending',
      attachment: sampleAttachment,
    }))
    const por: ResumePoint = {
      id: `${si}-p0`,
      section: 'por',
      ...pick(1),
      status: 'pending',
      attachment: sampleAttachment,
    }
    out[name] = [...work, por]
  })
  return out
}
