import { useEffect, useState } from 'react'
import { Check } from 'lucide-react'
import { useBusiness } from '../../contexts/BusinessContext'
import { supabase } from '../../lib/supabase'
import type { Business } from '../../lib/database.types'

export default function SettingsPage() {
  const { business } = useBusiness()
  const [form, setForm] = useState<Partial<Business>>({})
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)

  useEffect(() => {
    if (business) setForm(business)
  }, [business])

  function set(field: keyof Business, value: string) {
    setForm(f => ({ ...f, [field]: value }))
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault()
    if (!business) return
    setSaving(true)
    await supabase.from('businesses').update({
      name: form.name,
      description: form.description,
      phone: form.phone,
      email: form.email,
      address: form.address,
      city: form.city,
      state: form.state,
      zip: form.zip,
      instagram: form.instagram,
      website: form.website,
      primary_color: form.primary_color,
    }).eq('id', business.id)
    setSaving(false)
    setSaved(true)
    setTimeout(() => setSaved(false), 2500)
  }

  return (
    <div className="space-y-5 max-w-2xl">
      <h2 className="text-xl font-bold">Configurações da Empresa</h2>

      <form onSubmit={handleSave} className="card p-6 space-y-5">
        <section className="space-y-4">
          <h3 className="font-semibold text-sm text-[var(--color-text-muted)] uppercase tracking-wider border-b border-[var(--color-border)] pb-2">Informações gerais</h3>
          <div className="grid sm:grid-cols-2 gap-4">
            <div className="sm:col-span-2">
              <label className="block text-sm font-medium mb-1">Nome da empresa</label>
              <input value={form.name ?? ''} onChange={e => set('name', e.target.value)} className="input" />
            </div>
            <div className="sm:col-span-2">
              <label className="block text-sm font-medium mb-1">Descrição</label>
              <textarea value={form.description ?? ''} onChange={e => set('description', e.target.value)} className="input resize-none h-20" />
            </div>
          </div>
        </section>

        <section className="space-y-4">
          <h3 className="font-semibold text-sm text-[var(--color-text-muted)] uppercase tracking-wider border-b border-[var(--color-border)] pb-2">Contato</h3>
          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Telefone</label>
              <input value={form.phone ?? ''} onChange={e => set('phone', e.target.value)} className="input" />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">E-mail</label>
              <input type="email" value={form.email ?? ''} onChange={e => set('email', e.target.value)} className="input" />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Instagram</label>
              <input value={form.instagram ?? ''} onChange={e => set('instagram', e.target.value)} className="input" placeholder="@barbearia" />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Website</label>
              <input value={form.website ?? ''} onChange={e => set('website', e.target.value)} className="input" placeholder="https://..." />
            </div>
          </div>
        </section>

        <section className="space-y-4">
          <h3 className="font-semibold text-sm text-[var(--color-text-muted)] uppercase tracking-wider border-b border-[var(--color-border)] pb-2">Endereço</h3>
          <div className="grid sm:grid-cols-2 gap-4">
            <div className="sm:col-span-2">
              <label className="block text-sm font-medium mb-1">Endereço</label>
              <input value={form.address ?? ''} onChange={e => set('address', e.target.value)} className="input" />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Cidade</label>
              <input value={form.city ?? ''} onChange={e => set('city', e.target.value)} className="input" />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Estado</label>
              <input value={form.state ?? ''} onChange={e => set('state', e.target.value)} className="input" maxLength={2} />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">CEP</label>
              <input value={form.zip ?? ''} onChange={e => set('zip', e.target.value)} className="input" />
            </div>
          </div>
        </section>

        <button type="submit" disabled={saving} className="btn-primary text-sm">
          {saved ? <><Check size={16} /> Salvo!</> : saving ? 'Salvando...' : 'Salvar alterações'}
        </button>
      </form>
    </div>
  )
}
