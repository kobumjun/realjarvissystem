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
  return new;
end;
$$;

drop trigger if exists on_auth_user_created_access on auth.users;

create trigger on_auth_user_created_access
after insert on auth.users
for each row execute procedure public.handle_new_user_access();
