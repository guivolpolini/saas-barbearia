import { MapPin, Phone, Mail, Clock, AtSign } from 'lucide-react'
import { useBusiness } from '../../contexts/BusinessContext'
import { dayName } from '../../lib/utils'

export default function ContactSection() {
  const { business, hours } = useBusiness()

  return (
    <section id="contact" className="py-24 bg-[var(--color-primary)]">
      <div className="max-w-6xl mx-auto px-4">
        <div className="text-center mb-16">
          <span className="text-[var(--color-accent)] text-sm font-medium tracking-widest uppercase">Fale conosco</span>
          <h2 className="section-title mt-3">Localização e Contato</h2>
        </div>

        <div className="grid md:grid-cols-2 gap-8">
          {/* Info card */}
          <div className="card p-8 space-y-6">
            <h3 className="font-bold text-xl">{business?.name}</h3>

            <div className="space-y-4">
              {business?.address && (
                <div className="flex items-start gap-3">
                  <MapPin size={18} className="text-[var(--color-accent)] mt-0.5 shrink-0" />
                  <div>
                    <p className="text-sm font-medium">Endereço</p>
                    <p className="text-[var(--color-text-muted)] text-sm mt-0.5">
                      {business.address}<br />
                      {business.city}{business.state ? `, ${business.state}` : ''}
                      {business.zip ? ` — ${business.zip}` : ''}
                    </p>
                  </div>
                </div>
              )}

              {business?.phone && (
                <div className="flex items-center gap-3">
                  <Phone size={18} className="text-[var(--color-accent)] shrink-0" />
                  <div>
                    <p className="text-sm font-medium">Telefone</p>
                    <a href={`tel:${business.phone}`} className="text-[var(--color-text-muted)] text-sm hover:text-[var(--color-accent)] transition-colors">
                      {business.phone}
                    </a>
                  </div>
                </div>
              )}

              {business?.email && (
                <div className="flex items-center gap-3">
                  <Mail size={18} className="text-[var(--color-accent)] shrink-0" />
                  <div>
                    <p className="text-sm font-medium">E-mail</p>
                    <a href={`mailto:${business.email}`} className="text-[var(--color-text-muted)] text-sm hover:text-[var(--color-accent)] transition-colors">
                      {business.email}
                    </a>
                  </div>
                </div>
              )}

              {business?.instagram && (
                <div className="flex items-center gap-3">
                  <AtSign size={18} className="text-[var(--color-accent)] shrink-0" />
                  <div>
                    <p className="text-sm font-medium">Instagram</p>
                    <p className="text-[var(--color-text-muted)] text-sm">{business.instagram}</p>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Hours card */}
          <div className="card p-8">
            <div className="flex items-center gap-2 mb-6">
              <Clock size={18} className="text-[var(--color-accent)]" />
              <h3 className="font-bold text-xl">Horário de Funcionamento</h3>
            </div>

            <div className="space-y-3">
              {hours.map(hour => (
                <div key={hour.day_of_week} className="flex justify-between items-center py-2 border-b border-[var(--color-border)] last:border-0">
                  <span className="text-sm font-medium">{dayName(hour.day_of_week)}</span>
                  {hour.is_closed ? (
                    <span className="text-red-400 text-sm font-medium">Fechado</span>
                  ) : (
                    <span className="text-[var(--color-accent)] text-sm font-medium">
                      {hour.open_time?.substring(0, 5)} – {hour.close_time?.substring(0, 5)}
                    </span>
                  )}
                </div>
              ))}
            </div>

            <a href="#booking" className="btn-primary w-full mt-6 justify-center">
              Agendar agora
            </a>
          </div>
        </div>
      </div>
    </section>
  )
}
