import React, { useState, useEffect, useRef } from 'react'
import { MessageCircle, X, Send, Scissors, ChevronLeft } from 'lucide-react'
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
} from '../../lib/utils'
import type { Service } from '../../lib/database.types'
import { format, addDays, parse, isBefore, startOfDay } from 'date-fns'
import { ptBR } from 'date-fns/locale'

// ============================================================
// Types
// ============================================================
type Step =
  | 'welcome'
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
  isLoading?: boolean
}

// ============================================================
// Helpers
// ============================================================
function buildId() {
  return Math.random().toString(36).slice(2)
}

function botMsg(text: string, options?: string[]): Message {
  return { id: buildId(), from: 'bot', text, options }
}

function userMsg(text: string): Message {
  return { id: buildId(), from: 'user', text }
}

function getNextDays(count: number): string[] {
  const days: string[] = []
  let d = new Date()
  d.setHours(0, 0, 0, 0)
  d = addDays(d, 1) // start from tomorrow
  while (days.length < count) {
    days.push(format(d, 'yyyy-MM-dd'))
    d = addDays(d, 1)
  }
  return days
}

function labelDate(iso: string): string {
  const date = parse(iso, 'yyyy-MM-dd', new Date())
  return format(date, "EEE, dd/MM", { locale: ptBR })
}

