import { useEffect, useState } from 'react'
import { format, subDays, addDays } from 'date-fns'
import { Search, Phone, Calendar, Clock } from 'lucide-react'
import { useBusiness } from '../../contexts/BusinessContext'
import { getAppointmentsRange, updateAppointmentStatus } from '../../lib/api'
import { formatCurrency, formatDateShort } from '../../lib/utils'
import type { Appointment } from '../../lib/database.types'

interface ApptExt extends Appointment {
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

export default function AppointmentsPage() {
  const { business } = useBusiness()
  const [appointments, setAppointments] = useState<ApptExt[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [updating, setUpdating] = useState<string | null>(null)

  useEffect(() => {
    if (!business) return
    const from = format(subDays(new Date(), 30), 'yyyy-MM-dd')
    const to = format(addDays(new Date(), 60), 'yyyy-MM-dd')
    getAppointmentsRange(business.id, from, to).then(data => {
      setAppointments((data as ApptExt[]).reverse())
      setLoading(false)
    })
  }, [business])

  async function handleStatusChange(id: string, status: string) {
    setUpdating(id)
    const ok = await updateAppointmentStatus(id, status)
    if (ok) {
      setAppointments(prev => prev.map(a => a.id === id ? { ...a, status: status as any } : a))
    }
    setUpdating(null)
  }

  const filtered = appointments.filter(a => {
    const name = (a as any).customers?.name?.toLowerCase() ?? ''
    const phone = (a as any).customers?.phone ?? ''
    const matchSearch = !search || name.includes(search.toLowerCase()) || phone.includes(search)
    const matchStatus = statusFilter === 'all' || a.status === statusFilter
    return matchSearch && matchStatus
  })

  return (
    <div className="space-y-5">
      <h2 className="text-xl font-bold">Todos os Agendamentos</h2>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--color-text-muted)]" />
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="input pl-9 text-sm"
            placeholder="Buscar por nome ou telefone..."
          />
        </div>
        <select
          value={statusFilter}
          onChange={e => setStatusFilter(e.target.value)}
          className="input text-sm w-full sm:w-44"
        >
          <option value="all">Todos os status</option>
          {Object.entries(STATUS_LABELS).map(([key, { label }]) => (
            <option key={key} value={key}>{label}</option>
          ))}
        </select>
      </div>

      {/* Table */}
      <div className="card overflow-hidden">
        {loading ? (
          <div className="p-8 text-center text-[var(--color-text-muted)] text-sm">Carregando...</div>
        ) : filtered.length === 0 ? (
          <div className="p-8 text-center text-[var(--color-text-muted)] text-sm">Nenhum agendamento encontrado.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-[var(--color-border)] text-[var(--color-text-muted)] text-xs uppercase">
                  <th className="text-left px-5 py-3 font-medium">Cliente</th>
                  <th className="text-left px-5 py-3 font-medium">Serviço</th>
                  <th className="text-left px-5 py-3 font-medium">Data</th>
                  <th className="text-left px-5 py-3 font-medium">Horário</th>
                  <th className="text-left px-5 py-3 font-medium">Valor</th>
                  <th className="text-left px-5 py-3 font-medium">Status</th>
                  <th className="px-5 py-3" />
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--color-border)]">
                {filtered.map(appt => {
                  const status = STATUS_LABELS[appt.status] ?? STATUS_LABELS.pending
                  return (
                    <tr key={appt.id} className="hover:bg-[var(--color-surface-2)] transition-colors">
                      <td className="px-5 py-3">
                        <p className="font-medium">{(appt as any).customers?.name ?? '—'}</p>
                        <p className="text-xs text-[var(--color-text-muted)] flex items-center gap-1 mt-0.5">
                          <Phone size={10} />
                          {(appt as any).customers?.phone ?? '—'}
                        </p>
                      </td>
                      <td className="px-5 py-3 text-[var(--color-text-muted)]">{(appt as any).services?.name ?? '—'}</td>
                      <td className="px-5 py-3 text-[var(--color-text-muted)]">{formatDateShort(appt.date)}</td>
                      <td className="px-5 py-3 text-[var(--color-text-muted)]">{appt.start_time.substring(0, 5)}</td>
                      <td className="px-5 py-3 font-medium">{formatCurrency((appt as any).services?.price ?? 0)}</td>
                      <td className="px-5 py-3">
                        <span className={`badge text-xs font-medium ${status.color}`}>{status.label}</span>
                      </td>
                      <td className="px-5 py-3">
                        <select
                          value={appt.status}
                          disabled={updating === appt.id}
                          onChange={e => handleStatusChange(appt.id, e.target.value)}
                          className="text-xs bg-[var(--color-surface)] border border-[var(--color-border)] rounded px-2 py-1 text-[var(--color-text-muted)] disabled:opacity-50"
                        >
                          {Object.entries(STATUS_LABELS).map(([key, { label }]) => (
                            <option key={key} value={key}>{label}</option>
                          ))}
                        </select>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}
