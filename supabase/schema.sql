-- ============================================================
-- SaaS Agendamento - Schema Supabase Multiempresa & Multi-profissional
-- Execute no SQL Editor do Supabase
-- ============================================================

-- Habilitar extensão para UUID
create extension if not exists "uuid-ossp";

-- ============================================================
-- TABELA: businesses
-- ============================================================
create table if not exists public.businesses (
  id            uuid primary key default uuid_generate_v4(),
  name          text not null,
  slug          text not null unique,
  description   text,
  phone         text,
  email         text,
  address       text,
  city          text,
  state         text,
  zip           text,
  logo_url      text,
  primary_color text default '#c8a96e',
  accent_color  text default '#1a1a1a',
  website       text,
  instagram     text,
  active        boolean default true,
  created_at    timestamptz default now(),
  updated_at    timestamptz default now()
);

-- ============================================================
-- TABELA: services
-- ============================================================
create table if not exists public.services (
  id            uuid primary key default uuid_generate_v4(),
  business_id   uuid not null references public.businesses(id) on delete cascade,
  name          text not null,
  description   text,
  price         numeric(10,2) not null,
  duration_min  integer not null,
  active        boolean default true,
  sort_order    integer default 0,
  created_at    timestamptz default now(),
  updated_at    timestamptz default now()
);

-- ============================================================
-- TABELA: professionals (Multi-profissional)
-- ============================================================
create table if not exists public.professionals (
  id            uuid primary key default uuid_generate_v4(),
  business_id   uuid not null references public.businesses(id) on delete cascade,
  name          text not null,
  role          text,
  avatar_url    text,
  active        boolean default true,
  created_at    timestamptz default now(),
  updated_at    timestamptz default now()
);

-- ============================================================
-- TABELA: business_hours
-- ============================================================
create table if not exists public.business_hours (
  id            uuid primary key default uuid_generate_v4(),
  business_id   uuid not null references public.businesses(id) on delete cascade,
  day_of_week   integer not null check (day_of_week between 0 and 6), -- 0=domingo, 6=sábado
  open_time     time,
  close_time    time,
  is_closed     boolean default false,
  created_at    timestamptz default now(),
  updated_at    timestamptz default now(),
  unique (business_id, day_of_week)
);

-- ============================================================
-- TABELA: customers
-- ============================================================
create table if not exists public.customers (
  id            uuid primary key default uuid_generate_v4(),
  business_id   uuid not null references public.businesses(id) on delete cascade,
  name          text not null,
  phone         text not null,
  email         text,
  created_at    timestamptz default now(),
  updated_at    timestamptz default now(),
  unique (business_id, phone)
);

-- ============================================================
-- TABELA: appointments
-- ============================================================
create table if not exists public.appointments (
  id              uuid primary key default uuid_generate_v4(),
  business_id     uuid not null references public.businesses(id) on delete cascade,
  service_id      uuid not null references public.services(id),
  professional_id uuid references public.professionals(id) on delete set null,
  customer_id     uuid not null references public.customers(id),
  date            date not null,
  start_time      time not null,
  end_time        time not null,
  status          text not null default 'confirmed' check (status in ('pending','confirmed','cancelled','completed','no_show')),
  notes           text,
  n8n_notified    boolean default false,
  created_at      timestamptz default now(),
  updated_at      timestamptz default now()
);

-- Impede agendamento duplicado no mesmo horário
create unique index if not exists idx_appointments_slot
  on public.appointments (business_id, date, start_time)
  where status not in ('cancelled');

-- ============================================================
-- ÍNDICES
-- ============================================================
create index if not exists idx_services_business on public.services(business_id);
create index if not exists idx_professionals_business on public.professionals(business_id);
create index if not exists idx_hours_business on public.business_hours(business_id);
create index if not exists idx_customers_business on public.customers(business_id);
create index if not exists idx_appointments_business_date on public.appointments(business_id, date);

