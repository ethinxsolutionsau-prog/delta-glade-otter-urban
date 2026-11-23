import type { IdType } from "./types";

export type Technique = {
  id: string;
  name: string;
  applies: IdType[] | "all";
  mode: "live" | "pivot";
  summary: string;
  sample?: string;
};

export const TECHNIQUES: Technique[] = [
  {
    id: "classify",
    name: "Classification",
    applies: "all",
    mode: "live",
    summary: "Decide what the input is before any request leaves the desk.",
  },
  {
    id: "username",
    name: "Username enumeration",
    applies: ["username", "email"],
    mode: "live",
    summary: "A profile counts only when that site's API confirms the account.",
    sample: "torvalds",
  },
  {
    id: "social",
    name: "Social profiles",
    applies: ["username", "email"],
    mode: "live",
    summary:
      "YouTube, TikTok, Twitch, Bluesky, Mastodon, Tumblr, Steam, and public communities. X, Instagram, and Reddit stay as pivots.",
    sample: "pokimane",
  },
  {
    id: "github",
    name: "Code profile",
    applies: ["username"],
    mode: "live",
    summary: "Public GitHub identity: name, company, repos, followers.",
    sample: "torvalds",
  },
  {
    id: "dns",
    name: "Passive DNS",
    applies: ["domain", "email", "url"],
    mode: "live",
    summary: "A, AAAA, MX, NS, TXT, and SOA over DNS-over-HTTPS. No port scan.",
    sample: "cloudflare.com",
  },
  {
    id: "rdap",
    name: "Registration",
    applies: ["domain", "ipv4", "ipv6"],
    mode: "live",
    summary: "Registrar, dates, status, and network name from RDAP.",
    sample: "cloudflare.com",
  },
  {
    id: "ct",
    name: "Certificate transparency",
    applies: ["domain", "url"],
    mode: "live",
    summary: "Hostnames published in certificate logs, plus a short name brute.",
    sample: "cloudflare.com",
  },
  {
    id: "mail",
    name: "Mail authentication",
    applies: ["domain", "email"],
    mode: "live",
    summary: "SPF from the domain TXT record and DMARC from _dmarc.",
    sample: "cloudflare.com",
  },
  {
    id: "http",
    name: "HTTP fingerprint",
    applies: ["domain", "url"],
    mode: "live",
    summary: "Title, server, HSTS, security.txt, and the redirect chain.",
    sample: "https://github.com",
  },
  {
    id: "geo",
    name: "IP geolocation",
    applies: ["ipv4", "ipv6", "domain"],
    mode: "live",
    summary: "Country, city, ASN, and whether the address looks like hosting.",
    sample: "1.1.1.1",
  },
  {
    id: "phone",
    name: "Numbering and directory",
    applies: ["phone"],
    mode: "live",
    summary: "National plan, original carrier block, and a published reverse listing if one exists.",
    sample: "+61 412 345 678",
  },
  {
    id: "hash",
    name: "File hash lookup",
    applies: ["hash"],
    mode: "live",
    summary: "CIRCL's public hash lookup for known files. Not a private malware sandbox.",
    sample: "275a021bbfb6489e54d471899f7db9d1663fc695ec2fe2a2c4538aabf651fd0f",
  },
  {
    id: "wallet",
    name: "Public chain",
    applies: ["wallet"],
    mode: "live",
    summary: "Balance and transaction count from a public block explorer.",
    sample: "1A1zP1eP5QGefi2DMPTfTL5SLmv7DivfNa",
  },
  {
    id: "exif",
    name: "Local EXIF",
    applies: ["image"],
    mode: "live",
    summary: "Camera, time, and GPS parsed in the browser. The file is not uploaded.",
  },
  {
    id: "pivot",
    name: "Search pivots",
    applies: "all",
    mode: "pivot",
    summary: "Hand-off links for sites that block automated checks. They are not live hits.",
  },
];

export function techniquesFor(type: IdType): Technique[] {
  return TECHNIQUES.filter((t) => t.applies === "all" || t.applies.includes(type));
}
