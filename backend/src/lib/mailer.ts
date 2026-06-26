import nodemailer from "nodemailer";
import { query } from "../db";

const SMTP_PORT = Number(process.env.SMTP_PORT ?? 587);

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST ?? "smtp.resend.com",
  port: SMTP_PORT,
  secure: SMTP_PORT === 465, // 465 = SSL trực tiếp; 587/2587 = STARTTLS
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

// Tạo bản text thuần từ HTML — email có cả text + html ít bị đánh spam hơn.
function htmlToText(html: string): string {
  return html
    .replace(/<style[\s\S]*?<\/style>/gi, "")
    .replace(/<!--[\s\S]*?-->/g, "")
    .replace(/<br\s*\/?>/gi, "\n")
    .replace(/<\/(p|div|tr|h[1-6]|table)>/gi, "\n")
    .replace(/<[^>]+>/g, "")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/[ \t]+/g, " ")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

async function getNotificationEmail(): Promise<string | null> {
  try {
    const result = await query(
      "select value from admin_settings where key = $1",
      ["notification_email"]
    );
    return result.rows[0]?.value ?? null;
  } catch {
    return null;
  }
}

export interface LeadEmailData {
  name: string;
  phone: string;
  email?: string | null;
  address?: string | null;
  service: string;
  message?: string | null;
  source: string;
}

export async function sendLeadEmails(lead: LeadEmailData): Promise<void> {
  if (!process.env.SMTP_USER || !process.env.SMTP_PASS) {
    console.warn("[mailer] SMTP_USER / SMTP_PASS chưa cấu hình — bỏ qua gửi mail.");
    return;
  }

  const from =
    process.env.SMTP_FROM ?? `"Glenn's Plumbing NYC" <${process.env.SMTP_USER}>`;
  const replyTo = process.env.SMTP_REPLY_TO || undefined;
  const siteUrl = process.env.SITE_URL ?? "http://localhost:5173";
  const notifyEmail = await getNotificationEmail();

  const tasks: Promise<unknown>[] = [];

  // 1. Thông báo cho admin
  if (notifyEmail) {
    const adminHtml = buildAdminHtml(lead, siteUrl);
    tasks.push(
      transporter
        .sendMail({
          from,
          to: notifyEmail,
          replyTo: lead.email || replyTo,
          subject: `New Quote Request — ${lead.name}`,
          html: adminHtml,
          text: htmlToText(adminHtml),
        })
        .then((info) => console.log("[mailer] Admin email sent:", info.messageId))
        .catch((err) => console.error("[mailer] Admin email error:", err))
    );
  }

  // 2. Xác nhận cho khách (chỉ khi họ nhập email)
  if (lead.email) {
    const userHtml = buildUserHtml(lead);
    tasks.push(
      transporter
        .sendMail({
          from,
          to: lead.email,
          replyTo,
          subject: "We received your quote request — Glenn's Plumbing NYC",
          html: userHtml,
          text: htmlToText(userHtml),
          headers: {
            "List-Unsubscribe": "<mailto:" + (replyTo ?? process.env.SMTP_USER) + "?subject=unsubscribe>",
          },
        })
        .then((info) => console.log("[mailer] User email sent:", info.messageId))
        .catch((err) => console.error("[mailer] User email error:", err))
    );
  }

  await Promise.allSettled(tasks);
}

// ─── HTML templates ───────────────────────────────────────────────────────────

// Nút CTA bo tròn (kèm fallback VML cho Outlook). Dùng chung cho cả 2 email.
function ctaButton(href: string, label: string, width: number): string {
  return `<!--[if mso]><v:roundrect xmlns:v="urn:schemas-microsoft-com:vml" xmlns:w="urn:schemas-microsoft-com:office:word" href="${href}" style="height:50px;v-text-anchor:middle;width:${width}px;" arcsize="50%" fillcolor="#2563EB" stroke="f"><w:anchorlock/><center style="color:#ffffff;font-family:Helvetica,Arial,sans-serif;font-size:16px;font-weight:bold;"><![endif]-->
              <a class="btn-cta" href="${href}" style="background:#2563EB; color:#ffffff; display:inline-block; font-family:'Manrope',Helvetica,Arial,sans-serif; font-size:16px; font-weight:700; line-height:50px; text-align:center; text-decoration:none; width:${width}px; border-radius:25px; box-shadow:0 8px 20px rgba(37,99,235,0.32); letter-spacing:0.2px;">
                ${label}
              </a>
              <!--[if mso]></center></v:roundrect><![endif]-->`;
}

