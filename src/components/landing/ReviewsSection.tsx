import { Star, Quote } from 'lucide-react'

const REVIEWS = [
  {
    name: 'Carlos Mendes',
    rating: 5,
    text: 'Melhor barbearia da cidade! Atendimento impecável e o corte ficou exatamente como eu queria. Recomendo demais!',
    date: 'há 3 dias',
    avatar: 'CM',
  },
  {
    name: 'Rafael Oliveira',
    rating: 5,
    text: 'Fui pela primeira vez e já sou cliente fiel. A barba ficou perfeita e o ambiente é muito agradável. Profissionais nota 10!',
    date: 'há 1 semana',
    avatar: 'RO',
  },
  {
    name: 'André Souza',
    rating: 5,
    text: 'O combo corte + barba é incrível pelo preço. Agendamento pelo site é super fácil. Voltarei sempre!',
    date: 'há 2 semanas',
    avatar: 'AS',
  },
  {
    name: 'Marcelo Costa',
    rating: 5,
    text: 'Pontualidade e qualidade acima de tudo. Nunca tive que esperar e o resultado é sempre excelente. Já indiquei para vários amigos.',
    date: 'há 3 semanas',
    avatar: 'MC',
  },
  {
    name: 'Lucas Ferreira',
    rating: 5,
    text: 'Ambiente moderno, profissionais experientes e preço justo. O agendamento online facilita muito a vida. Nota máxima!',
    date: 'há 1 mês',
    avatar: 'LF',
  },
  {
    name: 'Thiago Alves',
    rating: 5,
    text: 'Fui indicado por um amigo e não me arrependo. O corte ficou incrível e o atendimento foi muito atencioso. Top demais!',
    date: 'há 1 mês',
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
    <section id="reviews" className="py-24 bg-[var(--color-surface)]">
      <div className="max-w-6xl mx-auto px-4">
        <div className="text-center mb-16">
          <span className="text-[var(--color-accent)] text-sm font-medium tracking-widest uppercase">O que dizem nossos clientes</span>
          <h2 className="section-title mt-3">Avaliações</h2>
          <div className="flex items-center justify-center gap-3 mt-4">
            <Stars count={5} />
            <span className="text-[var(--color-text)] font-bold text-lg">4.9</span>
            <span className="text-[var(--color-text-muted)] text-sm">/ 5 · 127 avaliações</span>
          </div>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
          {REVIEWS.map((review) => (
            <div key={review.name} className="card p-6 hover:border-[var(--color-accent)]/30 transition-colors">
              <Quote size={24} className="text-[var(--color-accent)]/40 mb-3" />
              <p className="text-[var(--color-text-muted)] text-sm leading-relaxed mb-5">{review.text}</p>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-full bg-[var(--color-accent)] flex items-center justify-center text-black font-bold text-xs">
                    {review.avatar}
                  </div>
                  <div>
                    <p className="font-semibold text-sm">{review.name}</p>
                    <p className="text-xs text-[var(--color-text-muted)]">{review.date}</p>
                  </div>
                </div>
                <Stars count={review.rating} />
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
