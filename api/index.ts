// Vercel serverless entry cho TOÀN BỘ API.
// Dự án deploy dưới dạng 1 project Vercel duy nhất:
//   - Frontend (Vite) build ra frontend/dist → Vercel phục vụ tĩnh ở "/"
//     (gồm cả trang người dùng và trang /admin — cùng một React app).
//   - Mọi request /api/* và /health được rewrite về function này (xem vercel.json),
//     Express bên trong tự định tuyến: /api/lead, /api/auth/login, /api/admin/*.
// Vì frontend và API CÙNG 1 domain nên frontend gọi thẳng "/api/..." (same-origin)
//   → KHÔNG cần CORS, KHÔNG cần VITE_API_URL (để trống trong frontend/.env.production).
export { default } from "../backend/src/index";
