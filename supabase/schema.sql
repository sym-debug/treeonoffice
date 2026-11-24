-- TreeON Office — Supabase 스키마
-- Supabase 대시보드 > SQL Editor 에 붙여넣고 실행하세요.
-- 실행 후 맨 아래 admins 에 관리자 이메일을 넣고, 그 이메일로 회원가입(이메일 인증)하면 /admin 에 들어갈 수 있습니다.

create extension if not exists pgcrypto;

-- 관리자 목록
create table if not exists admins (email text primary key);

create or replace function is_admin() returns boolean
language sql stable security definer set search_path = public as $$
  select exists (select 1 from admins where lower(email) = lower(auth.jwt() ->> 'email'));
$$;

-- 문의·사전 신청·회원가입 리드
create table if not exists leads (
  id uuid primary key default gen_random_uuid(),
  kind text not null,                 -- apply | signup | contact
  status text not null default '신규',
  data jsonb not null default '{}',
  memo text,
  created_at timestamptz not null default now(),
  updated_at timestamptz
);

-- 데모(무료 체험) 일정
create table if not exists trials (
  id uuid primary key default gen_random_uuid(),
  lead_id uuid,
  status text not null default '요청',
  data jsonb not null default '{}',
  created_at timestamptz not null default now(),
  updated_at timestamptz
);

-- 이용 리포트
create table if not exists reports (
  id uuid primary key default gen_random_uuid(),
  owner_email text,
  company text,
  team text,
  published boolean not null default false,
  data jsonb not null default '{}',
  created_at timestamptz not null default now(),
  updated_at timestamptz
);

-- 사이트 콘텐츠 (요금·주변 시설·공지·연락처·사진 설명·샘플 리포트)
create table if not exists content (
  key text primary key,
  value jsonb not null,
  updated_at timestamptz default now()
);

-- 이용자 앱 데이터 (예약·근태·서류 신청 등)
create table if not exists user_data (
  email text not null,
  name text not null,
  value jsonb,
  updated_at timestamptz default now(),
  primary key (email, name)
);

alter table admins enable row level security;
alter table leads enable row level security;
alter table trials enable row level security;
alter table reports enable row level security;
alter table content enable row level security;
alter table user_data enable row level security;

-- admins: 본인 행만 조회 (관리자 여부 확인용)
create policy "admins self read" on admins for select using (lower(email) = lower(auth.jwt() ->> 'email'));

-- leads: 누구나 접수, 관리자만 조회·수정·삭제
create policy "leads insert anyone" on leads for insert to anon, authenticated with check (kind in ('apply','signup','contact'));
create policy "leads admin read" on leads for select using (is_admin());
create policy "leads admin update" on leads for update using (is_admin());
create policy "leads admin delete" on leads for delete using (is_admin());

-- trials: 관리자 전용
create policy "trials admin all" on trials for all using (is_admin()) with check (is_admin());

-- reports: 관리자 전체, 이용자는 본인 이메일의 공개 리포트만 조회
create policy "reports admin all" on reports for all using (is_admin()) with check (is_admin());
create policy "reports owner read" on reports for select using (published and lower(owner_email) = lower(auth.jwt() ->> 'email'));

-- content: 누구나 조회, 관리자만 수정
create policy "content read" on content for select using (true);
create policy "content admin write" on content for all using (is_admin()) with check (is_admin());

-- user_data: 본인 데이터 읽기·쓰기, 관리자는 전체 읽기·수정
create policy "user_data owner" on user_data for all
  using (lower(email) = lower(auth.jwt() ->> 'email'))
  with check (lower(email) = lower(auth.jwt() ->> 'email'));
create policy "user_data admin" on user_data for all using (is_admin()) with check (is_admin());

-- 관리자 이메일 등록 (바꿔서 실행)
-- insert into admins (email) values ('admin@yourcompany.com');
