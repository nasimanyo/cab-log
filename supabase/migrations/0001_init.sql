-- カブナビ（仮） Supabase設計書 v1.0 に基づく初期スキーマ
-- users / weeks テーブルとRow Level Securityの設定
-- ※ prices / predictions はアプリ側でJSON化してweeksテーブルに保持する簡易構成としている
--    (画面設計書の要件を満たしつつテーブル数を抑え、保守性を優先)

-- users テーブル（Supabase Authのユーザーに対応する追加プロフィール情報）
create table if not exists public.users (
  id uuid primary key references auth.users(id) on delete cascade,
  display_name text,
  created_at timestamptz not null default now()
);

alter table public.users enable row level security;

create policy "Users can view own profile"
  on public.users for select
  using (auth.uid() = id);

create policy "Users can update own profile"
  on public.users for update
  using (auth.uid() = id);

create policy "Users can insert own profile"
  on public.users for insert
  with check (auth.uid() = id);

-- weeks テーブル（1週間分のカブ価データ。price/predictionはJSONBで保持）
create table if not exists public.weeks (
  id uuid primary key,
  user_id uuid not null references auth.users(id) on delete cascade,
  year integer not null,
  week integer not null,
  buy_price integer,
  buy_count integer,
  prices_json jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists idx_weeks_user_id on public.weeks(user_id);
create unique index if not exists idx_weeks_user_year_week on public.weeks(user_id, year, week);

alter table public.weeks enable row level security;

create policy "Users can select own weeks"
  on public.weeks for select
  using (auth.uid() = user_id);

create policy "Users can insert own weeks"
  on public.weeks for insert
  with check (auth.uid() = user_id);

create policy "Users can update own weeks"
  on public.weeks for update
  using (auth.uid() = user_id);

create policy "Users can delete own weeks"
  on public.weeks for delete
  using (auth.uid() = user_id);

-- updated_at自動更新トリガー
create or replace function public.set_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

drop trigger if exists trg_weeks_updated_at on public.weeks;
create trigger trg_weeks_updated_at
  before update on public.weeks
  for each row
  execute function public.set_updated_at();
