export const SITE = {
  name: "VITARIA",
  legalName: "VITARIA",
  url: process.env.NEXT_PUBLIC_SITE_URL ?? "https://www.vitaria.us",
  locale: "en_US",
  email: process.env.LEADS_TO_EMAIL ?? "sales@vitaria.us",
  phone: "+905357331290",
  address: {
    streetAddress: "Your Address",
    addressLocality: "Your City",
    addressRegion: "Your State",
    postalCode: "00000",
    addressCountry: "US",
  },
  social: [] as string[],
};
