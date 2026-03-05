import type { LeadInput } from "@/lib/validation/validators";
import { SITE } from "@/lib/core/site";
import { getPublicUrl } from "@/lib/storage/url";

// ─── Tokens - exact app colour palette, solid equivalents of CSS vars ─────────
const BG = "#0b0f12"; // --color-bg
const CARD = "#14181c"; // --color-surface (rgba 255 255 255 0.06 on BG)
const INNER = "#111519"; // slightly darker for inset rows
const BORDER = "#1c2128"; // --color-border (rgba 255 255 255 0.12 on BG)
const SEP = "#161b20"; // row separator
const TEXT = "#eae6e0"; // --color-text
const MUTED = "#b9b4ac"; // --color-muted
const SUBTLE = "#8b8680"; // --color-subtle
const GOLD = "#c9a35a"; // --color-gold
const GOLD_BG = "#110e07"; // very dark gold tint - CTA button fill in Outlook

// ─── Utils ────────────────────────────────────────────────────────────────────
function esc(v: string): string {
  return v
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}
function st(v?: string | null): string | null {
  if (!v) return null;
  const t = v.trim();
  return t ? esc(t) : null;
}
function su(v?: string | null): string | null {
  if (!v) return null;
  const t = v.trim();
  try {
    const u = new URL(t);
    if (u.protocol !== "http:" && u.protocol !== "https:") return null;
    return esc(t);
  } catch {
    return null;
  }
}
function fd(d?: Date): string | null {
  if (!d) return null;
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  }).format(d);
}

// ─── Row: label above value ───────────────────────────────────────────────────
function row(label: string, value: string | null, last = false): string {
  if (!value) return "";
  return `<tr>
  <td bgcolor="${INNER}" style="background:${INNER};padding:12px 20px;${last ? "" : `border-bottom:1px solid ${SEP};`}">
    <p style="margin:0 0 2px;font-size:10px;font-weight:700;letter-spacing:0.09em;text-transform:uppercase;color:${SUBTLE};">${esc(label)}</p>
    <p style="margin:0;font-size:14px;line-height:1.55;color:${TEXT};">${value}</p>
  </td>
</tr>`;
}

// ─── Primary CTA button ───────────────────────────────────────────────────────
function btn(href: string, label: string): string {
  return `<table role="presentation" cellpadding="0" cellspacing="0" align="center">
  <tr>
    <td bgcolor="${GOLD}" style="background:${GOLD};border-radius:999px;mso-border-alt:none;padding:0;">
      <a href="${href}" target="_blank" rel="noopener noreferrer" style="display:inline-block;padding:14px 32px;font-size:14px;font-weight:800;letter-spacing:0.02em;color:#08100c;text-decoration:none;line-height:1;white-space:nowrap;">${esc(label)}</a>
    </td>
  </tr>
</table>`;
}

// ─── Ghost secondary button ───────────────────────────────────────────────────
function ghost(href: string, label: string): string {
  return `<table role="presentation" cellpadding="0" cellspacing="0" align="center">
  <tr>
    <td style="border:1px solid ${BORDER};border-radius:999px;mso-border-alt:none;padding:0;">
      <a href="${href}" target="_blank" rel="noopener noreferrer" style="display:inline-block;padding:11px 28px;font-size:13px;font-weight:600;color:${MUTED};text-decoration:none;line-height:1;white-space:nowrap;">${esc(label)}</a>
    </td>
  </tr>
</table>`;
}

