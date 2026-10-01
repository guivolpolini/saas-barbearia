/**
 * n8n Webhook integration
 * Sends structured appointment data to n8n for automations (confirmations, reminders, etc.)
 * 
 * SECURITY: In production, route this through a Supabase Edge Function or backend
 * to avoid exposing the webhook URL. For MVP, it goes direct from client.
 */

export interface WebhookPayload {
  event: 'appointment.created' | 'appointment.cancelled' | 'appointment.reminder'
  business_id: string
  service_id: string
  service_name: string
  professional_id?: string | null
  professional_name?: string
  customer_name: string
  phone: string
  date: string        // ISO: YYYY-MM-DD
  time: string        // HH:mm
  duration_min: number
  price: number
  appointment_id: string
  created_at: string
}

export async function triggerN8nWebhook(payload: WebhookPayload): Promise<void> {
  const webhookUrl = import.meta.env.VITE_N8N_WEBHOOK_URL
  
  if (!webhookUrl) {
    console.warn('n8n webhook URL not configured. Skipping notification.')
    return
  }

  try {
    await fetch(webhookUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    })
  } catch (error) {
    // Non-blocking: webhook failure shouldn't break the booking flow
    console.error('n8n webhook failed:', error)
  }
}
