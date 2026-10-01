import { format, addMinutes, parse, getHours, getMinutes } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import type { BusinessHour } from './database.types'

export function formatCurrency(value: number): string {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(value)
}

export function formatDate(dateStr: string): string {
  const date = parse(dateStr, 'yyyy-MM-dd', new Date())
  return format(date, "EEEE, dd 'de' MMMM 'de' yyyy", { locale: ptBR })
}

export function formatDateShort(dateStr: string): string {
  const date = parse(dateStr, 'yyyy-MM-dd', new Date())
  return format(date, 'dd/MM/yyyy', { locale: ptBR })
}

export function formatTime(timeStr: string): string {
  return timeStr.substring(0, 5)
}

export function calcEndTime(startTime: string, durationMin: number): string {
  const base = parse(`2000-01-01 ${startTime}`, 'yyyy-MM-dd HH:mm', new Date())
  return format(addMinutes(base, durationMin), 'HH:mm')
}

export function formatDuration(minutes: number): string {
  if (minutes < 60) return `${minutes} min`
  const h = Math.floor(minutes / 60)
  const m = minutes % 60
  return m > 0 ? `${h}h ${m}min` : `${h}h`
}

export function dayName(dayOfWeek: number): string {
  const days = ['Domingo', 'Segunda-feira', 'Terça-feira', 'Quarta-feira', 'Quinta-feira', 'Sexta-feira', 'Sábado']
  return days[dayOfWeek] ?? ''
}

export function dayNameShort(dayOfWeek: number): string {
  const days = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb']
  return days[dayOfWeek] ?? ''
}

export function todayISO(): string {
  return format(new Date(), 'yyyy-MM-dd')
}

export function isValidPhone(phone: string): boolean {
  const cleaned = phone.replace(/\D/g, '')
  return cleaned.length >= 10 && cleaned.length <= 11
}

export function maskPhone(value: string): string {
  const cleaned = value.replace(/\D/g, '').substring(0, 11)
  if (cleaned.length <= 2) return cleaned
  if (cleaned.length <= 6) return `(${cleaned.slice(0, 2)}) ${cleaned.slice(2)}`
  if (cleaned.length <= 10) return `(${cleaned.slice(0, 2)}) ${cleaned.slice(2, 6)}-${cleaned.slice(6)}`
  return `(${cleaned.slice(0, 2)}) ${cleaned.slice(2, 7)}-${cleaned.slice(7)}`
}

// ============================================================
// Business Live Status
// ============================================================
export function getBusinessStatus(hours: BusinessHour[]): {
  isOpen: boolean
  label: string
  detail: string
} {
  if (!hours || hours.length === 0) {
    return { isOpen: true, label: 'Atendimento online', detail: 'Agendamento disponível 24/7' }
  }

  const now = new Date()
  const currentDay = now.getDay() // 0 = Domingo
  const currentMinutes = getHours(now) * 60 + getMinutes(now)

  const todayHours = hours.find(h => h.day_of_week === currentDay)

  if (!todayHours || todayHours.is_closed || !todayHours.open_time || !todayHours.close_time) {
    // Procura próximo dia aberto
    const nextOpen = hours.find(h => !h.is_closed && h.open_time)
    const nextDayName = nextOpen ? dayNameShort(nextOpen.day_of_week) : 'em breve'
    return {
      isOpen: false,
      label: 'Fechado no momento',
      detail: `Abre ${nextDayName} às ${nextOpen?.open_time?.substring(0, 5) ?? '09:00'}`,
    }
  }

  const [openH, openM] = todayHours.open_time.split(':').map(Number)
  const [closeH, closeM] = todayHours.close_time.split(':').map(Number)
  const openMinutes = openH * 60 + openM
  const closeMinutes = closeH * 60 + closeM

  if (currentMinutes >= openMinutes && currentMinutes < closeMinutes) {
    return {
      isOpen: true,
      label: 'Aberto agora',
      detail: `Até às ${todayHours.close_time.substring(0, 5)}`,
    }
  } else if (currentMinutes < openMinutes) {
    return {
      isOpen: false,
      label: 'Fechado no momento',
      detail: `Abre hoje às ${todayHours.open_time.substring(0, 5)}`,
    }
  } else {
    return {
      isOpen: false,
      label: 'Fechado no momento',
      detail: 'Reabre amanhã',
    }
  }
}

// ============================================================
// Calendar & Sharing Helpers
// ============================================================
export function generateGoogleCalendarUrl(event: {
  title: string
  description: string
  location: string
  date: string      // YYYY-MM-DD
  startTime: string // HH:mm
  endTime: string   // HH:mm
}): string {
  const startIso = `${event.date.replace(/-/g, '')}T${event.startTime.replace(':', '')}00`
  const endIso = `${event.date.replace(/-/g, '')}T${event.endTime.replace(':', '')}00`

  const params = new URLSearchParams({
    action: 'TEMPLATE',
    text: event.title,
    details: event.description,
    location: event.location,
    dates: `${startIso}/${endIso}`,
  })

  return `https://calendar.google.com/calendar/render?${params.toString()}`
}

export function downloadIcsFile(event: {
  title: string
  description: string
  location: string
  date: string      // YYYY-MM-DD
  startTime: string // HH:mm
  endTime: string   // HH:mm
}) {
  const startIso = `${event.date.replace(/-/g, '')}T${event.startTime.replace(':', '')}00`
  const endIso = `${event.date.replace(/-/g, '')}T${event.endTime.replace(':', '')}00`
  const nowIso = format(new Date(), "yyyyMMdd'T'HHmmss'Z'")

  const icsContent = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//SaaS Barbearia//Agendamento Online//PT',
    'CALSCALE:GREGORIAN',
    'METHOD:PUBLISH',
    'BEGIN:VEVENT',
    `DTSTAMP:${nowIso}`,
    `UID:${nowIso}-${Math.random().toString(36).slice(2)}@barbeariaprime.com.br`,
    `SUMMARY:${event.title}`,
    `DESCRIPTION:${event.description}`,
    `LOCATION:${event.location}`,
    `DTSTART:${startIso}`,
    `DTEND:${endIso}`,
    'STATUS:CONFIRMED',
    'END:VEVENT',
    'END:VCALENDAR',
  ].join('\r\n')

  const blob = new Blob([icsContent], { type: 'text/calendar;charset=utf-8' })
  const link = document.createElement('a')
  link.href = window.URL.createObjectURL(blob)
  link.setAttribute('download', `agendamento-${event.date}.ics`)
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
}

export async function copyToClipboard(text: string): Promise<boolean> {
  try {
    await navigator.clipboard.writeText(text)
    return true
  } catch {
    const textArea = document.createElement('textarea')
    textArea.value = text
    document.body.appendChild(textArea)
    textArea.select()
    document.execCommand('copy')
    document.body.removeChild(textArea)
    return true
  }
}
