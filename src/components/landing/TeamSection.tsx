import { User, Sparkles, CheckCircle2, ArrowRight } from 'lucide-react'
import { useBusiness } from '../../contexts/BusinessContext'

export default function TeamSection() {
  const { professionals } = useBusiness()

  if (!professionals || professionals.length === 0) return null

  return (
    <section id="team" className="py-20 relative bg-[var(--color-primary)] border-t border-[var(--color-border)]">
      <div className="max-w-6xl mx-auto px-4">
        <div className="text-center max-w-2xl mx-auto mb-14">
          <span className="text-[var(--color-accent)] text-xs font-bold tracking-widest uppercase px-3 py-1 rounded-full bg-[var(--color-accent)]/10 border border-[var(--color-accent)]/20">
            Nossos Barbeiros
          </span>
          <h2 className="text-3xl sm:text-4xl font-black tracking-tight text-[var(--color-text)] mt-4">
            Equipe Especializada
          </h2>
          <p className="text-[var(--color-text-muted)] text-sm sm:text-base mt-2">
            Profissionais experientes prontos para cuidar do seu visual com excelência.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          {professionals.map((prof, idx) => (
            <div
              key={prof.id}
              className="card p-6 flex flex-col items-center text-center group hover:border-[var(--color-accent)]/50 transition-all duration-300"
            >
              <div className="relative mb-5">
                <div className="w-20 h-20 rounded-2xl bg-gradient-to-tr from-[var(--color-surface-2)] to-[var(--color-accent)]/20 border-2 border-[var(--color-accent)]/40 flex items-center justify-center text-2xl font-black text-[var(--color-accent)] group-hover:scale-105 transition-transform shadow-lg">
                  {prof.avatar_url ? (
                    <img src={prof.avatar_url} alt={prof.name} className="w-full h-full object-cover rounded-2xl" />
                  ) : (
                    <span>{prof.name.slice(0, 2).toUpperCase()}</span>
                  )}
                </div>
                <span className="absolute -bottom-1.5 -right-1.5 w-5 h-5 rounded-full bg-emerald-500 border-2 border-[var(--color-surface)] flex items-center justify-center text-[10px] text-black font-bold">
                  ✓
                </span>
              </div>

              <h3 className="text-lg font-bold text-[var(--color-text)] mb-1">{prof.name}</h3>
              <p className="text-xs text-[var(--color-accent)] font-semibold mb-3">
                {prof.role ?? 'Especialista em Cortes & Barba'}
              </p>

              <div className="flex items-center gap-1.5 text-xs text-[var(--color-text-muted)] mb-5">
                <CheckCircle2 size={13} className="text-emerald-400" />
                <span>Disponível para agendamento</span>
              </div>

              <a
                href="#booking"
                className="w-full py-2 px-4 rounded-xl border border-[var(--color-border)] text-xs font-semibold text-[var(--color-text-muted)] hover:border-[var(--color-accent)] hover:text-[var(--color-accent)] hover:bg-[var(--color-accent)]/5 transition-all flex items-center justify-center gap-1.5 mt-auto"
              >
                <span>Agendar com {prof.name.split(' ')[0]}</span>
                <ArrowRight size={13} />
              </a>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