// ─── Shell ────────────────────────────────────────────────────────────────────
function shell(content: string, narrow = false): string {
  const logo = getPublicUrl("logo.png");
  const siteUrl = esc(SITE.url);
  const name = esc(SITE.name);
  const legal = esc(SITE.legalName);
  const w = narrow ? "520" : "600";

  return `<!DOCTYPE html>
<html lang="en" xmlns:v="urn:schemas-microsoft-com:vml" xmlns:o="urn:schemas-microsoft-com:office:office">
<head>
<meta charset="UTF-8"/>
<meta name="viewport" content="width=device-width,initial-scale=1"/>
<meta name="color-scheme" content="dark"/>
<meta name="supported-color-schemes" content="dark"/>
<title>${name}</title>
<!--[if mso]><noscript><xml><o:OfficeDocumentSettings><o:PixelsPerInch>96</o:PixelsPerInch></o:OfficeDocumentSettings></xml></noscript><![endif]-->
</head>
<body bgcolor="${BG}" style="margin:0;padding:0;background:${BG};font-family:'Segoe UI',Arial,Helvetica,sans-serif;-webkit-text-size-adjust:100%;mso-line-height-rule:exactly;">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" bgcolor="${BG}" style="background:${BG};">
<tr><td align="center" bgcolor="${BG}" style="background:${BG};padding:44px 16px 52px;">

<table role="presentation" width="${w}" cellpadding="0" cellspacing="0" style="max-width:${w}px;width:100%;">

  <!-- ── LOGO ─────────────────────────────────────── -->
  <tr>
    <td bgcolor="${BG}" align="center" style="background:${BG};padding-bottom:24px;">
      <a href="${siteUrl}" target="_blank" rel="noopener noreferrer" style="display:inline-block;text-decoration:none;">
        <img src="${logo}" alt="${name}" width="110" height="auto"
            style="display:block;width:110px;height:auto;border:0;"/>
      </a>
    </td>
  </tr>

  <!-- ── MAIN CARD ─────────────────────────────────── -->
  <tr>
    <td bgcolor="${CARD}" style="background:${CARD};border:1px solid ${BORDER};border-top:3px solid ${GOLD};border-radius:16px;mso-border-alt:none;padding:36px 36px 32px;">
      ${content}
    </td>
  </tr>

  <!-- ── FOOTER ────────────────────────────────────── -->
  <tr>
    <td bgcolor="${BG}" align="center" style="background:${BG};padding:24px 0 0;">
      <p style="margin:0 0 3px;font-size:11px;line-height:1.6;color:${SUBTLE};">
        &copy; ${new Date().getFullYear()} ${legal}
        &nbsp;&middot;&nbsp;
        <a href="${siteUrl}" target="_blank" rel="noopener noreferrer" style="color:${SUBTLE};text-decoration:none;">${siteUrl}</a>
      </p>
      <p style="margin:0;font-size:10px;color:${SUBTLE};line-height:1.6;">
        You received this because you contacted ${name}.
      </p>
    </td>
  </tr>

</table>

</td></tr>
</table>
</body>
</html>`;
}

// ─── Types ────────────────────────────────────────────────────────────────────
export type LeadEmailData = LeadInput & {
  id?: string;
  createdAt?: Date;
  referrer?: string | null;
  ip?: string | null;
  userAgent?: string | null;
};

