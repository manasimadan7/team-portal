export type Role = 'intern' | 'apc' | 'cc'

export const ROLES: Record<Role, { label: string; plural: string }> = {
  intern: { label: 'Internship Coordinator', plural: 'Internship Coordinators' },
  apc: { label: 'Associate Placement Coordinator', plural: 'Associate Placement Coordinators' },
  cc: { label: 'Company Coordinator', plural: 'Company Coordinators' },
}

export type Member = { name: string; role: Role; companies: string }

/** Rows from frame 263:3130. The signed-in user is Ravi Hari (Home profile). */
export const team: Member[] = [
  { name: 'Ravi Hari', role: 'intern', companies: 'Google, Microsoft, Amazon' },
  { name: 'Priya Nair', role: 'intern', companies: 'Flipkart, Meesho, Swiggy' },
  { name: 'Arjun Mehta', role: 'apc', companies: 'Infosys, TCS, Wipro' },
  { name: 'Ananya Iyer', role: 'apc', companies: 'HCL, Tech Mahindra, Cognizant' },
  { name: 'Rohan Gupta', role: 'cc', companies: 'Goldman Sachs, JP Morgan, Deloitte' },
  { name: 'Ishita Singh', role: 'intern', companies: 'Adobe, Atlassian, Salesforce' },
  { name: 'Vihaan Rao', role: 'cc', companies: 'KPMG, EY, PwC' },
  { name: 'Diya Nair', role: 'apc', companies: 'Zomato, Ola, Paytm' },
  { name: 'Kabir Verma', role: 'intern', companies: 'Intel, NVIDIA, Qualcomm' },
  { name: 'Meera Joshi', role: 'cc', companies: 'BCG, McKinsey, Bain' },
  { name: 'Aditya Kumar', role: 'apc', companies: 'Accenture, IBM, Capgemini' },
  { name: 'Saanvi Reddy', role: 'intern', companies: 'Oracle, SAP, Cisco' },
  { name: 'Rahul Kapoor', role: 'cc', companies: 'Reliance, Tata Group, Mahindra' },
  { name: 'Kavya Menon', role: 'intern', companies: 'Bosch, Siemens, ABB' },
]

export const ME = 'Ravi Hari'
export const roleOf = (name: string) => team.find((m) => m.name === name)?.role
