import type { LeadInput } from "@/lib/validation/validators";
import { SITE } from "@/lib/core/site";

// ─── Brand tokens ─────────────────────────────────────────────────────────────
// Solid-color equivalents of globals.css dark theme. Dark backgrounds render
// correctly in Outlook (via bgcolor attrs), Gmail (already dark = no inversion),
// Apple Mail and Outlook.com.

const PAGE_BG    = "#0b0f12"; // --color-bg
const HEADER_BG  = "#163524"; // brand-ink (dark green header band)
const CARD_BG    = "#141a1e"; // --color-surface equivalent
const PANEL_BG   = "#111418"; // slightly darker panel inside card
const BORDER     = "#1e2428"; // --color-border equivalent
const ROW_SEP    = "#1a2024"; // row separator
const TEXT       = "#eae6e0"; // --color-text equivalent
const MUTED      = "#b8b3ab"; // --color-muted equivalent
const SUBTLE     = "#8a8580"; // --color-subtle equivalent
const GOLD       = "#c9a35a"; // --color-gold
const GOLD_DARK  = "#9f7b37"; // darker gold for text on gold bg
const BRAND_LINK = "#7fb88a"; // light muted green for links (readable on dark)

// ─── Safety helpers ───────────────────────────────────────────────────────────

function escapeHtml(value: string): string {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

function safeText(value?: string | null): string | null {
  if (!value) return null;
  const trimmed = value.trim();
  return trimmed ? escapeHtml(trimmed) : null;
}

function safeUrl(value?: string | null): string | null {
  if (!value) return null;
  const trimmed = value.trim();
  if (!trimmed) return null;
  try {
    const url = new URL(trimmed);
    if (url.protocol !== "http:" && url.protocol !== "https:") return null;
    return escapeHtml(trimmed);
  } catch {
    return null;
  }
}

function formatDate(date?: Date): string | null {
  if (!date) return null;
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  }).format(date);
}

// ─── Layout primitives ────────────────────────────────────────────────────────

function row(label: string, value: string | null): string {
  if (!value) return "";
  return `
  <tr>
    <td width="110" style="padding:10px 14px 10px 0;vertical-align:top;font-size:11px;font-weight:700;letter-spacing:0.09em;text-transform:uppercase;color:${SUBTLE};white-space:nowrap;">${escapeHtml(label)}</td>
    <td style="padding:10px 0;vertical-align:top;font-size:14px;line-height:1.6;color:${TEXT};border-bottom:1px solid ${ROW_SEP};">${value}</td>
  </tr>`;
}

function pill(label: string, accent = false): string {
  const bg     = accent ? GOLD     : "#1e2a24";
  const fg     = accent ? GOLD_DARK : BRAND_LINK;
  const border = accent ? GOLD_DARK : "#2a3c30";
  return `<span style="display:inline-block;padding:4px 12px;border:1px solid ${border};border-radius:999px;background:${bg};font-size:11px;font-weight:800;letter-spacing:0.1em;text-transform:uppercase;color:${fg};">${escapeHtml(label)}</span>`;
}

// Rounded-full table button — matches website's rounded-full pill buttons
function btn(href: string, label: string, primary = true): string {
  if (primary) {
    return `<table role="presentation" cellpadding="0" cellspacing="0" style="display:inline-table;"><tr>
    <td bgcolor="${GOLD}" style="background:${GOLD};border:1px solid ${GOLD_DARK};border-radius:999px;">
      <a href="${href}" style="display:inline-block;padding:11px 24px;font-size:13px;font-weight:800;color:#0f1e14;text-decoration:none;line-height:1;white-space:nowrap;">${escapeHtml(label)}</a>
    </td></tr></table>`;
  }
  return `<table role="presentation" cellpadding="0" cellspacing="0" style="display:inline-table;"><tr>
    <td bgcolor="${BORDER}" style="background:${BORDER};border:1px solid #2a3540;border-radius:999px;">
      <a href="${href}" style="display:inline-block;padding:11px 24px;font-size:13px;font-weight:700;color:${MUTED};text-decoration:none;line-height:1;white-space:nowrap;">${escapeHtml(label)}</a>
    </td></tr></table>`;
}

// ─── Shell ────────────────────────────────────────────────────────────────────
// Dark outer wrap → brand-ink header → gold rule → dark card (website surface
// card style: border + bg-surface + rounded-2xl). No overflow:hidden. Both
// bgcolor attr AND background CSS for full Outlook compatibility.

