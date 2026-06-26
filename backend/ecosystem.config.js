// PM2 process config cho backend.
// Chạy (từ thư mục backend, sau khi đã `npm run build`):
//   pm2 start ecosystem.config.js
//   pm2 save && pm2 startup     # tự bật lại sau khi VPS reboot
// .env được dotenv tự nạp (index.ts import "dotenv/config"), nên không cần khai báo env ở đây.
module.exports = {
  apps: [
    {
      name: "glenns-api",
      script: "dist/index.js",
      cwd: __dirname,
      instances: 1,
      autorestart: true,
      max_memory_restart: "300M",
      env: {
        NODE_ENV: "production",
      },
    },
  ],
};
