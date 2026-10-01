import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { BusinessProvider } from './contexts/BusinessContext'
import { AuthProvider } from './contexts/AuthContext'
import LandingPage from './pages/LandingPage'
import LoginPage from './pages/admin/LoginPage'
import AdminGuard from './pages/AdminGuard'
import DashboardPage from './pages/admin/DashboardPage'
import AgendaPage from './pages/admin/AgendaPage'
import AppointmentsPage from './pages/admin/AppointmentsPage'
import TeamPage from './pages/admin/TeamPage'
import ServicesPage from './pages/admin/ServicesPage'
import HoursPage from './pages/admin/HoursPage'
import SettingsPage from './pages/admin/SettingsPage'
import PwaInstallPrompt from './components/pwa/PwaInstallPrompt'

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <BusinessProvider>
          <Routes>
            {/* Public */}
            <Route path="/" element={<LandingPage />} />

            {/* Admin auth */}
            <Route path="/admin/login" element={<LoginPage />} />

            {/* Admin protected */}
            <Route path="/admin" element={<AdminGuard />}>
              <Route index element={<DashboardPage />} />
              <Route path="agenda" element={<AgendaPage />} />
              <Route path="appointments" element={<AppointmentsPage />} />
              <Route path="team" element={<TeamPage />} />
              <Route path="services" element={<ServicesPage />} />
              <Route path="hours" element={<HoursPage />} />
              <Route path="settings" element={<SettingsPage />} />
            </Route>

            {/* Catch-all */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
          <PwaInstallPrompt />
        </BusinessProvider>
      </AuthProvider>
    </BrowserRouter>
  )
}
