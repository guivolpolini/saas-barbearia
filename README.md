# saas-barbearia

Sistema de agendamento online que construí como MVP para testar a viabilidade de um SaaS voltado a pequenos negócios. A ideia é simples: o cliente acessa o site, conversa com um chat e marca o horário — sem ligar, sem WhatsApp, sem depender de ninguém.

A demo roda com dados da **Barbearia Prime** (fictícia), mas a arquitetura é multiempresa desde o início. Para colocar outro cliente, basta cadastrar no banco.

## Stack

- React + Vite + TypeScript
- Tailwind CSS v4
- Supabase (Postgres + Auth)
- n8n para automações via webhook
- date-fns, lucide-react, react-router-dom

## O que tem

**Site público**
- Landing page com serviços, preços, horários e avaliações
- Chat flutuante que conduz o agendamento passo a passo
- Verificação de conflito de horário antes de confirmar

**Painel admin** (`/admin`)
- Dashboard com resumo do dia e do mês
- Agenda semanal
- Lista de agendamentos com filtros e atualização de status
- CRUD de serviços e preços
- Configuração de horários de funcionamento
- Edição dos dados da empresa

**Banco de dados**
- Schema multiempresa com `business_id` em todas as tabelas
- RLS configurado no Supabase
- Índice único para impedir agendamento duplicado no mesmo horário

## Rodando localmente

```bash
git clone https://github.com/guivolpolini/saas-barbearia
cd saas-barbearia
npm install
cp .env.example .env
```

Preencha o `.env` com suas credenciais do Supabase, execute o `supabase/schema.sql` no SQL Editor do projeto e rode:

```bash
npm run dev
```

O admin fica em `/admin/login`. Crie o usuário pelo painel de Authentication do Supabase.

## Variáveis de ambiente

```env
VITE_SUPABASE_URL=https://seu-projeto.supabase.co
VITE_SUPABASE_ANON_KEY=sua-anon-key
VITE_N8N_WEBHOOK_URL=         # opcional, deixe vazio se não usar
```

A `service_role` nunca vai pro frontend. Se quiser mover o webhook do n8n pra um lugar mais seguro, uma Edge Function do Supabase resolve.

## n8n

Quando o agendamento é confirmado, o sistema dispara um `POST` pro webhook configurado:

```json
{
  "event": "appointment.created",
  "business_id": "...",
  "service_id": "...",
  "service_name": "Corte",
  "customer_name": "João Silva",
  "phone": "(11) 99999-0000",
  "date": "2026-10-01",
  "time": "14:30",
  "duration_min": 45,
  "price": 40.00,
  "appointment_id": "...",
  "created_at": "..."
}
```

A partir daí no n8n você conecta o que quiser: e-mail de confirmação, lembrete no dia anterior, planilha, Telegram pro barbeiro, etc.

## Adicionando um novo cliente

Só inserir no banco — sem mexer em código:

```sql
-- 1. empresa
INSERT INTO public.businesses (name, slug, description, phone, email, address, city, state, primary_color)
VALUES ('Nome do Cliente', 'slug-do-cliente', '...', '...', '...', '...', '...', '...', '#hex');

-- 2. serviços
INSERT INTO public.services (business_id, name, price, duration_min, sort_order)
VALUES ('<id>', 'Corte', 50.00, 45, 1);

-- 3. horários
INSERT INTO public.business_hours (business_id, day_of_week, open_time, close_time, is_closed)
VALUES ('<id>', 1, '09:00', '18:00', false); -- repetir para cada dia
```

Depois sobe uma instância do projeto apontando pro slug novo no `BusinessContext.tsx`. Futuramente esse slug pode vir do subdomínio automaticamente.

## O que não tem (ainda)

- Pagamentos
- Notificações por SMS
- IA
- Multi-profissional (mais de um barbeiro por agenda)
- App mobile

A arquitetura não impede nada disso. É questão de prioridade.
