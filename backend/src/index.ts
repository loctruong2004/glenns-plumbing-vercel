import "dotenv/config";
import express from "express";
import cors from "cors";
import leadRouter from "./routes/lead";
import authRouter from "./routes/auth";
import adminRouter from "./routes/admin";

const app = express();
const PORT = Number(process.env.PORT ?? 4000);

app.use(
  cors({
    origin: process.env.FRONTEND_URL ?? "http://localhost:3000",
    methods: ["POST", "GET", "PATCH", "OPTIONS"],
  })
);

app.use(express.json());

app.get("/health", (_req, res) => res.json({ ok: true }));

app.use("/api", leadRouter);
app.use("/api/auth", authRouter);
app.use("/api/admin", adminRouter);

// Backend chạy như 1 service độc lập (dev / VPS / Vercel Services) — luôn lắng nghe cổng.
// Trên Vercel, biến PORT được service runtime tự set và proxy /api, /health về đây (xem vercel.json).
app.listen(PORT, () => {
  console.log(`Backend chạy tại http://localhost:${PORT}`);
});

export default app;
