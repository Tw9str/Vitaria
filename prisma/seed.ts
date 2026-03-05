import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const products = [
  {
    slug: "extra-virgin-olive-oil-500ml",
    title: "Extra Virgin Olive Oil 500ml",
    summary:
      "Cold-pressed from hand-picked olives harvested at peak ripeness. Rich, fruity flavour with a peppery finish.",
    highlight: "Best Seller",
    image: "",
    gallery: [],
    published: true,
    specs: [
      { label: "Volume", value: "500 ml" },
      { label: "Acidity", value: "≤ 0.3%" },
      { label: "Origin", value: "Crete, Greece" },
      { label: "Certifications", value: "PDO, Organic" },
    ],
    sections: [
      {
        heading: "Tasting Notes",
        items: ["Fruity aroma", "Peppery finish", "Low bitterness"],
      },
      {
        heading: "Packaging",
        items: [
          "Dark glass bottle",
          "12 units per case",
          "Shelf life 24 months",
        ],
      },
    ],
  },
  {
    slug: "extra-virgin-olive-oil-1l",
    title: "Extra Virgin Olive Oil 1 L",
    summary:
      "Same premium cold-press quality in a larger format, ideal for restaurants and food-service accounts.",
    highlight: "Food Service",
    image: "",
    gallery: [],
    published: true,
    specs: [
      { label: "Volume", value: "1 L" },
      { label: "Acidity", value: "≤ 0.3%" },
      { label: "Origin", value: "Crete, Greece" },
    ],
    sections: [
      {
        heading: "Packaging",
        items: ["Dark glass bottle", "6 units per case"],
      },
    ],
  },
  {
    slug: "organic-olive-oil-tin-3l",
    title: "Organic Olive Oil Tin 3 L",
    summary:
      "Certified organic, packed in a traditional tin for extended freshness. Perfect for wholesale and retail display.",
    highlight: "Organic",
    image: "",
    gallery: [],
    published: true,
    specs: [
      { label: "Volume", value: "3 L" },
      { label: "Acidity", value: "≤ 0.5%" },
      { label: "Certifications", value: "EU Organic, BRC" },
    ],
    sections: [
      {
        heading: "Storage",
        items: ["Keep in a cool, dark place", "Do not refrigerate"],
      },
    ],
  },
  {
    slug: "kalamata-olives-pitted-250g",
    title: "Kalamata Olives Pitted 250 g",
    summary:
      "Firm, meaty Kalamata olives cured in red wine vinegar and sea salt. Ready-to-use for salads and antipasti.",
    highlight: "PDO",
    image: "",
    gallery: [],
    published: true,
    specs: [
      { label: "Net Weight", value: "250 g" },
      { label: "Brine", value: "Red wine vinegar" },
      { label: "Origin", value: "Kalamata, Greece" },
      { label: "Shelf Life", value: "18 months" },
    ],
    sections: [
      {
        heading: "Serving Suggestions",
        items: ["Greek salad", "Antipasti platters", "Pizza topping"],
      },
    ],
  },
  {
    slug: "kalamata-olives-whole-500g",
    title: "Kalamata Olives Whole 500 g",
    summary:
      "Whole Kalamata olives in traditional brine. Distinctive almond shape and deep purple skin.",
    highlight: null,
    image: "",
    gallery: [],
    published: true,
    specs: [
      { label: "Net Weight", value: "500 g" },
      { label: "Brine", value: "Sea salt & water" },
      { label: "Origin", value: "Kalamata, Greece" },
    ],
    sections: [],
  },
  {
    slug: "olive-tapenade-dark-190g",
    title: "Dark Olive Tapenade 190 g",
    summary:
      "Finely blended Kalamata olives with capers, anchovies and lemon zest. A crowd-pleasing spread or condiment.",
    highlight: "New",
    image: "",
    gallery: [],
    published: true,
    specs: [
      { label: "Net Weight", value: "190 g" },
      { label: "Format", value: "Glass jar" },
      { label: "Shelf Life", value: "12 months" },
    ],
    sections: [
      {
        heading: "Ingredients",
        items: ["Kalamata olives", "Capers", "Anchovies", "Lemon zest", "EVOO"],
      },
    ],
  },
  {
    slug: "herb-infused-olive-oil-250ml",
    title: "Herb-Infused Olive Oil 250 ml",
    summary:
      "Extra virgin olive oil infused with rosemary, thyme and garlic. Ready for drizzling on bread, fish or vegetables.",
    highlight: "Specialty",
    image: "",
    gallery: [],
    published: true,
    specs: [
      { label: "Volume", value: "250 ml" },
      { label: "Base Oil", value: "Extra Virgin" },
      { label: "Infusion", value: "Rosemary, Thyme, Garlic" },
    ],
    sections: [],
  },
  {
    slug: "chilli-infused-olive-oil-250ml",
    title: "Chilli-Infused Olive Oil 250 ml",
    summary:
      "A gently spiced EVOO with sun-dried chillies. Adds warmth to pasta, pizza and marinades without overpowering.",
    highlight: "Specialty",
    image: "",
    gallery: [],
    published: false,
    specs: [
      { label: "Volume", value: "250 ml" },
      { label: "Heat Level", value: "Medium" },
      { label: "Base Oil", value: "Extra Virgin" },
    ],
    sections: [],
  },
  {
    slug: "olive-oil-soap-bar",
    title: "Pure Olive Oil Soap Bar",
    summary:
      "Handmade cold-process soap with 72 % pure olive oil. Deeply moisturising, suitable for sensitive skin.",
    highlight: "Natural",
    image: "",
    gallery: [],
    published: true,
    specs: [
      { label: "Weight", value: "125 g" },
      { label: "Olive Oil Content", value: "72%" },
      { label: "Skin Type", value: "All / Sensitive" },
    ],
    sections: [
      {
        heading: "Ingredients",
        items: ["Olive oil", "Water", "Sodium hydroxide", "Sea salt"],
      },
    ],
  },
  {
    slug: "premium-gift-box-assortment",
    title: "Premium Gift Box Assortment",
    summary:
      "Curated gift set featuring a 500 ml EVOO, 190 g tapenade and 250 g pitted Kalamata olives. Ideal for retail gifting.",
    highlight: "Gift Set",
    image: "",
    gallery: [],
    published: false,
    specs: [
      { label: "Contents", value: "3 items" },
      { label: "Box Size", value: "28 × 18 × 10 cm" },
      { label: "MOQ", value: "12 units" },
    ],
    sections: [
      {
        heading: "Box Contents",
        items: [
          "500 ml Extra Virgin Olive Oil",
          "190 g Dark Olive Tapenade",
          "250 g Pitted Kalamata Olives",
        ],
      },
    ],
  },
];

