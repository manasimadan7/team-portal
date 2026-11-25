import { useCallback, useEffect, useMemo, useState } from 'react'
import Frame from './components/Frame'
import Sidebar, { type NavDestination } from './components/Sidebar'
import Chat from './components/chat/Chat'
import { ChatContext } from './components/chat/ChatContext'
import MailComposer from './components/MailComposer'
import { PortalContext, today, type CompaniesTabReq, type MailRequest } from './state/portal'
import type { TimelineEntry } from './data/companies'
import Home from './pages/Home'
import Resume from './pages/Resume'
import Companies from './pages/Companies'
import Team from './pages/Team'
import CompanyDetail from './pages/CompanyDetail'
import Kanban from './pages/Kanban'
import Splash from './components/Splash'
import type { CompanyProfile } from './data/companyDetail'
import { ME } from './data/team'

function App() {
  const [page, setPage] = useState<NavDestination>('home')
  /** company detail page, opened from a company name; `from` = where Back returns to */
  const [company, setCompany] = useState<{ name: string; from: NavDestination } | null>(null)
  const [profiles, setProfiles] = useState<Record<string, CompanyProfile>>({})
  /** coordinator dashboard opened from the Team page */
  const [member, setMember] = useState<string | null>(null)
  /** outreach kanban board — which companies, and where its List toggle returns to */
  const [board, setBoard] = useState<{ scope: 'mine' | 'all'; from: 'home' | 'companies' } | null>(null)
  const [companiesTab, setCompaniesTab] = useState<CompaniesTabReq>('all')
  const [chatReq, setChatReq] = useState<{ id: string; n: number } | null>(null)
  const [history, setHistory] = useState<Record<string, TimelineEntry[]>>({})
  const [mail, setMail] = useState<MailRequest | null>(null)
  const [toastMsg, setToast] = useState<string | null>(null)

  useEffect(() => {
    if (!toastMsg) return
    const t = setTimeout(() => setToast(null), 2600)
    return () => clearTimeout(t)
  }, [toastMsg])

  const openChat = useCallback((id: string) => setChatReq((r) => ({ id, n: (r?.n ?? 0) + 1 })), [])
  const chatCtx = useMemo(() => ({ openChat }), [openChat])

  const addEntry = useCallback(
    (id: string, base: TimelineEntry[], text: string) =>
      setHistory((h) => ({ ...h, [id]: [...(h[id] ?? base), { date: today(), text: [text] }] })),
    [],
  )

  const portal = useMemo(
    () => ({
      history,
      addEntry,
      openMail: (m: MailRequest) => setMail(m),
      navigate: (p: NavDestination, opts?: { companiesTab?: CompaniesTabReq }) => {
        if (opts?.companiesTab) setCompaniesTab(opts.companiesTab)
        setCompany(null)
        setMember(null)
        setBoard(null)
        setPage(p)
      },
      openBoard: (opts?: { scope?: 'mine' | 'all'; from?: 'home' | 'companies' }) => {
        setCompany(null)
        setMember(null)
        setBoard({ scope: opts?.scope ?? 'mine', from: opts?.from ?? 'home' })
      },
      openMember: (name: string) => {
        setCompany(null)
        setBoard(null)
        if (name === ME) {
          setMember(null)
          setPage('home')
        } else {
          setMember(name)
        }
      },
      toast: (msg: string) => setToast(msg),
      openCompany: (name: string) => setCompany((c) => ({ name, from: c?.from ?? page })),
      profiles,
      saveProfile: (name: string, p: CompanyProfile) => setProfiles((all) => ({ ...all, [name]: p })),
    }),
    [history, addEntry, profiles, page],
  )

  const goTo = (p: NavDestination) => {
    setCompany(null)
    setMember(null)
    setBoard(null)
    setPage(p)
  }

  return (
    <PortalContext.Provider value={portal}>
      <ChatContext.Provider value={chatCtx}>
        <Frame>
          <Sidebar active={company || board ? 'companies' : member ? 'team' : page} onNavigate={goTo} />
          {company ? (
            <CompanyDetail
              name={company.name}
              onBack={() => {
                setCompany(null)
                if (company.from !== page) setPage(company.from)
              }}
            />
          ) : board ? (
            <Kanban
              key={board.scope}
              scope={board.scope}
              onList={() => {
                if (board.from === 'companies') {
                  setCompaniesTab(board.scope === 'all' ? 'all' : 'assigned')
                  goTo('companies')
                } else goTo('home')
              }}
              onGrid={() => {
                setCompaniesTab(board.scope === 'all' ? 'all' : 'assigned')
                goTo('companies')
              }}
            />
          ) : member ? (
            <Home key={member} memberName={member} onBack={() => goTo('team')} />
          ) : (
            <>
              {page === 'home' && <Home />}
              {page === 'resume' && <Resume />}
              {page === 'companies' && <Companies initialTab={companiesTab} onTabChange={setCompaniesTab} />}
              {page === 'team' && <Team />}
            </>
          )}

          {mail && (
            <MailComposer
              to={mail.to}
              company={mail.company}
              onClose={() => setMail(null)}
              onSend={(subject) => {
                addEntry(mail.rowId, mail.base, `Mail sent: ${subject}`)
                setToast(`Message sent to ${mail.to}`)
                setMail(null)
              }}
            />
          )}
          {toastMsg && (
            <div className="mail-toast" role="status">
              {toastMsg}
            </div>
          )}
          <Chat requested={chatReq} />
        </Frame>
        <Splash />
      </ChatContext.Provider>
    </PortalContext.Provider>
  )
}

export default App
