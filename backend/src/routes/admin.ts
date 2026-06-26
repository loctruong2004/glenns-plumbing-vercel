import { Router, Response } from "express";
import { query } from "../db";
import { requireAuth, AuthRequest } from "../middleware/auth";

const router = Router();

const VALID_STATUSES = ["NEW", "CONTACTED", "QUOTED", "SCHEDULED", "DONE", "LOST"];

// GET /api/admin/leads — danh sách leads mới nhất trước
router.get("/leads", requireAuth, async (_req: AuthRequest, res: Response) => {
  try {
    const result = await query(`
      select id, name, phone, email, address,
             service, source, status, message, notes,
             "createdAt", "respondedAt", "closedAt"
      from leads
      order by "createdAt" desc
    `);
    return res.json({ ok: true, leads: result.rows });
  } catch (err) {
    console.error("[GET /api/admin/leads]", err);
    return res.status(500).json({ ok: false, error: "Server error" });
  }
});

// PATCH /api/admin/leads/:id/status — đổi trạng thái lead
router.patch("/leads/:id/status", requireAuth, async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { status } = req.body ?? {};
    if (!VALID_STATUSES.includes(status)) {
      return res.status(400).json({ ok: false, error: "Invalid status" });
    }
    await query("update leads set status = $1 where id = $2", [status, id]);
    return res.json({ ok: true });
  } catch (err) {
    console.error("[PATCH /api/admin/leads/:id/status]", err);
    return res.status(500).json({ ok: false, error: "Server error" });
  }
});

// GET /api/admin/settings — lấy cài đặt (hiện tại: email + sđt thông báo)
router.get("/settings", requireAuth, async (_req: AuthRequest, res: Response) => {
  try {
    const result = await query("select key, value from admin_settings");
    const settings: Record<string, string | null> = {};
    for (const row of result.rows) {
      settings[row.key] = row.value;
    }
    return res.json({ ok: true, settings });
  } catch (err) {
    console.error("[GET /api/admin/settings]", err);
    return res.status(500).json({ ok: false, error: "Server error" });
  }
});

// PATCH /api/admin/settings — cập nhật một setting (UPSERT)
router.patch("/settings", requireAuth, async (req: AuthRequest, res: Response) => {
  try {
    const { key, value } = req.body ?? {};
    if (typeof key !== "string" || key.length === 0) {
      return res.status(400).json({ ok: false, error: "Missing key" });
    }
    await query(
      `insert into admin_settings (key, value) values ($1, $2)
       on conflict (key) do update set value = excluded.value`,
      [key, value ?? null]
    );
    return res.json({ ok: true });
  } catch (err) {
    console.error("[PATCH /api/admin/settings]", err);
    return res.status(500).json({ ok: false, error: "Server error" });
  }
});

export default router;
