import { useEffect, useState } from 'react'
import { Check, X } from 'lucide-react'
import { useBusiness } from '../../contexts/BusinessContext'
import { supabase } from '../../lib/supabase'
import { dayName } from '../../lib/utils'
import type { BusinessHour } from '../../lib/database.types'

export default function HoursPage() {
  const { business, hours: ctxHours } = useBusiness()
  const [hours, setHours] = useState<BusinessHour[]>([])
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)

  useEffect(() => {
    setHours(ctxHours)
  }, [ctxHours])

  function update(dayOfWeek: number, field: keyof BusinessHour, value: any) {
    setHours(prev => prev.map(h => h.day_of_week === dayOfWeek ? { ...h, [field]: value } : h))
  }

  async function handleSave() {
    if (!business) return
    setSaving(true)
    const updates = hours.map(h =>
      supabase.from('business_hours').upsert({
        id: h.id,
        business_id: business.id,
        day_of_week: h.day_of_week,
        open_time: h.is_closed ? null : h.open_time,
        close_time: h.is_closed ? null : h.close_time,
        is_closed: h.is_closed,
      })
    )
    await Promise.all(updates)
    setSaving(false)
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold">Horários de Funcionamento</h2>
        <button onClick={handleSave} disabled={saving} className="btn-primary text-sm px-4 py-2">
          {saved ? <><Check size={16} /> Salvo!</> : saving ? 'Salvando...' : <><Check size={16} /> Salvar</>}
        </button>
      </div>

      <div className="card divide-y divide-[var(--color-border)]">
        {[0, 1, 2, 3, 4, 5, 6].map(dow => {
          const hour = hours.find(h => h.day_of_week === dow) ?? {
            id: '', business_id: '', day_of_week: dow, open_time: '09:00', close_time: '18:00', is_closed: false, created_at: '', updated_at: ''
          }
          return (
            <div key={dow} className="px-5 py-4 flex items-center gap-4 flex-wrap">
              <div className="w-32 font-medium text-sm">{dayName(dow)}</div>

              <label className="flex items-center gap-2 cursor-pointer">
                <div
                  onClick={() => update(dow, 'is_closed', !hour.is_closed)}
                  className={`relative w-10 h-5 rounded-full transition-colors ${hour.is_closed ? 'bg-red-500' : 'bg-green-500'}`}
                >
                  <span className={`absolute top-0.5 left-0.5 w-4 h-4 bg-white rounded-full shadow transition-transform ${hour.is_closed ? '' : 'translate-x-5'}`} />
                </div>
                <span className="text-sm text-[var(--color-text-muted)]">
                  {hour.is_closed ? 'Fechado' : 'Aberto'}
                </span>
              </label>

              {!hour.is_closed && (
                <div className="flex items-center gap-3 ml-auto">
                  <div>
                    <label className="block text-xs text-[var(--color-text-muted)] mb-1">Abertura</label>
                    <input
                      type="time"
                      value={hour.open_time?.substring(0, 5) ?? '09:00'}
                      onChange={e => update(dow, 'open_time', e.target.value)}
                      className="input text-sm py-1.5 px-3 w-28"
                    />
                  </div>
                  <span className="text-[var(--color-text-muted)] mt-4">–</span>
                  <div>
                    <label className="block text-xs text-[var(--color-text-muted)] mb-1">Fechamento</label>
                    <input
                      type="time"
                      value={hour.close_time?.substring(0, 5) ?? '18:00'}
                      onChange={e => update(dow, 'close_time', e.target.value)}
                      className="input text-sm py-1.5 px-3 w-28"
                    />
                  </div>
                </div>
              )}
            </div>
          )
        })}
      </div>

      <p className="text-xs text-[var(--color-text-muted)]">
        Alterações nos horários refletem imediatamente no agendamento online.
      </p>
    </div>
  )
}
