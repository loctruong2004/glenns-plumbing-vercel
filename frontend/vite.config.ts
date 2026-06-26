import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import { resolve } from "path";

export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      "@": resolve(__dirname, "./src"),
    },
  },
  server: {
    host: true, // lắng nghe trên 0.0.0.0 để truy cập qua IP máy chủ
    proxy: {
      // Chuyển /api về backend Express (cùng origin -> không lo CORS)
      "/api": {
        target: "http://localhost:4000",
        changeOrigin: true,
      },
    },
  },
});
