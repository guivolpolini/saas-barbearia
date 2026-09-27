import { Scissors } from 'lucide-react'
import { useBusiness } from '../../contexts/BusinessContext'

export default function Footer() {
  const { business } = useBusiness()
  const year = new Date().getFullYear()

  return (
    <footer className="border-t border-[var(--color-border)] py-10">
      <div className="max-w-6xl mx-auto px-4 flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-2.5">
          <div className="w-7 h-7 rounded-lg bg-[var(--color-accent)] flex items-center justify-center">
            <Scissors size={14} className="text-black" />
          </div>
          <span className="font-bold text-sm">{business?.name ?? 'Barbearia'}</span>
        </div>

        <p className="text-[var(--color-text-muted)] text-sm text-center">
          © {year} {business?.name}. Todos os direitos reservados.
        </p>

        <div className="flex gap-4 text-sm text-[var(--color-text-muted)]">
          <a href="#services" className="hover:text-[var(--color-accent)] transition-colors">Serviços</a>
          <a href="#contact" className="hover:text-[var(--color-accent)] transition-colors">Contato</a>
        </div>
      </div>
    </footer>
  )
}
