import React, { createContext, useContext, useEffect, useState } from 'react'
import { getBusinessBySlug, getServices, getBusinessHours, getProfessionals } from '../lib/api'
import type { Business, Service, BusinessHour, Professional } from '../lib/database.types'

interface BusinessContextValue {
  business: Business | null
  services: Service[]
  hours: BusinessHour[]
  professionals: Professional[]
  loading: boolean
  error: string | null
  currentSlug: string
  setSlug: (slug: string) => void
}

const BusinessContext = createContext<BusinessContextValue>({
  business: null,
  services: [],
  hours: [],
  professionals: [],
  loading: true,
  error: null,
  currentSlug: 'barbearia-prime',
  setSlug: () => {},
})

export function BusinessProvider({ children }: { children: React.ReactNode }) {
  // Lê slug da query string ?slug=... ou ?empresa=... ou default 'barbearia-prime'
  const getInitialSlug = () => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search)
      return params.get('slug') || params.get('empresa') || 'barbearia-prime'
    }
    return 'barbearia-prime'
  }

  const [currentSlug, setSlugState] = useState<string>(getInitialSlug)
  const [business, setBusiness] = useState<Business | null>(null)
  const [services, setServices] = useState<Service[]>([])
  const [hours, setHours] = useState<BusinessHour[]>([])
  const [professionals, setProfessionals] = useState<Professional[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  function setSlug(newSlug: string) {
    setSlugState(newSlug)
    if (typeof window !== 'undefined') {
      const url = new URL(window.location.href)
      url.searchParams.set('slug', newSlug)
      window.history.replaceState({}, '', url.toString())
    }
  }

  useEffect(() => {
    async function load() {
      setLoading(true)
      setError(null)
      try {
        const biz = await getBusinessBySlug(currentSlug)
        if (!biz) {
          setError(`Empresa "${currentSlug}" não encontrada.`)
          setLoading(false)
          return
        }
        setBusiness(biz)

        // White-label: Aplicação dinâmica de identidade visual (CSS vars e title)
        if (typeof document !== 'undefined') {
          if (biz.primary_color) {
            document.documentElement.style.setProperty('--color-accent', biz.primary_color)
          }
          if (biz.name) {
            document.title = `${biz.name} | Agendamento Online`
          }
        }

        const [svcs, hrs, profs] = await Promise.all([
          getServices(biz.id),
          getBusinessHours(biz.id),
          getProfessionals(biz.id),
        ])
        setServices(svcs)
        setHours(hrs)
        setProfessionals(profs)
      } catch (err) {
        console.error('Error loading business:', err)
        setError('Erro ao carregar dados da empresa.')
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [currentSlug])

  return (
    <BusinessContext.Provider
      value={{
        business,
        services,
        hours,
        professionals,
        loading,
        error,
        currentSlug,
        setSlug,
      }}
    >
      {children}
    </BusinessContext.Provider>
  )
}

export function useBusiness() {
  return useContext(BusinessContext)
}
