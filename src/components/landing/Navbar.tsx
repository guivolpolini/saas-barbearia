import { Scissors, Sparkles } from 'lucide-react'
import { useBusiness } from '../../contexts/BusinessContext'
import { getBusinessStatus } from '../../lib/utils'

export default function Navbar() {
  const { business, hours, currentSlug, setSlug } = useBusiness()
  const status = getBusinessStatus(hours)

  return (
    <nav className="fixed top-0 left-0 right-0 z-40 bg-[var(--color-surface)]/90 backdrop-blur-md border-b border-[var(--color-border)]">
      <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
        {/* Brand */}
        <a href="#top" className="flex items-center gap-3 group">
          <div className="w-9 h-9 rounded-xl bg-[var(--color-accent)]/15 border border-[var(--color-accent)]/30 flex items-center justify-center text-[var(--color-accent)] group-hover:scale-105 transition-transform">
            <Scissors size={18} />
          </div>
          <div className="flex flex-col">
            <span className="font-bold text-base tracking-tight text-[var(--color-text)]">
              {business?.name ?? 'Barbearia Prime'}
            </span>
            <span className="text-[11px] text-[var(--color-text-muted)] flex items-center gap-1.5">
              <span className={`w-1.5 h-1.5 rounded-full ${status.isOpen ? 'bg-emerald-400 animate-pulse' : 'bg-amber-400'}`} />
              {status.label}
            </span>
          </div>
        </a>

        {/* Links */}
        <div className="hidden md:flex items-center gap-7 text-sm font-medium text-[var(--color-text-muted)]">
          <a href="#services" className="hover:text-[var(--color-accent)] transition-colors">Serviços</a>
          <a href="#team" className="hover:text-[var(--color-accent)] transition-colors">Equipe</a>
          <a href="#reviews" className="hover:text-[var(--color-accent)] transition-colors">Avaliações</a>
          <a href="#contact" className="hover:text-[var(--color-accent)] transition-colors">Localização</a>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-3">
          <a
            href="#booking"
            className="btn-primary text-xs md:text-sm px-4 py-2 rounded-xl flex items-center gap-1.5"
          >
            <Sparkles size={14} />
            Agendar Horário
          </a>
        </div>
      </div>
    </nav>
  )
}
