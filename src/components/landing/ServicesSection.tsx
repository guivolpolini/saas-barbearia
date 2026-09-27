import { Clock, ArrowRight } from 'lucide-react'
import { useBusiness } from '../../contexts/BusinessContext'
import { formatCurrency, formatDuration } from '../../lib/utils'

export default function ServicesSection() {
  const { services } = useBusiness()

  return (
    <section id="services" className="py-24 relative">
      <div className="absolute inset-0 bg-gradient-to-b from-[var(--color-surface)] to-[var(--color-primary)]" />

      <div className="relative max-w-6xl mx-auto px-4">
        <div className="text-center mb-16">
          <span className="text-[var(--color-accent)] text-sm font-medium tracking-widest uppercase">O que oferecemos</span>
          <h2 className="section-title mt-3">Nossos Serviços</h2>
          <p className="section-subtitle">Qualidade e cuidado em cada detalhe</p>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          {services.map((service, i) => (
            <div
              key={service.id}
              className={`card p-8 group hover:border-[var(--color-accent)]/50 hover:-translate-y-1 transition-all duration-300 flex flex-col ${i === 1 ? 'ring-1 ring-[var(--color-accent)]/30' : ''}`}
            >
              {i === 1 && (
                <div className="self-start mb-4 badge bg-[var(--color-accent)] text-black text-xs font-bold">
                  ✨ Mais popular
                </div>
              )}
              <div className="w-12 h-12 rounded-xl bg-[var(--color-accent)]/10 flex items-center justify-center mb-6 group-hover:bg-[var(--color-accent)]/20 transition-colors">
                <span className="text-[var(--color-accent)] text-xl">✂️</span>
              </div>

              <h3 className="text-xl font-bold mb-2">{service.name}</h3>
              {service.description && (
                <p className="text-[var(--color-text-muted)] text-sm leading-relaxed mb-6 flex-1">
                  {service.description}
                </p>
              )}

              <div className="mt-auto space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5 text-[var(--color-text-muted)] text-sm">
                    <Clock size={14} />
                    <span>{formatDuration(service.duration_min)}</span>
                  </div>
                  <span className="text-2xl font-black text-[var(--color-accent)]">
                    {formatCurrency(service.price)}
                  </span>
                </div>

                <a
                  href="#booking"
                  className="flex items-center justify-center gap-2 w-full py-2.5 rounded-lg border border-[var(--color-border)] text-sm font-medium text-[var(--color-text-muted)] hover:border-[var(--color-accent)] hover:text-[var(--color-accent)] transition-all duration-200"
                >
                  Agendar
                  <ArrowRight size={14} />
                </a>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
