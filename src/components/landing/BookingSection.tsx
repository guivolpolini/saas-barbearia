import { MessageCircle } from 'lucide-react'

export default function BookingSection() {
  return (
    <section id="booking" className="py-24 bg-[var(--color-surface)]">
      <div className="max-w-2xl mx-auto px-4 text-center">
        <span className="text-[var(--color-accent)] text-sm font-medium tracking-widest uppercase">Simples e rápido</span>
        <h2 className="section-title mt-3">Agende Online</h2>
        <p className="section-subtitle mb-10">
          Use o chat no canto inferior direito para escolher seu serviço, data e horário. <br className="hidden md:block" />
          Em menos de 2 minutos, seu agendamento está confirmado.
        </p>

        <div className="card p-8 space-y-6">
          <div className="grid grid-cols-3 gap-4 text-center">
            {[
              { step: '1', label: 'Escolha o serviço', icon: '✂️' },
              { step: '2', label: 'Selecione data e hora', icon: '📅' },
              { step: '3', label: 'Confirme seus dados', icon: '✅' },
            ].map(({ step, label, icon }) => (
              <div key={step} className="space-y-2">
                <div className="w-12 h-12 rounded-full bg-[var(--color-accent)]/10 flex items-center justify-center mx-auto text-2xl">
                  {icon}
                </div>
                <div className="text-xs font-bold text-[var(--color-accent)]">Passo {step}</div>
                <p className="text-xs text-[var(--color-text-muted)] leading-tight">{label}</p>
              </div>
            ))}
          </div>

          <div className="flex items-center gap-3 p-4 rounded-xl bg-[var(--color-accent)]/10 border border-[var(--color-accent)]/20">
            <MessageCircle size={20} className="text-[var(--color-accent)] shrink-0" />
            <p className="text-sm text-[var(--color-text-muted)]">
              Clique no ícone de chat no canto inferior direito para começar o agendamento.
            </p>
          </div>
        </div>
      </div>
    </section>
  )
}
