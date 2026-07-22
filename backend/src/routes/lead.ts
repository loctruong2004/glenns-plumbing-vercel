import { Router, Request, Response } from "express";
import { z } from "zod";
import { pool, query } from "../db";
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
  // SMS opt-in (Twilio A2P / TCPA): the form checkbox is unchecked by default
  // and required — enforced here too so consent is never assumed for API calls.
  consent: z
    .boolean()
    .optional()
    .refine((v) => v === true, {
      message: "Please agree to receive text messages to continue",
    }),
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

    // Chống spam: mỗi số điện thoại và mỗi email tối đa 10 lần gửi / 30 ngày.
    // Đếm cùng lúc theo phone và email trong 1 truy vấn (email rỗng => không tính).
    const RATE_LIMIT = 10;
    const emailKey = email || null;
    const rate = await query(
      `select
         count(*) filter (where phone = $1)                          as phone_count,
         count(*) filter (where email is not null and email = $2)    as email_count
       from leads
       where "createdAt" > now() - interval '30 days'`,
      [phone, emailKey]
    );
    const phoneCount = Number(rate.rows[0].phone_count);
    const emailCount = Number(rate.rows[0].email_count);
    if (phoneCount >= RATE_LIMIT || emailCount >= RATE_LIMIT) {
      return res.status(429).json({
        ok: false,
        error:
          "You've reached the limit of requests for this month. Please call us at (646) 963-2616 and we'll help you right away.",
      });
    }

    // Transaction: insert lead + sự kiện trạng thái ban đầu (atomic).
    // id / status / createdAt do DB tự điền (default gen_random_uuid()/'NEW'/now()).
    const client = await pool.connect();
    try {
      await client.query("begin");

      // smsConsent luôn true tại đây (schema đã chặn thiếu consent);
      // smsConsentAt = now() phía server làm bằng chứng TCPA (không tin client).
      const leadResult = await client.query(
        `insert into leads
           (name, phone, email, address, service, "serviceSlug", message, source,
            "smsConsent", "smsConsentAt")
         values ($1, $2, $3, $4, $5, $6, $7, $8, true, now())
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
