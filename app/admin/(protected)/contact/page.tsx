import { getSiteConfig } from "@/lib/db/siteConfig";
import ContactEditor from "@/components/admin/ContactEditor";

export const metadata = { title: "Contact channels" };

export default async function ContactPage() {
  const config = await getSiteConfig();
  return <ContactEditor initialConfig={config} />;
}
