create table if not exists public.app_data (
  key text primary key,
  value text not null,
  updated_at timestamptz not null default now()
);

alter table public.app_data enable row level security;

do $$
begin
  if not exists (
    select 1 from pg_policies
    where schemaname = 'public' and tablename = 'app_data' and policyname = 'Allow public read'
  ) then
    create policy "Allow public read" on public.app_data for select using (true);
  end if;

  if not exists (
    select 1 from pg_policies
    where schemaname = 'public' and tablename = 'app_data' and policyname = 'Allow public insert'
  ) then
    create policy "Allow public insert" on public.app_data for insert with check (true);
  end if;

  if not exists (
    select 1 from pg_policies
    where schemaname = 'public' and tablename = 'app_data' and policyname = 'Allow public update'
  ) then
    create policy "Allow public update" on public.app_data for update using (true);
  end if;

  if not exists (
    select 1 from pg_policies
    where schemaname = 'public' and tablename = 'app_data' and policyname = 'Allow public delete'
  ) then
    create policy "Allow public delete" on public.app_data for delete using (true);
  end if;
end $$;
