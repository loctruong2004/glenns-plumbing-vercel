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

const BIZ_PHONE = "(646) 963-2616";

export async function sendLeadSms(lead: LeadSmsData): Promise<void> {
  if (!client || !fromNumber) {
    console.warn(
      "[sms] TWILIO_ACCOUNT_SID / TWILIO_AUTH_TOKEN / TWILIO_FROM chưa cấu hình — bỏ qua gửi SMS."
    );
    return;
  }

  // Gửi 2 SMS độc lập, song song: thông báo cho admin + xác nhận cho khách.
  // Lỗi/thiếu cấu hình của cái này KHÔNG chặn cái kia.
  await Promise.allSettled([
    sendAdminSms(lead),
    sendCustomerSms(lead),
  ]);
}

// 1) Thông báo lead mới cho admin (số cấu hình ở /admin → notification_phone).
async function sendAdminSms(lead: LeadSmsData): Promise<void> {
  const rawTo = await getNotificationPhone();
  if (!rawTo) {
    console.warn("[sms] notification_phone chưa cấu hình ở /admin — bỏ qua SMS admin.");
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
    const msg = await client!.messages.create({
      body: lines.join("\n"),
      from: fromNumber,
      to,
    });
    console.log("[sms] Admin SMS sent:", msg.sid);
  } catch (err) {
    console.error("[sms] Admin SMS error:", err);
  }
}

// 2) Xác nhận cho khách (khách đã tick consent trên form → hợp lệ A2P/TCPA).
//    Kèm STOP/HELP theo yêu cầu opt-out của A2P 10DLC.
async function sendCustomerSms(lead: LeadSmsData): Promise<void> {
  const to = normalizePhone(lead.phone);
  if (!to) {
    console.error(`[sms] Số khách không hợp lệ, bỏ qua SMS xác nhận: ${lead.phone}`);
    return;
  }

  const firstName = lead.name.trim().split(/\s+/)[0] || "there";
  const body =
    `Hi ${firstName}, thanks for contacting Glenn's Plumbing! ` +
    `We received your request for ${lead.service} and will call you shortly. ` +
    `For emergencies call ${BIZ_PHONE}. Reply STOP to opt out, HELP for help.`;

  try {
    const msg = await client!.messages.create({
      body,
      from: fromNumber,
      to,
    });
    console.log("[sms] Customer SMS sent:", msg.sid);
  } catch (err) {
    console.error("[sms] Customer SMS error:", err);
  }
}
