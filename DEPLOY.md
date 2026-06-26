# Triển khai lên VPS (Ubuntu + Nginx + PM2)

Hướng dẫn đưa toàn bộ dự án (frontend Vite, backend Express, SQL Server) lên một VPS Ubuntu, dùng **1 domain duy nhất**: Nginx phục vụ frontend ở `/` và proxy `/api` về backend.

```
Internet ──▶ Nginx (:80/:443)
               ├── /         → frontend/dist (file tĩnh)
               └── /api      → http://127.0.0.1:4000  (Express qua PM2)
                                        └── SQL Server (Docker, 127.0.0.1:1433)
```

> Yêu cầu VPS: Ubuntu 22.04+, **≥ 2 GB RAM** (SQL Server cần nhiều RAM), domain đã trỏ A record về IP VPS.

---

## 1. Cài môi trường (chạy 1 lần)

```bash
# Node 20 + Nginx + Git
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt update && sudo apt install -y nodejs nginx git
sudo npm i -g pm2

# Docker (để chạy SQL Server)
curl -fsSL https://get.docker.com | sh
```

## 2. SQL Server (Docker)

```bash
docker run -d --name mssql --restart unless-stopped \
  -e "ACCEPT_EULA=Y" -e "MSSQL_SA_PASSWORD=Chuoi!Manh2024" \
  -p 127.0.0.1:1433:1433 \
  -v mssql_data:/var/opt/mssql \
  mcr.microsoft.com/mssql/server:2022-latest
```

Tạo database + nạp schema (chạy từ thư mục dự án):

```bash
docker exec -i mssql /opt/mssql-tools/bin/sqlcmd -S localhost -U sa -P 'Chuoi!Manh2024' \
  -Q "IF DB_ID('glenns_plumbing') IS NULL CREATE DATABASE glenns_plumbing"

docker exec -i mssql /opt/mssql-tools/bin/sqlcmd -S localhost -U sa -P 'Chuoi!Manh2024' \
  -d glenns_plumbing < db/schema.sql
```

## 3. Lấy code về VPS

```bash
sudo mkdir -p /var/www && cd /var/www
sudo git clone <repo-url> glenns && sudo chown -R $USER:$USER glenns
cd glenns
```

## 4. Backend

```bash
cd /var/www/glenns/backend
cp .env.production.example .env      # rồi sửa .env: domain, mật khẩu DB, JWT, SMTP, Twilio
nano .env

npm install                          # cài cả devDeps để build được
npm run build                        # biên dịch ra dist/
npm run seed-admin -- admin <mat-khau-admin>   # tạo tài khoản đăng nhập /admin

pm2 start ecosystem.config.js
pm2 save && pm2 startup              # làm theo dòng lệnh PM2 in ra
```

Kiểm tra backend sống: `curl http://127.0.0.1:4000/health` → `{"ok":true}`

## 5. Frontend

```bash
cd /var/www/glenns/frontend
npm install
npm run build                        # ra frontend/dist (Nginx sẽ phục vụ)
```

`.env.production` đã để `VITE_API_URL=` trống sẵn (gọi API cùng origin).

## 6. Nginx + HTTPS

```bash
# Sửa server_name trong deploy/nginx.conf cho đúng domain trước
sudo cp /var/www/glenns/deploy/nginx.conf /etc/nginx/sites-available/glenns
sudo ln -s /etc/nginx/sites-available/glenns /etc/nginx/sites-enabled/
sudo rm -f /etc/nginx/sites-enabled/default
sudo nginx -t && sudo systemctl reload nginx

# Chứng chỉ HTTPS miễn phí
sudo apt install -y certbot python3-certbot-nginx
sudo certbot --nginx -d tenmien.com -d www.tenmien.com
```

## 7. Kiểm tra

- `https://tenmien.com` → trang chủ hiển thị.
- Gửi thử form đặt lịch → xem `pm2 logs glenns-api` và bảng `leads`.
- `https://tenmien.com/admin` → đăng nhập bằng tài khoản đã seed.

---

## Cập nhật code về sau

```bash
cd /var/www/glenns && git pull
cd backend  && npm install && npm run build && pm2 restart glenns-api
cd ../frontend && npm install && npm run build   # Nginx tự phục vụ bản mới
```

## Lệnh hữu ích

```bash
pm2 status            # trạng thái backend
pm2 logs glenns-api   # xem log
pm2 restart glenns-api
docker logs mssql     # log SQL Server
```

## Lưu ý bảo mật

- Cổng SQL Server chỉ bind `127.0.0.1` → không lộ ra Internet.
- Bật tường lửa: `sudo ufw allow OpenSSH && sudo ufw allow 'Nginx Full' && sudo ufw enable`
- `.env` chứa mật khẩu — **không commit lên git** (đã nằm trong `.gitignore`).
- Đổi `MSSQL_SA_PASSWORD` và `JWT_SECRET` thành giá trị mạnh, không dùng giá trị mẫu.
