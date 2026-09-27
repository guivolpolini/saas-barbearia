import { useEffect, useState } from 'react'
import { format, addDays, startOfWeek, subWeeks, addWeeks } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { ChevronLeft, ChevronRight, Clock } from 'lucide-react'
import { useBusiness } from '../../contexts/BusinessContext'
import { getAppointmentsRange } from '../../lib/api'
import { formatCurrency } from '../../lib/utils'
import type { Appointment } from '../../lib/database.types'

interface ApptExt extends Appointment {
  services?: { name: string; price: number }
  customers?: { name: string; phone: string }
}

const STATUS_COLOR: Record<string, string> = {
  confirmed: 'bg-[var(--color-accent)]/20 border-l-2 border-[var(--color-accent)] text-[var(--color-accent)]',
  pending: 'bg-yellow-500/20 border-l-2 border-yellow-500 text-yellow-400',
  cancelled: 'bg-red-500/10 border-l-2 border-red-500 text-red-400',
  completed: 'bg-blue-500/20 border-l-2 border-blue-500 text-blue-400',
  no_show: 'bg-gray-500/10 border-l-2 border-gray-500 text-gray-400',
}

export default function AgendaPage() {
  const { business } = useBusiness()
  const [weekStart, setWeekStart] = useState(() => startOfWeek(new Date(), { weekStartsOn: 1 }))
  const [appointments, setAppointments] = useState<ApptExt[]>([])
  const [loading, setLoading] = useState(true)

  const days = Array.from({ length: 7 }, (_, i) => addDays(weekStart, i))
  const from = format(weekStart, 'yyyy-MM-dd')
  const to = format(addDays(weekStart, 6), 'yyyy-MM-dd')

  useEffect(() => {
    if (!business) return
    setLoading(true)
    getAppointmentsRange(business.id, from, to).then(data => {
      setAppointments(data as ApptExt[])
      setLoading(false)
    })
  }, [business, from])

  function apptsByDay(day: Date) {
    const iso = format(day, 'yyyy-MM-dd')
    return appointments.filter(a => a.date === iso)
  }

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold">Agenda Semanal</h2>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setWeekStart(w => subWeeks(w, 1))}
            className="btn-ghost p-2 rounded-lg"
          >
            <ChevronLeft size={18} />
          </button>
          <span className="text-sm font-medium px-3">
            {format(weekStart, "d MMM", { locale: ptBR })} – {format(addDays(weekStart, 6), "d MMM yyyy", { locale: ptBR })}
          </span>
          <button
            onClick={() => setWeekStart(w => addWeeks(w, 1))}
            className="btn-ghost p-2 rounded-lg"
          >
            <ChevronRight size={18} />
          </button>
          <button
            onClick={() => setWeekStart(startOfWeek(new Date(), { weekStartsOn: 1 }))}
            className="btn-ghost text-xs px-3 py-2"
          >
            Hoje
          </button>
        </div>
      </div>

      {loading ? (
        <div className="card p-12 text-center text-[var(--color-text-muted)] text-sm">Carregando agenda...</div>
      ) : (
        <div className="grid grid-cols-7 gap-2">
          {days.map(day => {
            const appts = apptsByDay(day)
            const isToday = format(day, 'yyyy-MM-dd') === format(new Date(), 'yyyy-MM-dd')
            return (
              <div key={day.toISOString()} className="card min-h-32">
                <div className={`px-2 py-2 text-center border-b border-[var(--color-border)] ${isToday ? 'bg-[var(--color-accent)]/10' : ''}`}>
                  <p className="text-xs text-[var(--color-text-muted)] uppercase">{format(day, 'EEE', { locale: ptBR })}</p>
                  <p className={`text-lg font-bold ${isToday ? 'text-[var(--color-accent)]' : ''}`}>
                    {format(day, 'd')}
                  </p>
                </div>
                <div className="p-1.5 space-y-1">
                  {appts.map(a => (
                    <div key={a.id} className={`${STATUS_COLOR[a.status] ?? ''} px-2 py-1.5 rounded text-xs leading-tight`}>
                      <p className="font-bold">{a.start_time.substring(0, 5)}</p>
                      <p className="truncate">{(a as any).customers?.name?.split(' ')[0]}</p>
                      <p className="truncate opacity-75">{(a as any).services?.name}</p>
                    </div>
                  ))}
                  {appts.length === 0 && (
                    <p className="text-xs text-[var(--color-text-muted)] text-center py-2 opacity-50">—</p>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