function shell(body: string): string {
  const siteUrl  = escapeHtml(SITE.url);
  const siteName = escapeHtml(SITE.name);
  const legal    = escapeHtml(SITE.legalName);

  return `<!DOCTYPE html>
<html lang="en" xmlns:v="urn:schemas-microsoft-com:vml">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width,initial-scale=1.0" />
  <meta name="color-scheme" content="dark" />
  <meta name="supported-color-schemes" content="dark" />
  <title>${siteName}</title>
  <!--[if mso]><noscript><xml><o:OfficeDocumentSettings>
    <o:PixelsPerInch>96</o:PixelsPerInch>
  </o:OfficeDocumentSettings></xml></noscript><![endif]-->
</head>
<body style="margin:0;padding:0;background:${PAGE_BG};font-family:'Segoe UI',Arial,Helvetica,sans-serif;-webkit-text-size-adjust:100%;color:${TEXT};">

<table role="presentation" width="100%" cellpadding="0" cellspacing="0" bgcolor="${PAGE_BG}" style="background:${PAGE_BG};">
  <tr>
    <td align="center" style="padding:40px 16px 48px;">

      <table role="presentation" width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;">

        <!-- HEADER: brand-ink green band -->
        <tr>
          <td bgcolor="${HEADER_BG}" style="background:${HEADER_BG};padding:22px 30px;border-radius:16px 16px 0 0;mso-border-alt:none;">
            <table role="presentation" width="100%" cellpadding="0" cellspacing="0"><tr>
              <td style="vertical-align:middle;">
                <span style="font-size:15px;font-weight:800;letter-spacing:0.24em;text-transform:uppercase;color:#ffffff;">${siteName}</span>
              </td>
              <td align="right" style="vertical-align:middle;">
                <a href="${siteUrl}" style="font-size:11px;color:rgba(255,255,255,0.35);text-decoration:none;">${siteUrl}</a>
              </td>
            </tr></table>
          </td>
        </tr>

        <!-- GOLD SEPARATOR -->
        <tr>
          <td bgcolor="${GOLD}" height="2" style="background:${GOLD};height:2px;font-size:0;line-height:0;">&nbsp;</td>
        </tr>

        <!-- CARD: matches website "rounded-2xl border border-border bg-surface" -->
        <tr>
          <td bgcolor="${CARD_BG}" style="background:${CARD_BG};padding:32px 30px 28px;border:1px solid ${BORDER};border-top:none;border-radius:0 0 16px 16px;mso-border-alt:none;">
            ${body}
          </td>
        </tr>

        <!-- FOOTER -->
        <tr>
          <td style="padding:20px 0 0;text-align:center;">
            <p style="margin:0;font-size:11px;color:#484340;line-height:1.7;">
              ${legal}&nbsp;&middot;&nbsp;<a href="${siteUrl}" style="color:#484340;text-decoration:none;">${siteUrl}</a>
            </p>
            <p style="margin:4px 0 0;font-size:11px;color:#363230;line-height:1.7;">
              You are receiving this because you contacted ${siteName}.
            </p>
          </td>
        </tr>

      </table>
    </td>
  </tr>
</table>

</body>
</html>`;
}

// ─── Types ────────────────────────────────────────────────────────────────────

export type LeadEmailData = LeadInput & {
  id?: string;
  createdAt?: Date;
};

// ─── Admin notification ───────────────────────────────────────────────────────

