import { format, addMinutes, parse } from 'date-fns'
import { ptBR } from 'date-fns/locale'

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
