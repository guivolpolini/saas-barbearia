import { useEffect, useState } from 'react'
import { format, addDays, startOfWeek, subWeeks, addWeeks } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { ChevronLeft, ChevronRight, Clock, Users } from 'lucide-react'
import { useBusiness } from '../../contexts/BusinessContext'
import { getAppointmentsRange } from '../../lib/api'
import { formatCurrency } from '../../lib/utils'
import type { Appointment } from '../../lib/database.types'

interface ApptExt extends Appointment {
  services?: { name: string; price: number }
  professionals?: { id: string; name: string; role: string | null }
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
  const { business, professionals } = useBusiness()
  const [weekStart, setWeekStart] = useState(() => startOfWeek(new Date(), { weekStartsOn: 1 }))
  const [appointments, setAppointments] = useState<ApptExt[]>([])
  const [profFilter, setProfFilter] = useState('all')
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
    return appointments.filter(a => {
      const matchDay = a.date === iso
      const matchProf =
        profFilter === 'all' ||
        (a as any).professionals?.id === profFilter ||
        (profFilter === 'none' && !(a as any).professionals)
      return matchDay && matchProf
    })
  }

  return (
    <div className="space-y-5">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <h2 className="text-xl font-bold">Agenda Semanal</h2>

        <div className="flex flex-wrap items-center gap-2.5">
          {/* Barber Filter */}
          <select
            value={profFilter}
            onChange={e => setProfFilter(e.target.value)}
            className="input text-xs py-1.5 px-2.5 w-auto"
          >
            <option value="all">Equipe Completa</option>
            {professionals.map(p => (
              <option key={p.id} value={p.id}>{p.name}</option>
            ))}
            <option value="none">Sem barbeiro fixo</option>
          </select>

          {/* Week Nav */}
          <div className="flex items-center gap-1 bg-[var(--color-surface)] border border-[var(--color-border)] rounded-xl p-1">
            <button
              onClick={() => setWeekStart(w => subWeeks(w, 1))}
              className="btn-ghost p-1.5 rounded-lg"
              title="Semana anterior"
            >
              <ChevronLeft size={16} />
            </button>
            <span className="text-xs font-semibold px-2">
              {format(weekStart, "d MMM", { locale: ptBR })} - {format(addDays(weekStart, 6), "d MMM yyyy", { locale: ptBR })}
            </span>
            <button
              onClick={() => setWeekStart(w => addWeeks(w, 1))}
              className="btn-ghost p-1.5 rounded-lg"
              title="Próxima semana"
            >
              <ChevronRight size={16} />
            </button>
          </div>

          <button
            onClick={() => setWeekStart(startOfWeek(new Date(), { weekStartsOn: 1 }))}
            className="btn-ghost text-xs px-3 py-2 rounded-xl"
          >
            Hoje
          </button>
        </div>
      </div>

      {loading ? (
        <div className="card p-12 text-center text-[var(--color-text-muted)] text-sm">Carregando agenda...</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-7 gap-2">
          {days.map(day => {
            const appts = apptsByDay(day)
            const isToday = format(day, 'yyyy-MM-dd') === format(new Date(), 'yyyy-MM-dd')
            return (
              <div key={day.toISOString()} className="card min-h-36 flex flex-col">
                <div className={`px-2.5 py-2 text-center border-b border-[var(--color-border)] ${isToday ? 'bg-[var(--color-accent)]/10' : ''}`}>
                  <p className="text-xs text-[var(--color-text-muted)] uppercase font-semibold">{format(day, 'EEE', { locale: ptBR })}</p>
                  <p className={`text-base font-bold ${isToday ? 'text-[var(--color-accent)]' : ''}`}>
                    {format(day, 'd/MM')}
                  </p>
                </div>
                <div className="p-2 space-y-1.5 flex-1">
                  {appts.map(a => {
                    const profName = (a as any).professionals?.name
                    return (
                      <div key={a.id} className={`${STATUS_COLOR[a.status] ?? ''} p-2 rounded-lg text-xs leading-tight shadow-sm`}>
                        <div className="flex items-center justify-between font-bold">
                          <span>{a.start_time.substring(0, 5)}</span>
                          {profName && (
                            <span className="text-[10px] opacity-80 truncate max-w-[70px]">
                              {profName.split(' ')[0]}
                            </span>
                          )}
                        </div>
                        <p className="font-medium truncate mt-0.5">{(a as any).customers?.name?.split(' ')[0]}</p>
                        <p className="truncate opacity-75 text-[11px]">{(a as any).services?.name}</p>
                      </div>
                    )
                  })}
                  {appts.length === 0 && (
                    <p className="text-xs text-[var(--color-text-muted)] text-center py-4 opacity-40">Sem agendamentos</p>
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