// ─── Leads ────────────────────────────────────────────────────────────────────
const leads = [
  {
    name: "Marco Fontana",
    email: "m.fontana@delizioso.it",
    company: "Delizioso Import SRL",
    website: "https://delizioso.it",
    type: "importer",
    region: "Italy",
    message:
      "We are looking to import 5–10 pallets of your EVOO range per quarter. Please share your wholesale price list and minimum order quantities.",
    ip: "82.113.45.201",
    userAgent: "Mozilla/5.0 (Windows NT 10.0; Win64; x64)",
    referrer: "https://google.com",
    status: "contacted",
    notes:
      "Sent welcome email and price sheet on 2026-02-10. Follow-up scheduled for end of month.",
  },
  {
    name: "Aisha Mensah",
    email: "aisha.mensah@goldcoastfine.com",
    company: "Gold Coast Fine Foods",
    website: null,
    type: "distributor",
    region: "Ghana",
    message:
      "Interested in distributing your Kalamata olive range across West Africa. Can you supply halal-certified products?",
    ip: "196.206.122.88",
    userAgent: "Mozilla/5.0 (iPhone; CPU iPhone OS 17_0)",
    referrer: null,
    status: "new",
    notes: null,
  },
  {
    name: "Sophie Laurent",
    email: "slaurent@epiceriefine.fr",
    company: "Épicerie Fine Paris",
    website: "https://epiceriefine.fr",
    type: "retailer",
    region: "France",
    message:
      "I run a chain of three specialty food boutiques in Paris. Your gift box assortment looks perfect for our holiday range.",
    ip: "89.92.31.15",
    userAgent: "Mozilla/5.0 (Macintosh; Intel Mac OS X 14_0)",
    referrer: "https://instagram.com",
    status: "read",
    notes: null,
  },
  {
    name: "Tariq Al-Rashidi",
    email: "t.alrashidi@horizonfoods.ae",
    company: "Horizon Foods LLC",
    website: "https://horizonfoods.ae",
    type: "distributor",
    region: "UAE",
    message:
      "We distribute premium European foods to high-end supermarkets across the Gulf. Looking for an exclusive partnership for your EVOO and infused oil lines.",
    ip: "185.220.64.12",
    userAgent: "Mozilla/5.0 (Windows NT 10.0; Win64; x64)",
    referrer: "https://linkedin.com",
    status: "closed",
    notes:
      "Signed distribution agreement on 2026-01-28. First shipment dispatched.",
  },
  {
    name: "Luisa Carvalho",
    email: "luisa@saboresbrasil.com",
    company: "Sabores Brasil",
    website: null,
    type: "importer",
    region: "Brazil",
    message:
      "Queremos importar azeite extra virgem para o mercado brasileiro. Por favor envie cotação para 500 unidades mensais.",
    ip: "177.85.44.201",
    userAgent: "Mozilla/5.0 (Linux; Android 13)",
    referrer: "https://google.com.br",
    status: "new",
    notes: null,
  },
  {
    name: "James Whitfield",
    email: "james@olivegroveuk.co.uk",
    company: "Olive Grove UK",
    website: "https://olivegroveuk.co.uk",
    type: "retailer",
    region: "United Kingdom",
    message:
      "We're expanding our fine foods catalogue and your Kalamata range would be a great fit. Can we arrange a tasting sample?",
    ip: "86.9.102.44",
    userAgent: "Mozilla/5.0 (Macintosh; Intel Mac OS X 13_5)",
    referrer: "https://bing.com",
    status: "contacted",
    notes: "Shipped sample set on 2026-02-20. Awaiting feedback.",
  },
];

