const SERVICE_ROLE = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6IndobnRvdW1xYW1heXpwaWFqdnZqIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc5MDU0NDU4NywiZXhwIjoyMTA2MTIwNTg3fQ.V_uQ8iEwBCZZ0GsnAWhO8kDUqelaIbOb_toIa7PNAs0'
const PROJECT_REF = 'whntoumqamayzpiajvvj'
const API_URL = `https://api.supabase.com/v1/projects/${PROJECT_REF}/database/query`

async function runSQL(label, sql) {
  const res = await fetch(API_URL, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${SERVICE_ROLE}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ query: sql }),
  })
  const text = await res.text()
  if (!res.ok) {
    console.error(`❌ [${label}] ${res.status}: ${text}`)
    return false
  }
  console.log(`✅ [${label}] OK`)
  return true
}

const steps = [
  ['uuid-extension', `create extension if not exists "uuid-ossp";`],

  ['table-businesses', `
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
  `],

  ['table-services', `
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
  `],

  ['table-business-hours', `
    create table if not exists public.business_hours (
      id            uuid primary key default uuid_generate_v4(),
      business_id   uuid not null references public.businesses(id) on delete cascade,
      day_of_week   integer not null check (day_of_week between 0 and 6),
      open_time     time,
      close_time    time,
      is_closed     boolean default false,
      created_at    timestamptz default now(),
      updated_at    timestamptz default now(),
      unique (business_id, day_of_week)
    );
  `],

  ['table-customers', `
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
  `],

  ['table-appointments', `
    create table if not exists public.appointments (
      id            uuid primary key default uuid_generate_v4(),
      business_id   uuid not null references public.businesses(id) on delete cascade,
      service_id    uuid not null references public.services(id),
      customer_id   uuid not null references public.customers(id),
      date          date not null,
      start_time    time not null,
      end_time      time not null,
      status        text not null default 'confirmed' check (status in ('pending','confirmed','cancelled','completed','no_show')),
      notes         text,
      n8n_notified  boolean default false,
      created_at    timestamptz default now(),
      updated_at    timestamptz default now()
    );
  `],

  ['index-unique-slot', `
    create unique index if not exists idx_appointments_slot
      on public.appointments (business_id, date, start_time)
      where status not in ('cancelled');
  `],

  ['indexes', `
    create index if not exists idx_services_business on public.services(business_id);
    create index if not exists idx_hours_business on public.business_hours(business_id);
    create index if not exists idx_customers_business on public.customers(business_id);
    create index if not exists idx_appointments_business_date on public.appointments(business_id, date);
  `],

  ['rls-enable', `
    alter table public.businesses enable row level security;
    alter table public.services enable row level security;
    alter table public.business_hours enable row level security;
    alter table public.customers enable row level security;
    alter table public.appointments enable row level security;
  `],

  ['rls-policies', `
    do $$ begin
      if not exists (select 1 from pg_policies where policyname = 'Public read businesses') then
        create policy "Public read businesses" on public.businesses for select using (active = true);
      end if;
      if not exists (select 1 from pg_policies where policyname = 'Public read services') then
        create policy "Public read services" on public.services for select using (active = true);
      end if;
      if not exists (select 1 from pg_policies where policyname = 'Public read business_hours') then
        create policy "Public read business_hours" on public.business_hours for select using (true);
      end if;
      if not exists (select 1 from pg_policies where policyname = 'Anon insert customers') then
        create policy "Anon insert customers" on public.customers for insert with check (true);
      end if;
      if not exists (select 1 from pg_policies where policyname = 'Anon read own customer') then
        create policy "Anon read own customer" on public.customers for select using (true);
      end if;
      if not exists (select 1 from pg_policies where policyname = 'Public read appointments') then
        create policy "Public read appointments" on public.appointments for select using (true);
      end if;
      if not exists (select 1 from pg_policies where policyname = 'Anon insert appointments') then
        create policy "Anon insert appointments" on public.appointments for insert with check (true);
      end if;
    end $$;
  `],

  ['updated-at-fn', `
    create or replace function public.handle_updated_at()
    returns trigger language plpgsql as $$
    begin
      new.updated_at = now();
      return new;
    end;
    $$;
  `],

  ['triggers', `
    do $$ begin
      if not exists (select 1 from pg_trigger where tgname = 'set_updated_at_businesses') then
        create trigger set_updated_at_businesses before update on public.businesses for each row execute function public.handle_updated_at();
      end if;
      if not exists (select 1 from pg_trigger where tgname = 'set_updated_at_services') then
        create trigger set_updated_at_services before update on public.services for each row execute function public.handle_updated_at();
      end if;
      if not exists (select 1 from pg_trigger where tgname = 'set_updated_at_business_hours') then
        create trigger set_updated_at_business_hours before update on public.business_hours for each row execute function public.handle_updated_at();
      end if;
      if not exists (select 1 from pg_trigger where tgname = 'set_updated_at_customers') then
        create trigger set_updated_at_customers before update on public.customers for each row execute function public.handle_updated_at();
      end if;
      if not exists (select 1 from pg_trigger where tgname = 'set_updated_at_appointments') then
        create trigger set_updated_at_appointments before update on public.appointments for each row execute function public.handle_updated_at();
      end if;
    end $$;
  `],

  ['seed-business', `
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
    on conflict (slug) do nothing;
  `],

  ['seed-services', `
    insert into public.services (business_id, name, description, price, duration_min, sort_order)
    values
      ('a0000000-0000-0000-0000-000000000001', 'Corte', 'Corte moderno com acabamento impecável', 40.00, 45, 1),
      ('a0000000-0000-0000-0000-000000000001', 'Barba', 'Barba modelada com navalha e produtos premium', 30.00, 30, 2),
      ('a0000000-0000-0000-0000-000000000001', 'Corte + Barba', 'Combo completo com desconto especial', 60.00, 60, 3)
    on conflict do nothing;
  `],

  ['seed-hours', `
    insert into public.business_hours (business_id, day_of_week, open_time, close_time, is_closed)
    values
      ('a0000000-0000-0000-0000-000000000001', 0, null, null, true),
      ('a0000000-0000-0000-0000-000000000001', 1, '09:00', '19:00', false),
      ('a0000000-0000-0000-0000-000000000001', 2, '09:00', '19:00', false),
      ('a0000000-0000-0000-0000-000000000001', 3, '09:00', '19:00', false),
      ('a0000000-0000-0000-0000-000000000001', 4, '09:00', '19:00', false),
      ('a0000000-0000-0000-0000-000000000001', 5, '09:00', '19:00', false),
      ('a0000000-0000-0000-0000-000000000001', 6, '09:00', '17:00', false)
    on conflict (business_id, day_of_week) do nothing;
  `],
]

let allOk = true
for (const [label, sql] of steps) {
  const ok = await runSQL(label, sql.trim())
  if (!ok) allOk = false
}

if (allOk) {
  console.log('\n🎉 Schema criado com sucesso! Barbearia Prime está no banco.')
} else {
  console.log('\n⚠️  Alguns passos falharam. Veja os erros acima.')
}
