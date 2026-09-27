export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      businesses: {
        Row: {
          id: string
          name: string
          slug: string
          description: string | null
          phone: string | null
          email: string | null
          address: string | null
          city: string | null
          state: string | null
          zip: string | null
          logo_url: string | null
          primary_color: string | null
          accent_color: string | null
          website: string | null
          instagram: string | null
          active: boolean
          created_at: string
          updated_at: string
        }
        Insert: Omit<Database['public']['Tables']['businesses']['Row'], 'id' | 'created_at' | 'updated_at'>
        Update: Partial<Database['public']['Tables']['businesses']['Insert']>
      }
      services: {
        Row: {
          id: string
          business_id: string
          name: string
          description: string | null
          price: number
          duration_min: number
          active: boolean
          sort_order: number
          created_at: string
          updated_at: string
        }
        Insert: Omit<Database['public']['Tables']['services']['Row'], 'id' | 'created_at' | 'updated_at'>
        Update: Partial<Database['public']['Tables']['services']['Insert']>
      }
      business_hours: {
        Row: {
          id: string
          business_id: string
          day_of_week: number
          open_time: string | null
          close_time: string | null
          is_closed: boolean
          created_at: string
          updated_at: string
        }
        Insert: Omit<Database['public']['Tables']['business_hours']['Row'], 'id' | 'created_at' | 'updated_at'>
        Update: Partial<Database['public']['Tables']['business_hours']['Insert']>
      }
      customers: {
        Row: {
          id: string
          business_id: string
          name: string
          phone: string
          email: string | null
          created_at: string
          updated_at: string
        }
        Insert: Omit<Database['public']['Tables']['customers']['Row'], 'id' | 'created_at' | 'updated_at'>
        Update: Partial<Database['public']['Tables']['customers']['Insert']>
      }
      appointments: {
        Row: {
          id: string
          business_id: string
          service_id: string
          customer_id: string
          date: string
          start_time: string
          end_time: string
          status: 'pending' | 'confirmed' | 'cancelled' | 'completed' | 'no_show'
          notes: string | null
          n8n_notified: boolean
          created_at: string
          updated_at: string
        }
        Insert: Omit<Database['public']['Tables']['appointments']['Row'], 'id' | 'created_at' | 'updated_at'>
        Update: Partial<Database['public']['Tables']['appointments']['Insert']>
      }
    }
  }
}

// Convenience types
export type Business = Database['public']['Tables']['businesses']['Row']
export type Service = Database['public']['Tables']['services']['Row']
export type BusinessHour = Database['public']['Tables']['business_hours']['Row']
export type Customer = Database['public']['Tables']['customers']['Row']
export type Appointment = Database['public']['Tables']['appointments']['Row']
export type AppointmentStatus = Appointment['status']
