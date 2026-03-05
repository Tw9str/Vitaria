import { SITE } from "@/lib/core/site";
import { getPublicUrl } from "@/lib/storage/url";

// sendEmail (not sendEmailSafe): failure surfaces as an error to the admin
// attempting sign-in so they know the magic link was never delivered.

const BG = "#0b0f12";
const CARD = "#14181c";
const BORDER = "#1c2128";
const TEXT = "#eae6e0";
const MUTED = "#b9b4ac";
const SUBTLE = "#8b8680";
const GOLD = "#c9a35a";

export function buildMagicLinkEmail(url: string): {
  subject: string;
  html: string;
} {
  const name = SITE.name;
  const siteUrl = SITE.url;
  const logo = getPublicUrl("logo.png");

  return {
    subject: `Sign in to ${name} admin`,
    html: `<!DOCTYPE html>
<html lang="en" xmlns:v="urn:schemas-microsoft-com:vml" xmlns:o="urn:schemas-microsoft-com:office:office">
<head>
<meta charset="UTF-8"/>
<meta name="viewport" content="width=device-width,initial-scale=1"/>
<meta name="color-scheme" content="dark"/>
<meta name="supported-color-schemes" content="dark"/>
<title>Sign in - ${name}</title>
<!--[if mso]><noscript><xml><o:OfficeDocumentSettings><o:PixelsPerInch>96</o:PixelsPerInch></o:OfficeDocumentSettings></xml></noscript><![endif]-->
</head>
<body bgcolor="${BG}" style="margin:0;padding:0;background:${BG};font-family:'Segoe UI',Arial,Helvetica,sans-serif;-webkit-text-size-adjust:100%;mso-line-height-rule:exactly;">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" bgcolor="${BG}" style="background:${BG};">
<tr><td align="center" bgcolor="${BG}" style="background:${BG};padding:64px 16px 64px;">

<table role="presentation" width="440" cellpadding="0" cellspacing="0" style="max-width:440px;width:100%;">

  <!-- LOGO -->
  <tr>
    <td bgcolor="${BG}" align="center" style="background:${BG};padding-bottom:28px;">
      <a href="${siteUrl}" target="_blank" rel="noopener noreferrer" style="display:inline-block;text-decoration:none;">
        <img src="${logo}" alt="${name}" width="100" height="auto"
            style="display:block;width:100px;height:auto;border:0;"/>
      </a>
    </td>
  </tr>

  <!-- CARD -->
  <tr>
    <td bgcolor="${CARD}" align="center" style="background:${CARD};border:1px solid ${BORDER};border-top:3px solid ${GOLD};border-radius:16px;mso-border-alt:none;padding:40px 32px 36px;text-align:center;">

      <h2 style="margin:0 0 10px;font-size:22px;font-weight:800;letter-spacing:-0.01em;color:${TEXT};">Sign in to admin</h2>
      <p style="margin:0 0 32px;font-size:14px;line-height:1.75;color:${MUTED};">
        Click below to securely access the <strong style="color:${TEXT};">${name}</strong> admin panel.<br/>
        <span style="font-size:12px;color:${SUBTLE};">Link expires in 10 minutes.</span>
      </p>

      <table role="presentation" cellpadding="0" cellspacing="0" align="center">
        <tr>
          <td bgcolor="${GOLD}" style="background:${GOLD};border-radius:999px;mso-border-alt:none;">
            <a href="${url}" target="_blank" rel="noopener noreferrer" style="display:inline-block;padding:14px 36px;font-size:15px;font-weight:800;letter-spacing:0.02em;color:#08100c;text-decoration:none;line-height:1;white-space:nowrap;">
              Sign in &rarr;
            </a>
          </td>
        </tr>
      </table>

      <p style="margin:28px 0 0;font-size:11px;color:${SUBTLE};">
        Didn't request this? You can safely ignore this email.
      </p>
    </td>
  </tr>

  <!-- FOOTER -->
  <tr>
    <td bgcolor="${BG}" align="center" style="background:${BG};padding:22px 0 0;">
      <p style="margin:0;font-size:11px;color:${SUBTLE};line-height:1.6;">
        ${name}&nbsp;&middot;&nbsp;
        <a href="${siteUrl}" target="_blank" rel="noopener noreferrer" style="color:${SUBTLE};text-decoration:none;">${siteUrl}</a>
      </p>
    </td>
  </tr>

</table>

</td></tr>
</table>
</body>
</html>`,
  };
}
