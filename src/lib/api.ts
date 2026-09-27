import { supabase } from './supabase'
import type { Business, Service, BusinessHour, Appointment } from './database.types'
import { addMinutes, format, parse, isAfter, isBefore, startOfDay } from 'date-fns'

// ============================================================
// Business
// ============================================================
export async function getBusinessBySlug(slug: string): Promise<Business | null> {
  const { data, error } = await supabase
    .from('businesses')
    .select('*')
    .eq('slug', slug)
    .eq('active', true)
    .single()

  if (error) {
    console.error('getBusinessBySlug error:', error)
    return null
  }
  return data
}

// ============================================================
// Services
// ============================================================
export async function getServices(businessId: string): Promise<Service[]> {
  const { data, error } = await supabase
    .from('services')
    .select('*')
    .eq('business_id', businessId)
    .eq('active', true)
    .order('sort_order')

  if (error) {
    console.error('getServices error:', error)
    return []
  }
  return data ?? []
}

// ============================================================
// Business Hours
// ============================================================
export async function getBusinessHours(businessId: string): Promise<BusinessHour[]> {
  const { data, error } = await supabase
    .from('business_hours')
    .select('*')
    .eq('business_id', businessId)
    .order('day_of_week')

  if (error) {
    console.error('getBusinessHours error:', error)
    return []
  }
  return data ?? []
}

// ============================================================
// Appointments
// ============================================================
export async function getAppointmentsByDate(
  businessId: string,
  date: string
): Promise<Appointment[]> {
  const { data, error } = await supabase
    .from('appointments')
    .select('*')
    .eq('business_id', businessId)
    .eq('date', date)
    .not('status', 'eq', 'cancelled')
    .order('start_time')

  if (error) {
    console.error('getAppointmentsByDate error:', error)
    return []
  }
  return data ?? []
}

export async function getAppointmentsRange(
  businessId: string,
  from: string,
  to: string
): Promise<Appointment[]> {
  const { data, error } = await supabase
    .from('appointments')
    .select(`
      *,
      services(name, duration_min, price),
      customers(name, phone, email)
    `)
    .eq('business_id', businessId)
    .gte('date', from)
    .lte('date', to)
    .not('status', 'eq', 'cancelled')
    .order('date')
    .order('start_time')

  if (error) {
    console.error('getAppointmentsRange error:', error)
    return []
  }
  return data ?? []
}

export async function checkSlotAvailability(
  businessId: string,
  date: string,
  startTime: string,
  endTime: string
): Promise<boolean> {
  const { data, error } = await supabase
    .from('appointments')
    .select('id')
    .eq('business_id', businessId)
    .eq('date', date)
    .not('status', 'eq', 'cancelled')
    .or(`start_time.lt.${endTime},end_time.gt.${startTime}`)

  if (error) {
    console.error('checkSlotAvailability error:', error)
    return false
  }
  return (data?.length ?? 0) === 0
}

// ============================================================
// Slot generation
// ============================================================
export function generateTimeSlots(
  openTime: string,
  closeTime: string,
  durationMin: number,
  bookedSlots: Array<{ start_time: string; end_time: string }>
): string[] {
  const slots: string[] = []
  const baseDate = '2000-01-01'
  let current = parse(`${baseDate} ${openTime}`, 'yyyy-MM-dd HH:mm', new Date())
  const end = parse(`${baseDate} ${closeTime}`, 'yyyy-MM-dd HH:mm', new Date())

  while (isBefore(addMinutes(current, durationMin), end) || 
         format(addMinutes(current, durationMin), 'HH:mm') === format(end, 'HH:mm')) {
    const slotStart = format(current, 'HH:mm')
    const slotEnd = format(addMinutes(current, durationMin), 'HH:mm')
    
    const isBooked = bookedSlots.some(b => {
      const bStart = b.start_time.substring(0, 5)
      const bEnd = b.end_time.substring(0, 5)
      return slotStart < bEnd && slotEnd > bStart
    })
    
    if (!isBooked) {
      slots.push(slotStart)
    }
    
    current = addMinutes(current, 30) // intervalo de 30 min
    
    if (!isBefore(current, end)) break
  }

  return slots
}

// ============================================================
// Create appointment
// ============================================================
export async function createAppointment(payload: {
  businessId: string
  serviceId: string
  customerName: string
  phone: string
  date: string
  startTime: string
  endTime: string
}): Promise<{ success: boolean; appointmentId?: string; error?: string }> {
  // 1. Upsert customer
  const { data: customerData, error: customerError } = await supabase
    .from('customers')
    .upsert(
      { business_id: payload.businessId, name: payload.customerName, phone: payload.phone },
      { onConflict: 'business_id,phone', ignoreDuplicates: false }
    )
    .select('id')
    .single()

  if (customerError || !customerData) {
    return { success: false, error: 'Erro ao registrar cliente.' }
  }

  // 2. Insert appointment
  const { data: apptData, error: apptError } = await supabase
    .from('appointments')
    .insert({
      business_id: payload.businessId,
      service_id: payload.serviceId,
      customer_id: customerData.id,
      date: payload.date,
      start_time: payload.startTime,
      end_time: payload.endTime,
      status: 'confirmed',
    })
    .select('id')
    .single()

  if (apptError) {
    if (apptError.code === '23505') {
      return { success: false, error: 'Horário já foi reservado. Escolha outro.' }
    }
    return { success: false, error: 'Erro ao criar agendamento.' }
  }

  return { success: true, appointmentId: apptData.id }
}

export async function updateAppointmentStatus(
  id: string,
  status: string
): Promise<boolean> {
  const { error } = await supabase
    .from('appointments')
    .update({ status })
    .eq('id', id)

  return !error
}
