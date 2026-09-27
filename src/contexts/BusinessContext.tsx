import React, { createContext, useContext, useEffect, useState } from 'react'
import { getBusinessBySlug, getServices, getBusinessHours } from '../lib/api'
import type { Business, Service, BusinessHour } from '../lib/database.types'

interface BusinessContextValue {
  business: Business | null
  services: Service[]
  hours: BusinessHour[]
  loading: boolean
  error: string | null
}

const BusinessContext = createContext<BusinessContextValue>({
  business: null,
  services: [],
  hours: [],
  loading: true,
  error: null,
})

const BUSINESS_SLUG = 'barbearia-prime' // Change per deployment

export function BusinessProvider({ children }: { children: React.ReactNode }) {
  const [business, setBusiness] = useState<Business | null>(null)
  const [services, setServices] = useState<Service[]>([])
  const [hours, setHours] = useState<BusinessHour[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function load() {
      try {
        const biz = await getBusinessBySlug(BUSINESS_SLUG)
        if (!biz) {
          setError('Empresa não encontrada.')
          return
        }
        setBusiness(biz)
        const [svcs, hrs] = await Promise.all([
          getServices(biz.id),
          getBusinessHours(biz.id),
        ])
        setServices(svcs)
        setHours(hrs)
      } catch {
        setError('Erro ao carregar dados.')
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [])

  return (
    <BusinessContext.Provider value={{ business, services, hours, loading, error }}>
      {children}
    </BusinessContext.Provider>
  )
}

export function useBusiness() {
  return useContext(BusinessContext)
}
