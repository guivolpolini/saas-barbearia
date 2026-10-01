import React, { useState, useEffect, useRef } from 'react'
import {
  MessageCircle,
  X,
  Send,
  Scissors,
  ChevronLeft,
  Calendar,
  Clock,
  User,
  CheckCircle2,
  ExternalLink,
  Download,
  RotateCcw,
  Sparkles,
} from 'lucide-react'
import clsx from 'clsx'
import { useBusiness } from '../../contexts/BusinessContext'
import {
  getAppointmentsByDate,
  generateTimeSlots,
  checkSlotAvailability,
  createAppointment,
} from '../../lib/api'
import { triggerN8nWebhook } from '../../lib/webhook'
import {
  formatCurrency,
  formatDate,
  formatDuration,
  calcEndTime,
  maskPhone,
  isValidPhone,
  todayISO,
  generateGoogleCalendarUrl,
  downloadIcsFile,
  dayNameShort,
} from '../../lib/utils'
import type { Service, Professional } from '../../lib/database.types'
import { format, addDays, parse, isBefore, startOfDay } from 'date-fns'
import { ptBR } from 'date-fns/locale'

// ============================================================
// Types
// ============================================================
type Step =
  | 'welcome'
  | 'professional'
  | 'service'
  | 'date'
  | 'time'
  | 'name'
  | 'phone'
  | 'confirm'
  | 'done'
  | 'error'

interface BookingState {
  service: Service | null
  professional: Professional | null
  date: string
  time: string
  name: string
  phone: string
  appointmentId: string
}

interface Message {
  id: string
  from: 'bot' | 'user'
  text: string
  options?: string[]
  type?: 'text' | 'service-list' | 'date-list' | 'slot-list' | 'summary-done'
  isLoading?: boolean
}

function buildId() {
  return Math.random().toString(36).slice(2)
}

function botMsg(text: string, options?: string[], type: Message['type'] = 'text'): Message {
  return { id: buildId(), from: 'bot', text, options, type }
}

function userMsg(text: string): Message {
  return { id: buildId(), from: 'user', text }
}

function getNextDays(count: number): string[] {
  const days: string[] = []
  let d = new Date()
  d.setHours(0, 0, 0, 0)
  d = addDays(d, 1) // Começa a partir de amanhã
  while (days.length < count) {
    days.push(format(d, 'yyyy-MM-dd'))
    d = addDays(d, 1)
  }
  return days
}

