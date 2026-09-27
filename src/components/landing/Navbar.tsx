import { Scissors } from 'lucide-react'
import { useBusiness } from '../../contexts/BusinessContext'
import { dayName } from '../../lib/utils'

export default function Navbar() {
  const { business } = useBusiness()

  return (
    <nav className="fixed top-0 left-0 right-0 z-40 bg-[var(--color-surface)]/90 backdrop-blur-md border-b border-[var(--color-border)]">
      <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
        <a href="#top" className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-[var(--color-accent)] flex items-center justify-center">
            <Scissors size={18} className="text-black" />
          </div>
          <span className="font-bold text-lg tracking-tight">{business?.name ?? 'Barbearia'}</span>
        </a>

        <div className="hidden md:flex items-center gap-6 text-sm text-[var(--color-text-muted)]">
          <a href="#services" className="hover:text-[var(--color-accent)] transition-colors">Serviços</a>
          <a href="#about" className="hover:text-[var(--color-accent)] transition-colors">Sobre</a>
          <a href="#reviews" className="hover:text-[var(--color-accent)] transition-colors">Avaliações</a>
          <a href="#contact" className="hover:text-[var(--color-accent)] transition-colors">Contato</a>
        </div>

        <a href="#booking" className="btn-primary text-sm px-4 py-2">
          Agendar agora
        </a>
      </div>
    </nav>
  )
}
