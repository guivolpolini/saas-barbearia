import { Scissors, Lock } from 'lucide-react'
import { Link } from 'react-router-dom'
import { useBusiness } from '../../contexts/BusinessContext'

export default function Footer() {
  const { business } = useBusiness()
  const year = new Date().getFullYear()

  return (
    <footer className="border-t border-[var(--color-border)] py-10 bg-[var(--color-surface)]">
      <div className="max-w-6xl mx-auto px-4 flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-[var(--color-accent)]/15 border border-[var(--color-accent)]/30 flex items-center justify-center text-[var(--color-accent)]">
            <Scissors size={16} />
          </div>
          <span className="font-bold text-sm text-[var(--color-text)]">{business?.name ?? 'Barbearia Prime'}</span>
        </div>

        <p className="text-[var(--color-text-muted)] text-xs text-center">
          © {year} {business?.name ?? 'Barbearia Prime'}. Todos os direitos reservados.
        </p>

        <div className="flex items-center gap-5 text-xs text-[var(--color-text-muted)] font-medium">
          <a href="#services" className="hover:text-[var(--color-accent)] transition-colors">Serviços</a>
          <a href="#team" className="hover:text-[var(--color-accent)] transition-colors">Equipe</a>
          <a href="#contact" className="hover:text-[var(--color-accent)] transition-colors">Contato</a>
          <Link
            to="/admin/login"
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[var(--color-surface-2)] border border-[var(--color-border)] hover:border-[var(--color-accent)] hover:text-[var(--color-accent)] transition-all"
          >
            <Lock size={12} />
            <span>Acesso Lojista</span>
          </Link>
        </div>
      </div>
    </footer>
  )
}
