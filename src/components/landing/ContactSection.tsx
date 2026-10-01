import { useState } from 'react'
import { MapPin, Phone, Mail, Clock, AtSign, Copy, Check, ExternalLink, Navigation } from 'lucide-react'
import { useBusiness } from '../../contexts/BusinessContext'
import { dayName, copyToClipboard } from '../../lib/utils'

export default function ContactSection() {
  const { business, hours } = useBusiness()
  const [copied, setCopied] = useState(false)
  const currentDay = new Date().getDay()

  const fullAddress = `${business?.address ?? 'Rua das Palmeiras, 123 - Centro'}, ${business?.city ?? 'São Paulo'}${business?.state ? ` - ${business.state}` : ''}`

  async function handleCopyAddress() {
    const success = await copyToClipboard(fullAddress)
    if (success) {
      setCopied(true)
      setTimeout(() => setCopied(false), 2200)
    }
  }

  const encodedAddress = encodeURIComponent(fullAddress)
  const googleMapsUrl = `https://www.google.com/maps/search/?api=1&query=${encodedAddress}`
  const wazeUrl = `https://waze.com/ul?q=${encodedAddress}`

  return (
    <section id="contact" className="py-24 bg-[var(--color-primary)] relative">
      <div className="max-w-6xl mx-auto px-4">
        <div className="text-center max-w-xl mx-auto mb-16">
          <span className="text-[var(--color-accent)] text-xs font-bold tracking-widest uppercase px-3 py-1 rounded-full bg-[var(--color-accent)]/10 border border-[var(--color-accent)]/20">
            Fale Conosco
          </span>
          <h2 className="text-3xl sm:text-4xl font-black tracking-tight text-[var(--color-text)] mt-4">
            Localização e Contato
          </h2>
          <p className="text-[var(--color-text-muted)] text-sm sm:text-base mt-2">
            Venha nos visitar ou tire suas dúvidas diretamente pelos nossos canais.
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-8">
          {/* Info Card */}
          <div className="card p-8 space-y-6 flex flex-col justify-between border border-[var(--color-border)]">
            <div className="space-y-6">
              <div>
                <h3 className="font-bold text-xl text-[var(--color-text)]">{business?.name}</h3>
                <p className="text-xs text-[var(--color-text-muted)] mt-1">
                  Espaço climatizado, café espresso cortesia e estacionamento conveniado.
                </p>
              </div>

              <div className="space-y-4">
                {/* Address Box */}
                <div className="p-4 rounded-xl bg-[var(--color-surface-2)] border border-[var(--color-border)]">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-start gap-3">
                      <MapPin size={20} className="text-[var(--color-accent)] mt-0.5 shrink-0" />
                      <div>
                        <p className="text-xs font-semibold text-[var(--color-text-muted)] uppercase tracking-wider">Endereço</p>
                        <p className="text-sm font-medium text-[var(--color-text)] mt-1">
                          {fullAddress}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Quick Action Navigation Buttons */}
                  <div className="flex flex-wrap items-center gap-2 mt-4 pt-3 border-t border-[var(--color-border)]">
                    <button
                      onClick={handleCopyAddress}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-[var(--color-surface)] border border-[var(--color-border)] text-[var(--color-text)] hover:border-[var(--color-accent)] transition-colors"
                    >
                      {copied ? <Check size={13} className="text-emerald-400" /> : <Copy size={13} />}
                      <span>{copied ? 'Copiado!' : 'Copiar Endereço'}</span>
                    </button>

                    <a
                      href={googleMapsUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-[var(--color-surface)] border border-[var(--color-border)] text-[var(--color-text)] hover:text-[var(--color-accent)] hover:border-[var(--color-accent)] transition-colors"
                    >
                      <Navigation size={13} />
                      <span>Google Maps</span>
                      <ExternalLink size={11} className="opacity-60" />
                    </a>

                    <a
                      href={wazeUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-[var(--color-surface)] border border-[var(--color-border)] text-[var(--color-text)] hover:text-[var(--color-accent)] hover:border-[var(--color-accent)] transition-colors"
                    >
                      <span>Waze</span>
                      <ExternalLink size={11} className="opacity-60" />
                    </a>
                  </div>
                </div>

                {/* Phone */}
                {business?.phone && (
                  <div className="flex items-center gap-3 p-3 rounded-xl bg-[var(--color-surface-2)] border border-[var(--color-border)]">
                    <Phone size={18} className="text-[var(--color-accent)] shrink-0 ml-1" />
                    <div>
                      <p className="text-[11px] font-semibold text-[var(--color-text-muted)] uppercase">Telefone / WhatsApp</p>
                      <a href={`tel:${business.phone}`} className="text-sm font-semibold text-[var(--color-text)] hover:text-[var(--color-accent)] transition-colors">
                        {business.phone}
                      </a>
                    </div>
                  </div>
                )}

                {/* Email */}
                {business?.email && (
                  <div className="flex items-center gap-3 p-3 rounded-xl bg-[var(--color-surface-2)] border border-[var(--color-border)]">
                    <Mail size={18} className="text-[var(--color-accent)] shrink-0 ml-1" />
                    <div>
                      <p className="text-[11px] font-semibold text-[var(--color-text-muted)] uppercase">E-mail</p>
                      <a href={`mailto:${business.email}`} className="text-sm font-semibold text-[var(--color-text)] hover:text-[var(--color-accent)] transition-colors">
                        {business.email}
                      </a>
                    </div>
                  </div>
                )}

                {/* Instagram */}
                {business?.instagram && (
                  <div className="flex items-center gap-3 p-3 rounded-xl bg-[var(--color-surface-2)] border border-[var(--color-border)]">
                    <AtSign size={18} className="text-[var(--color-accent)] shrink-0 ml-1" />
                    <div>
                      <p className="text-[11px] font-semibold text-[var(--color-text-muted)] uppercase">Instagram Oficial</p>
                      <p className="text-sm font-semibold text-[var(--color-accent)]">{business.instagram}</p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Hours Card */}
          <div className="card p-8 flex flex-col justify-between border border-[var(--color-border)]">
            <div>
              <div className="flex items-center gap-3 mb-6 pb-4 border-b border-[var(--color-border)]">
                <div className="w-10 h-10 rounded-xl bg-[var(--color-accent)]/15 border border-[var(--color-accent)]/30 flex items-center justify-center text-[var(--color-accent)]">
                  <Clock size={18} />
                </div>
                <div>
                  <h3 className="font-bold text-lg text-[var(--color-text)]">Horários Semanais</h3>
                  <p className="text-xs text-[var(--color-text-muted)]">Atendimento por ordem de agendamento</p>
                </div>
              </div>

              <div className="space-y-2.5">
                {hours.map(hour => {
                  const isToday = hour.day_of_week === currentDay
                  return (
                    <div
                      key={hour.day_of_week}
                      className={`flex justify-between items-center px-3.5 py-2.5 rounded-xl transition-colors ${
                        isToday ? 'bg-[var(--color-surface-2)] border border-[var(--color-accent)]/40 font-semibold' : 'border border-transparent'
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        {isToday && <span className="w-1.5 h-1.5 rounded-full bg-[var(--color-accent)]" />}
                        <span className={`text-xs sm:text-sm ${isToday ? 'text-[var(--color-text)]' : 'text-[var(--color-text-muted)]'}`}>
                          {dayName(hour.day_of_week)} {isToday ? '(Hoje)' : ''}
                        </span>
                      </div>
                      {hour.is_closed ? (
                        <span className="text-red-400 text-xs sm:text-sm font-semibold">Fechado</span>
                      ) : (
                        <span className="text-[var(--color-accent)] text-xs sm:text-sm font-semibold">
                          {hour.open_time?.substring(0, 5)} - {hour.close_time?.substring(0, 5)}
                        </span>
                      )}
                    </div>
                  )
                })}
              </div>
            </div>

            <a
              href="#booking"
              className="btn-primary w-full mt-6 py-3 justify-center text-sm font-semibold rounded-xl"
            >
              Agendar Horário pelo Chat
            </a>
          </div>
        </div>
      </div>
    </section>
  )
}
