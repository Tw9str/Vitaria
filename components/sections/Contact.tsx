import { CHANNEL_DEFS, buildHref } from "@/lib/contact-channels";
import { getSiteConfig } from "@/lib/db/siteConfig";
import { config } from "@/lib/config";
import InquiryForm from "./contact/InquiryForm";
import ContactSidebar from "./contact/ContactSidebar";

export default async function Contact() {
  const contactConfig = await getSiteConfig().catch(() => null);
  const turnstileSiteKey = config.turnstile.turnstileSiteKey;

  const whatsappCh = contactConfig?.whatsapp;
  const whatsappHref =
    whatsappCh?.visible && whatsappCh.value
      ? buildHref(
          CHANNEL_DEFS.find((d) => d.key === "whatsapp")!,
          whatsappCh.value,
        )
      : null;

  return (
    <section id="contact" className="py-20">
      <div className="mx-auto max-w-290 px-5">
        <div className="grid gap-10 lg:grid-cols-[1fr_340px] lg:items-stretch">
          <InquiryForm
            turnstileSiteKey={turnstileSiteKey}
            whatsappHref={whatsappHref}
          />
          {/* ── Right column: sidebar ── */}
          <ContactSidebar contactConfig={contactConfig} />
        </div>
      </div>
    </section>
  );
}
