-- Glenn's Plumbing — Supabase Postgres Schema
-- Convert từ db/schema.sql (SQL Server) sang Postgres.
-- Tên cột camelCase được giữ NGUYÊN (bọc dấu nháy kép) để JSON API không đổi
-- → frontend đọc lead.createdAt, passwordHash... không phải sửa.

-- ============================================================
-- admin_users — tài khoản đăng nhập trang quản trị
-- ============================================================
create table if not exists admin_users (
  id             uuid         primary key default gen_random_uuid(),
  username       text         not null unique,
  "passwordHash" text         not null,
  "createdAt"    timestamptz  not null default now()
);

-- ============================================================
-- leads — thông tin khách hàng + yêu cầu dịch vụ (gộp)
-- ============================================================
create table if not exists leads (
  id            uuid         primary key default gen_random_uuid(),
  -- Thông tin khách hàng
  phone         text         not null,
  name          text         not null,
  email         text,
  address       text,
  -- Thông tin yêu cầu dịch vụ
  service       text         not null,
  "serviceSlug" text,
  message       text,
  source        text         not null,                -- HOME | PRICING | SERVICE
  status        text         not null default 'NEW',  -- NEW | CONTACTED | QUOTED | SCHEDULED | DONE | LOST
  notes         text,
  "createdAt"   timestamptz  not null default now(),
  "respondedAt" timestamptz,
  "closedAt"    timestamptz
);

create index if not exists idx_leads_status_created on leads (status, "createdAt");
create index if not exists idx_leads_phone          on leads (phone);

-- ============================================================
-- lead_events — lịch sử thay đổi trạng thái
-- ============================================================
create table if not exists lead_events (
  id           uuid         primary key default gen_random_uuid(),
  "leadId"     uuid         not null references leads(id) on delete cascade,
  "fromStatus" text,
  "toStatus"   text         not null,
  note         text,
  "createdAt"  timestamptz  not null default now()
);

create index if not exists idx_lead_events_leadid on lead_events ("leadId", "createdAt");

-- ============================================================
-- admin_settings — cấu hình trang quản trị (key-value)
-- ============================================================
create table if not exists admin_settings (
  key   text  primary key,
  value text
);

-- Seed mặc định: email + số điện thoại thông báo (để trống, cấu hình qua /admin)
insert into admin_settings (key, value) values
  ('notification_email', null),
  ('notification_phone', null)
on conflict (key) do nothing;

-- ============================================================
-- RLS — khóa các bảng khỏi API public (anon / PostgREST).
-- Backend kết nối bằng role Postgres (bypass RLS) nên đọc/ghi bình thường.
-- Bật RLS mà KHÔNG tạo policy = chặn mọi truy cập qua anon key
-- → bảo vệ PII khách hàng trong bảng leads.
-- ============================================================
alter table admin_users    enable row level security;
alter table leads          enable row level security;
alter table lead_events    enable row level security;
alter table admin_settings enable row level security;