// ─── Notes ────────────────────────────────────────────────────────────────────
const notes = [
  {
    content:
      "📌 Q1 priority: push the EVOO 500 ml and gift box to French and UK markets before Easter.",
    pinned: true,
  },
  {
    content:
      "Contact logistics team about reducing lead time from Crete warehouse - currently 14 days, target 10.",
    pinned: false,
  },
  {
    content:
      "Add halal certification documents to the product info sheet to address recurring requests from Gulf distributors.",
    pinned: true,
  },
  {
    content:
      "Seasonal campaign idea: 'Tastes of Greece' bundle (EVOO + tapenade + Kalamata olives) for summer retail.",
    pinned: false,
  },
  {
    content:
      "Reminder: renew PDO certification for Kalamata Olives Pitted 250 g before June 2026.",
    pinned: false,
  },
];

// ─── Activity logs ─────────────────────────────────────────────────────────────
const now = new Date("2026-03-02T12:00:00.000Z");
const daysAgo = (d: number) => new Date(now.getTime() - d * 86_400_000);

const activityLogs = [
  {
    action: "LEAD_NOTES_SAVED",
    entity: "lead",
    entityTitle: "Marco Fontana",
    actorEmail: "admin@olive-site.com",
    actorName: "Admin",
    severity: "info",
    detail: "Notes updated for lead Marco Fontana.",
    createdAt: daysAgo(0),
  },
  {
    action: "LEAD_STATUS_CHANGED",
    entity: "lead",
    entityTitle: "Tariq Al-Rashidi",
    actorEmail: "admin@olive-site.com",
    actorName: "Admin",
    severity: "info",
    detail: "Status changed to 'closed'.",
    createdAt: daysAgo(1),
  },
  {
    action: "NOTE_CREATED",
    entity: "note",
    entityTitle: "Q1 priority note",
    actorEmail: "admin@olive-site.com",
    actorName: "Admin",
    severity: "info",
    detail: "New pinned note added.",
    createdAt: daysAgo(2),
  },
  {
    action: "PRODUCT_DELETED",
    entity: "product",
    entityTitle: "Test Draft Product",
    actorEmail: "editor@olive-site.com",
    actorName: "Editor",
    severity: "warning",
    detail: "Draft product removed during catalogue cleanup.",
    createdAt: daysAgo(3),
  },
  {
    action: "LEAD_STATUS_CHANGED",
    entity: "lead",
    entityTitle: "James Whitfield",
    actorEmail: "admin@olive-site.com",
    actorName: "Admin",
    severity: "info",
    detail: "Status changed to 'contacted'.",
    createdAt: daysAgo(5),
  },
  {
    action: "NOTE_UPDATED",
    entity: "note",
    entityTitle: "Halal certification note",
    actorEmail: "admin@olive-site.com",
    actorName: "Admin",
    severity: "info",
    detail: "Note content revised.",
    createdAt: daysAgo(6),
  },
  {
    action: "LEAD_STATUS_CHANGED",
    entity: "lead",
    entityTitle: "Sophie Laurent",
    actorEmail: "editor@olive-site.com",
    actorName: "Editor",
    severity: "info",
    detail: "Status changed to 'read'.",
    createdAt: daysAgo(8),
  },
  {
    action: "USER_CREATED",
    entity: "user",
    entityTitle: "editor@olive-site.com",
    actorEmail: "admin@olive-site.com",
    actorName: "Admin",
    severity: "info",
    detail: "New editor account created.",
    createdAt: daysAgo(10),
  },
  {
    action: "NOTE_CREATED",
    entity: "note",
    entityTitle: "Seasonal campaign idea",
    actorEmail: "editor@olive-site.com",
    actorName: "Editor",
    severity: "info",
    detail: "New note added by editor.",
    createdAt: daysAgo(12),
  },
  {
    action: "PROFILE_UPDATED",
    entity: "profile",
    entityTitle: "admin@olive-site.com",
    actorEmail: "admin@olive-site.com",
    actorName: "Admin",
    severity: "info",
    detail: "Site profile / contact details updated.",
    createdAt: daysAgo(15),
  },
];

