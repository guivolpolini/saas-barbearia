import Navbar from '../components/landing/Navbar'
import HeroSection from '../components/landing/HeroSection'
import ServicesSection from '../components/landing/ServicesSection'
import TeamSection from '../components/landing/TeamSection'
import BookingSection from '../components/landing/BookingSection'
import ReviewsSection from '../components/landing/ReviewsSection'
import ContactSection from '../components/landing/ContactSection'
import Footer from '../components/landing/Footer'
import ChatWidget from '../components/chat/ChatWidget'
import { useBusiness } from '../contexts/BusinessContext'

export default function LandingPage() {
  const { loading, error } = useBusiness()

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[var(--color-primary)]">
        <div className="text-center space-y-3">
          <div className="w-10 h-10 border-2 border-[var(--color-accent)] border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-[var(--color-text-muted)] text-sm font-medium">Carregando barbearia...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[var(--color-primary)] px-4">
        <div className="card p-8 text-center max-w-md border border-red-500/20">
          <div className="w-12 h-12 rounded-full bg-red-500/10 text-red-400 flex items-center justify-center mx-auto mb-4 text-xl font-bold">
            ⚠️
          </div>
          <p className="text-red-400 font-bold text-lg mb-1">Empresa não encontrada</p>
          <p className="text-[var(--color-text-muted)] text-sm mb-4">{error}</p>
          <a
            href="?slug=barbearia-prime"
            className="btn-primary text-xs px-4 py-2 inline-block rounded-lg"
          >
            Carregar Barbearia Prime (Padrão)
          </a>
        </div>
      </div>
    )
  }

  return (
    <>
      <Navbar />
      <main>
        <HeroSection />
        <ServicesSection />
        <TeamSection />
        <BookingSection />
        <ReviewsSection />
        <ContactSection />
      </main>
      <Footer />
      <ChatWidget />
    </>
  )
}
