import { createHash } from "node:crypto";
import { LIVE_PLATFORMS } from "./platforms";
import { isDisposableDomain, isRoleAccount } from "./disposable";
import { assertPublicHost, parseHttpUrl } from "./ssrf.server";
import type {
  DnsRecord,
  DomainIntel,
  EmailIntel,
  GithubIntel,
  HttpProbe,
  IpIntel,
  UrlIntel,
  UsernameHit,
  UsernameIntel,
} from "./types";

const UA =
  "Mozilla/5.0 (compatible; FathomResearch/1.0; +https://grok.com) AppleWebKit/537.36 Chrome/124.0.0.0";

function withTimeout<T>(promise: Promise<T>, ms: number, fallback: T): Promise<T> {
  return new Promise((resolve) => {
    const t = setTimeout(() => resolve(fallback), ms);
    promise
      .then((v) => {
        clearTimeout(t);
        resolve(v);
      })
      .catch(() => {
        clearTimeout(t);
        resolve(fallback);
      });
  });
}

async function fetchOk(
  url: string,
  init: RequestInit & { timeout?: number } = {},
): Promise<Response | null> {
  const ctrl = new AbortController();
  const t = setTimeout(() => ctrl.abort(), init.timeout ?? 8000);
  try {
    return await fetch(url, {
      ...init,
      signal: ctrl.signal,
      headers: {
        "User-Agent": UA,
        Accept: "*/*",
        ...(init.headers ?? {}),
      },
    });
  } catch {
    return null;
  } finally {
    clearTimeout(t);
  }
}

async function fetchJson<T>(
  url: string,
  opts: { timeout?: number; headers?: Record<string, string> } = {},
): Promise<T | null> {
  const res = await fetchOk(url, {
    timeout: opts.timeout ?? 8000,
    headers: { Accept: "application/json", ...(opts.headers ?? {}) },
  });
  if (!res || !res.ok) return null;
  try {
    return (await res.json()) as T;
  } catch {
    return null;
  }
}

async function mapPool<T, R>(items: T[], limit: number, fn: (item: T) => Promise<R>): Promise<R[]> {
  const out: R[] = new Array(items.length);
  let i = 0;
  async function worker() {
    while (i < items.length) {
      const idx = i++;
      const item = items[idx];
      if (item === undefined) continue;
      out[idx] = await fn(item);
    }
  }
  await Promise.all(Array.from({ length: Math.min(limit, items.length) }, () => worker()));
  return out;
}

type DohAnswer = { name: string; type: number; TTL?: number; data: string };
type DohResponse = { Answer?: DohAnswer[]; Status?: number };

const DOH_TYPES: Record<number, string> = {
  1: "A",
  2: "NS",
  5: "CNAME",
  6: "SOA",
  12: "PTR",
  15: "MX",
  16: "TXT",
  28: "AAAA",
};

async function doh(name: string, type: string): Promise<DnsRecord[]> {
  const url = `https://cloudflare-dns.com/dns-query?name=${encodeURIComponent(name)}&type=${type}`;
  const json = await fetchJson<DohResponse>(url, {
    timeout: 6000,
    headers: { Accept: "application/dns-json" },
  });
  return (json?.Answer ?? []).map((a) => ({
    type: DOH_TYPES[a.type] ?? String(a.type),
    name: a.name,
    ttl: a.TTL,
    data: a.data.replace(/^"|"$/g, ""),
  }));
}

function ptrName(ip: string): string | null {
  if (/^\d{1,3}(?:\.\d{1,3}){3}$/.test(ip)) {
    return `${ip.split(".").reverse().join(".")}.in-addr.arpa`;
  }
  return null;
}

type RdapEntity = {
  roles?: string[];
  vcardArray?: [string, unknown[][]];
  handle?: string;
};
type RdapJson = {
  handle?: string;
  ldhName?: string;
  status?: string[];
  events?: { eventAction?: string; eventDate?: string }[];
  nameservers?: { ldhName?: string }[];
  entities?: RdapEntity[];
  name?: string;
  type?: string;
  country?: string;
  startAddress?: string;
  endAddress?: string;
  cidr0_cidrs?: { v4prefix?: string; length?: number }[];
};

function vcardFn(entity?: RdapEntity): string | undefined {
  const rows = entity?.vcardArray?.[1] ?? [];
  for (const row of rows) {
    if (Array.isArray(row) && row[0] === "fn" && typeof row[3] === "string") return row[3];
    if (Array.isArray(row) && row[0] === "email" && typeof row[3] === "string") return row[3];
  }
  return undefined;
}