-- ============================================================
-- ROW LEVEL SECURITY (RLS)
-- ============================================================
alter table public.businesses enable row level security;
alter table public.services enable row level security;
alter table public.professionals enable row level security;
alter table public.business_hours enable row level security;
alter table public.customers enable row level security;
alter table public.appointments enable row level security;

-- Leitura pública (para landing page e chat)
create policy "Public read businesses" on public.businesses
  for select using (active = true);

create policy "Public read services" on public.services
  for select using (active = true);

create policy "Public read professionals" on public.professionals
  for select using (active = true);

create policy "Public read business_hours" on public.business_hours
  for select using (true);

-- Clientes: inserir apenas (sem auth, via anon key)
create policy "Anon insert customers" on public.customers
  for insert with check (true);

create policy "Anon read own customer" on public.customers
  for select using (true);

-- Agendamentos: leitura e inserção pública
create policy "Public read appointments" on public.appointments
  for select using (true);

create policy "Anon insert appointments" on public.appointments
  for insert with check (true);

-- ============================================================
-- FUNÇÃO: updated_at trigger
-- ============================================================
create or replace function public.handle_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger set_updated_at_businesses before update on public.businesses
  for each row execute function public.handle_updated_at();
create trigger set_updated_at_services before update on public.services
  for each row execute function public.handle_updated_at();
create trigger set_updated_at_professionals before update on public.professionals
  for each row execute function public.handle_updated_at();
create trigger set_updated_at_business_hours before update on public.business_hours
  for each row execute function public.handle_updated_at();
create trigger set_updated_at_customers before update on public.customers
  for each row execute function public.handle_updated_at();
create trigger set_updated_at_appointments before update on public.appointments
  for each row execute function public.handle_updated_at();

-- ============================================================
-- SEED: Barbearia Prime
-- ============================================================
do $$
declare
  biz_id uuid;
begin
  -- Inserir empresa
  insert into public.businesses (id, name, slug, description, phone, email, address, city, state, zip, primary_color, instagram)
  values (
    'a0000000-0000-0000-0000-000000000001',
    'Barbearia Prime',
    'barbearia-prime',
    'Estilo e precisão para o homem moderno. Atendimento personalizado com os melhores profissionais da cidade.',
    '(11) 99999-0001',
    'contato@barbeariaprime.com.br',
    'Rua das Palmeiras, 123 - Centro',
    'São Paulo',
    'SP',
    '01310-100',
    '#c8a96e',
    '@barbeariaprime'
  )
  on conflict (slug) do nothing
  returning id into biz_id;

  if biz_id is null then
    select id into biz_id from public.businesses where slug = 'barbearia-prime';
  end if;

  -- Serviços
  insert into public.services (business_id, name, description, price, duration_min, sort_order)
  values
    (biz_id, 'Corte', 'Corte moderno com acabamento impecável', 40.00, 45, 1),
    (biz_id, 'Barba', 'Barba modelada com navalha e produtos premium', 30.00, 30, 2),
    (biz_id, 'Corte + Barba', 'Combo completo com desconto especial', 60.00, 60, 3)
  on conflict do nothing;

  -- Profissionais
  insert into public.professionals (business_id, name, role)
  values
    (biz_id, 'Marcos Silva', 'Barbeiro Master'),
    (biz_id, 'Lucas Prado', 'Especialista em Barba'),
    (biz_id, 'Diego Ramos', 'Cortes Clássicos & Fade')
  on conflict do nothing;

  -- Horários (0=dom, 1=seg, ..., 6=sáb)
  insert into public.business_hours (business_id, day_of_week, open_time, close_time, is_closed)
  values
    (biz_id, 0, null, null, true),           -- domingo: fechado
    (biz_id, 1, '09:00', '19:00', false),    -- segunda
    (biz_id, 2, '09:00', '19:00', false),    -- terça
    (biz_id, 3, '09:00', '19:00', false),    -- quarta
    (biz_id, 4, '09:00', '19:00', false),    -- quinta
    (biz_id, 5, '09:00', '19:00', false),    -- sexta
    (biz_id, 6, '09:00', '17:00', false)     -- sábado
  on conflict (business_id, day_of_week) do nothing;

end $$;