// ============================================================
// Chat
// ============================================================
export default function ChatWidget() {
  const { business, services, hours } = useBusiness()
  const [open, setOpen] = useState(false)
  const [messages, setMessages] = useState<Message[]>([])
  const [step, setStep] = useState<Step>('welcome')
  const [booking, setBooking] = useState<BookingState>({
    service: null,
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

  function addBotMsg(text: string, options?: string[]) {
    addMsg(botMsg(text, options))
  }

  function initChat() {
    setStep('service')
    const serviceOptions = services.map(s =>
      `${s.name} — ${formatCurrency(s.price)} (${formatDuration(s.duration_min)})`
    )
    setTimeout(() => {
      addBotMsg(`Olá! 👋 Bem-vindo à **${business?.name}**.\n\nSou seu assistente de agendamento. Vamos marcar seu horário?`)
      setTimeout(() => {
        addBotMsg('Qual serviço você deseja?', serviceOptions)
      }, 800)
    }, 400)
  }

  async function handleServiceSelect(optionText: string) {
    const service = services.find(s =>
      optionText.startsWith(s.name)
    )
    if (!service) return

    addMsg(userMsg(optionText))
    setBooking(prev => ({ ...prev, service }))

    setBusy(true)
    // Build available dates (next 14 days, excluding closed days)
    const candidates = getNextDays(21)
    const openDays = candidates.filter(iso => {
      const d = parse(iso, 'yyyy-MM-dd', new Date())
      const dow = d.getDay() // 0=sun
      const hour = hours.find(h => h.day_of_week === dow)
      return hour && !hour.is_closed
    }).slice(0, 14)
    setAvailableDates(openDays)
    setBusy(false)

    setStep('date')
    const dateOptions = openDays.map(labelDate)
    addBotMsg('Ótima escolha! 📅 Qual data você prefere?', dateOptions)
  }

  async function handleDateSelect(optionText: string) {
    const idx = availableDates.findIndex(d => labelDate(d) === optionText)
    const selectedDate = idx >= 0 ? availableDates[idx] : ''
    if (!selectedDate || !booking.service) return

    addMsg(userMsg(optionText))
    setBooking(prev => ({ ...prev, date: selectedDate }))

    setBusy(true)
    const d = parse(selectedDate, 'yyyy-MM-dd', new Date())
    const dow = d.getDay()
    const hour = hours.find(h => h.day_of_week === dow)

    if (!hour || hour.is_closed || !hour.open_time || !hour.close_time) {
      addBotMsg('Ops, esse dia está fechado. Escolha outra data.')
      setBusy(false)
      return
    }

    const booked = await getAppointmentsByDate(business!.id, selectedDate)
    const slots = generateTimeSlots(
      hour.open_time.substring(0, 5),
      hour.close_time.substring(0, 5),
      booking.service.duration_min,
      booked.map(b => ({ start_time: b.start_time, end_time: b.end_time }))
    )
    setAvailableSlots(slots)
    setBusy(false)

    if (slots.length === 0) {
      setStep('date')
      addBotMsg('Sem horários disponíveis nessa data. 😕 Escolha outra data:', availableDates.map(labelDate))
      return
    }

    setStep('time')
    addBotMsg('Perfeito! ⏰ Qual horário funciona para você?', slots)
  }

  function handleTimeSelect(time: string) {
    addMsg(userMsg(time))
    setBooking(prev => ({ ...prev, time }))
    setStep('name')
    setTimeout(() => addBotMsg('Ótimo! Qual é o seu nome completo?'), 300)
  }

  function handleNameInput(name: string) {
    const trimmed = name.trim()
    if (trimmed.length < 2) {
      addBotMsg('Por favor, informe seu nome completo.')
      return
    }
    addMsg(userMsg(trimmed))
    setBooking(prev => ({ ...prev, name: trimmed }))
    setStep('phone')
    setTimeout(() => addBotMsg('E seu WhatsApp/telefone para contato?'), 300)
  }

  function handlePhoneInput(raw: string) {
    const phone = raw.trim()
    if (!isValidPhone(phone)) {
      addBotMsg('Número inválido. Digite um telefone com DDD, ex: (11) 99999-0000')
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
    }, 300)
  }

  async function handleConfirm() {
    if (!business || !booking.service) return
    addMsg(userMsg('✅ Sim, confirmar!'))

    setBusy(true)
    const endTime = calcEndTime(booking.time, booking.service.duration_min)

    // Re-check availability
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
      const slots = hour?.open_time && hour?.close_time
        ? generateTimeSlots(
            hour.open_time.substring(0, 5),
            hour.close_time.substring(0, 5),
            booking.service.duration_min,
            booked.map(b => ({ start_time: b.start_time, end_time: b.end_time }))
          )
        : []
      setAvailableSlots(slots)
      addBotMsg(
        '⚠️ Esse horário acabou de ser reservado por outra pessoa. Escolha um novo horário:',
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
      addBotMsg(`❌ ${result.error ?? 'Erro ao agendar. Tente novamente.'}\n\nDigite *reiniciar* para começar de novo.`)
      return
    }

    setBooking(prev => ({ ...prev, appointmentId: result.appointmentId ?? '' }))

    // Trigger n8n (non-blocking)
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
      `✅ **Agendamento confirmado!**\n\n` +
      `Você está na nossa agenda para ${formatDate(booking.date)} às ${booking.time}.\n\n` +
      `Nos vemos em breve! 💈\n\n` +
      `_Endereço: ${business.address}, ${business.city}_`
    )
  }

  function handleCancel() {
    addMsg(userMsg('❌ Cancelar'))
    addBotMsg('Tudo bem! Agendamento cancelado. Se mudar de ideia, é só recomeçar. 😊', ['🔄 Agendar de novo'])
    setStep('welcome')
  }

  async function handleUserSend() {
    const text = input.trim()
    if (!text || busy) return
    setInput('')

    if (text.toLowerCase() === 'reiniciar' || text === '🔄 Agendar de novo') {
      resetChat()
      return
    }

    switch (step) {
      case 'name': handleNameInput(text); break
      case 'phone': handlePhoneInput(maskPhone(text)); break
      default: addBotMsg('Clique em uma das opções acima para continuar.')
    }
  }

  function handleOptionClick(option: string) {
    if (busy) return
    switch (step) {
      case 'service': handleServiceSelect(option); break
      case 'date': handleDateSelect(option); break
      case 'time': handleTimeSelect(option); break
      case 'confirm':
        if (option.includes('Sim')) handleConfirm()
        else handleCancel()
        break
      case 'welcome':
        if (option.includes('Agendar')) resetChat()
        break
    }
  }

  function resetChat() {
    setMessages([])
    setBooking({ service: null, date: '', time: '', name: '', phone: '', appointmentId: '' })
    setStep('welcome')
    setAvailableSlots([])
    setAvailableDates([])
    setTimeout(() => initChat(), 100)
  }

  const lastOptions = [...messages].reverse().find(m => m.options)?.options

  return (
    <>
      {/* Toggle button */}
      <button
        onClick={() => setOpen(o => !o)}
        className="fixed bottom-6 right-6 z-50 w-14 h-14 rounded-full bg-[var(--color-accent)] text-black shadow-2xl flex items-center justify-center hover:bg-[var(--color-accent-dark)] transition-all duration-200 hover:scale-105"
        aria-label={open ? 'Fechar chat' : 'Abrir chat de agendamento'}
      >
        {open ? <X size={24} /> : <MessageCircle size={24} />}
        {!open && (
          <span className="absolute -top-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-[var(--color-primary)]" />
        )}
      </button>

      {/* Chat window */}
      <div
        className={clsx(
          'fixed bottom-24 right-6 z-50 w-96 max-w-[calc(100vw-3rem)] bg-[var(--color-surface)] rounded-2xl shadow-2xl border border-[var(--color-border)] flex flex-col overflow-hidden transition-all duration-300',
          open ? 'opacity-100 translate-y-0 pointer-events-auto' : 'opacity-0 translate-y-4 pointer-events-none'
        )}
        style={{ height: '520px' }}
      >
        {/* Header */}
        <div className="flex items-center gap-3 px-4 py-3 bg-[var(--color-surface-2)] border-b border-[var(--color-border)]">
          <div className="w-9 h-9 rounded-full bg-[var(--color-accent)] flex items-center justify-center text-black">
            <Scissors size={18} />
          </div>
          <div className="flex-1 min-w-0">
            <p className="font-semibold text-sm text-[var(--color-text)] truncate">Assistente de Agendamento</p>
            <p className="text-xs text-green-400 flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-green-400 inline-block" />
              Online agora
            </p>
          </div>
          <button onClick={() => setOpen(false)} className="text-[var(--color-text-muted)] hover:text-[var(--color-text)] transition-colors">
            <X size={18} />
          </button>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {messages.map(msg => (
            <div key={msg.id} className={clsx('flex', msg.from === 'user' ? 'justify-end' : 'justify-start')}>
              <div
                className={clsx(
                  'max-w-[85%] px-3 py-2 rounded-2xl text-sm leading-relaxed',
                  msg.from === 'user'
                    ? 'bg-[var(--color-accent)] text-black rounded-tr-sm font-medium'
                    : 'bg-[var(--color-surface-2)] text-[var(--color-text)] rounded-tl-sm border border-[var(--color-border)]'
                )}
              >
                <span className="whitespace-pre-line">{msg.text.replace(/\*\*(.*?)\*\*/g, '$1')}</span>
              </div>
            </div>
          ))}

          {busy && (
            <div className="flex justify-start">
              <div className="bg-[var(--color-surface-2)] border border-[var(--color-border)] px-4 py-2 rounded-2xl rounded-tl-sm flex gap-1">
                {[0, 1, 2].map(i => (
                  <span
                    key={i}
                    className="w-2 h-2 bg-[var(--color-text-muted)] rounded-full animate-bounce"
                    style={{ animationDelay: `${i * 0.15}s` }}
                  />
                ))}
              </div>
            </div>
          )}

          {/* Quick options */}
          {lastOptions && !busy && step !== 'done' && step !== 'error' && (
            <div className="flex flex-wrap gap-2 mt-2">
              {lastOptions.map(opt => (
                <button
                  key={opt}
                  onClick={() => handleOptionClick(opt)}
                  className="text-xs px-3 py-1.5 rounded-full border border-[var(--color-accent)] text-[var(--color-accent)] hover:bg-[var(--color-accent)] hover:text-black transition-all duration-150"
                >
                  {opt}
                </button>
              ))}
            </div>
          )}

          <div ref={bottomRef} />
        </div>

        {/* Input */}
        {(step === 'name' || step === 'phone' || step === 'error') && (
          <div className="p-3 border-t border-[var(--color-border)] flex gap-2">
            <input
              ref={inputRef}
              value={input}
              onChange={e => {
                const val = step === 'phone' ? maskPhone(e.target.value) : e.target.value
                setInput(val)
              }}
              onKeyDown={e => e.key === 'Enter' && handleUserSend()}
              placeholder={step === 'name' ? 'Seu nome completo...' : step === 'phone' ? '(11) 99999-0000' : 'reiniciar'}
              className="input flex-1 py-2 text-sm"
              disabled={busy}
            />
            <button
              onClick={handleUserSend}
              disabled={busy || !input.trim()}
              className="w-9 h-9 rounded-lg bg-[var(--color-accent)] text-black flex items-center justify-center disabled:opacity-40 hover:bg-[var(--color-accent-dark)] transition-colors"
            >
              <Send size={16} />
            </button>
          </div>
        )}
      </div>
    </>
  )
}
