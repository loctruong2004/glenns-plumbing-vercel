-- Glenn's Plumbing — SQL Server Schema
-- Chạy theo thứ tự: admin_users trước, rồi leads, lead_events
-- Yêu cầu: SQL Server 2016+ hoặc Azure SQL

-- ============================================================
-- Bảng admin_users — tài khoản đăng nhập trang quản trị
-- ============================================================
CREATE TABLE admin_users (
  id           UNIQUEIDENTIFIER  PRIMARY KEY DEFAULT NEWID(),
  username     NVARCHAR(50)      NOT NULL UNIQUE,
  passwordHash NVARCHAR(255)     NOT NULL,
  createdAt    DATETIME2         NOT NULL DEFAULT GETUTCDATE()
);
-- Tạo tài khoản: chạy lệnh  npm run seed-admin -- admin YourPassword  trong backend/

-- ============================================================
-- Bảng leads — thông tin khách hàng + yêu cầu dịch vụ (gộp)
-- ============================================================
CREATE TABLE leads (
  id          UNIQUEIDENTIFIER  PRIMARY KEY DEFAULT NEWID(),
  -- Thông tin khách hàng
  phone       NVARCHAR(30)      NOT NULL,
  name        NVARCHAR(120)     NOT NULL,
  email       NVARCHAR(254)     NULL,
  address     NVARCHAR(500)     NULL,
  -- Thông tin yêu cầu dịch vụ
  service     NVARCHAR(80)      NOT NULL,
  serviceSlug NVARCHAR(80)      NULL,
  message     NVARCHAR(2000)    NULL,
  source      NVARCHAR(20)      NOT NULL,  -- HOME | PRICING | SERVICE
  status      NVARCHAR(20)      NOT NULL DEFAULT 'NEW',  -- NEW | CONTACTED | QUOTED | SCHEDULED | DONE | LOST
  notes       NVARCHAR(MAX)     NULL,
  createdAt   DATETIME2         NOT NULL DEFAULT GETUTCDATE(),
  respondedAt DATETIME2         NULL,
  closedAt    DATETIME2         NULL
);

CREATE INDEX idx_leads_status_created ON leads (status, createdAt);
CREATE INDEX idx_leads_phone          ON leads (phone);

-- ============================================================
-- Bảng lead_events — lịch sử thay đổi trạng thái
-- ============================================================
CREATE TABLE lead_events (
  id          UNIQUEIDENTIFIER  PRIMARY KEY DEFAULT NEWID(),
  leadId      UNIQUEIDENTIFIER  NOT NULL REFERENCES leads(id) ON DELETE CASCADE,
  fromStatus  NVARCHAR(20)      NULL,
  toStatus    NVARCHAR(20)      NOT NULL,
  note        NVARCHAR(MAX)     NULL,
  createdAt   DATETIME2         NOT NULL DEFAULT GETUTCDATE()
);

CREATE INDEX idx_lead_events_leadId ON lead_events (leadId, createdAt);

-- ============================================================
-- Bảng admin_settings — cấu hình trang quản trị (key-value)
-- ============================================================
CREATE TABLE admin_settings (
  [key]   NVARCHAR(100)  PRIMARY KEY,
  [value] NVARCHAR(MAX)  NULL
);

-- Seed mặc định: email + số điện thoại thông báo (để trống, cấu hình qua trang /admin)
INSERT INTO admin_settings ([key], [value]) VALUES ('notification_email', NULL);
INSERT INTO admin_settings ([key], [value]) VALUES ('notification_phone', NULL);