async function main() {
  console.log("Seeding 10 products…");

  for (const p of products) {
    try {
      await prisma.product.upsert({
        where: { slug: p.slug },
        update: p,
        create: p,
      });
      console.log(`  ✓ ${p.title}`);
    } catch (e) {
      console.log(`  ✗ ${p.title}: ${e}`);
    }
  }

  console.log("\nSeeding 6 leads…");
  for (const lead of leads) {
    try {
      const created = await prisma.lead.create({ data: lead });
      console.log(`  ✓ ${lead.name} (${lead.company})`);
      // patch entityId on matching activity log entries after creation
      activityLogs.forEach((log) => {
        if (log.entity === "lead" && log.entityTitle === lead.name) {
          (log as Record<string, unknown>).entityId = created.id;
        }
      });
    } catch (e) {
      console.log(`  ✗ ${lead.name}: ${e}`);
    }
  }

  console.log("\nSeeding 5 notes…");
  for (const note of notes) {
    try {
      await prisma.note.create({ data: note });
      console.log(`  ✓ ${note.content.slice(0, 50)}…`);
    } catch (e) {
      console.log(`  ✗ note: ${e}`);
    }
  }

  console.log("\nSeeding 10 activity logs…");
  for (const log of activityLogs) {
    try {
      await prisma.activityLog.create({ data: log });
      console.log(`  ✓ [${log.action}] ${log.entityTitle}`);
    } catch (e) {
      console.log(`  ✗ ${log.action}: ${e}`);
    }
  }

  console.log("\nDone.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
