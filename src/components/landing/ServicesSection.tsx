import { useState } from 'react'
import { Clock, ArrowRight, Sparkles, Check } from 'lucide-react'
import { useBusiness } from '../../contexts/BusinessContext'
import { formatCurrency, formatDuration } from '../../lib/utils'

export default function ServicesSection() {
  const { services } = useBusiness()
  const [selectedCategory, setSelectedCategory] = useState<string>('all')

  const categories = [
    { id: 'all', label: 'Todos os Serviços' },
    { id: 'corte', label: 'Cortes' },
    { id: 'barba', label: 'Barba' },
    { id: 'combo', label: 'Combos' },
  ]

  const filteredServices = services.filter(service => {
    if (selectedCategory === 'all') return true
    const nameLower = service.name.toLowerCase()
    if (selectedCategory === 'corte') return nameLower.includes('corte') && !nameLower.includes('barba')
    if (selectedCategory === 'barba') return nameLower.includes('barba') && !nameLower.includes('corte')
    if (selectedCategory === 'combo') return nameLower.includes('combo') || (nameLower.includes('corte') && nameLower.includes('barba')) || nameLower.includes('+')
    return true
  })

  return (
    <section id="services" className="py-24 relative overflow-hidden bg-[var(--color-surface)]">
      {/* Background ambient accents */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-[var(--color-accent)]/5 rounded-full blur-3xl pointer-events-none" />

      <div className="relative max-w-6xl mx-auto px-4">
        {/* Section Header */}
        <div className="text-center max-w-2xl mx-auto mb-12">
          <span className="text-[var(--color-accent)] text-xs font-bold tracking-widest uppercase px-3 py-1 rounded-full bg-[var(--color-accent)]/10 border border-[var(--color-accent)]/20">
            Tabela de Preços
          </span>
          <h2 className="text-3xl sm:text-4xl font-black tracking-tight text-[var(--color-text)] mt-4">
            Serviços e Tratamentos
          </h2>
          <p className="text-[var(--color-text-muted)] text-sm sm:text-base mt-2">
            Produtos de primeira linha, técnicas clássicas e modernas com atendimento impecável.
          </p>

          {/* Category Tabs */}
          <div className="flex flex-wrap items-center justify-center gap-2 mt-8">
            {categories.map(cat => (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id)}
                className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all ${
                  selectedCategory === cat.id
                    ? 'bg-[var(--color-accent)] text-black shadow-md shadow-[var(--color-accent)]/20'
                    : 'bg-[var(--color-surface-2)] text-[var(--color-text-muted)] hover:text-[var(--color-text)] border border-[var(--color-border)]'
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>
        </div>

        {/* Services Grid */}
        <div className="grid md:grid-cols-3 gap-6">
          {filteredServices.map((service, i) => {
            const isPopular = i === 1 || service.name.toLowerCase().includes('+') || service.name.toLowerCase().includes('combo')

            return (
              <div
                key={service.id}
                className={`card p-7 relative flex flex-col justify-between group hover:border-[var(--color-accent)]/60 hover:-translate-y-1 transition-all duration-300 ${
                  isPopular ? 'border-[var(--color-accent)]/40 bg-gradient-to-b from-[var(--color-surface-2)] to-[var(--color-surface)] shadow-xl' : ''
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
                    <div className="w-12 h-12 rounded-xl bg-[var(--color-accent)]/15 border border-[var(--color-accent)]/30 flex items-center justify-center text-xl text-[var(--color-accent)] group-hover:scale-110 transition-transform">
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

                  <p className="text-[var(--color-text-muted)] text-sm leading-relaxed mb-6">
                    {service.description ?? 'Atendimento especializado com acabamento detalhado, toalha quente e finalização com pomada premium.'}
                  </p>
                </div>

                <div className="pt-5 border-t border-[var(--color-border)] mt-auto space-y-4">
                  <div className="flex items-baseline justify-between">
                    <span className="text-xs text-[var(--color-text-muted)] font-medium">Investimento</span>
                    <span className="text-3xl font-black text-[var(--color-accent)] tracking-tight">
                      {formatCurrency(service.price)}
                    </span>
                  </div>

                  <a
                    href="#booking"
                    className={`w-full py-2.5 rounded-xl font-semibold text-sm flex items-center justify-center gap-2 transition-all ${
                      isPopular
                        ? 'btn-primary'
                        : 'border border-[var(--color-border)] bg-[var(--color-surface-2)] text-[var(--color-text)] hover:border-[var(--color-accent)] hover:text-[var(--color-accent)]'
                    }`}
                  >
                    <span>Escolher Serviço</span>
                    <ArrowRight size={15} />
                  </a>
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </section>
  )
}
