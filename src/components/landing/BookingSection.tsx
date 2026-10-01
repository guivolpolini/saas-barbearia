import { MessageCircle, Sparkles, ArrowRight } from 'lucide-react'

export default function BookingSection() {
  function handleOpenChat() {
    // Procura e clica no botão do chat flutuante se não estiver aberto
    const chatBtn = document.querySelector('button[aria-label="Abrir chat de agendamento"]') as HTMLButtonElement | null
    if (chatBtn) {
      chatBtn.click()
    }
  }

  return (
    <section id="booking" className="py-24 bg-[var(--color-surface)] relative overflow-hidden">
      <div className="max-w-3xl mx-auto px-4 text-center">
        <span className="text-[var(--color-accent)] text-xs font-bold tracking-widest uppercase px-3 py-1 rounded-full bg-[var(--color-accent)]/10 border border-[var(--color-accent)]/20">
          Simples e Rápido
        </span>
        <h2 className="text-3xl sm:text-4xl font-black tracking-tight text-[var(--color-text)] mt-4">
          Agendamento 100% Online
        </h2>
        <p className="text-[var(--color-text-muted)] text-sm sm:text-base mt-2 mb-10 max-w-xl mx-auto">
          Sem ligações, sem espera no WhatsApp. Nosso assistente interativo encontra o horário ideal para você em menos de 2 minutos.
        </p>

        <div className="card p-8 sm:p-10 space-y-8 border border-[var(--color-border)] shadow-2xl bg-gradient-to-b from-[var(--color-surface-2)] to-[var(--color-surface)]">
          <div className="grid grid-cols-3 gap-4 text-center">
            {[
              { step: '1', label: 'Escolha o serviço', icon: '✂️' },
              { step: '2', label: 'Selecione data e hora', icon: '📅' },
              { step: '3', label: 'Confirmação na hora', icon: '✅' },
            ].map(({ step, label, icon }) => (
              <div key={step} className="space-y-2.5">
                <div className="w-14 h-14 rounded-2xl bg-[var(--color-accent)]/15 border border-[var(--color-accent)]/30 flex items-center justify-center mx-auto text-2xl shadow-inner">
                  {icon}
                </div>
                <div className="text-xs font-bold text-[var(--color-accent)] uppercase tracking-wider">Passo {step}</div>
                <p className="text-xs sm:text-sm font-medium text-[var(--color-text-muted)] leading-tight">{label}</p>
              </div>
            ))}
          </div>

          <div className="pt-6 border-t border-[var(--color-border)] flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-3 text-left">
              <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 shrink-0">
                <MessageCircle size={20} />
              </div>
              <div>
                <p className="text-xs font-bold text-[var(--color-text)]">Assistente Online Ativo</p>
                <p className="text-xs text-[var(--color-text-muted)]">Verificação de conflito em tempo real</p>
              </div>
            </div>

            <button
              onClick={handleOpenChat}
              className="btn-primary w-full sm:w-auto px-6 py-3 rounded-xl font-bold text-sm flex items-center justify-center gap-2 shadow-lg shadow-[var(--color-accent)]/20"
            >
              <Sparkles size={16} />
              <span>Abrir Chat de Agendamento</span>
              <ArrowRight size={16} />
            </button>
          </div>
        </div>
      </div>
    </section>
  )
}
