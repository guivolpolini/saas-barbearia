import { ArrowRight, Star, Clock } from 'lucide-react'
import { useBusiness } from '../../contexts/BusinessContext'

export default function HeroSection() {
  const { business } = useBusiness()

  return (
    <section id="top" className="relative min-h-screen flex items-center overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-[#0a0a0a] via-[var(--color-primary)] to-[#0d0d0d]" />
      <div
        className="absolute inset-0 opacity-5"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23c8a96e' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`
        }}
      />

      {/* Gold accent bar */}
      <div className="absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r from-transparent via-[var(--color-accent)] to-transparent" />

      <div className="relative max-w-6xl mx-auto px-4 pt-32 pb-20 grid md:grid-cols-2 gap-12 items-center w-full">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-[var(--color-accent)]/10 border border-[var(--color-accent)]/30 text-[var(--color-accent)] text-xs font-medium mb-6">
            <span className="w-1.5 h-1.5 rounded-full bg-[var(--color-accent)] animate-pulse" />
            Agendamento online disponível
          </div>

          <h1 className="text-5xl md:text-6xl font-black leading-tight mb-6">
            Estilo e{' '}
            <span className="text-[var(--color-accent)]">precisão</span>{' '}
            para o homem moderno
          </h1>

          <p className="text-[var(--color-text-muted)] text-lg leading-relaxed mb-8 max-w-md">
            {business?.description ?? 'Atendimento personalizado com os melhores profissionais. Reserve seu horário em minutos, direto pelo chat.'}
          </p>

          <div className="flex flex-wrap gap-4">
            <a href="#booking" className="btn-primary gap-2">
              Agendar agora
              <ArrowRight size={18} />
            </a>
            <a href="#services" className="btn-secondary">
              Ver serviços
            </a>
          </div>

          <div className="flex items-center gap-6 mt-10 pt-8 border-t border-[var(--color-border)]">
            <div className="text-center">
              <p className="text-2xl font-bold text-[var(--color-accent)]">500+</p>
              <p className="text-xs text-[var(--color-text-muted)] mt-0.5">Clientes atendidos</p>
            </div>
            <div className="w-px h-10 bg-[var(--color-border)]" />
            <div className="text-center">
              <p className="text-2xl font-bold text-[var(--color-accent)]">4.9</p>
              <div className="flex items-center gap-1 mt-0.5">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} size={12} className="fill-[var(--color-accent)] text-[var(--color-accent)]" />
                ))}
              </div>
            </div>
            <div className="w-px h-10 bg-[var(--color-border)]" />
            <div className="text-center">
              <p className="text-2xl font-bold text-[var(--color-accent)]">5+</p>
              <p className="text-xs text-[var(--color-text-muted)] mt-0.5">Anos de experiência</p>
            </div>
          </div>
        </div>

        {/* Right card */}
        <div className="hidden md:block">
          <div className="card p-6 space-y-4">
            <div className="flex items-center gap-3 pb-4 border-b border-[var(--color-border)]">
              <div className="w-10 h-10 rounded-full bg-[var(--color-accent)]/20 flex items-center justify-center">
                <Clock size={20} className="text-[var(--color-accent)]" />
              </div>
              <div>
                <p className="font-semibold text-sm">Próximo horário disponível</p>
                <p className="text-[var(--color-accent)] text-xs font-medium">Hoje às 14:30</p>
              </div>
            </div>
            <div className="space-y-3">
              {[
                { label: 'Seg – Sex', value: '09:00 – 19:00' },
                { label: 'Sábado', value: '09:00 – 17:00' },
                { label: 'Domingo', value: 'Fechado' },
              ].map(({ label, value }) => (
                <div key={label} className="flex justify-between text-sm">
                  <span className="text-[var(--color-text-muted)]">{label}</span>
                  <span className={value === 'Fechado' ? 'text-red-400' : 'text-[var(--color-text)]'}>{value}</span>
                </div>
              ))}
            </div>
            <a href="#booking" className="btn-primary w-full text-center mt-2">
              Reservar agora — é grátis
            </a>
          </div>
        </div>
      </div>
    </section>
  )
}
