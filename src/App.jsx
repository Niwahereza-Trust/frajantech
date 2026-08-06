import Sidebar from './components/Sidebar.jsx'
import Announcements from './components/Announcements.jsx'
import Hero from './components/Hero.jsx'
import CheckStatus from './components/CheckStatus.jsx'
import Packages from './components/Packages.jsx'
import WhyChoose from './components/WhyChoose.jsx'
import HowItWorks from './components/HowItWorks.jsx'
import Referral from './components/Referral.jsx'
import FAQ from './components/FAQ.jsx'
import Support from './components/Support.jsx'
import Footer from './components/Footer.jsx'
import ConnectModal from './components/ConnectModal.jsx'
import AgentModal from './components/AgentModal.jsx'
import AdminPage from './pages/AdminPage.jsx'
import { ConnectModalProvider } from './context/ConnectModalContext.jsx'
import { AgentModalProvider } from './context/AgentModalContext.jsx'

export default function App() {
  if (window.location.pathname.startsWith('/admin')) {
    return <AdminPage />
  }

  return (
    <ConnectModalProvider>
      <AgentModalProvider>
        <Sidebar />
        <div className="main-content">
          <Announcements />
          <Hero />
          <CheckStatus />
          <Packages />
          <WhyChoose />
          <HowItWorks />
          <Referral />
          <FAQ />
          <Support />
          <Footer />
        </div>
        <ConnectModal />
        <AgentModal />
      </AgentModalProvider>
    </ConnectModalProvider>
  )
}