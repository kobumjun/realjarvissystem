-- ============================================================
--  user_access (existing)
-- ============================================================
create table if not exists public.user_access (
  user_id uuid primary key references auth.users(id) on delete cascade,
  email text unique,
  has_access boolean not null default false,
  created_at timestamp with time zone not null default now(),
  updated_at timestamp with time zone not null default now()
);

alter table public.user_access enable row level security;

create policy "read own access"
on public.user_access
for select
to authenticated
using (auth.uid() = user_id);

create policy "insert own access"
on public.user_access
for insert
to authenticated
with check (auth.uid() = user_id);

create policy "update own access"
on public.user_access
for update
to authenticated
using (auth.uid() = user_id);

-- ============================================================
--  user_credits — running balance per user
-- ============================================================
create table if not exists public.user_credits (
  user_id uuid primary key references auth.users(id) on delete cascade,
  balance integer not null default 0,
  updated_at timestamp with time zone not null default now()
);

alter table public.user_credits enable row level security;

create policy "read own credits"
on public.user_credits
for select
to authenticated
using (auth.uid() = user_id);

-- ============================================================
--  credit_ledger — immutable audit trail of every credit change
-- ============================================================
create table if not exists public.credit_ledger (
  id bigint generated always as identity primary key,
  user_id uuid not null references auth.users(id) on delete cascade,
  amount integer not null,            -- positive = charge, negative = deduct
  balance_after integer not null,     -- snapshot after this tx
  reason text not null,               -- e.g. 'purchase:lite', 'api:chat', 'api:briefing'
  reference_id text,                  -- e.g. Lemon order id, request id
  created_at timestamp with time zone not null default now()
);

create index if not exists idx_credit_ledger_user on public.credit_ledger (user_id, created_at desc);

alter table public.credit_ledger enable row level security;

create policy "read own ledger"
on public.credit_ledger
for select
to authenticated
using (auth.uid() = user_id);

-- ============================================================
--  usage_logs — per-request usage record
-- ============================================================
create table if not exists public.usage_logs (
  id bigint generated always as identity primary key,
  user_id uuid not null references auth.users(id) on delete cascade,
  request_type text not null,         -- 'chat', 'briefing', etc.
  credits_used integer not null default 0,
  model text,
  tokens_in integer,
  tokens_out integer,
  metadata jsonb,
  created_at timestamp with time zone not null default now()
);

create index if not exists idx_usage_logs_user on public.usage_logs (user_id, created_at desc);

alter table public.usage_logs enable row level security;

create policy "read own usage"
on public.usage_logs
for select
to authenticated
using (auth.uid() = user_id);

-- ============================================================
--  Trigger: auto-create user_access + user_credits on signup
-- ============================================================
create or replace function public.handle_new_user_access()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.user_access (user_id, email, has_access)
  values (new.id, new.email, false)
  on conflict (user_id) do nothing;

  insert into public.user_credits (user_id, balance)
  values (new.id, 0)
  on conflict (user_id) do nothing;

  return new;
end;
$$;

drop trigger if exists on_auth_user_created_access on auth.users;

create trigger on_auth_user_created_access
after insert on auth.users
for each row execute procedure public.handle_new_user_access();

-- ============================================================
--  RPC: atomic credit adjustment (used by server)
-- ============================================================
create or replace function public.adjust_credits(
  p_user_id uuid,
  p_amount integer,
  p_reason text,
  p_reference_id text default null
)
returns integer
language plpgsql
security definer
set search_path = public
as $$
declare
  v_new_balance integer;
begin
  -- Ensure row exists
  insert into public.user_credits (user_id, balance)
  values (p_user_id, 0)
  on conflict (user_id) do nothing;

  -- Atomic update
  update public.user_credits
  set balance = balance + p_amount,
      updated_at = now()
  where user_id = p_user_id
  returning balance into v_new_balance;

  -- Guard against negative balance for deductions
  if p_amount < 0 and v_new_balance < 0 then
    raise exception 'insufficient_credits' using errcode = 'P0001';
  end if;

  -- Ledger entry
  insert into public.credit_ledger (user_id, amount, balance_after, reason, reference_id)
  values (p_user_id, p_amount, v_new_balance, p_reason, p_reference_id);

  return v_new_balance;
end;
$$;
