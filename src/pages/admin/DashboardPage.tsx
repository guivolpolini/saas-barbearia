import { useEffect, useState } from 'react'
import { Calendar, Users, TrendingUp, Clock, CheckCircle, XCircle } from 'lucide-react'
import { useBusiness } from '../../contexts/BusinessContext'
import { getAppointmentsRange } from '../../lib/api'
import { formatCurrency, formatDate, formatDateShort } from '../../lib/utils'
import { format, startOfMonth, endOfMonth } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import type { Appointment } from '../../lib/database.types'

interface AppointmentWithRelations extends Appointment {
  services?: { name: string; price: number; duration_min: number }
  customers?: { name: string; phone: string }
}

const STATUS_LABELS: Record<string, { label: string; color: string }> = {
  confirmed: { label: 'Confirmado', color: 'text-green-400 bg-green-400/10' },
  pending: { label: 'Pendente', color: 'text-yellow-400 bg-yellow-400/10' },
  cancelled: { label: 'Cancelado', color: 'text-red-400 bg-red-400/10' },
  completed: { label: 'Concluído', color: 'text-blue-400 bg-blue-400/10' },
  no_show: { label: 'Não compareceu', color: 'text-gray-400 bg-gray-400/10' },
}

export default function DashboardPage() {
  const { business } = useBusiness()
  const [appointments, setAppointments] = useState<AppointmentWithRelations[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!business) return
    async function load() {
      const today = format(new Date(), 'yyyy-MM-dd')
      const monthStart = format(startOfMonth(new Date()), 'yyyy-MM-dd')
      const monthEnd = format(endOfMonth(new Date()), 'yyyy-MM-dd')
      const data = await getAppointmentsRange(business!.id, monthStart, monthEnd)
      setAppointments(data as AppointmentWithRelations[])
      setLoading(false)
    }
    load()
  }, [business])

  const today = format(new Date(), 'yyyy-MM-dd')
  const todayAppts = appointments.filter(a => a.date === today)
  const confirmedTotal = appointments.filter(a => a.status === 'confirmed' || a.status === 'completed').length
  const revenue = appointments
    .filter(a => a.status === 'confirmed' || a.status === 'completed')
    .reduce((sum, a) => sum + ((a as any).services?.price ?? 0), 0)

  const stats = [
    { label: 'Agendamentos hoje', value: todayAppts.length, icon: Calendar, color: 'text-[var(--color-accent)]' },
    { label: 'Confirmados no mês', value: confirmedTotal, icon: CheckCircle, color: 'text-green-400' },
    { label: 'Receita estimada', value: formatCurrency(revenue), icon: TrendingUp, color: 'text-blue-400' },
    { label: 'Total no mês', value: appointments.length, icon: Users, color: 'text-purple-400' },
  ]

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold">Olá, bem-vindo! 👋</h2>
        <p className="text-[var(--color-text-muted)] text-sm mt-1">
          Aqui está um resumo do mês de {format(new Date(), 'MMMM yyyy', { locale: ptBR })}
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map(({ label, value, icon: Icon, color }) => (
          <div key={label} className="card p-5">
            <Icon size={20} className={color} />
            <p className="text-2xl font-bold mt-3">{value}</p>
            <p className="text-[var(--color-text-muted)] text-xs mt-1">{label}</p>
          </div>
        ))}
      </div>

      {/* Today's appointments */}
      <div className="card">
        <div className="px-5 py-4 border-b border-[var(--color-border)] flex items-center justify-between">
          <h3 className="font-semibold flex items-center gap-2">
            <Clock size={16} className="text-[var(--color-accent)]" />
            Agenda de hoje — {formatDateShort(today)}
          </h3>
          <span className="badge bg-[var(--color-accent)]/15 text-[var(--color-accent)]">
            {todayAppts.length} agendamento{todayAppts.length !== 1 ? 's' : ''}
          </span>
        </div>

        {loading ? (
          <div className="p-8 text-center text-[var(--color-text-muted)] text-sm">Carregando...</div>
        ) : todayAppts.length === 0 ? (
          <div className="p-8 text-center text-[var(--color-text-muted)] text-sm">Nenhum agendamento hoje.</div>
        ) : (
          <div className="divide-y divide-[var(--color-border)]">
            {todayAppts.map(appt => {
              const status = STATUS_LABELS[appt.status] ?? STATUS_LABELS.pending
              return (
                <div key={appt.id} className="px-5 py-4 flex items-center gap-4">
                  <div className="w-12 text-center">
                    <p className="text-sm font-bold text-[var(--color-accent)]">{appt.start_time.substring(0, 5)}</p>
                    <p className="text-xs text-[var(--color-text-muted)]">{appt.end_time.substring(0, 5)}</p>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-sm">{(appt as any).customers?.name ?? '—'}</p>
                    <p className="text-xs text-[var(--color-text-muted)]">{(appt as any).services?.name}</p>
                  </div>
                  <span className={`badge text-xs font-medium ${status.color}`}>{status.label}</span>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