export function buildAdminLeadNotification(lead: LeadEmailData): {
  subject: string;
  html: string;
} {
  const subject = `New wholesale inquiry — ${lead.company}`;
  const name    = safeText(lead.name);
  const email   = safeText(lead.email);
  const company = safeText(lead.company) ?? "New inquiry";
  const type    = safeText(lead.type);
  const region  = safeText(lead.region);
  const website = safeUrl(lead.website);
  const message = safeText(lead.message);
  const date    = formatDate(lead.createdAt);

  const html = shell(`

    <!-- HEADING -->
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin:0 0 24px;"><tr>
      <td style="vertical-align:top;">
        <p style="margin:0 0 4px;font-size:11px;font-weight:700;letter-spacing:0.1em;text-transform:uppercase;color:${SUBTLE};">Wholesale inquiry</p>
        <h1 style="margin:0;font-size:24px;font-weight:800;line-height:1.2;color:${TEXT};">${company}</h1>
        ${date ? `<p style="margin:7px 0 0;font-size:12px;color:${SUBTLE};">${escapeHtml(date)}</p>` : ""}
      </td>
      <td align="right" style="vertical-align:top;padding-left:16px;">${pill("New", true)}</td>
    </tr></table>

    <!-- CONTACT PANEL: matches website sidebar card -->
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0"
      style="border:1px solid ${BORDER};border-radius:16px;margin:0 0 20px;">
      <tr><td bgcolor="${PANEL_BG}" style="background:${PANEL_BG};padding:4px 18px 14px;border-radius:16px;">
        <p style="margin:14px 0 8px;font-size:11px;font-weight:700;letter-spacing:0.09em;text-transform:uppercase;color:${SUBTLE};">Contact details</p>
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
          ${row("Name",    name)}
          ${row("Email",   email   ? `<a href="mailto:${email}" style="color:${BRAND_LINK};text-decoration:none;font-weight:600;">${email}</a>` : null)}
          ${row("Type",    type)}
          ${row("Region",  region)}
          ${row("Website", website ? `<a href="${website}" style="color:${BRAND_LINK};text-decoration:none;font-weight:600;">${website}</a>` : null)}
        </table>
      </td></tr>
    </table>

    ${message ? `
    <!-- MESSAGE PANEL -->
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0"
      style="border:1px solid ${BORDER};border-radius:16px;margin:0 0 24px;">
      <tr><td bgcolor="${GOLD}" height="2" style="background:${GOLD};height:2px;font-size:0;line-height:0;border-radius:16px 16px 0 0;">&nbsp;</td></tr>
      <tr><td bgcolor="${PANEL_BG}" style="background:${PANEL_BG};padding:16px 18px;border-radius:0 0 16px 16px;">
        <p style="margin:0 0 8px;font-size:11px;font-weight:700;letter-spacing:0.09em;text-transform:uppercase;color:${SUBTLE};">Message</p>
        <p style="margin:0;font-size:14px;line-height:1.8;color:${TEXT};white-space:pre-wrap;">${message}</p>
      </td></tr>
    </table>` : ""}

    ${lead.id && email ? `
    <!-- ACTIONS -->
    <table role="presentation" cellpadding="0" cellspacing="0"><tr>
      <td style="padding-right:10px;">${btn(`${escapeHtml(SITE.url)}/admin/leads`, "Open admin", true)}</td>
      <td>${btn(`mailto:${email}`, "Reply to lead", false)}</td>
    </tr></table>` : ""}

  `);

  return { subject, html };
}

// ─── Lead confirmation ────────────────────────────────────────────────────────

export function buildLeadConfirmation(lead: LeadEmailData): {
  subject: string;
  html: string;
} {
  const subject   = `We received your inquiry — ${SITE.name}`;
  const name      = safeText(lead.name) ?? "there";
  const firstName = escapeHtml((lead.name?.trim().split(/\s+/)[0] || "there").trim());
  const company   = safeText(lead.company);
  const type      = safeText(lead.type);
  const region    = safeText(lead.region);
  const email     = safeText(lead.email);
  const siteEmail = escapeHtml(SITE.email);

  const html = shell(`

    <!-- STATUS PILL -->
    <p style="margin:0 0 16px;">${pill("Inquiry received")}</p>

    <!-- HEADING -->
    <h1 style="margin:0 0 10px;font-size:24px;font-weight:800;line-height:1.2;color:${TEXT};">
      Thank you, ${firstName}.
    </h1>
    <p style="margin:0 0 24px;font-size:15px;line-height:1.8;color:${MUTED};">
      We received your wholesale inquiry${company ? ` for <strong style="color:${TEXT};">${company}</strong>` : ""}.
      Our team will review your details and be in touch with catalog, pricing, and next steps within one business day.
    </p>

    <!-- SUMMARY PANEL -->
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0"
      style="border:1px solid ${BORDER};border-radius:16px;margin:0 0 24px;">
      <tr><td bgcolor="${PANEL_BG}" style="background:${PANEL_BG};padding:4px 18px 14px;border-radius:16px;">
        <p style="margin:14px 0 8px;font-size:11px;font-weight:700;letter-spacing:0.09em;text-transform:uppercase;color:${SUBTLE};">Your inquiry summary</p>
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
          ${row("Name",    name)}
          ${row("Company", company)}
          ${row("Type",    type)}
          ${row("Region",  region)}
          ${row("Email",   email)}
        </table>
      </td></tr>
    </table>

    <!-- ACTIONS -->
    <table role="presentation" cellpadding="0" cellspacing="0" style="margin:0 0 24px;"><tr>
      <td style="padding-right:10px;">${btn(`mailto:${siteEmail}`, "Email us", true)}</td>
      <td>${btn(`${escapeHtml(SITE.url)}`, "Visit website", false)}</td>
    </tr></table>

    <!-- SIGN-OFF -->
    <p style="margin:0;font-size:13px;line-height:1.9;color:${MUTED};">
      Warm regards,<br />
      <strong style="color:${TEXT};">The ${escapeHtml(SITE.name)} Wholesale Team</strong><br />
      <a href="mailto:${siteEmail}" style="color:${BRAND_LINK};text-decoration:none;">${siteEmail}</a>
    </p>

  `);

  return { subject, html };
}