// ─── Admin notification ───────────────────────────────────────────────────────
export function buildAdminLeadNotification(lead: LeadEmailData): {
  subject: string;
  html: string;
} {
  const company = st(lead.company) ?? "New inquiry";
  const name = st(lead.name);
  const email = st(lead.email);
  const type = st(lead.type);
  const region = st(lead.region);
  const website = su(lead.website);
  const message = st(lead.message);
  const referrer = st(lead.referrer);
  const referrerUrl = su(lead.referrer);
  const ip = st(lead.ip);
  const userAgent = st(lead.userAgent);
  const date = fd(lead.createdAt);

  const content = `
    <p style="margin:0 0 6px;font-size:11px;font-weight:700;letter-spacing:0.1em;text-transform:uppercase;color:${SUBTLE};">New inquiry</p>
    <h1 style="margin:0 0 4px;font-size:26px;font-weight:800;line-height:1.15;color:${TEXT};">${company}</h1>
    ${date ? `<p style="margin:0 0 28px;font-size:12px;color:${SUBTLE};">${esc(date)}</p>` : `<div style="margin-bottom:28px;"></div>`}

    <!-- contact fields -->
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0"
      style="border:1px solid ${BORDER};border-radius:12px;overflow:hidden;margin-bottom:20px;">
      ${row("Contact name", name)}
      ${row("Email", email ? `<a href="mailto:${email}" target="_blank" rel="noopener noreferrer" style="color:${GOLD};text-decoration:none;">${email}</a>` : null)}
      ${row("Business type", type)}
      ${row("Region", region)}
      ${row("Website", website ? `<a href="${website}" target="_blank" rel="noopener noreferrer" style="color:${GOLD};text-decoration:none;">${website}</a>` : null)}
      ${row("Message", message ? `<span style="white-space:pre-wrap;">${message}</span>` : null)}
      ${row("Referrer", referrerUrl ? `<a href="${referrerUrl}" target="_blank" rel="noopener noreferrer" style="color:${GOLD};text-decoration:none;">${referrerUrl}</a>` : referrer)}
      ${row("IP address", ip)}
      ${row("User agent", userAgent, true)}
    </table>

    ${
      lead.id && email
        ? `
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
      <tr>
        <td align="center" style="padding-top:8px;">${btn(`${esc(SITE.url)}/admin/leads`, "Open in admin")}</td>
      </tr>
      <tr>
        <td align="center" style="padding-top:10px;">${ghost(`mailto:${email}`, `Reply to ${lead.name ?? "lead"}`)}</td>
      </tr>
    </table>`
        : ""
    }
  `;

  return {
    subject: `New inquiry - ${lead.company?.trim() || lead.name}`,
    html: shell(content),
  };
}

// ─── Customer confirmation ────────────────────────────────────────────────────
export function buildLeadConfirmation(lead: LeadEmailData): {
  subject: string;
  html: string;
} {
  const firstName = esc((lead.name?.trim().split(/\s+/)[0] || "there").trim());
  const name = st(lead.name) ?? "there";
  const company = st(lead.company);
  const email = st(lead.email);
  const website = su(lead.website);
  const message = st(lead.message);
  const siteEmail = esc(SITE.email);

  const content = `
    <h1 style="margin:0 0 16px;font-size:26px;font-weight:800;line-height:1.2;color:${TEXT};">
      Hi ${firstName},<br/>
      <span style="color:${GOLD};">we got your message.</span>
    </h1>

    <p style="margin:0 0 32px;font-size:15px;line-height:1.8;color:${MUTED};">
      Thanks for reaching out${company ? ` on behalf of <strong style="color:${TEXT};">${company}</strong>` : ""}. We've received your message and someone from our team will be in touch with you shortly.
    </p>

    <!-- full inquiry details -->
    <p style="margin:0 0 10px;font-size:10px;font-weight:700;letter-spacing:0.1em;text-transform:uppercase;color:${SUBTLE};">Your inquiry</p>
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0"
      style="border:1px solid ${BORDER};border-radius:12px;overflow:hidden;margin-bottom:28px;">
      ${row("Name", name)}
      ${row("Email", email)}
      ${row("Website", website ? `<a href="${website}" target="_blank" rel="noopener noreferrer" style="color:${GOLD};text-decoration:none;">${website}</a>` : null)}
      ${message ? row("Your message", `<span style="white-space:pre-wrap;">${message}</span>`, true) : ""}
    </table>

    <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
      <tr>
        <td align="center" style="padding-top:8px;">${btn(`mailto:${siteEmail}`, "Contact us")}</td>
      </tr>
      <tr>
        <td align="center" style="padding-top:10px;">${ghost(`${esc(SITE.url)}`, "Visit website")}</td>
      </tr>
    </table>

    <p style="margin:32px 0 0;font-size:13px;line-height:1.9;color:${MUTED};border-top:1px solid ${BORDER};padding-top:24px;">
      Warm regards,<br/>
      <strong style="color:${TEXT};">The ${esc(SITE.name)} Team</strong><br/>
      <a href="mailto:${siteEmail}" target="_blank" rel="noopener noreferrer" style="color:${GOLD};text-decoration:none;">${siteEmail}</a>
    </p>
  `;

  return {
    subject: `We received your inquiry - ${SITE.name}`,
    html: shell(content),
  };
}
