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

// Chỉ lắng nghe cổng khi chạy local (dev / VPS).
// Trên Vercel, app được export như một serverless function (xem api/index.ts)
// nên KHÔNG gọi app.listen() (biến VERCEL được Vercel tự set).
if (!process.env.VERCEL) {
  app.listen(PORT, () => {
    console.log(`Backend chạy tại http://localhost:${PORT}`);
  });
}

export default app;
