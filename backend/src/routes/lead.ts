import { Router, Request, Response } from "express";
import { z } from "zod";
import { pool } from "../db";
import { sendLeadEmails } from "../lib/mailer";
import { sendLeadSms } from "../lib/sms";

const router = Router();

function normalizePhone(raw: string): string | null {
  const digits = raw.replace(/\D/g, "");
  if (digits.length === 10) return `+1${digits}`;
  if (digits.length === 11 && digits.startsWith("1")) return `+${digits}`;
  return null;
}

const leadSchema = z.object({
  name: z.string().trim().min(1, "Please enter your name").max(120),
  phone: z.string().transform((val, ctx) => {
    const e164 = normalizePhone(val);
    if (!e164) {
      ctx.addIssue({ code: "custom", message: "Enter a valid phone number" });
      return z.NEVER;
    }
    return e164;
  }),
  email:   z.string().trim().email().max(254).optional().or(z.literal("")),
  address: z.string().trim().max(500).optional().or(z.literal("")),
  service: z.string().trim().max(80).default("Not sure"),
  message: z.string().trim().max(2000).optional(),
  source: z
    .enum(["home", "pricing"])
    .or(z.string().regex(/^service:[a-z-]+$/))
    .default("home"),
  company: z.string().max(0).optional(), // honeypot
});

// POST /api/lead
router.post("/lead", async (req: Request, res: Response) => {
  try {
    // Honeypot
    const company = req.body?.company;
    if (company != null && company !== "") {
      return res.json({ ok: true });
    }

    const parsed = leadSchema.safeParse(req.body);
    if (!parsed.success) {
      const fieldErrors = parsed.error.flatten().fieldErrors;
      const errors = Object.fromEntries(
        Object.entries(fieldErrors).map(([k, v]) => [k, v?.[0] ?? "Invalid value"])
      );
      return res.status(400).json({ ok: false, errors });
    }

    const { name, phone, email, address, service, message, source } = parsed.data;
    const serviceSlug = source.startsWith("service:") ? source.slice(8) : null;
    const sourceEnum =
      source === "home" ? "HOME" : source === "pricing" ? "PRICING" : "SERVICE";

    // Transaction: insert lead + sự kiện trạng thái ban đầu (atomic).
    // id / status / createdAt do DB tự điền (default gen_random_uuid()/'NEW'/now()).
    const client = await pool.connect();
    try {
      await client.query("begin");

      const leadResult = await client.query(
        `insert into leads
           (name, phone, email, address, service, "serviceSlug", message, source)
         values ($1, $2, $3, $4, $5, $6, $7, $8)
         returning id`,
        [name, phone, email || null, address || null, service, serviceSlug, message || null, sourceEnum]
      );
      const leadId: string = leadResult.rows[0].id;

      await client.query(
        `insert into lead_events ("leadId", "toStatus") values ($1, 'NEW')`,
        [leadId]
      );

      await client.query("commit");
    } catch (err) {
      await client.query("rollback");
      throw err;
    } finally {
      client.release();
    }

    // Gửi mail + SMS: PHẢI await trên serverless — nếu không, function có thể bị
    // đóng băng ngay sau khi trả response và mail/SMS không gửi xong.
    // Lỗi mail/SMS không làm hỏng lead đã lưu (đã commit + catch riêng).
    await sendLeadEmails({ name, phone, email, address, service, message, source: sourceEnum }).catch(
      (err) => console.error("[lead] sendLeadEmails failed:", err)
    );
    await sendLeadSms({ name, phone, email, address, service, message }).catch(
      (err) => console.error("[lead] sendLeadSms failed:", err)
    );

    return res.json({ ok: true });
  } catch (err) {
    console.error("[POST /api/lead]", err);
    return res.status(500).json({
      ok: false,
      error: "Something went wrong. Please call us at (646) 963-2616 or try again.",
    });
  }
});

export default router;
