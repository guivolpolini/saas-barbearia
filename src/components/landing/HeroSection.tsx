import { ArrowRight, Star, Clock, CheckCircle2, ShieldCheck, Sparkles } from 'lucide-react'
import { useBusiness } from '../../contexts/BusinessContext'
import { getBusinessStatus, dayName } from '../../lib/utils'

export default function HeroSection() {
  const { business, hours } = useBusiness()
  const status = getBusinessStatus(hours)
  const currentDay = new Date().getDay()

  return (
    <section id="top" className="relative min-h-[92vh] flex items-center overflow-hidden">
      {/* Dynamic Background with Ambient Glow */}
      <div className="absolute inset-0 bg-gradient-to-b from-[#08080a] via-[var(--color-primary)] to-[#0c0c0f]" />
      <div
        className="absolute inset-0 opacity-[0.035]"
        style={{
          backgroundImage: `radial-gradient(var(--color-accent) 1px, transparent 1px)`,
          backgroundSize: '28px 28px',
        }}
      />
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[700px] h-[350px] bg-[var(--color-accent)]/10 rounded-full blur-[120px] pointer-events-none" />

      {/* Gold Top Accent Line */}
      <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-[var(--color-accent)]/50 to-transparent" />

      <div className="relative max-w-6xl mx-auto px-4 pt-28 pb-16 grid md:grid-cols-12 gap-12 items-center w-full">
        {/* Left Column */}
        <div className="md:col-span-7 space-y-6">
          {/* Live Status Pill */}
          <div className="inline-flex items-center gap-2.5 px-3.5 py-1.5 rounded-full bg-[var(--color-surface-2)] border border-[var(--color-border)] shadow-sm text-xs font-medium">
            <span className={`w-2 h-2 rounded-full ${status.isOpen ? 'bg-emerald-400 animate-pulse' : 'bg-amber-400'}`} />
            <span className="text-[var(--color-text)] font-semibold">{status.label}</span>
            <span className="text-[var(--color-text-muted)]">• {status.detail}</span>
          </div>

          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black tracking-tight leading-[1.1] text-[var(--color-text)]">
            Estilo e precisão para o{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-[var(--color-accent)] to-[#e8d2a6]">
              homem moderno.
            </span>
          </h1>

          <p className="text-[var(--color-text-muted)] text-base sm:text-lg leading-relaxed max-w-xl">
            {business?.description ??
              'Atendimento personalizado com os melhores profissionais da região. Agende seu horário em menos de 2 minutos pelo nosso chat interativo.'}
          </p>

          {/* Action CTAs */}
          <div className="flex flex-wrap items-center gap-4 pt-2">
            <a
              href="#booking"
              className="btn-primary px-7 py-3.5 rounded-xl font-semibold flex items-center gap-2 shadow-lg shadow-[var(--color-accent)]/15 hover:scale-[1.02] transition-transform"
            >
              <Sparkles size={18} />
              Agendar no Chat
              <ArrowRight size={16} />
            </a>
            <a
              href="#services"
              className="btn-secondary px-6 py-3.5 rounded-xl font-semibold text-sm hover:border-[var(--color-accent)]/40 transition-colors"
            >
              Ver Tabela de Serviços
            </a>
          </div>

          {/* Value Props & Social Proof */}
          <div className="grid grid-cols-3 gap-4 pt-8 border-t border-[var(--color-border)] max-w-lg">
            <div>
              <p className="text-2xl font-black text-[var(--color-accent)]">500+</p>
              <p className="text-xs text-[var(--color-text-muted)] font-medium mt-0.5">Clientes atendidos</p>
            </div>
            <div>
              <div className="flex items-center gap-1">
                <span className="text-2xl font-black text-[var(--color-text)]">4.9</span>
                <Star size={16} className="fill-[var(--color-accent)] text-[var(--color-accent)]" />
              </div>
              <p className="text-xs text-[var(--color-text-muted)] font-medium mt-0.5">Nota máxima Google</p>
            </div>
            <div>
              <p className="text-2xl font-black text-emerald-400">100%</p>
              <p className="text-xs text-[var(--color-text-muted)] font-medium mt-0.5">Sem espera na fila</p>
            </div>
          </div>
        </div>

        {/* Right Column: Live Booking Preview Card */}
        <div className="md:col-span-5">
          <div className="card p-6 md:p-7 border border-[var(--color-border)]/80 bg-[var(--color-surface)]/90 backdrop-blur-xl shadow-2xl relative">
            <div className="flex items-center justify-between pb-5 border-b border-[var(--color-border)]">
              <div className="flex items-center gap-3">
                <div className="w-11 h-11 rounded-xl bg-[var(--color-accent)]/15 border border-[var(--color-accent)]/30 flex items-center justify-center text-[var(--color-accent)]">
                  <Clock size={20} />
                </div>
                <div>
                  <p className="font-bold text-sm text-[var(--color-text)]">Horários de Atendimento</p>
                  <p className="text-xs text-[var(--color-accent)] font-medium">Agendamento em tempo real</p>
                </div>
              </div>
              <span className="text-[11px] font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-2.5 py-1 rounded-full">
                Vagas Hoje
              </span>
            </div>

            {/* Hours list */}
            <div className="py-4 space-y-2.5 text-sm">
              {hours && hours.length > 0 ? (
                hours.slice(0, 5).map(h => {
                  const isToday = h.day_of_week === currentDay
                  return (
                    <div
                      key={h.day_of_week}
                      className={`flex items-center justify-between p-2 rounded-lg transition-colors ${
                        isToday ? 'bg-[var(--color-surface-2)] border border-[var(--color-border)]' : ''
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        {isToday && <span className="w-1.5 h-1.5 rounded-full bg-[var(--color-accent)]" />}
                        <span className={`text-xs font-medium ${isToday ? 'text-[var(--color-text)] font-semibold' : 'text-[var(--color-text-muted)]'}`}>
                          {dayName(h.day_of_week)} {isToday ? '(Hoje)' : ''}
                        </span>
                      </div>
                      <span className={`text-xs font-semibold ${h.is_closed ? 'text-red-400' : 'text-[var(--color-accent)]'}`}>
                        {h.is_closed ? 'Fechado' : `${h.open_time?.substring(0, 5)} - ${h.close_time?.substring(0, 5)}`}
                      </span>
                    </div>
                  )
                })
              ) : (
                <p className="text-xs text-[var(--color-text-muted)] py-2">Carregando horários...</p>
              )}
            </div>

            {/* Card Footer */}
            <div className="pt-4 border-t border-[var(--color-border)] space-y-3">
              <div className="flex items-center gap-2 text-xs text-[var(--color-text-muted)]">
                <ShieldCheck size={14} className="text-[var(--color-accent)] shrink-0" />
                <span>Confirmação instantânea sem espera no WhatsApp</span>
              </div>

              <a
                href="#booking"
                className="btn-primary w-full text-center py-3 text-sm font-semibold rounded-xl flex items-center justify-center gap-2"
              >
                Abrir Chat e Agendar
                <ArrowRight size={14} />
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