export default function ChatWidget() {
  const { business, services, hours, professionals } = useBusiness()
  const [open, setOpen] = useState(false)
  const [messages, setMessages] = useState<Message[]>([])
  const [step, setStep] = useState<Step>('welcome')
  const [booking, setBooking] = useState<BookingState>({
    service: null,
    professional: null,
    date: '',
    time: '',
    name: '',
    phone: '',
    appointmentId: '',
  })
  const [input, setInput] = useState('')
  const [busy, setBusy] = useState(false)
  const [availableSlots, setAvailableSlots] = useState<string[]>([])
  const [availableDates, setAvailableDates] = useState<string[]>([])
  const bottomRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (open && messages.length === 0 && business) {
      initChat()
    }
  }, [open, business])

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  useEffect(() => {
    if (open) setTimeout(() => inputRef.current?.focus(), 300)
  }, [open])

  function addMsg(msg: Message) {
    setMessages(prev => [...prev, msg])
  }

  function addBotMsg(text: string, options?: string[], type: Message['type'] = 'text') {
    addMsg(botMsg(text, options, type))
  }

  function initChat() {
    setStep('service')
    const serviceOptions = services.map(
      s => `${s.name} - ${formatCurrency(s.price)} (${formatDuration(s.duration_min)})`
    )

    setTimeout(() => {
      addBotMsg(
        `Olá! 👋 Seja bem-vindo à **${business?.name ?? 'Barbearia Prime'}**.\n\nSou seu assistente de agendamento online. Vamos marcar seu horário em menos de 2 minutos?`
      )
      setTimeout(() => {
        addBotMsg('Qual serviço você deseja realizar?', serviceOptions)
      }, 700)
    }, 350)
  }

  async function handleServiceSelect(optionText: string) {
    const service = services.find(s => optionText.startsWith(s.name))
    if (!service) return

    addMsg(userMsg(optionText))
    setBooking(prev => ({ ...prev, service }))
    setBusy(true)

    // Gera datas disponíveis
    const candidates = getNextDays(21)
    const openDays = candidates.filter(iso => {
      const d = parse(iso, 'yyyy-MM-dd', new Date())
      const dow = d.getDay()
      const hour = hours.find(h => h.day_of_week === dow)
      return hour && !hour.is_closed && hour.open_time && hour.close_time
    })

    setAvailableDates(openDays.slice(0, 7))
    setBusy(false)
    setStep('date')

    const dateLabels = openDays.slice(0, 7).map(iso => {
      const d = parse(iso, 'yyyy-MM-dd', new Date())
      return `${format(d, "EEE, dd/MM", { locale: ptBR })} [${iso}]`
    })

    setTimeout(() => {
      addBotMsg(
        `Excelente escolha! ✂️ **${service.name}** (${formatCurrency(service.price)}).\n\nPara qual dia você prefere?`,
        dateLabels
      )
    }, 400)
  }

  async function handleDateSelect(optionText: string) {
    const match = optionText.match(/\[(\d{4}-\d{2}-\d{2})\]/)
    const date = match ? match[1] : availableDates.find(d => optionText.includes(d))

    if (!date) return

    addMsg(userMsg(optionText.replace(/\[\d{4}-\d{2}-\d{2}\]/, '').trim()))
    setBooking(prev => ({ ...prev, date }))
    setBusy(true)

    if (!business || !booking.service) return

    // Busca agendamentos do dia para calcular slots
    const booked = await getAppointmentsByDate(business.id, date)
    const d = parse(date, 'yyyy-MM-dd', new Date())
    const dow = d.getDay()
    const hour = hours.find(h => h.day_of_week === dow)

    const slots =
      hour?.open_time && hour?.close_time
        ? generateTimeSlots(
            hour.open_time.substring(0, 5),
            hour.close_time.substring(0, 5),
            booking.service.duration_min,
            booked.map(b => ({ start_time: b.start_time, end_time: b.end_time }))
          )
        : []

    setAvailableSlots(slots)
    setBusy(false)

    if (slots.length === 0) {
      setTimeout(() => {
        addBotMsg(
          'Infelizmente não há horários livres neste dia. Por favor, selecione outra data:',
          availableDates.map(iso => {
            const dt = parse(iso, 'yyyy-MM-dd', new Date())
            return `${format(dt, "EEE, dd/MM", { locale: ptBR })} [${iso}]`
          })
        )
      }, 400)
      return
    }

    setStep('time')
    setTimeout(() => {
      addBotMsg(`Temos estes horários livres para ${formatDate(date)}. Qual horário fica melhor para você?`, slots)
    }, 400)
  }

  async function handleTimeSelect(time: string) {
    addMsg(userMsg(`⏰ ${time}`))
    setBooking(prev => ({ ...prev, time }))
    setStep('name')

    setTimeout(() => {
      addBotMsg('Perfeito! Agora, por favor, me diga seu **nome completo**:')
    }, 400)
  }

  function handleNameInput(name: string) {
    if (name.trim().length < 3) {
      addBotMsg('Por favor, informe seu nome com pelo menos 3 caracteres.')
      return
    }
    addMsg(userMsg(name.trim()))
    setBooking(prev => ({ ...prev, name: name.trim() }))
    setStep('phone')

    setTimeout(() => {
      addBotMsg('Ótimo! Agora digite seu **telefone / WhatsApp** com DDD:')
    }, 350)
  }

  function handlePhoneInput(phone: string) {
    if (!isValidPhone(phone)) {
      addBotMsg('Número de telefone inválido. Digite com DDD (ex: 11 99999-8888):')
      return
    }
    addMsg(userMsg(phone))
    setBooking(prev => ({ ...prev, phone }))
    setStep('confirm')

    const { service, date, time, name } = booking
    const displayPhone = phone

    setTimeout(() => {
      addBotMsg(
        `Perfeito! Veja o resumo do seu agendamento:\n\n` +
          `📋 **Serviço:** ${service?.name}\n` +
          `💰 **Valor:** ${formatCurrency(service?.price ?? 0)}\n` +
          `📅 **Data:** ${formatDate(date)}\n` +
          `⏰ **Horário:** ${time}\n` +
          `👤 **Nome:** ${name}\n` +
          `📱 **Telefone:** ${displayPhone}\n\n` +
          `Confirmo o agendamento?`,
        ['✅ Sim, confirmar!', '❌ Cancelar']
      )
    }, 350)
  }

  async function handleConfirm() {
    if (!business || !booking.service) return
    addMsg(userMsg('✅ Sim, confirmar!'))

    setBusy(true)
    const endTime = calcEndTime(booking.time, booking.service.duration_min)

    // Re-check slot availability
    const available = await checkSlotAvailability(
      business.id,
      booking.date,
      booking.time + ':00',
      endTime + ':00'
    )

    if (!available) {
      setBusy(false)
      setStep('time')
      const booked = await getAppointmentsByDate(business.id, booking.date)
      const d = parse(booking.date, 'yyyy-MM-dd', new Date())
      const dow = d.getDay()
      const hour = hours.find(h => h.day_of_week === dow)
      const slots =
        hour?.open_time && hour?.close_time
          ? generateTimeSlots(
              hour.open_time.substring(0, 5),
              hour.close_time.substring(0, 5),
              booking.service.duration_min,
              booked.map(b => ({ start_time: b.start_time, end_time: b.end_time }))
            )
          : []
      setAvailableSlots(slots)
      addBotMsg(
        '⚠️ Esse horário acabou de ser reservado por outro cliente. Por favor, escolha um novo horário disponível:',
        slots
      )
      return
    }

    const result = await createAppointment({
      businessId: business.id,
      serviceId: booking.service.id,
      customerName: booking.name,
      phone: booking.phone,
      date: booking.date,
      startTime: booking.time + ':00',
      endTime: endTime + ':00',
    })

    if (!result.success) {
      setBusy(false)
      setStep('error')
      addBotMsg(
        `❌ ${result.error ?? 'Erro ao registrar agendamento.'}\n\nDigite *reiniciar* para tentar novamente.`
      )
      return
    }

    setBooking(prev => ({ ...prev, appointmentId: result.appointmentId ?? '' }))

    // Notificação Webhook n8n (não bloqueante)
    triggerN8nWebhook({
      event: 'appointment.created',
      business_id: business.id,
      service_id: booking.service.id,
      service_name: booking.service.name,
      customer_name: booking.name,
      phone: booking.phone,
      date: booking.date,
      time: booking.time,
      duration_min: booking.service.duration_min,
      price: booking.service.price,
      appointment_id: result.appointmentId ?? '',
      created_at: new Date().toISOString(),
    })

    setBusy(false)
    setStep('done')

    addBotMsg(
      `🎉 **Agendamento Confirmado com Sucesso!**\n\n` +
        `Seu horário está garantido para **${formatDate(booking.date)} às ${booking.time}**.\n\n` +
        `📍 **Local:** ${business.address ?? 'Endereço principal'}, ${business.city ?? 'Centro'}\n\n` +
        `_Clique nos botões abaixo para salvar na sua agenda:_`,
      undefined,
      'summary-done'
    )
  }

  function handleCancel() {
    addMsg(userMsg('❌ Cancelar'))
    addBotMsg(
      'Tudo bem! O agendamento foi cancelado. Se desejar recomeçar, basta clicar no botão abaixo:',
      ['🔄 Agendar novamente']
    )
    setStep('welcome')
  }

  function resetChat() {
    setMessages([])
    setBooking({
      service: null,
      professional: null,
      date: '',
      time: '',
      name: '',
      phone: '',
      appointmentId: '',
    })
    setStep('welcome')
    initChat()
  }

  async function handleUserSend() {
    const text = input.trim()
    if (!text || busy) return
    setInput('')

    if (text.toLowerCase() === 'reiniciar' || text === '🔄 Agendar novamente') {
      resetChat()
      return
    }

    switch (step) {
      case 'name':
        handleNameInput(text)
        break
      case 'phone':
        handlePhoneInput(maskPhone(text))
        break
      default:
        addBotMsg('Por favor, clique em uma das opções acima para prosseguir.')
    }
  }

  function handleOptionClick(option: string) {
    if (busy) return
    if (option === '✅ Sim, confirmar!') {
      handleConfirm()
    } else if (option === '❌ Cancelar') {
      handleCancel()
    } else if (option === '🔄 Agendar novamente') {
      resetChat()
    } else if (step === 'service') {
      handleServiceSelect(option)
    } else if (step === 'date') {
      handleDateSelect(option)
    } else if (step === 'time') {
      handleTimeSelect(option)
    }
  }

  // Prepara dados do calendário para o step 'done'
  const calendarEvent = booking.service
    ? {
        title: `${booking.service.name} - ${business?.name ?? 'Barbearia Prime'}`,
        description: `Agendamento de ${booking.service.name} (${formatCurrency(booking.service.price)}) com ${booking.name}.`,
        location: `${business?.address ?? 'Rua das Palmeiras, 123'}, ${business?.city ?? 'São Paulo'}`,
        date: booking.date,
        startTime: booking.time,
        endTime: calcEndTime(booking.time, booking.service.duration_min),
      }
    : null

  return (
    <>
      {/* Floating trigger button */}
      {!open && (
        <button
          onClick={() => setOpen(true)}
          className="fixed bottom-6 right-6 z-50 flex items-center gap-3 px-5 py-3.5 rounded-full bg-[var(--color-accent)] text-black font-bold shadow-2xl shadow-[var(--color-accent)]/30 hover:scale-105 active:scale-95 transition-all duration-200 group"
          aria-label="Abrir chat de agendamento"
        >
          <span className="relative flex h-3 w-3">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-black opacity-75" />
            <span className="relative inline-flex rounded-full h-3 w-3 bg-black" />
          </span>
          <Scissors size={20} className="group-hover:rotate-45 transition-transform" />
          <span className="text-sm font-extrabold tracking-tight">Agendar Horário</span>
        </button>
      )}

      {/* Chat window */}
      {open && (
        <div className="fixed bottom-4 right-4 z-50 w-[calc(100vw-32px)] sm:w-[420px] h-[600px] max-h-[calc(100vh-32px)] flex flex-col rounded-2xl bg-[var(--color-surface)] border border-[var(--color-border)] shadow-2xl overflow-hidden animate-in fade-in slide-in-from-bottom-6 duration-200">
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3.5 bg-[var(--color-surface-2)] border-b border-[var(--color-border)] shrink-0">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-[var(--color-accent)]/20 border border-[var(--color-accent)]/40 flex items-center justify-center text-[var(--color-accent)]">
                <Scissors size={18} />
              </div>
              <div>
                <p className="font-bold text-sm text-[var(--color-text)] leading-none">{business?.name ?? 'Barbearia Prime'}</p>
                <div className="flex items-center gap-1.5 mt-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  <p className="text-[11px] text-[var(--color-text-muted)] font-medium">Assistente de Agendamento</p>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-1">
              <button
                onClick={resetChat}
                title="Reiniciar conversa"
                className="w-8 h-8 rounded-lg flex items-center justify-center text-[var(--color-text-muted)] hover:text-[var(--color-text)] hover:bg-[var(--color-surface)] transition-colors"
              >
                <RotateCcw size={15} />
              </button>
              <button
                onClick={() => setOpen(false)}
                className="w-8 h-8 rounded-lg flex items-center justify-center text-[var(--color-text-muted)] hover:text-[var(--color-text)] hover:bg-[var(--color-surface)] transition-colors"
              >
                <X size={18} />
              </button>
            </div>
          </div>

          {/* Messages body */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3.5 scroll-smooth">
            {messages.map(msg => (
              <div key={msg.id} className={clsx('flex flex-col', msg.from === 'user' ? 'items-end' : 'items-start')}>
                <div
                  className={clsx(
                    'max-w-[85%] rounded-2xl px-4 py-3 text-sm leading-relaxed shadow-sm',
                    msg.from === 'user'
                      ? 'bg-[var(--color-accent)] text-black font-medium rounded-br-none'
                      : 'bg-[var(--color-surface-2)] text-[var(--color-text)] border border-[var(--color-border)] rounded-bl-none'
                  )}
                >
                  <p className="whitespace-pre-line">
                    {msg.text.split('\n').map((line, i) => (
                      <React.Fragment key={i}>
                        {line.startsWith('**') && line.endsWith('**') ? (
                          <strong>{line.slice(2, -2)}</strong>
                        ) : (
                          line
                        )}
                        {i < msg.text.split('\n').length - 1 && <br />}
                      </React.Fragment>
                    ))}
                  </p>
                </div>

                {/* Interactive Options / Action Buttons */}
                {msg.options && msg.options.length > 0 && (
                  <div className="flex flex-wrap gap-2 mt-2.5 max-w-[95%]">
                    {msg.options.map(option => (
                      <button
                        key={option}
                        onClick={() => handleOptionClick(option)}
                        disabled={busy}
                        className={clsx(
                          'text-xs font-semibold px-3.5 py-2 rounded-xl border transition-all duration-150',
                          option.startsWith('✅')
                            ? 'bg-emerald-500/20 border-emerald-500/50 text-emerald-300 hover:bg-emerald-500/30'
                            : option.startsWith('❌')
                            ? 'bg-red-500/10 border-red-500/30 text-red-400 hover:bg-red-500/20'
                            : 'bg-[var(--color-surface-2)] border-[var(--color-border)] text-[var(--color-text)] hover:border-[var(--color-accent)] hover:text-[var(--color-accent)] hover:bg-[var(--color-accent)]/5 active:scale-95'
                        )}
                      >
                        {option.replace(/\[\d{4}-\d{2}-\d{2}\]/, '').trim()}
                      </button>
                    ))}
                  </div>
                )}

                {/* Custom Final Success Card with Calendar Actions */}
                {msg.type === 'summary-done' && calendarEvent && (
                  <div className="w-full mt-3 p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/30 space-y-3">
                    <div className="flex items-center gap-2 text-emerald-400 font-bold text-xs uppercase tracking-wider">
                      <CheckCircle2 size={16} />
                      Adicionar ao seu calendário
                    </div>

                    <div className="grid grid-cols-2 gap-2 pt-1">
                      <a
                        href={generateGoogleCalendarUrl(calendarEvent)}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-lg bg-[var(--color-surface)] border border-[var(--color-border)] text-xs font-semibold text-[var(--color-text)] hover:border-[var(--color-accent)] hover:text-[var(--color-accent)] transition-colors"
                      >
                        <Calendar size={13} />
                        <span>Google Agenda</span>
                        <ExternalLink size={10} className="opacity-50" />
                      </a>

                      <button
                        onClick={() => downloadIcsFile(calendarEvent)}
                        className="flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-lg bg-[var(--color-surface)] border border-[var(--color-border)] text-xs font-semibold text-[var(--color-text)] hover:border-[var(--color-accent)] hover:text-[var(--color-accent)] transition-colors"
                      >
                        <Download size={13} />
                        <span>Apple / iCal</span>
                      </button>
                    </div>

                    <button
                      onClick={resetChat}
                      className="w-full py-2 text-center text-xs font-medium text-[var(--color-text-muted)] hover:text-[var(--color-text)] transition-colors pt-2 border-t border-emerald-500/20"
                    >
                      Fazer outro agendamento
                    </button>
                  </div>
                )}
              </div>
            ))}

            {busy && (
              <div className="flex items-center gap-2 text-[var(--color-text-muted)] text-xs px-2 py-1">
                <span className="w-2 h-2 rounded-full bg-[var(--color-accent)] animate-ping" />
                <span>Verificando horários em tempo real...</span>
              </div>
            )}
            <div ref={bottomRef} />
          </div>

          {/* Input Footer */}
          <div className="p-3 bg-[var(--color-surface-2)] border-t border-[var(--color-border)] shrink-0">
            <form
              onSubmit={e => {
                e.preventDefault()
                handleUserSend()
              }}
              className="flex items-center gap-2"
            >
              <input
                ref={inputRef}
                type={step === 'phone' ? 'tel' : 'text'}
                value={input}
                onChange={e => {
                  if (step === 'phone') {
                    setInput(maskPhone(e.target.value))
                  } else {
                    setInput(e.target.value)
                  }
                }}
                placeholder={
                  step === 'name'
                    ? 'Digite seu nome completo...'
                    : step === 'phone'
                    ? 'Digite seu telefone (11 99999-8888)...'
                    : 'Clique nas opções acima...'
                }
                disabled={busy || (step !== 'name' && step !== 'phone')}
                className="flex-1 bg-[var(--color-surface)] border border-[var(--color-border)] text-[var(--color-text)] placeholder-[var(--color-text-muted)] text-sm rounded-xl px-3.5 py-2.5 focus:outline-none focus:border-[var(--color-accent)] transition-colors disabled:opacity-50"
              />
              <button
                type="submit"
                disabled={!input.trim() || busy}
                className="w-10 h-10 rounded-xl bg-[var(--color-accent)] text-black flex items-center justify-center hover:scale-105 active:scale-95 disabled:opacity-40 disabled:scale-100 transition-all shrink-0 font-bold"
              >
                <Send size={16} />
              </button>
            </form>
          </div>
        </div>
      )}
    </>
  )
}
