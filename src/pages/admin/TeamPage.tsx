import { useEffect, useState } from 'react'
import { Plus, Pencil, Trash2, Check, X, Users, UserCheck, Scissors, Sparkles } from 'lucide-react'
import { useBusiness } from '../../contexts/BusinessContext'
import { supabase } from '../../lib/supabase'
import type { Professional } from '../../lib/database.types'

interface ProfessionalForm {
  name: string
  role: string
  avatar_url: string
}

const EMPTY_FORM: ProfessionalForm = {
  name: '',
  role: '',
  avatar_url: '',
}

export default function TeamPage() {
  const { business } = useBusiness()
  const [professionals, setProfessionals] = useState<Professional[]>([])
  const [loading, setLoading] = useState(true)
  const [editing, setEditing] = useState<string | null>(null)
  const [form, setForm] = useState<ProfessionalForm>(EMPTY_FORM)
  const [showAdd, setShowAdd] = useState(false)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    reload()
  }, [business])

  async function reload() {
    if (!business) return
    setLoading(true)
    const { data } = await supabase
      .from('professionals')
      .select('*')
      .eq('business_id', business.id)
      .order('name')

    if (data) {
      setProfessionals(data)
    }
    setLoading(false)
  }

  function startEdit(p: Professional) {
    setEditing(p.id)
    setShowAdd(false)
    setForm({
      name: p.name,
      role: p.role ?? '',
      avatar_url: p.avatar_url ?? '',
    })
  }

  function cancelEdit() {
    setEditing(null)
    setShowAdd(false)
    setForm(EMPTY_FORM)
    setError('')
  }

  async function handleSave() {
    if (!business || !form.name.trim()) {
      setError('O nome do profissional é obrigatório.')
      return
    }
    setSaving(true)
    setError('')

    const payload = {
      business_id: business.id,
      name: form.name.trim(),
      role: form.role.trim() || null,
      avatar_url: form.avatar_url.trim() || null,
      active: true,
    }

    if (editing) {
      await supabase.from('professionals').update(payload).eq('id', editing)
    } else {
      await supabase.from('professionals').insert(payload)
    }

    await reload()
    cancelEdit()
    setSaving(false)
  }

  async function handleDelete(id: string) {
    if (!confirm('Tem certeza que deseja excluir este profissional?')) return
    await supabase.from('professionals').delete().eq('id', id)
    await reload()
  }

  async function toggleActive(p: Professional) {
    await supabase.from('professionals').update({ active: !p.active }).eq('id', p.id)
    await reload()
  }

  const activeCount = professionals.filter(p => p.active).length

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold flex items-center gap-2">
            <Users className="w-5 h-5 text-[var(--color-accent)]" />
            Equipe & Barbeiros
          </h2>
          <p className="text-xs text-[var(--color-text-muted)] mt-0.5">
            Gerencie os barbeiros e profissionais disponíveis para agendamento online.
          </p>
        </div>

        <button
          onClick={() => {
            setShowAdd(true)
            setEditing(null)
            setForm(EMPTY_FORM)
          }}
          className="btn-primary text-sm px-4 py-2 flex items-center gap-2 self-start sm:self-auto"
        >
          <Plus size={16} />
          <span>Adicionar Barbeiro</span>
        </button>
      </div>

      {/* Summary KPI cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="card p-4 flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-[var(--color-accent)]/15 border border-[var(--color-accent)]/30 flex items-center justify-center text-[var(--color-accent)]">
            <Users size={20} />
          </div>
          <div>
            <p className="text-xs text-[var(--color-text-muted)]">Total de Profissionais</p>
            <p className="text-xl font-bold">{professionals.length}</p>
          </div>
        </div>

        <div className="card p-4 flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
            <UserCheck size={20} />
          </div>
          <div>
            <p className="text-xs text-[var(--color-text-muted)]">Ativos no Chat</p>
            <p className="text-xl font-bold text-emerald-400">{activeCount}</p>
          </div>
        </div>

        <div className="card p-4 flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-blue-500/15 border border-blue-500/30 flex items-center justify-center text-blue-400">
            <Scissors size={20} />
          </div>
          <div>
            <p className="text-xs text-[var(--color-text-muted)]">Disponibilidade</p>
            <p className="text-sm font-semibold text-blue-400">Segunda a Sábado</p>
          </div>
        </div>
      </div>

      {/* Form Add / Edit */}
      {(showAdd || editing) && (
        <div className="card p-6 space-y-4 border-[var(--color-accent)]/30 animate-in fade-in duration-200">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold text-base flex items-center gap-2">
              <Sparkles size={16} className="text-[var(--color-accent)]" />
              {editing ? 'Editar Profissional' : 'Novo Barbeiro / Profissional'}
            </h3>
            <button onClick={cancelEdit} className="text-[var(--color-text-muted)] hover:text-white">
              <X size={18} />
            </button>
          </div>

          {error && <p className="text-red-400 text-sm">{error}</p>}

          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Nome do Barbeiro *</label>
              <input
                value={form.name}
                onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                className="input"
                placeholder="Ex: Carlos Eduardo"
                autoFocus
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Especialidade / Cargo</label>
              <input
                value={form.role}
                onChange={e => setForm(f => ({ ...f, role: e.target.value }))}
                className="input"
                placeholder="Ex: Barbeiro Master, Fade & Navalha"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="block text-sm font-medium mb-1">URL da Foto (opcional)</label>
              <input
                value={form.avatar_url}
                onChange={e => setForm(f => ({ ...f, avatar_url: e.target.value }))}
                className="input"
                placeholder="https://images.unsplash.com/..."
              />
              <p className="text-[11px] text-[var(--color-text-muted)] mt-1">
                Deixe em branco para usar o avatar com as iniciais estilizadas.
              </p>
            </div>
          </div>

          <div className="flex gap-3 pt-2">
            <button onClick={handleSave} disabled={saving} className="btn-primary text-sm px-5 py-2.5 flex items-center gap-2">
              <Check size={16} />
              <span>{saving ? 'Salvando...' : 'Salvar Profissional'}</span>
            </button>
            <button onClick={cancelEdit} className="btn-ghost text-sm px-4 py-2.5">
              Cancelar
            </button>
          </div>
        </div>
      )}

      {/* Professionals List / Grid */}
      <div className="card overflow-hidden">
        {loading ? (
          <div className="p-12 text-center text-[var(--color-text-muted)] text-sm">Carregando equipe...</div>
        ) : professionals.length === 0 ? (
          <div className="p-12 text-center text-[var(--color-text-muted)] text-sm">
            Nenhum barbeiro cadastrado. Clique no botão acima para cadastrar o primeiro!
          </div>
        ) : (
          <div className="divide-y divide-[var(--color-border)]">
            {professionals.map(p => {
              const initials = p.name
                .split(' ')
                .map(n => n[0])
                .slice(0, 2)
                .join('')
                .toUpperCase()

              return (
                <div key={p.id} className="px-5 py-4 flex items-center gap-4 hover:bg-[var(--color-surface-2)] transition-colors">
                  {/* Avatar */}
                  {p.avatar_url ? (
                    <img
                      src={p.avatar_url}
                      alt={p.name}
                      className="w-12 h-12 rounded-xl object-cover border border-[var(--color-border)] shrink-0"
                    />
                  ) : (
                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-amber-500/20 to-amber-700/30 border border-amber-500/30 flex items-center justify-center text-amber-400 font-bold text-base shrink-0 shadow-inner">
                      {initials}
                    </div>
                  )}

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <p className="font-semibold text-sm text-[var(--color-text)]">{p.name}</p>
                      {p.active ? (
                        <span className="badge text-[11px] bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
                          Disponível no Chat
                        </span>
                      ) : (
                        <span className="badge text-[11px] bg-gray-500/20 text-gray-400 border border-gray-500/30">
                          Pausado / Inativo
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-[var(--color-text-muted)] mt-0.5">
                      {p.role || 'Barbeiro Profissional'}
                    </p>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-1.5 shrink-0">
                    <button
                      onClick={() => startEdit(p)}
                      className="btn-ghost p-2 rounded-lg text-[var(--color-text-muted)] hover:text-white"
                      title="Editar profissional"
                    >
                      <Pencil size={15} />
                    </button>
                    <button
                      onClick={() => toggleActive(p)}
                      className={`btn-ghost p-2 rounded-lg text-xs ${
                        p.active ? 'text-amber-400 hover:text-amber-300' : 'text-emerald-400 hover:text-emerald-300'
                      }`}
                      title={p.active ? 'Pausar no Chat' : 'Ativar no Chat'}
                    >
                      {p.active ? <X size={15} /> : <Check size={15} />}
                    </button>
                    <button
                      onClick={() => handleDelete(p.id)}
                      className="btn-ghost p-2 rounded-lg text-red-400 hover:bg-red-400/10"
                      title="Excluir profissional"
                    >
                      <Trash2 size={15} />
                    </button>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
