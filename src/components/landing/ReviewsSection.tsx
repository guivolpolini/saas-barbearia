import { Star, Quote, CheckCircle2 } from 'lucide-react'

const REVIEWS = [
  {
    name: 'Carlos Mendes',
    rating: 5,
    text: 'Melhor barbearia da cidade! Atendimento impecável e o corte ficou exatamente como eu queria. Recomendo demais!',
    date: 'há 3 dias',
    service: 'Corte + Barba',
    avatar: 'CM',
  },
  {
    name: 'Rafael Oliveira',
    rating: 5,
    text: 'Fui pela primeira vez e já sou cliente fiel. A barba ficou perfeita e o ambiente é muito agradável. Profissionais nota 10!',
    date: 'há 1 semana',
    service: 'Barboterapia',
    avatar: 'RO',
  },
  {
    name: 'André Souza',
    rating: 5,
    text: 'O combo corte + barba é incrível pelo preço. Agendamento pelo site no chat é super rápido e prático. Voltarei sempre!',
    date: 'há 2 semanas',
    service: 'Combo Completo',
    avatar: 'AS',
  },
  {
    name: 'Marcelo Costa',
    rating: 5,
    text: 'Pontualidade e qualidade acima de tudo. Nunca tive que esperar e o resultado é sempre excelente. Já indiquei para vários amigos.',
    date: 'há 3 semanas',
    service: 'Corte Tradicional',
    avatar: 'MC',
  },
  {
    name: 'Lucas Ferreira',
    rating: 5,
    text: 'Ambiente moderno, profissionais experientes e preço justo. O agendamento online facilita muito a vida. Nota máxima!',
    date: 'há 1 mês',
    service: 'Fade Degradê',
    avatar: 'LF',
  },
  {
    name: 'Thiago Alves',
    rating: 5,
    text: 'Fui indicado por um amigo e não me arrependo. O corte ficou incrível e o atendimento foi muito atencioso. Top demais!',
    date: 'há 1 mês',
    service: 'Corte + Barba',
    avatar: 'TA',
  },
]

function Stars({ count }: { count: number }) {
  return (
    <div className="flex gap-0.5">
      {[...Array(count)].map((_, i) => (
        <Star key={i} size={14} className="fill-[var(--color-accent)] text-[var(--color-accent)]" />
      ))}
    </div>
  )
}

export default function ReviewsSection() {
  return (
    <section id="reviews" className="py-24 bg-[var(--color-surface)] relative">
      <div className="max-w-6xl mx-auto px-4">
        <div className="text-center max-w-xl mx-auto mb-16">
          <span className="text-[var(--color-accent)] text-xs font-bold tracking-widest uppercase px-3 py-1 rounded-full bg-[var(--color-accent)]/10 border border-[var(--color-accent)]/20">
            Depoimentos Reais
          </span>
          <h2 className="text-3xl sm:text-4xl font-black tracking-tight text-[var(--color-text)] mt-4">
            Avaliações dos Clientes
          </h2>
          <div className="flex items-center justify-center gap-3 mt-4">
            <Stars count={5} />
            <span className="text-[var(--color-text)] font-bold text-lg text-[var(--color-accent)]">4.9 / 5</span>
            <span className="text-[var(--color-text-muted)] text-sm">(127 avaliações verificadas)</span>
          </div>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
          {REVIEWS.map((review) => (
            <div
              key={review.name}
              className="card p-6 border border-[var(--color-border)] hover:border-[var(--color-accent)]/40 transition-all duration-200 flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between mb-4">
                  <Stars count={review.rating} />
                  <span className="text-[11px] font-semibold text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded-full flex items-center gap-1">
                    <CheckCircle2 size={10} />
                    Verificado
                  </span>
                </div>
                <p className="text-[var(--color-text-muted)] text-sm leading-relaxed mb-6">"{review.text}"</p>
              </div>

              <div className="flex items-center justify-between pt-4 border-t border-[var(--color-border)]">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-[var(--color-accent)]/15 border border-[var(--color-accent)]/30 flex items-center justify-center text-[var(--color-accent)] font-bold text-xs">
                    {review.avatar}
                  </div>
                  <div>
                    <p className="font-semibold text-sm text-[var(--color-text)]">{review.name}</p>
                    <p className="text-[11px] text-[var(--color-text-muted)]">{review.service}</p>
                  </div>
                </div>
                <span className="text-[11px] text-[var(--color-text-muted)]">{review.date}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
