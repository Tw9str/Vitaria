import { SITE } from "@/lib/core/site";

// Uses the same dark design system as lead templates.
// sendEmail (not sendEmailSafe) is intentional — if delivery fails, NextAuth
// surfaces an error so the admin knows the magic link was never sent.

const PAGE_BG   = "#0b0f12";
const HEADER_BG = "#163524";
const CARD_BG   = "#141a1e";
const BORDER    = "#1e2428";
const TEXT      = "#eae6e0";
const MUTED     = "#b8b3ab";
const SUBTLE    = "#8a8580";
const GOLD      = "#c9a35a";
const GOLD_DARK = "#9f7b37";

export function buildMagicLinkEmail(url: string): {
  subject: string;
  html: string;
} {
  const name    = SITE.name;
  const siteUrl = SITE.url;

  return {
    subject: `Sign in to ${name} admin`,
    html: `<!DOCTYPE html>
<html lang="en" xmlns:v="urn:schemas-microsoft-com:vml">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width,initial-scale=1.0" />
  <meta name="color-scheme" content="dark" />
  <meta name="supported-color-schemes" content="dark" />
  <title>Sign in to ${name}</title>
</head>
<body style="margin:0;padding:0;background:${PAGE_BG};font-family:'Segoe UI',Arial,Helvetica,sans-serif;-webkit-text-size-adjust:100%;color:${TEXT};">

<table role="presentation" width="100%" cellpadding="0" cellspacing="0" bgcolor="${PAGE_BG}" style="background:${PAGE_BG};">
  <tr>
    <td align="center" style="padding:40px 16px 48px;">

      <table role="presentation" width="480" cellpadding="0" cellspacing="0" style="max-width:480px;width:100%;">

        <!-- HEADER -->
        <tr>
          <td bgcolor="${HEADER_BG}" style="background:${HEADER_BG};padding:20px 28px;border-radius:16px 16px 0 0;mso-border-alt:none;">
            <span style="font-size:14px;font-weight:800;letter-spacing:0.24em;text-transform:uppercase;color:#ffffff;">${name}</span>
          </td>
        </tr>

        <!-- GOLD RULE -->
        <tr>
          <td bgcolor="${GOLD}" height="2" style="background:${GOLD};height:2px;font-size:0;line-height:0;">&nbsp;</td>
        </tr>

        <!-- CARD -->
        <tr>
          <td bgcolor="${CARD_BG}" style="background:${CARD_BG};padding:32px 28px 28px;border:1px solid ${BORDER};border-top:none;border-radius:0 0 16px 16px;text-align:center;mso-border-alt:none;">

            <h2 style="margin:0 0 8px;font-size:20px;font-weight:800;color:${TEXT};">Admin sign in</h2>
            <p style="margin:0 0 26px;font-size:13px;line-height:1.7;color:${MUTED};">
              Click the button below to sign in to the <strong style="color:${TEXT};">${name}</strong> admin panel.<br/>
              This link expires in 10 minutes.
            </p>

            <!-- BUTTON: rounded-full pill matching website style -->
            <table role="presentation" cellpadding="0" cellspacing="0" align="center">
              <tr>
                <td bgcolor="${GOLD}" style="background:${GOLD};border:1px solid ${GOLD_DARK};border-radius:999px;">
                  <a href="${url}" style="display:inline-block;padding:13px 30px;font-size:14px;font-weight:800;color:#0f1e14;text-decoration:none;line-height:1;white-space:nowrap;">
                    Sign in to ${name}
                  </a>
                </td>
              </tr>
            </table>

            <p style="margin:24px 0 0;font-size:11px;color:${SUBTLE};">
              If you didn't request this, you can safely ignore this email.
            </p>
          </td>
        </tr>

        <!-- FOOTER -->
        <tr>
          <td style="padding:20px 0 0;text-align:center;">
            <p style="margin:0;font-size:11px;color:#484340;line-height:1.7;">
              ${name}&nbsp;&middot;&nbsp;<a href="${siteUrl}" style="color:#484340;text-decoration:none;">${siteUrl}</a>
            </p>
          </td>
        </tr>

      </table>
    </td>
  </tr>
</table>

</body>
</html>`,
  };
}
