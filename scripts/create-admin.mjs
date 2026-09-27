// Cria usuário admin no Supabase Auth via Admin API
const SERVICE_ROLE = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6IndobnRvdW1xYW1heXpwaWFqdnZqIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc5MDU0NDU4NywiZXhwIjoyMTA2MTIwNTg3fQ.V_uQ8iEwBCZZ0GsnAWhO8kDUqelaIbOb_toIa7PNAs0'
const SUPABASE_URL = 'https://whntoumqamayzpiajvvj.supabase.co'

const email = 'admin@barbeariaprime.com.br'
const password = 'BarbeariaPrime@2026'

const res = await fetch(`${SUPABASE_URL}/auth/v1/admin/users`, {
  method: 'POST',
  headers: {
    'apikey': SERVICE_ROLE,
    'Authorization': `Bearer ${SERVICE_ROLE}`,
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    email,
    password,
    email_confirm: true,
  }),
})

const data = await res.json()

if (res.ok) {
  console.log('✅ Usuário admin criado!')
  console.log(`   E-mail:  ${email}`)
  console.log(`   Senha:   ${password}`)
  console.log(`   ID:      ${data.id}`)
} else if (data.message?.includes('already been registered') || data.code === 'email_exists') {
  console.log('ℹ️  Usuário já existe — use as credenciais abaixo:')
  console.log(`   E-mail:  ${email}`)
  console.log(`   Senha:   ${password}`)
} else {
  console.error('❌ Erro:', JSON.stringify(data, null, 2))
}