async function rdap(kind: "domain" | "ip", query: string): Promise<RdapJson | null> {
  return fetchJson<RdapJson>(`https://rdap.org/${kind}/${encodeURIComponent(query)}`, {
    timeout: 8000,
  });
}

function extractTitle(html: string): string | undefined {
  const m = html.match(/<title[^>]*>([\s\S]{0,200}?)<\/title>/i);
  return m?.[1]?.replace(/\s+/g, " ").trim();
}

function extractGenerator(html: string): string | undefined {
  const m = html.match(/<meta[^>]+name=["']generator["'][^>]+content=["']([^"']+)/i);
  return m?.[1];
}

async function probeHttp(rawUrl: string): Promise<HttpProbe> {
  try {
    const url = parseHttpUrl(rawUrl);
    await assertPublicHost(url.hostname);
  } catch (e) {
    return {
      url: rawUrl,
      securityTxt: false,
      robots: false,
      sitemaps: [],
      blocked: e instanceof Error ? e.message : "blocked",
    };
  }

  const res = await fetchOk(rawUrl, { timeout: 8000, redirect: "follow" });
  if (!res) {
    return { url: rawUrl, securityTxt: false, robots: false, sitemaps: [] };
  }

  const buf = new Uint8Array(await res.arrayBuffer());
  const slice = buf.slice(0, 48_000);
  const html = new TextDecoder("utf-8", { fatal: false }).decode(slice);
  const headers = res.headers;

  const origin = new URL(rawUrl).origin;
  const [sec, robots] = await Promise.all([
    fetchOk(`${origin}/.well-known/security.txt`, { timeout: 4000, redirect: "follow" }),
    fetchOk(`${origin}/robots.txt`, { timeout: 4000, redirect: "follow" }),
  ]);

  let robotsText = "";
  if (robots && robots.ok) {
    robotsText = (await robots.text()).slice(0, 4000);
  }
  const sitemaps = [...robotsText.matchAll(/sitemap:\s*(\S+)/gi)].map((m) => m[1] ?? "").filter(Boolean);

  return {
    url: rawUrl,
    status: res.status,
    server: headers.get("server") ?? undefined,
    poweredBy: headers.get("x-powered-by") ?? undefined,
    contentType: headers.get("content-type") ?? undefined,
    hsts: headers.get("strict-transport-security") ?? undefined,
    csp: headers.get("content-security-policy") ?? undefined,
    title: extractTitle(html),
    generator: extractGenerator(html),
    securityTxt: Boolean(sec && sec.ok),
    robots: Boolean(robots && robots.ok),
    sitemaps,
  };
}

type CrtRow = {
  common_name?: string;
  name_value?: string;
  issuer_name?: string;
  not_before?: string;
  not_after?: string;
};

export async function collectDomain(domain: string): Promise<DomainIntel> {
  const host = domain.toLowerCase().replace(/\.$/, "");

  const [a, aaaa, mx, ns, txt, soa, rdapJson, certsRaw, waybackRaw, http] = await Promise.all([
    doh(host, "A"),
    doh(host, "AAAA"),
    doh(host, "MX"),
    doh(host, "NS"),
    doh(host, "TXT"),
    doh(host, "SOA"),
    rdap("domain", host),
    withTimeout(
      fetchJson<CrtRow[]>(`https://crt.sh/?q=${encodeURIComponent(host)}&output=json`, { timeout: 10000 }),
      10000,
      null,
    ),
    fetchJson<string[][]>(
      `https://web.archive.org/cdx/search/cdx?url=${encodeURIComponent(host)}&output=json&fl=timestamp,original,statuscode&limit=12&filter=statuscode:200`,
      { timeout: 8000 },
    ),
    probeHttp(`https://${host}`),
  ]);

  const dns = [...a, ...aaaa, ...mx, ...ns, ...txt, ...soa];
  const nameservers = ns.map((r) => r.data.replace(/\.$/, ""));
  const mxHosts = mx.map((r) => r.data.replace(/\.$/, ""));
  const ips = [...a, ...aaaa].map((r) => r.data);

  const registrarEntity = rdapJson?.entities?.find((e) => e.roles?.includes("registrar"));
  const abuseEntity = rdapJson?.entities?.find((e) => e.roles?.includes("abuse"));
  const registered = rdapJson?.events?.find((e) => e.eventAction === "registration")?.eventDate;
  const expires = rdapJson?.events?.find((e) => e.eventAction === "expiration")?.eventDate;

  const sans = new Set<string>();
  const certs = (Array.isArray(certsRaw) ? certsRaw : []).slice(0, 40).map((row) => {
    const names = (row.name_value ?? "")
      .split(/\n/g)
      .map((s) => s.trim().toLowerCase())
      .filter(Boolean);
    names.forEach((n) => {
      if (!n.startsWith("*.") && n.endsWith(host)) sans.add(n);
    });
    return {
      commonName: row.common_name ?? names[0] ?? host,
      sans: names,
      issuer: row.issuer_name ?? "",
      notBefore: row.not_before,
      notAfter: row.not_after,
    };
  });

  const subdomains = [...sans]
    .filter((n) => n !== host && n.endsWith(`.${host}`))
    .sort()
    .slice(0, 40);

  const rows = Array.isArray(waybackRaw) ? waybackRaw.slice(1) : [];
  const samples = rows.slice(0, 8).map((r) => ({
    timestamp: r[0] ?? "",
    original: r[1] ?? "",
    status: r[2],
  }));

  return {
    domain: host,
    dns,
    nameservers,
    mx: mxHosts,
    ips,
    txt: txt.map((r) => r.data),
    rdap: rdapJson
      ? {
          handle: rdapJson.handle,
          status: rdapJson.status,
          registrar: vcardFn(registrarEntity),
          registered,
          expires,
          nameservers: rdapJson.nameservers?.map((n) => n.ldhName ?? "").filter(Boolean),
          abuse: vcardFn(abuseEntity),
        }
      : null,
    certs,
    subdomains,
    wayback: {
      first: samples[0]?.timestamp,
      last: samples.at(-1)?.timestamp,
      count: samples.length,
      samples,
    },
    http,
  };
}

export async function collectIp(ip: string): Promise<IpIntel> {
  type Who = {
    ip?: string;
    success?: boolean;
    type?: string;
    country?: string;
    country_code?: string;
    region?: string;
    city?: string;
    postal?: string;
    latitude?: number;
    longitude?: number;
    connection?: { asn?: number; org?: string; isp?: string };
    timezone?: { id?: string };
    security?: { proxy?: boolean; hosting?: boolean };
  };

  const ptr = ptrName(ip);
  const [geo, rdapJson, ptrRec] = await Promise.all([
    fetchJson<Who>(`https://ipwho.is/${encodeURIComponent(ip)}`, { timeout: 7000 }),
    rdap("ip", ip),
    ptr ? doh(ptr, "PTR") : Promise.resolve([] as DnsRecord[]),
  ]);

  const cidr = rdapJson?.cidr0_cidrs?.[0];
  return {
    ip,
    version: geo?.type,
    country: geo?.country,
    countryCode: geo?.country_code,
    region: geo?.region,
    city: geo?.city,
    postal: geo?.postal,
    lat: geo?.latitude,
    lon: geo?.longitude,
    timezone: geo?.timezone?.id,
    isp: geo?.connection?.isp,
    org: geo?.connection?.org,
    asn: geo?.connection?.asn,
    reverse: ptrRec[0]?.data?.replace(/\.$/, ""),
    isProxy: geo?.security?.proxy,
    isHosting: geo?.security?.hosting,
    rdap: rdapJson
      ? {
          handle: rdapJson.handle,
          name: rdapJson.name,
          type: rdapJson.type,
          country: rdapJson.country,
          startAddress: rdapJson.startAddress,
          endAddress: rdapJson.endAddress,
          cidr: cidr?.v4prefix ? `${cidr.v4prefix}/${cidr.length}` : undefined,
        }
      : null,
  };
}

export async function collectUsername(username: string): Promise<UsernameIntel> {
  const hits = await mapPool(LIVE_PLATFORMS, 10, async (p): Promise<UsernameHit> => {
    const url = p.url(username);
    const res = await fetchOk(url, { timeout: 4500, redirect: "manual", method: "GET" });
    if (!res) {
      return { id: p.id, name: p.name, category: p.category, url, status: "unknown" };
    }
    const code = res.status;
    let status: UsernameHit["status"] = "unknown";
    if (code >= 200 && code < 300) status = "found";
    else if (code === 404 || code === 410) status = "absent";
    else if (code >= 300 && code < 400) {
      const loc = res.headers.get("location") ?? "";
      status = loc.includes(username) ? "found" : "unknown";
    }
    return { id: p.id, name: p.name, category: p.category, url, status, httpStatus: code };
  });

  hits.sort((a, b) => {
    const rank = { found: 0, unknown: 1, absent: 2 };
    return rank[a.status] - rank[b.status] || a.name.localeCompare(b.name);
  });

  return {
    username,
    hits,
    found: hits.filter((h) => h.status === "found").length,
    checked: hits.length,
  };
}

export async function collectGithub(username: string): Promise<GithubIntel> {
  const res = await fetchOk(`https://api.github.com/users/${encodeURIComponent(username)}`, {
    timeout: 7000,
    headers: {
      Accept: "application/vnd.github+json",
      "User-Agent": "FathomResearch/1.0",
    },
  });
  if (!res) return { found: false, message: "GitHub did not respond" };
  if (res.status === 404) return { found: false, message: "No public GitHub user" };
  if (!res.ok) return { found: false, message: `GitHub HTTP ${res.status}` };
  const u = (await res.json()) as {
    login?: string;
    name?: string | null;
    bio?: string | null;
    company?: string | null;
    location?: string | null;
    blog?: string | null;
    twitter_username?: string | null;
    public_repos?: number;
    followers?: number;
    following?: number;
    created_at?: string;
    avatar_url?: string;
    html_url?: string;
  };
  return {
    found: true,
    login: u.login,
    name: u.name,
    bio: u.bio,
    company: u.company,
    location: u.location,
    blog: u.blog,
    twitter: u.twitter_username,
    publicRepos: u.public_repos,
    followers: u.followers,
    following: u.following,
    createdAt: u.created_at,
    avatarUrl: u.avatar_url,
    htmlUrl: u.html_url,
  };
}

export async function collectEmail(email: string): Promise<EmailIntel> {
  const normalized = email.trim().toLowerCase();
  const [local, domain] = normalized.split("@");
  const hash = createHash("md5").update(normalized).digest("hex");
  const avatarUrl = `https://www.gravatar.com/avatar/${hash}?d=404&s=128`;
  const profileUrl = `https://www.gravatar.com/${hash}`;

  const [avatarRes, profile] = await Promise.all([
    fetchOk(avatarUrl, { timeout: 5000 }),
    fetchJson<{ entry?: { displayName?: string }[] }>(`https://en.gravatar.com/${hash}.json`, {
      timeout: 5000,
    }),
  ]);

  return {
    email: normalized,
    local: local ?? "",
    domain: domain ?? "",
    validSyntax: Boolean(local && domain),
    roleAccount: isRoleAccount(local ?? ""),
    disposable: isDisposableDomain(domain ?? ""),
    gravatar: {
      hash,
      hasImage: Boolean(avatarRes && avatarRes.ok),
      profileUrl,
      avatarUrl: `https://www.gravatar.com/avatar/${hash}?s=128&d=identicon`,
      displayName: profile?.entry?.[0]?.displayName,
    },
  };
}

export async function collectUrl(raw: string): Promise<UrlIntel> {
  let normalized = raw;
  try {
    normalized = parseHttpUrl(raw.includes("://") ? raw : `https://${raw}`).toString();
  } catch {
    normalized = raw.startsWith("http") ? raw : `https://${raw}`;
  }

  const chain: { url: string; status?: number }[] = [];
  let current = normalized;
  let finalUrl = normalized;

  for (let i = 0; i < 5; i++) {
    try {
      const parsed = parseHttpUrl(current);
      await assertPublicHost(parsed.hostname);
    } catch {
      chain.push({ url: current });
      break;
    }
    const res = await fetchOk(current, { timeout: 7000, redirect: "manual" });
    if (!res) {
      chain.push({ url: current });
      break;
    }
    chain.push({ url: current, status: res.status });
    if (res.status >= 300 && res.status < 400) {
      const loc = res.headers.get("location");
      if (!loc) break;
      try {
        current = new URL(loc, current).toString();
        finalUrl = current;
        continue;
      } catch {
        break;
      }
    }
    finalUrl = current;
    break;
  }

  const http = await probeHttp(finalUrl);
  let host = "";
  try {
    host = new URL(finalUrl).hostname;
  } catch {
    host = "";
  }

  return { input: raw, normalized, host, chain, finalUrl, http };
}
