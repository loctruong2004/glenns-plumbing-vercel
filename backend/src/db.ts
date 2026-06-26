import { Pool } from "pg";

// Kết nối Supabase Postgres.
// - Trên Vercel (serverless): trỏ DATABASE_URL về transaction pooler của Supabase
//   (Supavisor, cổng 6543). Pooling thật do Supavisor lo, nên mỗi instance hàm
//   chỉ cần giữ 1 kết nối (max = 1).
// - Local / seed-admin: có thể trỏ DATABASE_URL về direct connection (cổng 5432).
const useSsl = process.env.PG_SSL !== "false"; // Supabase yêu cầu SSL; đặt PG_SSL=false cho Postgres local không SSL

export const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: useSsl ? { rejectUnauthorized: false } : undefined,
  max: Number(process.env.PG_POOL_MAX ?? 1),
  idleTimeoutMillis: 10_000,
  connectionTimeoutMillis: 10_000,
});

pool.on("error", (err) => {
  console.error("[db] Lỗi pool Postgres:", err);
});

// Helper truy vấn nhanh cho các câu lệnh đơn (không cần transaction).
// Với transaction nhiều câu lệnh, dùng `pool.connect()` rồi begin/commit/rollback.
export const query = (text: string, params?: unknown[]) => pool.query(text, params);
