import parsePhoneNumberFromString from "libphonenumber-js";
import type { Classified, HashIntel, IdType, WalletIntel } from "./types";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/i;
const IPV4_RE = /^(?:(?:25[0-5]|2[0-4]\d|1?\d?\d)\.){3}(?:25[0-5]|2[0-4]\d|1?\d?\d)$/;
const HASH_RE = /^[0-9a-f]+$/i;
const DOMAIN_RE =
  /^(?:[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?\.)+[a-z]{2,24}\.?$/i;
const USER_RE = /^@?[a-zA-Z0-9._-]{2,39}$/;
const BTC_LEGACY = /^(?:[13]|bc1)[a-zA-HJ-NP-Z0-9]{24,90}$/;
const ETH_RE = /^0x[0-9a-fA-F]{40}$/;

const HASH_LEN: Record<number, HashIntel["algo"]> = {
  32: "MD5",
  40: "SHA-1",
  64: "SHA-256",
  96: "SHA-384",
  128: "SHA-512",
};

function looksLikeIpv6(q: string): boolean {
  if (!q.includes(":")) return false;
  if (!/^[0-9a-f:]+$/i.test(q)) return false;
  const parts = q.split(":");
  return parts.length >= 3 && parts.length <= 8;
}

function stripWww(host: string) {
  return host.replace(/^www\./i, "");
}

export function classify(raw: string): Classified {
  const display = raw.trim();
  const q = display;
  if (!q) return { type: "unknown", normalized: "", display: "" };

  if (/^https?:\/\//i.test(q) || /^www\./i.test(q) || /\/.+/.test(q) && DOMAIN_RE.test(q.split("/")[0] ?? "")) {
    try {
      const url = new URL(q.includes("://") ? q : `https://${q}`);
      if (url.hostname) {
        return {
          type: "url",
          normalized: url.toString(),
          display,
        };
      }
    } catch {
      /* fall through */
    }
  }

  if (EMAIL_RE.test(q)) {
    return { type: "email", normalized: q.toLowerCase(), display };
  }

  if (IPV4_RE.test(q)) {
    return { type: "ipv4", normalized: q, display };
  }

  if (looksLikeIpv6(q)) {
    return { type: "ipv6", normalized: q, display };
  }

  if (ETH_RE.test(q) || BTC_LEGACY.test(q)) {
    const chain: WalletIntel["chain"] = ETH_RE.test(q) ? "ethereum" : "bitcoin";
    return { type: "wallet", normalized: q, display, chain };
  }

  if (HASH_RE.test(q) && HASH_LEN[q.length]) {
    return {
      type: "hash",
      normalized: q.toLowerCase(),
      display,
      hashAlgo: HASH_LEN[q.length],
    };
  }

  const phone = parsePhoneNumberFromString(q.includes("+") ? q : q.replace(/^[0]/, "+"));
  const digits = q.replace(/\D/g, "");
  if (
    (q.startsWith("+") || /^[\d\s().-]{8,}$/.test(q)) &&
    digits.length >= 8 &&
    digits.length <= 15 &&
    (phone?.isPossible() || phone?.isValid())
  ) {
    return {
      type: "phone",
      normalized: phone?.number ?? q,
      display,
    };
  }

  const asDomain = q.replace(/\.$/, "").toLowerCase();
  if (DOMAIN_RE.test(asDomain) && asDomain.includes(".")) {
    return { type: "domain", normalized: stripWww(asDomain), display };
  }

  if (USER_RE.test(q)) {
    return { type: "username", normalized: q.replace(/^@/, ""), display };
  }

  return { type: "unknown", normalized: q, display };
}

export function typeLabel(type: IdType): string {
  switch (type) {
    case "ipv4":
      return "IPv4";
    case "ipv6":
      return "IPv6";
    case "url":
      return "URL";
    case "image":
      return "Image";
    default:
      return type.charAt(0).toUpperCase() + type.slice(1);
  }
}

export function extractHost(input: string): string | null {
  try {
    const url = new URL(input.includes("://") ? input : `https://${input}`);
    return url.hostname.replace(/\.$/, "").toLowerCase();
  } catch {
    return null;
  }
}

export function extractDomain(host: string): string {
  const h = host.replace(/^www\./, "").toLowerCase();
  const parts = h.split(".");
  if (parts.length <= 2) return h;
  const last = parts.at(-1) ?? "";
  const second = parts.at(-2) ?? "";
  const compound = new Set(["co", "com", "net", "org", "gov", "ac", "edu"]);
  if (compound.has(second) && last.length === 2) {
    return parts.slice(-3).join(".");
  }
  return parts.slice(-2).join(".");
}
