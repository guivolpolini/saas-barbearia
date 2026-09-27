# SaaS Barbearia

MVP de agendamento online multiempresa. Stack: React + Vite + TypeScript + Tailwind CSS + Supabase + n8n.

---

## Setup rápido

### 1. Clonar e instalar

```bash
git clone <repo>
cd saas-barbearia
npm install
```

### 2. Variáveis de ambiente

```bash
cp .env.example .env
```

Preencha no `.env`:

| Variável | Onde encontrar |
|---|---|
| `VITE_SUPABASE_URL` | Supabase Dashboard → Settings → API → Project URL |
| `VITE_SUPABASE_ANON_KEY` | Supabase Dashboard → Settings → API → anon/public key |
| `VITE_N8N_WEBHOOK_URL` | n8n → crie um workflow Webhook e copie a URL |

> ⚠️ **Nunca commite o `.env`**. Ele já está no `.gitignore`.

### 3. Configurar o Supabase

1. Crie um projeto em [supabase.com](https://supabase.com)
2. Vá em **SQL Editor** e execute o arquivo `supabase/schema.sql`
   - Isso cria as tabelas, RLS, índices e faz o seed da Barbearia Prime
3. Crie um usuário admin:
   - **Authentication → Users → Add user** (email + senha)
   - Esse usuário vai acessar o `/admin`

### 4. Rodar localmente

```bash
npm run dev
```

Acesse:
- **Site público**: http://localhost:5173
- **Admin**: http://localhost:5173/admin

---

## Configurar n8n

1. Instale o n8n (`npx n8n` ou via Docker)
2. Crie um workflow com o nó **Webhook** (method: POST)
3. Copie a URL do webhook e coloque em `VITE_N8N_WEBHOOK_URL`
4. A partir do Webhook, conecte:
   - **Send Email** (confirmação)
   - **Schedule** (lembrete 24h antes)
   - Qualquer outro nó de automação

Payload enviado pelo app:

```json
{
  "event": "appointment.created",
  "business_id": "uuid",
  "service_id": "uuid",
  "service_name": "Corte",
  "customer_name": "João Silva",
  "phone": "(11) 99999-0000",
  "date": "2026-10-01",
  "time": "14:30",
  "duration_min": 45,
  "price": 40.00,
  "appointment_id": "uuid",
  "created_at": "2026-09-27T19:00:00Z"
}
```

---

## Adicionar uma segunda empresa (SaaS)

Para onboarding de um novo cliente:

### 1. Inserir no banco

```sql
-- 1. Criar empresa
INSERT INTO public.businesses (name, slug, description, phone, email, address, city, state, primary_color)
VALUES ('Barbearia Nova', 'barbearia-nova', 'Descrição...', '(11) 99999-9999', 'contato@nova.com', 'Rua X, 100', 'Rio de Janeiro', 'RJ', '#2563eb');

-- 2. Adicionar serviços
INSERT INTO public.services (business_id, name, price, duration_min, sort_order)
VALUES 
  ('<id_da_empresa>', 'Corte', 45.00, 45, 1),
  ('<id_da_empresa>', 'Barba', 35.00, 30, 2);

-- 3. Adicionar horários
INSERT INTO public.business_hours (business_id, day_of_week, open_time, close_time, is_closed)
VALUES
  ('<id_da_empresa>', 0, null, null, true),
  ('<id_da_empresa>', 1, '10:00', '20:00', false),
  -- ...demais dias
```

### 2. Deploy de nova instância

Cada cliente tem seu próprio deploy com:
- Mesmo código
- `.env` apontando pro mesmo Supabase (ou projeto separado)
- `BUSINESS_SLUG` = slug da empresa (`src/contexts/BusinessContext.tsx` linha 18)

Futuramente, `BUSINESS_SLUG` pode vir de subdomínio automático (`barbearia-nova.seudominio.com`).

---

## Estrutura do projeto

```
src/
├── components/
│   ├── admin/          # Layout do painel admin
│   ├── chat/           # Widget de chat com fluxo de agendamento
│   └── landing/        # Seções da landing page
├── contexts/           # BusinessContext + AuthContext
├── lib/
│   ├── api.ts          # Todas as queries Supabase
│   ├── supabase.ts     # Cliente Supabase
│   ├── utils.ts        # Formatação, helpers
│   └── webhook.ts      # Integração n8n
├── pages/
│   ├── admin/          # Dashboard, agenda, agendamentos, serviços, horários, config
│   ├── LandingPage.tsx
│   └── AdminGuard.tsx  # Proteção de rota
supabase/
└── schema.sql          # Schema completo com seed
```

---

## Segurança

- Anon key do Supabase é segura para uso no frontend (somente leitura pública + insert de clientes/agendamentos via RLS)
- RLS bloqueia acesso cruzado entre empresas
- Service role key **nunca** vai ao frontend
- Webhook n8n: em produção, mova para uma Edge Function Supabase para não expor a URL

---

## Build

```bash
npm run build   # Gera dist/
npm run preview # Preview local do build
```
