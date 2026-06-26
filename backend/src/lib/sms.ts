import twilio from "twilio";
import { query } from "../db";

const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;
const fromNumber = process.env.TWILIO_FROM;

const client =
  accountSid && authToken ? twilio(accountSid, authToken) : null;

// Chuẩn hóa số về E.164 (+1...) — Twilio bắt buộc định dạng này.
function normalizePhone(raw: string): string | null {
  const trimmed = raw.trim();
  if (trimmed.startsWith("+")) return trimmed;
  const digits = trimmed.replace(/\D/g, "");
  if (digits.length === 10) return `+1${digits}`;
  if (digits.length === 11 && digits.startsWith("1")) return `+${digits}`;
  return null;
}

async function getNotificationPhone(): Promise<string | null> {
  try {
    const result = await query(
      "select value from admin_settings where key = $1",
      ["notification_phone"]
    );
    return result.rows[0]?.value ?? null;
  } catch {
    return null;
  }
}

export interface LeadSmsData {
  name: string;
  phone: string;
  email?: string | null;
  address?: string | null;
  service: string;
  message?: string | null;
}

export async function sendLeadSms(lead: LeadSmsData): Promise<void> {
  if (!client || !fromNumber) {
    console.warn(
      "[sms] TWILIO_ACCOUNT_SID / TWILIO_AUTH_TOKEN / TWILIO_FROM chưa cấu hình — bỏ qua gửi SMS."
    );
    return;
  }

  const rawTo = await getNotificationPhone();
  if (!rawTo) {
    console.warn("[sms] notification_phone chưa cấu hình ở /admin — bỏ qua gửi SMS.");
    return;
  }

  const to = normalizePhone(rawTo);
  if (!to) {
    console.error(`[sms] notification_phone không hợp lệ: ${rawTo}`);
    return;
  }

  const lines = [
    "New Quote Request — Glenn's Plumbing",
    `Name: ${lead.name}`,
    `Phone: ${lead.phone}`,
    `Service: ${lead.service}`,
  ];
  if (lead.email) lines.push(`Email: ${lead.email}`);
  if (lead.address) lines.push(`Address: ${lead.address}`);
  if (lead.message) lines.push(`Message: ${lead.message}`);

  try {
    const msg = await client.messages.create({
      body: lines.join("\n"),
      from: fromNumber,
      to,
    });
    console.log("[sms] Admin SMS sent:", msg.sid);
  } catch (err) {
    console.error("[sms] Admin SMS error:", err);
  }
}