// Footer dùng chung; chỉ dòng meta dưới cùng khác nhau giữa 2 loại email.
function footerBlock(metaHtml: string): string {
  return `
              <div style="height:1px; line-height:1px; font-size:0; background:#E2E8F0; margin-bottom:24px;">&nbsp;</div>
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td align="center">
                    <div style="font-family:'Sora','Manrope',Helvetica,Arial,sans-serif; font-weight:700; font-size:14px; color:#1E3A5F; letter-spacing:-0.1px;">Glenn's Plumbing NYC</div>
                    <div style="font-size:12.5px; color:#64748B; line-height:1.7; margin-top:7px;">
                      Licensed &amp; Insured · Serving all five boroughs<br>
                      Mon–Sat, 7am–8pm · Emergency service available
                    </div>
                    <div style="font-size:11.5px; color:#94A3B8; margin-top:16px;">
                      ${metaHtml}
                    </div>
                  </td>
                </tr>
              </table>`;
}

// Khung email dùng chung (header navy + body + thẻ summary + CTA + footer).
function renderEmail(opts: {
  preheader: string;
  headerSubtitle: string;
  bodyHtml: string;
  summaryTitle: string;
  summaryRows: string;
  ctaHelper: string;
  ctaHref: string;
  ctaLabel: string;
  ctaWidth: number;
  footerHtml: string;
}): string {
  const helper = opts.ctaHelper
    ? `<p style="margin:0 0 16px 0; font-size:15px; color:#64748B;">${opts.ctaHelper}</p>`
    : "";
  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<meta name="x-apple-disable-message-reformatting">
<title>Glenn's Plumbing NYC</title>
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Manrope:wght@400;500;600;700;800&family=Sora:wght@600;700;800&display=swap" rel="stylesheet">
<style>
  body { margin:0; padding:0; width:100% !important; -webkit-text-size-adjust:100%; -ms-text-size-adjust:100%; }
  table { border-collapse:collapse; mso-table-lspace:0pt; mso-table-rspace:0pt; }
  img { border:0; line-height:100%; outline:none; text-decoration:none; -ms-interpolation-mode:bicubic; }
  a { text-decoration:none; }
  .btn-cta:hover { background:#1D4ED8 !important; }

  @media only screen and (max-width:620px) {
    .container { width:100% !important; }
    .px { padding-left:24px !important; padding-right:24px !important; }
    .card-px { padding-left:22px !important; padding-right:22px !important; }
    .h1 { font-size:23px !important; }
  }
</style>
</head>
<body style="margin:0; padding:0; background:#ffffff; font-family:'Manrope',-apple-system,BlinkMacSystemFont,'Segoe UI',Helvetica,Arial,sans-serif;">

  <div style="display:none; max-height:0; overflow:hidden; opacity:0; color:transparent; height:0; width:0;">
    ${opts.preheader}
  </div>

  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#ffffff;">
    <tr>
      <td align="center" style="padding:40px 16px;">

        <table role="presentation" class="container" width="600" cellpadding="0" cellspacing="0" style="width:600px; max-width:600px; background:#faf7f2; border-radius:18px; overflow:hidden; box-shadow:0 18px 48px rgba(20,40,70,0.10);">

          <!-- HEADER -->
          <tr>
            <td style="background:#1E3A5F;">
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td class="px" style="padding:38px 44px 40px 44px;">
                    <table role="presentation" cellpadding="0" cellspacing="0">
                      <tr>
                        <td valign="middle">
                          <div class="h1" style="font-family:'Sora','Manrope',Helvetica,Arial,sans-serif; font-weight:800; font-size:25px; line-height:1.1; color:#ffffff; letter-spacing:-0.3px;">
                            Glenn's Plumbing
                            <span style="color:#8FB4F2; font-weight:700;">NYC</span>
                          </div>
                          <div style="font-family:'Manrope',Helvetica,Arial,sans-serif; font-size:13px; font-weight:500; color:#AEC4DD; letter-spacing:0.4px; margin-top:5px;">
                            ${opts.headerSubtitle}
                          </div>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
          <tr><td style="height:4px; line-height:4px; font-size:0; background:#2563EB;">&nbsp;</td></tr>

          <!-- BODY -->
          <tr>
            <td class="px" style="padding:40px 44px 8px 44px;">${opts.bodyHtml}
            </td>
          </tr>

          <!-- SUMMARY CARD -->
          <tr>
            <td class="px" style="padding:18px 44px 8px 44px;">
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#ffffff; border:1px solid #E2E8F0; border-radius:14px; box-shadow:0 8px 24px rgba(30,58,95,0.08);">
                <tr>
                  <td class="card-px" style="padding:28px 30px 26px 30px;">

                    <div style="font-family:'Manrope',Helvetica,Arial,sans-serif; font-size:11.5px; font-weight:700; letter-spacing:1.6px; color:#2563EB; text-transform:uppercase; padding-bottom:6px;">
                      ${opts.summaryTitle}
                    </div>
                    <div style="height:1px; line-height:1px; font-size:0; background:#E2E8F0; margin:14px 0 20px 0;">&nbsp;</div>
${opts.summaryRows}
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- CTA -->
          <tr>
            <td class="px" align="center" style="padding:34px 44px 10px 44px;">
              ${helper}${ctaButton(opts.ctaHref, opts.ctaLabel, opts.ctaWidth)}
            </td>
          </tr>

          <!-- FOOTER -->
          <tr>
            <td style="padding:30px 44px 36px 44px;">${opts.footerHtml}
            </td>
          </tr>

        </table>

      </td>
    </tr>
  </table>

</body>
</html>`;
}

function buildAdminHtml(lead: LeadEmailData, siteUrl: string): string {
  const name = esc(lead.name) || "Unknown";

  // Mọi trường của lead đều hiển thị; Email/Address/Message ẩn nếu trống.
  const rows = [
    summaryRow(ICON_USER, "Name", esc(lead.name)),
    summaryRow(ICON_PHONE, "Phone", esc(lead.phone)),
    lead.email ? summaryRow(ICON_MAIL, "Email", esc(lead.email)) : "",
    lead.address ? summaryRow(ICON_PIN, "Address", esc(lead.address)) : "",
    summaryRow(ICON_SERVICE, "Service", esc(lead.service)),
    summaryRow(ICON_TAG, "Source", esc(lead.source)),
    lead.message ? summaryRow(ICON_MSG, "Message", esc(lead.message).replace(/\r?\n/g, "<br>")) : "",
  ].filter(Boolean);
  const lastIdx = rows.length - 1;
  rows[lastIdx] = rows[lastIdx].replace(' style="margin-bottom:18px;"', "");
  const summaryRows = rows.join("\n");

  return renderEmail({
    preheader: `New quote request from ${name}`,
    headerSubtitle: "New quote request",
    bodyHtml: `
              <p style="margin:0 0 18px 0; font-size:18px; line-height:1.5; color:#1E3A5F;">
                New quote request from <strong style="font-weight:700;">${name}</strong>
              </p>
              <p style="margin:0 0 16px 0; font-size:15.5px; line-height:1.72; color:#64748B; font-weight:400;">
                A new lead just came in through the website. Full details are below — open the
                dashboard to follow up.
              </p>`,
    summaryTitle: "Lead Details",
    summaryRows,
    ctaHelper: "",
    ctaHref: `${siteUrl}/admin`,
    ctaLabel: "Open Admin Dashboard",
    ctaWidth: 260,
    footerHtml: footerBlock(
      "Internal notification · This lead has been saved to your admin dashboard."
    ),
  });
}

// Escape các giá trị do khách nhập trước khi nhúng vào HTML (tránh vỡ layout / injection).
function esc(value: string | null | undefined): string {
  return String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

// Một dòng trong "Request Summary" của email khách (icon + nhãn + giá trị).
function summaryRow(icon: string, label: string, valueHtml: string, last = false): string {
  return `
                    <table role="presentation" width="100%" cellpadding="0" cellspacing="0"${last ? "" : ' style="margin-bottom:18px;"'}>
                      <tr>
                        <td valign="top" width="40" style="padding-top:2px;">
                          <span style="display:inline-block; width:34px; height:34px; background:#EEF3FE; border-radius:9px; text-align:center; line-height:34px;">
                            <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="#2563EB" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="vertical-align:middle;">${icon}</svg>
                          </span>
                        </td>
                        <td valign="top" style="padding-left:14px;">
                          <div style="font-size:11.5px; font-weight:600; letter-spacing:0.6px; text-transform:uppercase; color:#64748B; padding-top:1px;">${label}</div>
                          <div style="font-size:15.5px; font-weight:600; color:#1E3A5F; margin-top:3px; line-height:1.6;">${valueHtml}</div>
                        </td>
                      </tr>
                    </table>`;
}

const ICON_SERVICE = `<path d="M14.7 6.3a4 4 0 0 0-5.2 5.2l-6 6a1.5 1.5 0 0 0 2.1 2.1l6-6a4 4 0 0 0 5.2-5.2l-2.4 2.4-2.1-.6-.6-2.1z"/>`;
const ICON_PHONE = `<path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.8 19.8 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.8 19.8 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.13.96.36 1.9.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.9.34 1.85.57 2.81.7A2 2 0 0 1 22 16.92z"/>`;
const ICON_MAIL = `<path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/>`;
const ICON_PIN = `<path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/>`;
const ICON_MSG = `<path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"/>`;
const ICON_USER = `<path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/>`;
const ICON_TAG = `<path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z"/><line x1="7" y1="7" x2="7.01" y2="7"/>`;

function buildUserHtml(lead: LeadEmailData): string {
  const name = esc(lead.name) || "there";
  const service = esc(lead.service) || "your request";

  // Chỉ render các dòng có dữ liệu — đảm bảo mọi thông tin khách gửi đều xuất hiện,
  // không để lại ô trống. Service & Phone luôn có; Email/Address/Message tùy chọn.
  const rows = [
    summaryRow(ICON_SERVICE, "Service", esc(lead.service)),
    summaryRow(ICON_PHONE, "Phone", esc(lead.phone)),
    lead.email ? summaryRow(ICON_MAIL, "Email", esc(lead.email)) : "",
    lead.address ? summaryRow(ICON_PIN, "Address", esc(lead.address)) : "",
    lead.message
      ? summaryRow(ICON_MSG, "Message", esc(lead.message).replace(/\r?\n/g, "<br>"), true)
      : "",
  ].filter(Boolean);
  // Bỏ margin-bottom ở dòng cuối cùng để khoảng cách dưới cùng cân đối.
  const lastIdx = rows.length - 1;
  rows[lastIdx] = rows[lastIdx].replace(' style="margin-bottom:18px;"', "");
  const summaryRows = rows.join("\n");

  return renderEmail({
    preheader: "We've received your free quote request — our team will be in touch shortly.",
    headerSubtitle: "We've received your request",
    bodyHtml: `
              <p style="margin:0 0 18px 0; font-size:18px; line-height:1.5; color:#1E3A5F;">
                Hi <strong style="font-weight:700;">${name}</strong>,
              </p>
              <p style="margin:0 0 16px 0; font-size:15.5px; line-height:1.72; color:#64748B; font-weight:400;">
                Thank you for reaching out to Glenn's Plumbing. We've received your free quote
                request for <strong style="color:#1E3A5F; font-weight:600;">${service}</strong> and a member of our
                team will get back to you as soon as possible.
              </p>`,
    summaryTitle: "Your Request Summary",
    summaryRows,
    ctaHelper: "Need help right away?",
    ctaHref: "tel:+16469632616",
    ctaLabel: "&#9742;&nbsp; Call (646) 963-2616",
    ctaWidth: 230,
    footerHtml: footerBlock(
      `You're receiving this email because you requested a quote at <a href="https://glennph.com" style="color:#2563EB; font-weight:600; text-decoration:none;">glennph.com</a>`
    ),
  });
}
