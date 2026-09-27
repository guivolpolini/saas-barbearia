import { useEffect, useState } from 'react'
import { Plus, Pencil, Trash2, Check, X } from 'lucide-react'
import { useBusiness } from '../../contexts/BusinessContext'
import { supabase } from '../../lib/supabase'
import { formatCurrency, formatDuration } from '../../lib/utils'
import type { Service } from '../../lib/database.types'

interface ServiceForm {
  name: string
  description: string
  price: string
  duration_min: string
  sort_order: string
}

const EMPTY_FORM: ServiceForm = { name: '', description: '', price: '', duration_min: '30', sort_order: '0' }

export default function ServicesPage() {
  const { business, services: ctxServices } = useBusiness()
  const [services, setServices] = useState<Service[]>([])
  const [editing, setEditing] = useState<string | null>(null)
  const [form, setForm] = useState<ServiceForm>(EMPTY_FORM)
  const [showAdd, setShowAdd] = useState(false)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    setServices(ctxServices)
  }, [ctxServices])

  async function reload() {
    if (!business) return
    const { data } = await supabase.from('services').select('*').eq('business_id', business.id).order('sort_order')
    if (data) setServices(data)
  }

  function startEdit(s: Service) {
    setEditing(s.id)
    setShowAdd(false)
    setForm({
      name: s.name,
      description: s.description ?? '',
      price: String(s.price),
      duration_min: String(s.duration_min),
      sort_order: String(s.sort_order),
    })
  }

  function cancelEdit() {
    setEditing(null)
    setShowAdd(false)
    setForm(EMPTY_FORM)
    setError('')
  }

  async function handleSave() {
    if (!business || !form.name.trim() || !form.price) {
      setError('Nome e preço são obrigatórios.')
      return
    }
    setSaving(true)
    setError('')

    const payload = {
      business_id: business.id,
      name: form.name.trim(),
      description: form.description.trim() || null,
      price: parseFloat(form.price),
      duration_min: parseInt(form.duration_min) || 30,
      sort_order: parseInt(form.sort_order) || 0,
      active: true,
    }

    if (editing) {
      await supabase.from('services').update(payload).eq('id', editing)
    } else {
      await supabase.from('services').insert(payload)
    }

    await reload()
    cancelEdit()
    setSaving(false)
  }

  async function handleDelete(id: string) {
    if (!confirm('Excluir este serviço?')) return
    await supabase.from('services').delete().eq('id', id)
    await reload()
  }

  async function toggleActive(s: Service) {
    await supabase.from('services').update({ active: !s.active }).eq('id', s.id)
    await reload()
  }

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold">Serviços</h2>
        <button onClick={() => { setShowAdd(true); setEditing(null); setForm(EMPTY_FORM) }} className="btn-primary text-sm px-4 py-2">
          <Plus size={16} />
          Novo serviço
        </button>
      </div>

      {/* Add/Edit form */}
      {(showAdd || editing) && (
        <div className="card p-6 space-y-4">
          <h3 className="font-semibold">{editing ? 'Editar serviço' : 'Novo serviço'}</h3>
          {error && <p className="text-red-400 text-sm">{error}</p>}
          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Nome *</label>
              <input value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} className="input" placeholder="Ex: Corte" />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Preço (R$) *</label>
              <input type="number" step="0.01" value={form.price} onChange={e => setForm(f => ({ ...f, price: e.target.value }))} className="input" placeholder="40.00" />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Duração (minutos) *</label>
              <input type="number" value={form.duration_min} onChange={e => setForm(f => ({ ...f, duration_min: e.target.value }))} className="input" placeholder="45" />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Ordem de exibição</label>
              <input type="number" value={form.sort_order} onChange={e => setForm(f => ({ ...f, sort_order: e.target.value }))} className="input" placeholder="1" />
            </div>
            <div className="sm:col-span-2">
              <label className="block text-sm font-medium mb-1">Descrição</label>
              <textarea value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} className="input resize-none h-20" placeholder="Descreva o serviço..." />
            </div>
          </div>
          <div className="flex gap-3">
            <button onClick={handleSave} disabled={saving} className="btn-primary text-sm px-4 py-2">
              <Check size={16} />
              {saving ? 'Salvando...' : 'Salvar'}
            </button>
            <button onClick={cancelEdit} className="btn-ghost text-sm">
              <X size={16} />
              Cancelar
            </button>
          </div>
        </div>
      )}

      {/* Services list */}
      <div className="card overflow-hidden">
        {services.length === 0 ? (
          <div className="p-8 text-center text-[var(--color-text-muted)] text-sm">Nenhum serviço cadastrado.</div>
        ) : (
          <div className="divide-y divide-[var(--color-border)]">
            {services.map(s => (
              <div key={s.id} className="px-5 py-4 flex items-center gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="font-medium">{s.name}</p>
                    {!s.active && (
                      <span className="badge text-xs bg-gray-500/20 text-gray-400">Inativo</span>
                    )}
                  </div>
                  {s.description && <p className="text-xs text-[var(--color-text-muted)] mt-0.5">{s.description}</p>}
                  <p className="text-xs text-[var(--color-text-muted)] mt-1">{formatDuration(s.duration_min)}</p>
                </div>
                <p className="font-bold text-[var(--color-accent)]">{formatCurrency(s.price)}</p>
                <div className="flex gap-2">
                  <button onClick={() => startEdit(s)} className="btn-ghost p-2 rounded-lg" title="Editar">
                    <Pencil size={15} />
                  </button>
                  <button onClick={() => toggleActive(s)} className="btn-ghost p-2 rounded-lg text-xs" title={s.active ? 'Desativar' : 'Ativar'}>
                    {s.active ? <X size={15} /> : <Check size={15} />}
                  </button>
                  <button onClick={() => handleDelete(s.id)} className="btn-ghost p-2 rounded-lg text-red-400 hover:bg-red-400/10" title="Excluir">
                    <Trash2 size={15} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
