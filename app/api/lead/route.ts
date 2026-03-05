import { NextResponse } from "next/server";
import { prisma } from "@/lib/db/prismaClient";
import { leadSchema } from "@/lib/validation/validators";
import { sendEmailSafe } from "@/lib/email/email";
import {
  buildAdminLeadNotification,
  buildLeadConfirmation,
} from "@/lib/email/templates/lead";
import { config } from "@/lib/core/config";
import { verifyTurnstileToken } from "@/lib/utils/turnstile";

export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => ({}));

    // Honeypot: bots fill this hidden field; silently succeed so they think the form worked.
    if (body?.company_site) {
      return NextResponse.json({ ok: true });
    }

    // Resolve client IP once and reuse for both Turnstile and DB storage.
    const ip =
      req.headers.get("cf-connecting-ip") ??
      req.headers.get("x-forwarded-for")?.split(",")[0].trim() ??
      null;

    // Cloudflare Turnstile verification
    const turnstileResult = await verifyTurnstileToken(
      body?.turnstileToken ?? "",
      ip ?? undefined,
    );
    if (!turnstileResult.success) {
      return NextResponse.json(
        { message: "Security check failed. Please try again." },
        { status: 400 },
      );
    }

    const parsed = leadSchema.safeParse(body);
    if (!parsed.success) {
      const message = parsed.error.issues.map((e) => e.message).join(", ");
      return NextResponse.json({ message }, { status: 400 });
    }

    const lead = await prisma.lead.create({
      data: {
        ...parsed.data,
        ip,
        userAgent: req.headers.get("user-agent") ?? null,
        referrer: req.headers.get("referer") ?? null,
      },
    });

    // Fire emails in parallel - failures are logged but never break the response.
    const leadData = {
      ...parsed.data,
      id: lead.id,
      createdAt: lead.createdAt,
      ip: lead.ip,
      userAgent: lead.userAgent,
      referrer: lead.referrer,
    };

    await Promise.all([
      sendEmailSafe({
        to: config.resend.leadsToEmail,
        ...buildAdminLeadNotification(leadData),
        replyTo: parsed.data.email,
      }),
      sendEmailSafe({
        to: parsed.data.email,
        ...buildLeadConfirmation(leadData),
        replyTo: config.resend.leadsToEmail,
      }),
    ]);

    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ message: "Server error." }, { status: 500 });
  }
}
