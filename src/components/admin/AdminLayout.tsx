import { type ReactNode, useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import {
  LayoutDashboard, Calendar, List, Scissors, Clock, Settings, LogOut, Menu, X, ChevronRight
} from 'lucide-react'
import { useAuth } from '../../contexts/AuthContext'
import { useBusiness } from '../../contexts/BusinessContext'
import clsx from 'clsx'

const NAV = [
  { label: 'Dashboard', icon: LayoutDashboard, path: '/admin' },
  { label: 'Agenda', icon: Calendar, path: '/admin/agenda' },
  { label: 'Agendamentos', icon: List, path: '/admin/appointments' },
  { label: 'Serviços', icon: Scissors, path: '/admin/services' },
  { label: 'Horários', icon: Clock, path: '/admin/hours' },
  { label: 'Configurações', icon: Settings, path: '/admin/settings' },
]

export default function AdminLayout({ children }: { children: ReactNode }) {
  const { signOut, user } = useAuth()
  const { business } = useBusiness()
  const location = useLocation()
  const [sidebarOpen, setSidebarOpen] = useState(false)

  const currentPage = NAV.find(n => n.path === location.pathname)

  return (
    <div className="min-h-screen bg-[var(--color-primary)] flex">
      {/* Sidebar */}
      <aside className={clsx(
        'fixed inset-y-0 left-0 z-50 w-64 bg-[var(--color-surface)] border-r border-[var(--color-border)] flex flex-col transition-transform duration-300 lg:translate-x-0',
        sidebarOpen ? 'translate-x-0' : '-translate-x-full'
      )}>
        {/* Logo */}
        <div className="px-6 py-5 border-b border-[var(--color-border)] flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-[var(--color-accent)] flex items-center justify-center">
              <Scissors size={16} className="text-black" />
            </div>
            <div>
              <p className="font-bold text-sm leading-tight">{business?.name ?? 'Admin'}</p>
              <p className="text-[var(--color-text-muted)] text-xs">Painel Admin</p>
            </div>
          </div>
          <button onClick={() => setSidebarOpen(false)} className="lg:hidden text-[var(--color-text-muted)]">
            <X size={18} />
          </button>
        </div>

        {/* Nav */}
        <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
          {NAV.map(({ label, icon: Icon, path }) => {
            const active = location.pathname === path
            return (
              <Link
                key={path}
                to={path}
                onClick={() => setSidebarOpen(false)}
                className={clsx(
                  'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-150',
                  active
                    ? 'bg-[var(--color-accent)]/15 text-[var(--color-accent)] border border-[var(--color-accent)]/20'
                    : 'text-[var(--color-text-muted)] hover:bg-[var(--color-surface-2)] hover:text-[var(--color-text)]'
                )}
              >
                <Icon size={17} />
                {label}
                {active && <ChevronRight size={14} className="ml-auto" />}
              </Link>
            )
          })}
        </nav>

        {/* User */}
        <div className="px-3 py-4 border-t border-[var(--color-border)]">
          <div className="flex items-center gap-3 px-3 py-2 mb-1">
            <div className="w-8 h-8 rounded-full bg-[var(--color-accent)]/20 flex items-center justify-center text-[var(--color-accent)] font-bold text-xs">
              {user?.email?.charAt(0).toUpperCase()}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-medium truncate">{user?.email}</p>
              <p className="text-xs text-[var(--color-text-muted)]">Administrador</p>
            </div>
          </div>
          <button
            onClick={signOut}
            className="flex items-center gap-2 w-full px-3 py-2 text-sm text-[var(--color-text-muted)] hover:text-red-400 hover:bg-red-400/10 rounded-lg transition-all"
          >
            <LogOut size={16} />
            Sair
          </button>
        </div>
      </aside>

      {/* Overlay */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-40 bg-black/50 lg:hidden" onClick={() => setSidebarOpen(false)} />
      )}

      {/* Main */}
      <div className="flex-1 lg:ml-64 flex flex-col min-h-screen">
        {/* Top bar */}
        <header className="sticky top-0 z-30 bg-[var(--color-surface)]/90 backdrop-blur-md border-b border-[var(--color-border)] px-4 h-14 flex items-center gap-3">
          <button onClick={() => setSidebarOpen(true)} className="lg:hidden text-[var(--color-text-muted)] hover:text-[var(--color-text)]">
            <Menu size={20} />
          </button>
          <h1 className="font-semibold text-sm">{currentPage?.label ?? 'Admin'}</h1>
          <div className="ml-auto flex items-center gap-2">
            <Link to="/" className="text-xs text-[var(--color-text-muted)] hover:text-[var(--color-accent)] transition-colors">
              Ver site público ↗
            </Link>
          </div>
        </header>

        <main className="flex-1 p-6">
          {children}
        </main>
      </div>
    </div>
  )
}
