import Navbar from '../components/landing/Navbar'
import HeroSection from '../components/landing/HeroSection'
import ServicesSection from '../components/landing/ServicesSection'
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
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center space-y-3">
          <div className="w-10 h-10 border-2 border-[var(--color-accent)] border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-[var(--color-text-muted)] text-sm">Carregando...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="card p-8 text-center max-w-sm">
          <p className="text-red-400 font-semibold mb-2">Erro ao carregar dados</p>
          <p className="text-[var(--color-text-muted)] text-sm">{error}</p>
          <p className="text-xs text-[var(--color-text-muted)] mt-4">Verifique as variáveis de ambiente do Supabase.</p>
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
        <BookingSection />
        <ReviewsSection />
        <ContactSection />
      </main>
      <Footer />
      <ChatWidget />
    </>
  )
}
