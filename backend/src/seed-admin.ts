// Tạo/cập nhật tài khoản admin
// Cách dùng:  npx ts-node src/seed-admin.ts <username> <password>
// Ví dụ:      npx ts-node src/seed-admin.ts admin MyPassword123
//
// Lưu ý: nên trỏ DATABASE_URL về DIRECT connection của Supabase (cổng 5432),
// không cần transaction pooler cho script chạy một lần.
import "dotenv/config";
import bcrypt from "bcryptjs";
import { pool, query } from "./db";

const [, , username = "admin", password] = process.argv;

if (!password) {
  console.error("Cần nhập password: npx ts-node src/seed-admin.ts <username> <password>");
  process.exit(1);
}

async function main() {
  const hash = await bcrypt.hash(password, 10);
  await query(
    `insert into admin_users (username, "passwordHash")
     values ($1, $2)
     on conflict (username) do update set "passwordHash" = excluded."passwordHash"`,
    [username, hash]
  );
  console.log(`✓ Tài khoản "${username}" đã được tạo/cập nhật.`);
  await pool.end();
  process.exit(0);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
