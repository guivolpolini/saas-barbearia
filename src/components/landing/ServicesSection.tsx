import { Clock, ArrowRight, Sparkles } from 'lucide-react'
import { useBusiness } from '../../contexts/BusinessContext'
import { formatCurrency, formatDuration } from '../../lib/utils'

export default function ServicesSection() {
  const { services } = useBusiness()

  return (
    <section id="services" className="py-24 relative overflow-hidden bg-[var(--color-surface)]">
      {/* Background ambient accents */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-[var(--color-accent)]/5 rounded-full blur-3xl pointer-events-none" />

      <div className="relative max-w-6xl mx-auto px-4">
        {/* Section Header */}
        <div className="text-center max-w-2xl mx-auto mb-14">
          <span className="text-[var(--color-accent)] text-xs font-bold tracking-widest uppercase px-3 py-1 rounded-full bg-[var(--color-accent)]/10 border border-[var(--color-accent)]/20">
            Tabela de Preços
          </span>
          <h2 className="text-3xl sm:text-4xl font-black tracking-tight text-[var(--color-text)] mt-4">
            Serviços e Tratamentos
          </h2>
          <p className="text-[var(--color-text-muted)] text-sm sm:text-base mt-2">
            Produtos de primeira linha, técnicas clássicas e modernas com atendimento impecável.
          </p>
        </div>

        {/* Services Grid */}
        <div className="grid md:grid-cols-3 gap-6">
          {services.map((service, i) => {
            const isPopular = i === 1 || service.name.toLowerCase().includes('+') || service.name.toLowerCase().includes('combo')

            return (
              <div
                key={service.id}
                onClick={() => {
                  const chatBtn = document.querySelector('button[aria-label="Abrir chat de agendamento"]') as HTMLButtonElement | null
                  if (chatBtn) chatBtn.click()
                }}
                className={`card p-7 relative flex flex-col justify-between group cursor-pointer hover:border-[var(--color-accent)]/80 hover:-translate-y-1 transition-all duration-200 ${
                  isPopular ? 'border-[var(--color-accent)]/40 bg-gradient-to-b from-[var(--color-surface-2)] to-[var(--color-surface)] shadow-lg' : ''
                }`}
              >
                {isPopular && (
                  <div className="absolute -top-3 left-6 inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[var(--color-accent)] text-black text-[11px] font-extrabold uppercase tracking-wider shadow-md">
                    <Sparkles size={12} />
                    Mais Escolhido
                  </div>
                )}

                <div>
                  <div className="flex items-center justify-between mb-4">
                    <div className="w-11 h-11 rounded-xl bg-[var(--color-accent)]/15 border border-[var(--color-accent)]/30 flex items-center justify-center text-xl text-[var(--color-accent)] group-hover:scale-110 transition-transform">
                      ✂️
                    </div>
                    <div className="flex items-center gap-1 text-[var(--color-text-muted)] text-xs font-medium bg-[var(--color-surface-2)] px-2.5 py-1 rounded-lg border border-[var(--color-border)]">
                      <Clock size={13} className="text-[var(--color-accent)]" />
                      <span>{formatDuration(service.duration_min)}</span>
                    </div>
                  </div>

                  <h3 className="text-xl font-bold text-[var(--color-text)] mb-2 group-hover:text-[var(--color-accent)] transition-colors">
                    {service.name}
                  </h3>

                  <p className="text-[var(--color-text-muted)] text-xs sm:text-sm leading-relaxed mb-6">
                    {service.description ?? 'Atendimento especializado com acabamento detalhado, toalha quente e finalização premium.'}
                  </p>
                </div>

                <div className="pt-4 border-t border-[var(--color-border)] mt-auto flex items-center justify-between">
                  <div>
                    <span className="text-[11px] text-[var(--color-text-muted)] block">Valor</span>
                    <span className="text-2xl font-black text-[var(--color-accent)] tracking-tight">
                      {formatCurrency(service.price)}
                    </span>
                  </div>

                  <span className="text-xs font-semibold text-[var(--color-text-muted)] group-hover:text-[var(--color-accent)] flex items-center gap-1 transition-colors">
                    <span>Agendar</span>
                    <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
                  </span>
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </section>
  )
}
