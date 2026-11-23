import { createHash } from "node:crypto";
import { isDisposableDomain, isRoleAccount } from "./disposable";
import { phoneIntel } from "./phone";
import { assertPublicHost, parseHttpUrl } from "./ssrf.server";
import type {
  DnsRecord,
  DomainIntel,
  EmailIntel,
  GithubIntel,
  HashIntel,
  HttpProbe,
  IpIntel,
  PhoneIntel,
  PhoneSighting,
  UrlIntel,
  UsernameHit,
  UsernameIntel,
  WalletIntel,
} from "./types";

const BROWSER_UA =
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36";

async function fetchRes(
  url: string,
  opts: {
    timeout?: number;
    redirect?: RequestRedirect;
    headers?: Record<string, string>;
    accept?: string;
  } = {},
): Promise<Response | null> {
  const ctrl = new AbortController();
  const t = setTimeout(() => ctrl.abort(), opts.timeout ?? 8000);
  try {
    return await fetch(url, {
      redirect: opts.redirect ?? "follow",
      signal: ctrl.signal,
      headers: {
        "User-Agent": BROWSER_UA,
        Accept: opts.accept ?? "*/*",
        ...(opts.headers ?? {}),
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
  opts: { timeout?: number; headers?: Record<string, string>; accept?: string } = {},
): Promise<{ status: number; data: T | null }> {
  const res = await fetchRes(url, {
    timeout: opts.timeout ?? 8000,
    headers: opts.headers,
    accept: opts.accept ?? "application/json",
  });
  if (!res) return { status: 0, data: null };
  try {
    const data = (await res.json()) as T;
    return { status: res.status, data };
  } catch {
    return { status: res.status, data: null };
  }
}

async function fetchText(url: string, timeout = 7000): Promise<{ status: number; text: string }> {
  const res = await fetchRes(url, { timeout, accept: "text/plain, text/html, */*" });
  if (!res) return { status: 0, text: "" };
  try {
    return { status: res.status, text: (await res.text()).slice(0, 80_000) };
  } catch {
    return { status: res.status, text: "" };
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
  await Promise.all(Array.from({ length: Math.min(limit, Math.max(items.length, 1)) }, () => worker()));
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
  const encoded = encodeURIComponent(name);
  const endpoints = [
    `https://cloudflare-dns.com/dns-query?name=${encoded}&type=${type}`,
    `https://dns.google/resolve?name=${encoded}&type=${type}`,
  ];
  for (const url of endpoints) {
    const { data } = await fetchJson<DohResponse>(url, {
      timeout: 6000,
      accept: "application/dns-json, application/json",
    });
    if (data?.Answer?.length) {
      return data.Answer.map((a) => ({
        type: DOH_TYPES[a.type] ?? String(a.type),
        name: a.name,
        ttl: a.TTL,
        data: String(a.data).replace(/^"|"$/g, ""),
      }));
    }
  }
  return [];
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
  const { status, data } = await fetchJson<RdapJson>(
    `https://rdap.org/${kind}/${encodeURIComponent(query)}`,
    { timeout: 8000, accept: "application/rdap+json, application/json" },
  );
  if (status >= 200 && status < 300) return data;
  return null;
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

  const res = await fetchRes(rawUrl, { timeout: 8000, redirect: "follow" });
  if (!res) {
    return { url: rawUrl, securityTxt: false, robots: false, sitemaps: [] };
  }

  const buf = new Uint8Array(await res.arrayBuffer());
  const html = new TextDecoder("utf-8", { fatal: false }).decode(buf.slice(0, 48_000));
  const headers = res.headers;
  const origin = new URL(rawUrl).origin;
  const [sec, robots] = await Promise.all([
    fetchRes(`${origin}/.well-known/security.txt`, { timeout: 4000 }),
    fetchRes(`${origin}/robots.txt`, { timeout: 4000 }),
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

const COMMON_HOSTS = [
  "www",
  "mail",
  "ftp",
  "api",
  "app",
  "dev",
  "staging",
  "cdn",
  "blog",
  "docs",
  "status",
  "git",
  "vpn",
  "smtp",
  "ns1",
  "ns2",
  "autodiscover",
  "portal",
  "static",
  "img",
];

type CertSpotter = { dns_names?: string[]; issuer?: { name?: string }; not_before?: string; not_after?: string };

async function collectSubdomains(host: string): Promise<{ names: string[]; certs: DomainIntel["certs"] }> {
  const names = new Set<string>();
  const certs: DomainIntel["certs"] = [];

  const certReq = fetchJson<CertSpotter[]>(
    `https://api.certspotter.com/v1/issuances?domain=${encodeURIComponent(host)}&include_subdomains=true&expand=dns_names`,
    { timeout: 8000 },
  );
  const htReq = fetchText(`https://api.hackertarget.com/hostsearch/?q=${encodeURIComponent(host)}`, 7000);
  const bruteReq = mapPool(COMMON_HOSTS, 8, async (prefix) => {
    const fqdn = `${prefix}.${host}`;
    const recs = await doh(fqdn, "A");
    return recs.length ? fqdn : null;
  });

  const [certRes, ht, brute] = await Promise.all([certReq, htReq, bruteReq]);

  if (Array.isArray(certRes.data)) {
    for (const row of certRes.data.slice(0, 30)) {
      const sans = (row.dns_names ?? []).map((s) => s.toLowerCase());
      sans.forEach((n) => {
        const clean = n.replace(/^\*\./, "");
        if (clean === host || clean.endsWith(`.${host}`)) names.add(clean);
      });
      certs.push({
        commonName: sans[0] ?? host,
        sans,
        issuer: row.issuer?.name ?? "",
        notBefore: row.not_before,
        notAfter: row.not_after,
      });
    }
  }

  if (ht.status === 200 && ht.text && !ht.text.toLowerCase().startsWith("error")) {
    for (const line of ht.text.split("\n")) {
      const name = line.split(",")[0]?.trim().toLowerCase();
      if (name && (name === host || name.endsWith(`.${host}`))) names.add(name);
    }
  }

  brute.filter(Boolean).forEach((n) => names.add(n as string));

  return {
    names: [...names].filter((n) => n !== host).sort().slice(0, 40),
    certs: certs.slice(0, 16),
  };
}

export async function collectDomain(domain: string): Promise<DomainIntel> {
  const host = domain.toLowerCase().replace(/\.$/, "");

  const [a, aaaa, mx, ns, txt, soa, dmarcTxt, rdapJson, http, extra, wayback] = await Promise.all([
    doh(host, "A"),
    doh(host, "AAAA"),
    doh(host, "MX"),
    doh(host, "NS"),
    doh(host, "TXT"),
    doh(host, "SOA"),
    doh(`_dmarc.${host}`, "TXT"),
    rdap("domain", host),
    probeHttp(`https://${host}`),
    collectSubdomains(host),
    fetchJson<{ archived_snapshots?: { closest?: { timestamp?: string; url?: string; status?: string } } }>(
      `https://archive.org/wayback/available?url=${encodeURIComponent(host)}`,
      { timeout: 7000 },
    ),
  ]);

  const dns = [...a, ...aaaa, ...mx, ...ns, ...txt, ...soa];
  const nameservers = ns.map((r) => r.data.replace(/\.$/, ""));
  const mxHosts = mx.map((r) => r.data.replace(/\.$/, ""));
  const ips = [...a, ...aaaa].map((r) => r.data);

  const registrarEntity = rdapJson?.entities?.find((e) => e.roles?.includes("registrar"));
  const abuseEntity = rdapJson?.entities?.find((e) => e.roles?.includes("abuse"));
  const registered = rdapJson?.events?.find((e) => e.eventAction === "registration")?.eventDate;
  const expires = rdapJson?.events?.find((e) => e.eventAction === "expiration")?.eventDate;

  const closest = wayback.data?.archived_snapshots?.closest;
  const samples = closest?.timestamp
    ? [{ timestamp: closest.timestamp, original: closest.url ?? host, status: closest.status }]
    : [];
  const txtValues = txt.map((r) => r.data);
  const spf = txtValues.find((t) => /^v=spf1\b/i.test(t));
  const dmarc = dmarcTxt.map((r) => r.data).find((t) => /v=dmarc1/i.test(t));
  const spfAll = spf?.match(/([~+\-?])all\b/i)?.[0];
  const dmarcPolicy = dmarc?.match(/\bp=([^;\s]+)/i)?.[1];

  return {
    domain: host,
    dns,
    nameservers,
    mx: mxHosts,
    ips,
    txt: txtValues,
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
    certs: extra.certs,
    subdomains: extra.names,
    wayback: {
      first: samples[0]?.timestamp,
      last: samples[0]?.timestamp,
      count: samples.length,
      samples,
    },
    http,
    emailAuth: {
      spf,
      spfAll,
      dmarc,
      dmarcPolicy,
    },
  };
}

export async function collectIp(ip: string): Promise<IpIntel> {
  type IpApi = {
    status?: string;
    country?: string;
    countryCode?: string;
    regionName?: string;
    city?: string;
    zip?: string;
    lat?: number;
    lon?: number;
    timezone?: string;
    isp?: string;
    org?: string;
    as?: string;
    asname?: string;
    reverse?: string;
    proxy?: boolean;
    hosting?: boolean;
    mobile?: boolean;
  };
  type IpInfo = {
    ip?: string;
    hostname?: string;
    city?: string;
    region?: string;
    country?: string;
    loc?: string;
    org?: string;
    postal?: string;
    timezone?: string;
  };

  const ptr = ptrName(ip);
  const [ipApi, info, rdapJson, ptrRec] = await Promise.all([
    fetchJson<IpApi>(
      `http://ip-api.com/json/${encodeURIComponent(ip)}?fields=status,country,countryCode,regionName,city,zip,lat,lon,isp,org,as,asname,reverse,proxy,hosting,mobile,timezone`,
      { timeout: 7000 },
    ),
    fetchJson<IpInfo>(`https://ipinfo.io/${encodeURIComponent(ip)}/json`, { timeout: 7000 }),
    rdap("ip", ip),
    ptr ? doh(ptr, "PTR") : Promise.resolve([] as DnsRecord[]),
  ]);

  const geo = ipApi.data?.status === "success" ? ipApi.data : null;
  const fallback = info.data;
  const loc = fallback?.loc?.split(",");
  const asnNum = (geo?.as ?? fallback?.org ?? "").match(/AS(\d+)/i)?.[1];
  const asname = geo?.asname ?? (geo?.as ?? fallback?.org ?? "").replace(/AS\d+\s*/i, "").trim();

  const cidr = rdapJson?.cidr0_cidrs?.[0];
  return {
    ip,
    country: geo?.country ?? (fallback?.country === "AU" ? "Australia" : fallback?.country),
    countryCode: geo?.countryCode ?? fallback?.country,
    region: geo?.regionName ?? fallback?.region,
    city: geo?.city ?? fallback?.city,
    postal: geo?.zip ?? fallback?.postal,
    lat: geo?.lat ?? (loc?.[0] ? Number(loc[0]) : undefined),
    lon: geo?.lon ?? (loc?.[1] ? Number(loc[1]) : undefined),
    timezone: geo?.timezone ?? fallback?.timezone,
    isp: geo?.isp ?? fallback?.org,
    org: geo?.org ?? fallback?.org,
    asn: asnNum,
    asname: asname || undefined,
    reverse: geo?.reverse || ptrRec[0]?.data?.replace(/\.$/, "") || fallback?.hostname,
    isProxy: geo?.proxy,
    isHosting: geo?.hosting,
    isMobile: geo?.mobile,
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

type CheckResult = {
  status: UsernameHit["status"];
  detail?: string;
  bio?: string;
  followers?: number;
  avatar?: string;
  httpStatus?: number;
};

function plain(value?: string | null) {
  return value?.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim().slice(0, 180) || undefined;
}

async function statusFromHttp(url: string): Promise<CheckResult> {
  const res = await fetchRes(url, { timeout: 6000, redirect: "follow" });
  if (!res) return { status: "unknown" };
  if (res.status === 404 || res.status === 410) return { status: "absent", httpStatus: res.status };
  if (res.status >= 200 && res.status < 300) return { status: "found", httpStatus: res.status };
  return { status: "unknown", httpStatus: res.status };
}

async function checkGithubUser(username: string): Promise<CheckResult> {
  const official = await fetchRes(`https://api.github.com/users/${encodeURIComponent(username)}`, {
    timeout: 6000,
    headers: { Accept: "application/vnd.github+json" },
  });
  if (official?.status === 404) return { status: "absent", httpStatus: 404 };
  if (official?.ok) {
    try {
      const u = (await official.json()) as { name?: string; login?: string };
      return { status: "found", detail: u.name || u.login, httpStatus: 200 };
    } catch {
      return { status: "found", httpStatus: 200 };
    }
  }
  const ungh = await fetchJson<{ user?: { name?: string; username?: string } }>(
    `https://ungh.cc/users/${encodeURIComponent(username)}`,
    { timeout: 6000 },
  );
  if (ungh.status === 404) return { status: "absent", httpStatus: 404 };
  if (ungh.data?.user?.username) {
    return { status: "found", detail: ungh.data.user.name || ungh.data.user.username, httpStatus: 200 };
  }
  return statusFromHttp(`https://github.com/${encodeURIComponent(username)}`);
}

const CHECKERS: {
  id: string;
  name: string;
  category: string;
  url: (u: string) => string;
  check: (u: string) => Promise<CheckResult>;
}[] = [
  { id: "github", name: "GitHub", category: "Code", url: (u) => `https://github.com/${u}`, check: checkGithubUser },
  {
    id: "gitlab",
    name: "GitLab",
    category: "Code",
    url: (u) => `https://gitlab.com/${u}`,
    check: async (u) => {
      const { status, data } = await fetchJson<{ username?: string; name?: string }[] | { message?: string }>(
        `https://gitlab.com/api/v4/users?username=${encodeURIComponent(u)}`,
      );
      if (Array.isArray(data)) {
        const hit = data.find((row) => row.username?.toLowerCase() === u.toLowerCase());
        return hit ? { status: "found", detail: hit.name, httpStatus: status } : { status: "absent", httpStatus: status };
      }
      return { status: "unknown", httpStatus: status };
    },
  },
  {
    id: "dockerhub",
    name: "Docker Hub",
    category: "Code",
    url: (u) => `https://hub.docker.com/u/${u}`,
    check: async (u) => {
      const { status, data } = await fetchJson<{ username?: string; full_name?: string }>(
        `https://hub.docker.com/v2/users/${encodeURIComponent(u)}`,
      );
      if (status === 404) return { status: "absent", httpStatus: 404 };
      if (status === 200 && data) return { status: "found", detail: data.full_name || data.username, httpStatus: 200 };
      return { status: "unknown", httpStatus: status };
    },
  },
  {
    id: "huggingface",
    name: "Hugging Face",
    category: "Code",
    url: (u) => `https://huggingface.co/${u}`,
    check: async (u) => {
      const { status, data } = await fetchJson<{ fullname?: string; error?: string }>(
        `https://huggingface.co/api/users/${encodeURIComponent(u)}/overview`,
      );
      if (status === 404) return { status: "absent", httpStatus: 404 };
      if (status === 200 && data && !data.error) return { status: "found", detail: data.fullname, httpStatus: 200 };
      return { status: "unknown", httpStatus: status };
    },
  },
  {
    id: "crates",
    name: "crates.io",
    category: "Code",
    url: (u) => `https://crates.io/users/${u}`,
    check: async (u) => {
      const { status, data } = await fetchJson<{ user?: { name?: string; login?: string } }>(
        `https://crates.io/api/v1/users/${encodeURIComponent(u)}`,
      );
      if (status === 404) return { status: "absent", httpStatus: 404 };
      if (data?.user) return { status: "found", detail: data.user.name || data.user.login, httpStatus: 200 };
      return { status: "unknown", httpStatus: status };
    },
  },
  {
    id: "keybase",
    name: "Keybase",
    category: "Community",
    url: (u) => `https://keybase.io/${u}`,
    check: async (u) => {
      const { status, data } = await fetchJson<{
        status?: { code?: number; name?: string };
        them?: { profile?: { full_name?: string } };
      }>(`https://keybase.io/_/api/1.0/user/lookup.json?username=${encodeURIComponent(u)}`);
      if (data?.status?.name === "NOT_FOUND" || data?.status?.code === 205) {
        return { status: "absent", httpStatus: status };
      }
      if (data?.status?.code === 0) return { status: "found", detail: data.them?.profile?.full_name, httpStatus: 200 };
      return { status: "unknown", httpStatus: status };
    },
  },
  {
    id: "hn",
    name: "Hacker News",
    category: "Community",
    url: (u) => `https://news.ycombinator.com/user?id=${u}`,
    check: async (u) => {
      const { status, data } = await fetchJson<{ id?: string; karma?: number } | null>(
        `https://hacker-news.firebaseio.com/v0/user/${encodeURIComponent(u)}.json`,
      );
      if (data && data.id) return { status: "found", detail: `${data.karma ?? 0} karma`, httpStatus: status };
      if (status === 200 && data === null) return { status: "absent", httpStatus: 200 };
      return { status: "unknown", httpStatus: status };
    },
  },
  {
    id: "devto",
    name: "Dev.to",
    category: "Community",
    url: (u) => `https://dev.to/${u}`,
    check: async (u) => {
      const { status, data } = await fetchJson<{ name?: string; username?: string }>(
        `https://dev.to/api/users/by_username?url=${encodeURIComponent(u)}`,
      );
      if (status === 404) return { status: "absent", httpStatus: 404 };
      if (data?.username) return { status: "found", detail: data.name, httpStatus: 200 };
      return { status: "unknown", httpStatus: status };
    },
  },
  {
    id: "mastodon",
    name: "Mastodon",
    category: "Social",
    url: (u) => `https://mastodon.social/@${u}`,
    check: async (u) => {
      const { status, data } = await fetchJson<{ display_name?: string; username?: string }>(
        `https://mastodon.social/api/v1/accounts/lookup?acct=${encodeURIComponent(u)}`,
      );
      if (status === 404) return { status: "absent", httpStatus: 404 };
      if (data?.username) {
        const page = await fetchRes(`https://mastodon.social/@${encodeURIComponent(u)}`, { timeout: 5000 });
        if (page && (page.status === 404 || page.status === 410)) {
          return { status: "absent", httpStatus: page.status };
        }
        const row = data as {
          username?: string;
          display_name?: string;
          note?: string;
          followers_count?: number;
          avatar?: string;
        };
        return {
          status: "found",
          detail: row.display_name || row.username,
          bio: plain(row.note),
          followers: row.followers_count,
          avatar: row.avatar,
          httpStatus: 200,
        };
      }
      return { status: "unknown", httpStatus: status };
    },
  },
  {
    id: "bsky",
    name: "Bluesky",
    category: "Social",
    url: (u) => `https://bsky.app/profile/${u.includes(".") ? u : `${u}.bsky.social`}`,
    check: async (u) => {
      const actor = u.includes(".") ? u : `${u}.bsky.social`;
      const { status, data } = await fetchJson<{
        displayName?: string;
        handle?: string;
        description?: string;
        followersCount?: number;
        avatar?: string;
        error?: string;
      }>(`https://public.api.bsky.app/xrpc/app.bsky.actor.getProfile?actor=${encodeURIComponent(actor)}`);
      if (status === 400 || status === 404 || data?.error) return { status: "absent", httpStatus: status };
      if (data?.handle) {
        return {
          status: "found",
          detail: data.displayName || data.handle,
          bio: plain(data.description),
          followers: data.followersCount,
          avatar: data.avatar,
          httpStatus: 200,
        };
      }
      return { status: "unknown", httpStatus: status };
    },
  },
  {
    id: "wikipedia",
    name: "Wikipedia",
    category: "Other",
    url: (u) => `https://en.wikipedia.org/wiki/User:${u}`,
    check: async (u) => {
      const { status, data } = await fetchJson<{
        query?: { users?: { name?: string; missing?: string; userid?: number }[] };
      }>(`https://en.wikipedia.org/w/api.php?action=query&list=users&ususers=${encodeURIComponent(u)}&format=json`);
      const row = data?.query?.users?.[0];
      if (!row) return { status: "unknown", httpStatus: status };
      if ("missing" in row || !row.userid) return { status: "absent", httpStatus: 200 };
      return { status: "found", httpStatus: 200 };
    },
  },
  {
    id: "codeberg",
    name: "Codeberg",
    category: "Code",
    url: (u) => `https://codeberg.org/${u}`,
    check: async (u) => {
      const { status, data } = await fetchJson<{ login?: string; full_name?: string; message?: string }>(
        `https://codeberg.org/api/v1/users/${encodeURIComponent(u)}`,
      );
      if (status === 404) return { status: "absent", httpStatus: 404 };
      if (status === 200 && data?.login) return { status: "found", detail: data.full_name || data.login, httpStatus: 200 };
      return { status: "unknown", httpStatus: status };
    },
  },
  {
    id: "npm",
    name: "npm",
    category: "Code",
    url: (u) => `https://www.npmjs.com/~${u}`,
    check: async (u) => {
      const { status, data } = await fetchJson<{ total?: number; results?: { package?: { name?: string } }[] }>(
        `https://api.npms.io/v2/search?q=${encodeURIComponent(`maintainer:${u}`)}&size=1`,
      );
      if (status !== 200) return { status: "unknown", httpStatus: status };
      const name = data?.results?.[0]?.package?.name;
      if ((data?.total ?? 0) > 0 && name) return { status: "found", detail: name, httpStatus: 200 };
      return { status: "absent", httpStatus: 200 };
    },
  },
  {
    id: "rubygems",
    name: "RubyGems",
    category: "Code",
    url: (u) => `https://rubygems.org/profiles/${u}`,
    check: async (u) => {
      const { status, data } = await fetchJson<{ handle?: string }>(
        `https://rubygems.org/api/v1/profiles/${encodeURIComponent(u)}.json`,
      );
      if (status === 404) return { status: "absent", httpStatus: 404 };
      if (data?.handle) return { status: "found", detail: data.handle, httpStatus: 200 };
      return { status: "unknown", httpStatus: status };
    },
  },
  {
    id: "youtube",
    name: "YouTube",
    category: "Social",
    url: (u) => `https://www.youtube.com/user/${u}`,
    check: async (u) => {
      const res = await fetchRes(
        `https://www.youtube.com/feeds/videos.xml?user=${encodeURIComponent(u)}`,
        { timeout: 7000, accept: "application/atom+xml, application/xml, text/xml" },
      );
      if (!res || res.status === 404) return { status: "absent", httpStatus: res?.status ?? 404 };
      if (!res.ok) return { status: "unknown", httpStatus: res.status };
      const text = (await res.text()).slice(0, 4000);
      if (!text.includes("<feed")) return { status: "unknown", httpStatus: res.status };
      const title = text.match(/<title>([^<]+)<\/title>/)?.[1];
      return { status: "found", detail: title, httpStatus: 200 };
    },
  },
  {
    id: "tiktok",
    name: "TikTok",
    category: "Social",
    url: (u) => `https://www.tiktok.com/@${u}`,
    check: async (u) => {
      const { status, data } = await fetchJson<{ author_name?: string; author_url?: string; message?: string }>(
        `https://www.tiktok.com/oembed?url=${encodeURIComponent(`https://www.tiktok.com/@${u}`)}`,
      );
      if (status === 400 || status === 404) return { status: "absent", httpStatus: status };
      if (status === 200 && data?.author_name) return { status: "found", detail: data.author_name, httpStatus: 200 };
      return { status: "unknown", httpStatus: status };
    },
  },
  {
    id: "twitch",
    name: "Twitch",
    category: "Social",
    url: (u) => `https://www.twitch.tv/${u}`,
    check: async (u) => {
      const { status, data } = await fetchJson<
        { displayName?: string; login?: string; bio?: string; followers?: number; logo?: string }[]
      >(`https://api.ivr.fi/v2/twitch/user?login=${encodeURIComponent(u)}`);
      if (status !== 200) return { status: "unknown", httpStatus: status };
      const row = data?.find((item) => item.login?.toLowerCase() === u.toLowerCase());
      if (!row) return { status: "absent", httpStatus: 200 };
      return {
        status: "found",
        detail: row.displayName || row.login,
        bio: plain(row.bio),
        followers: row.followers,
        avatar: row.logo,
        httpStatus: 200,
      };
    },
  },
  {
    id: "tumblr",
    name: "Tumblr",
    category: "Social",
    url: (u) => `https://${u}.tumblr.com`,
    check: async (u) => {
      if (!/^[a-z0-9-]{2,32}$/i.test(u)) return { status: "absent", httpStatus: 0 };
      const res = await fetchRes(`https://${u}.tumblr.com/api/read/json?num=0`, { timeout: 7000 });
      if (!res || res.status === 404) return { status: "absent", httpStatus: res?.status ?? 404 };
      if (!res.ok) return { status: "unknown", httpStatus: res.status };
      const raw = await res.text();
      const start = raw.indexOf("{");
      const end = raw.lastIndexOf("}");
      if (start < 0 || end < start) return { status: "unknown", httpStatus: res.status };
      try {
        const data = JSON.parse(raw.slice(start, end + 1)) as { tumblelog?: { title?: string; name?: string } };
        if (data.tumblelog?.name?.toLowerCase() === u.toLowerCase()) {
          const title = data.tumblelog.title?.trim();
          const safeTitle = title && !/[./]/.test(title) && title.toLowerCase() !== u.toLowerCase() ? title : undefined;
          return { status: "found", detail: safeTitle || data.tumblelog.name, httpStatus: 200 };
        }
      } catch {
        return { status: "unknown", httpStatus: res.status };
      }
      return { status: "absent", httpStatus: 200 };
    },
  },
  {
    id: "vimeo",
    name: "Vimeo",
    category: "Social",
    url: (u) => `https://vimeo.com/${u}`,
    check: async (u) => {
      const { status, data } = await fetchJson<{ display_name?: string; bio?: string; location?: string }>(
        `https://vimeo.com/api/v2/${encodeURIComponent(u)}/info.json`,
      );
      if (status === 404) return { status: "absent", httpStatus: 404 };
      if (data?.display_name) {
        return { status: "found", detail: data.display_name, bio: plain(data.bio || data.location), httpStatus: 200 };
      }
      return { status: "unknown", httpStatus: status };
    },
  },
  {
    id: "mixcloud",
    name: "Mixcloud",
    category: "Social",
    url: (u) => `https://www.mixcloud.com/${u}/`,
    check: async (u) => {
      const { status, data } = await fetchJson<{
        name?: string;
        username?: string;
        biog?: string;
        pictures?: { large?: string };
      }>(`https://api.mixcloud.com/${encodeURIComponent(u)}/`);
      if (status === 404) return { status: "absent", httpStatus: 404 };
      if (data?.username) {
        return { status: "found", detail: data.name || data.username, bio: plain(data.biog), avatar: data.pictures?.large, httpStatus: 200 };
      }
      return { status: "unknown", httpStatus: status };
    },
  },
  {
    id: "steam",
    name: "Steam",
    category: "Social",
    url: (u) => `https://steamcommunity.com/id/${u}`,
    check: async (u) => {
      const res = await fetchRes(`https://steamcommunity.com/id/${encodeURIComponent(u)}?xml=1`, {
        timeout: 7000,
        accept: "application/xml, text/xml",
      });
      if (!res) return { status: "unknown" };
      if (res.status === 404) return { status: "absent", httpStatus: 404 };
      const text = (await res.text()).slice(0, 8000);
      if (/could not be found/i.test(text)) return { status: "absent", httpStatus: res.status };
      const name = text.match(/<steamID><!\[CDATA\[(.*?)\]\]>/)?.[1];
      const vanity = text.match(/<customURL><!\[CDATA\[(.*?)\]\]>/)?.[1];
      const avatar = text.match(/<avatarFull><!\[CDATA\[(.*?)\]\]>/)?.[1];
      if (!name || vanity?.toLowerCase() !== u.toLowerCase()) return { status: "absent", httpStatus: res.status };
      return { status: "found", detail: name, avatar, httpStatus: 200 };
    },
  },
  {
    id: "chess",
    name: "Chess.com",
    category: "Community",
    url: (u) => `https://www.chess.com/member/${u}`,
    check: async (u) => {
      const { status, data } = await fetchJson<{
        username?: string;
        name?: string;
        title?: string;
        followers?: number;
        location?: string;
        avatar?: string;
      }>(`https://api.chess.com/pub/player/${encodeURIComponent(u)}`);
      if (status === 404) return { status: "absent", httpStatus: 404 };
      if (data?.username) {
        const label = [data.title, data.name || data.username].filter(Boolean).join(" ");
        return {
          status: "found",
          detail: label,
          bio: data.location,
          followers: data.followers,
          avatar: data.avatar,
          httpStatus: 200,
        };
      }
      return { status: "unknown", httpStatus: status };
    },
  },
  {
    id: "lichess",
    name: "Lichess",
    category: "Community",
    url: (u) => `https://lichess.org/@/${u}`,
    check: async (u) => {
      const { status, data } = await fetchJson<{
        username?: string;
        title?: string;
        profile?: { bio?: string; location?: string };
      }>(`https://lichess.org/api/user/${encodeURIComponent(u)}`, { headers: { Accept: "application/json" } });
      if (status === 404) return { status: "absent", httpStatus: 404 };
      if (data?.username) {
        return {
          status: "found",
          detail: [data.title, data.username].filter(Boolean).join(" "),
          bio: plain(data.profile?.bio || data.profile?.location),
          httpStatus: 200,
        };
      }
      return { status: "unknown", httpStatus: status };
    },
  },
  {
    id: "soundcloud",
    name: "SoundCloud",
    category: "Creative",
    url: (u) => `https://soundcloud.com/${u}`,
    check: (u) => statusFromHttp(`https://soundcloud.com/${encodeURIComponent(u)}`),
  },
];

export async function collectUsername(username: string): Promise<UsernameIntel> {
  const hits = await mapPool(CHECKERS, 8, async (p): Promise<UsernameHit> => {
    try {
      const result = await p.check(username);
      return {
        id: p.id,
        name: p.name,
        category: p.category,
        url: p.url(username),
        status: result.status,
        detail: result.detail,
        bio: result.bio,
        followers: result.followers,
        avatar: result.avatar,
        httpStatus: result.httpStatus,
      };
    } catch {
      return { id: p.id, name: p.name, category: p.category, url: p.url(username), status: "unknown" };
    }
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
  const official = await fetchRes(`https://api.github.com/users/${encodeURIComponent(username)}`, {
    timeout: 7000,
    headers: { Accept: "application/vnd.github+json" },
  });
  if (official?.status === 404) return { found: false, message: "No public GitHub user" };
  if (official?.ok) {
    const u = (await official.json()) as {
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

  const ungh = await fetchJson<{ user?: { username?: string; name?: string; avatar?: string; twitter?: string } }>(
    `https://ungh.cc/users/${encodeURIComponent(username)}`,
    { timeout: 6000 },
  );
  if (ungh.data?.user?.username) {
    const u = ungh.data.user;
    return {
      found: true,
      login: u.username,
      name: u.name,
      twitter: u.twitter,
      avatarUrl: u.avatar,
      htmlUrl: `https://github.com/${u.username}`,
    };
  }

  const html = await fetchRes(`https://github.com/${encodeURIComponent(username)}`, { timeout: 6000 });
  if (html?.status === 404) return { found: false, message: "No public GitHub user" };
  if (html?.ok) {
    return { found: true, login: username, htmlUrl: `https://github.com/${username}` };
  }
  return { found: false, message: "GitHub did not respond" };
}

export async function collectEmail(email: string): Promise<EmailIntel> {
  const normalized = email.trim().toLowerCase();
  const [local, domain] = normalized.split("@");
  const hash = createHash("md5").update(normalized).digest("hex");
  const avatarCheck = `https://www.gravatar.com/avatar/${hash}?d=404&s=128`;
  const profileUrl = `https://www.gravatar.com/${hash}`;

  const [avatarRes, profile, mx] = await Promise.all([
    fetchRes(avatarCheck, { timeout: 5000 }),
    fetchJson<{ entry?: { displayName?: string }[] }>(`https://en.gravatar.com/${hash}.json`, { timeout: 5000 }),
    domain ? doh(domain, "MX") : Promise.resolve([] as DnsRecord[]),
  ]);

  return {
    email: normalized,
    local: local ?? "",
    domain: domain ?? "",
    validSyntax: Boolean(local && domain),
    roleAccount: isRoleAccount(local ?? ""),
    disposable: isDisposableDomain(domain ?? ""),
    mx: mx.map((r) => r.data.replace(/\.$/, "")),
    gravatar: {
      hash,
      hasImage: Boolean(avatarRes && avatarRes.ok),
      profileUrl,
      avatarUrl: `https://www.gravatar.com/avatar/${hash}?s=128&d=identicon`,
      displayName: profile.data?.entry?.[0]?.displayName,
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
    const res = await fetchRes(current, { timeout: 7000, redirect: "manual" });
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

function stripMarkup(html: string) {
  return html
    .replace(/<script[\s\S]*?<\/script>/gi, " ")
    .replace(/<style[\s\S]*?<\/style>/gi, " ")
    .replace(/<[^>]+>/g, " ")
    .replace(/&nbsp;/gi, " ")
    .replace(new RegExp("&" + "amp;", "gi"), "&")
    .replace(new RegExp("&" + "quot;", "gi"), '"')
    .replace(new RegExp("&" + "#39;", "g"), "'")
    .replace(/\s+/g, " ")
    .trim();
}

function mentionsNumber(text: string, candidates: string[]) {
  const compact = text.replace(/\D/g, "");
  return candidates.some((digits) => digits.length >= 9 && compact.includes(digits));
}

const prefixCache = new Map<string, [string, string][]>();

async function fetchBody(url: string, timeout = 12000): Promise<{ status: number; text: string }> {
  const res = await fetchRes(url, { timeout, accept: "text/plain, */*" });
  if (!res) return { status: 0, text: "" };
  try {
    const text = await res.text();
    return { status: res.status, text: text.length > 4_000_000 ? text.slice(0, 4_000_000) : text };
  } catch {
    return { status: res.status, text: "" };
  }
}

function parsePrefixFile(text: string): [string, string][] {
  const rows: [string, string][] = [];
  for (const line of text.split("\n")) {
    if (!line || line.startsWith("#") || !line.includes("|")) continue;
    const i = line.indexOf("|");
    const prefix = line.slice(0, i).trim();
    const value = line.slice(i + 1).trim();
    if (prefix && value) rows.push([prefix, value]);
  }
  rows.sort((a, b) => b[0].length - a[0].length);
  return rows;
}

async function loadPrefixFile(kind: "carrier" | "geocoding", cc: string): Promise<[string, string][]> {
  const key = `${kind}:${cc}`;
  const cached = prefixCache.get(key);
  if (cached) return cached;
  const urls = [
    `https://cdn.jsdelivr.net/gh/google/libphonenumber@master/resources/${kind}/en/${cc}.txt`,
    `https://raw.githubusercontent.com/google/libphonenumber/master/resources/${kind}/en/${cc}.txt`,
  ];
  let rows: [string, string][] = [];
  for (const url of urls) {
    const { status, text } = await fetchBody(url, kind === "geocoding" ? 15000 : 8000);
    if (status === 200 && text.includes("|")) {
      rows = parsePrefixFile(text);
      if (rows.length) break;
    }
  }
  prefixCache.set(key, rows);
  return rows;
}

function longestPrefix(rows: [string, string][], haystack: string): { prefix: string; value: string } | undefined {
  for (const [prefix, value] of rows) {
    if (haystack.startsWith(prefix) && value) return { prefix, value };
  }
  return undefined;
}

async function bingSightings(queries: string[], candidates: string[]): Promise<PhoneSighting[]> {
  const seen = new Set<string>();
  const out: PhoneSighting[] = [];
  for (const q of queries) {
    const rssRes = await fetchRes(
      `https://www.bing.com/search?format=rss&q=${encodeURIComponent(`"${q}"`)}`,
      { timeout: 8000, accept: "application/rss+xml, application/xml, text/xml, */*" },
    );
    if (!rssRes || rssRes.status !== 200) continue;
    const text = (await rssRes.text()).slice(0, 80_000);
    if (!text.includes("<item>")) continue;
    const blocks = text.match(/<item>([\s\S]*?)<\/item>/g) ?? [];
    for (const block of blocks) {
      const tag = (name: string) => {
        const m = block.match(new RegExp(`<${name}>([\\s\\S]*?)</${name}>`));
        return stripMarkup((m?.[1] ?? "").replace(/<!\[CDATA\[([\s\S]*?)\]\]>/g, "$1"));
      };
      const title = tag("title");
      const url = tag("link");
      const snippet = tag("description");
      if (!title || !url) continue;
      if (/bing\.com/i.test(url)) continue;
      if (/^https?:\/\/(en\.)?wikipedia\.org\/wiki\/1(\b|$)/i.test(url)) continue;
      if (!mentionsNumber(`${title} ${snippet} ${url}`, candidates)) continue;
      if (seen.has(url)) continue;
      seen.add(url);
      out.push({ title, url, snippet: snippet || undefined, source: "Bing" });
      if (out.length >= 8) return out;
    }
  }
  return out;
}

async function hnSightings(query: string, candidates: string[]): Promise<PhoneSighting[]> {
  const { data } = await fetchJson<{
    hits?: { title?: string | null; story_title?: string | null; url?: string | null; story_url?: string | null; comment_text?: string | null; objectID?: string }[];
  }>(`https://hn.algolia.com/api/v1/search?query=${encodeURIComponent(`"${query}"`)}&hitsPerPage=8`, { timeout: 7000 });
  const out: PhoneSighting[] = [];
  for (const hit of data?.hits ?? []) {
    const title = stripMarkup(hit.story_title || hit.title || "Hacker News thread");
    const url = hit.url || hit.story_url || (hit.objectID ? `https://news.ycombinator.com/item?id=${hit.objectID}` : "");
    const snippet = hit.comment_text ? stripMarkup(hit.comment_text).slice(0, 180) : undefined;
    if (!url || !mentionsNumber(`${title} ${snippet ?? ""} ${url}`, candidates)) continue;
    out.push({ title, url, snippet, source: "Hacker News" });
    if (out.length >= 4) break;
  }
  return out;
}

async function collectNanp(national10: string): Promise<PhoneIntel["nanp"] | undefined> {
  if (!/^\d{10}$/.test(national10)) return undefined;
  const npa = national10.slice(0, 3);
  const nxx = national10.slice(3, 6);
  const { status, text } = await fetchText(
    `https://localcallingguide.com/xmlprefix.php?npa=${npa}&nxx=${nxx}`,
    8000,
  );
  if (status !== 200 || !text.includes("<prefixdata>")) return undefined;
  const block = text.match(/<prefixdata>([\s\S]*?)<\/prefixdata>/)?.[1] ?? "";
  const tag = (name: string) => block.match(new RegExp(`<${name}>([\\s\\S]*?)</${name}>`))?.[1]?.trim();
  const lat = Number(tag("rc-lat"));
  const lon = Number(tag("rc-lon"));
  return {
    npa,
    nxx,
    company: tag("company-name"),
    rateCenter: tag("rc"),
    region: tag("region"),
    lata: tag("lata"),
    switchName: tag("switchname") || tag("switch"),
    lat: Number.isFinite(lat) ? lat : undefined,
    lon: Number.isFinite(lon) ? lon : undefined,
  };
}

function splitListedNames(raw: string): string[] {
  const parts = raw
    .split(/\s+(?=[A-Z][A-Za-z'.-]+,)/)
    .map((s) => s.trim())
    .filter((s) => s.length > 1);
  return (parts.length ? parts : [raw.trim()]).slice(0, 8);
}

function between(text: string, start: string, end: string): string | undefined {
  const re = new RegExp(`${start}\\s+([\\s\\S]+?)\\s+${end}`, "i");
  const value = text.match(re)?.[1]?.replace(/\s+/g, " ").trim();
  if (!value || /^unknown$/i.test(value)) return undefined;
  return value;
}

async function collectReverseAustralia(nationalDigits: string): Promise<PhoneIntel["directory"] | undefined> {
  if (!/^0\d{9}$/.test(nationalDigits)) return undefined;
  const url = `https://www.reverseaustralia.com/lookup/${nationalDigits}/`;
  const res = await fetchRes(url, { timeout: 9000, accept: "text/html" });
  if (!res || res.status === 404) return undefined;
  if (!res.ok) return { source: "Reverse Australia", url };
  const html = (await res.text()).slice(0, 120_000);
  const text = stripMarkup(html);
  if (!/Latest Holder|Phone Type|total complaints/i.test(text)) {
    return { source: "Reverse Australia", url };
  }
  const complaints = text.match(/(\d+)\s+complaints this year,\s+(\d+)\s+total complaints/i);
  const namesRaw = between(text, "Names found on this computer", "Address");
  const address = between(text, "Address", "History");
  const spam = /likely being a scam/i.test(text) ? "Directory flags this number as a likely scam caller" : undefined;
  return {
    source: "Reverse Australia",
    url: res.url || url,
    phoneType: between(text, "Phone Type", "Latest Holder"),
    holder: between(text, "Latest Holder", "Numbering Area"),
    area: between(text, "Numbering Area", "Last Found"),
    lastFound: text.match(/Last Found\s+([A-Z][a-z]+ \d{4})/)?.[1],
    complaintsYear: complaints ? Number(complaints[1]) : undefined,
    complaintsTotal: complaints ? Number(complaints[2]) : undefined,
    spamNote: spam,
    names: namesRaw ? splitListedNames(namesRaw) : undefined,
    address,
  };
}
function genericDirectoryTitle(title: string) {
  return /free reverse phone|reverse phone number lookup by truecaller|^home\b|okcaller\.com$/i.test(title);
}

async function collectReputation(base: PhoneIntel): Promise<NonNullable<PhoneIntel["reputation"]>> {
  const digits = base.digits || "";
  const iso = (base.country ?? "au").toLowerCase();
  const national = (base.national ?? "").replace(/\D/g, "");
  const n10 =
    base.country === "US" || base.country === "CA"
      ? digits.replace(/^1/, "").slice(0, 10)
      : "";
  const candidates: { source: string; url: string }[] = [];
  if (n10.length === 10) {
    candidates.push(
      { source: "okcaller", url: `https://www.okcaller.com/${n10}` },
      { source: "Should I Answer", url: `https://www.shouldianswer.com/phone-number/${n10}` },
      { source: "ReportedCalls", url: `https://www.reportedcalls.com/${n10}` },
    );
  }
  if (base.country === "AU" && digits) {
    candidates.push({ source: "Should I Answer", url: `https://www.shouldianswer.com/phone-number/${digits}` });
  }
  if (national) {
    candidates.push({
      source: "Truecaller",
      url: `https://www.truecaller.com/search/${iso}/${encodeURIComponent(national)}`,
    });
  }

  const out: NonNullable<PhoneIntel["reputation"]> = [];
  const seen = new Set<string>();
  for (const row of candidates) {
    const res = await fetchRes(row.url, { timeout: 7000, accept: "text/html" });
    if (!res || res.status >= 400) continue;
    const html = (await res.text()).slice(0, 40_000);
    const title = stripMarkup(html.match(/<title[^>]*>([\s\S]*?)<\/title>/i)?.[1] ?? "");
    if (!title || genericDirectoryTitle(title)) continue;
    const finalUrl = res.url || row.url;
    if (seen.has(finalUrl)) continue;
    seen.add(finalUrl);
    const body = stripMarkup(html).slice(0, 1800);
    const loc = title.match(/\bin ([A-Za-z][A-Za-z .'-]+,\s*[A-Z]{2,3})\b/);
    let summary = title.replace(/\s+\|.*$/, "").slice(0, 160);
    if (loc) summary = `Listed in ${loc[1]}`;
    else if (/has no rating|no users reviews|no information about any suspicious/i.test(body)) {
      summary = "Directory page exists — no public ratings";
    } else if (/\b(spam|scam|telemarketer|robocall)\b/i.test(body)) {
      summary = "Directory mentions spam or scam reports — open the source to verify";
    }
    out.push({ source: row.source, summary, url: finalUrl });
    if (out.length >= 5) break;
  }
  return out;
}

function searchQueries(base: PhoneIntel): string[] {
  const national = (base.national ?? "").trim();
  const dashed = national.replace(/[()]/g, "").replace(/\s+/g, "-").replace(/-+/g, "-");
  const intl = (base.international ?? "").replace(/^\+/, "");
  const n10 =
    base.country === "US" || base.country === "CA"
      ? (base.digits ?? "").replace(/^1/, "").slice(0, 10)
      : "";
  const nanpDash = n10.length === 10 ? `${n10.slice(0, 3)}-${n10.slice(3, 6)}-${n10.slice(6)}` : "";
  return [...new Set([nanpDash, dashed, national, intl].filter((q) => q.replace(/\D/g, "").length >= 8))];
}

export async function collectPhone(raw: string): Promise<PhoneIntel> {
  const base = phoneIntel(raw);
  const digits = base.digits || raw.replace(/\D/g, "");
  const cc = (base.countryCallingCode ?? "").replace("+", "");
  const notes = [...(base.notes ?? [])];
  const queries = searchQueries(base).slice(0, 3);
  const nationalDigits = (base.national ?? "").replace(/\D/g, "");
  const nationalSig = nationalDigits.replace(/^0+/, "");
  const candidates = [...new Set([digits, nationalDigits, nationalSig].filter((d) => d.length >= 9))];

  const national10 =
    base.country === "US" || base.country === "CA"
      ? (base.e164 ?? "").replace(/\D/g, "").replace(/^1/, "").slice(0, 10)
      : "";

  const isMobile = /mobile/i.test(base.type ?? "");
  const haystacks = [...new Set([digits, (base.e164 ?? "").replace(/\D/g, "")].filter(Boolean))];

  const [carriers, geos, nanp, bingHits, hnHits, reputation, htmlweb, directory] = await Promise.all([
    cc ? loadPrefixFile("carrier", cc) : Promise.resolve([] as [string, string][]),
    cc && !isMobile ? loadPrefixFile("geocoding", cc) : Promise.resolve([] as [string, string][]),
    national10 ? collectNanp(national10) : Promise.resolve(undefined),
    queries.length ? bingSightings(queries, candidates) : Promise.resolve([] as PhoneSighting[]),
    queries[0] ? hnSightings(queries[0], candidates) : Promise.resolve([] as PhoneSighting[]),
    collectReputation(base),
    fetchJson<{
      country?: { mcc?: number | string };
      "0"?: { english?: string };
    }>(`https://htmlweb.ru/geo/api.php?json&telcod=${encodeURIComponent(digits)}`, { timeout: 7000 }),
    base.country === "AU" ? collectReverseAustralia(nationalDigits) : Promise.resolve(undefined),
  ]);

  let carrier: string | undefined;
  let carrierPrefix: string | undefined;
  let geo: string | undefined;
  for (const hay of haystacks) {
    const hit = longestPrefix(carriers, hay);
    if (hit && !carrier) {
      carrier = hit.value;
      carrierPrefix = hit.prefix;
    }
    geo ??= longestPrefix(geos, hay)?.value;
  }
  if (carrier) {
    notes.push("Carrier is the original number-range allocation. Ported numbers may sit on a different network.");
  } else if (base.valid && !directory?.holder) {
    notes.push("No published carrier block matched this prefix. That is common for newer ranges and for countries with a thin open allocation table.");
  }

  const hw = htmlweb.data;
  const broad =
    /^(new south wales|victoria|queensland|south australia|western australia|tasmania|northern territory|australian capital territory|australia|united states|canada|united kingdom)$/i;
  const geoIsBroad = Boolean(geo && broad.test(geo));
  const cityFromGeo = geo && !geoIsBroad ? (geo.includes(",") ? geo.split(",")[0]?.trim() : geo) : undefined;
  const directoryArea = directory?.area;
  const stateFromAddress = directory?.address?.match(/\b(NSW|VIC|QLD|SA|WA|TAS|NT|ACT)\b/)?.[1];
  const STATE_NAME: Record<string, string> = {
    NSW: "New South Wales",
    VIC: "Victoria",
    QLD: "Queensland",
    SA: "South Australia",
    WA: "Western Australia",
    TAS: "Tasmania",
    NT: "Northern Territory",
    ACT: "Australian Capital Territory",
  };

  const seenUrl = new Set<string>();
  const sightings: PhoneSighting[] = [];
  for (const hit of [...bingHits, ...hnHits]) {
    if (seenUrl.has(hit.url)) continue;
    seenUrl.add(hit.url);
    sightings.push(hit);
  }

  const city = directoryArea || nanp?.rateCenter || cityFromGeo;
  const stateName = stateFromAddress ? STATE_NAME[stateFromAddress] : undefined;

  return {
    ...base,
    carrier,
    carrierPrefix,
    carrierNote: carrier ? "Original allocation (not live HLR, not corrected for porting)" : undefined,
    city,
    region: stateName && city ? `${city}, ${stateName}` : base.region || (geoIsBroad ? geo : undefined) || nanp?.region || cityFromGeo,
    geoSource: directoryArea
      ? "Reverse Australia"
      : nanp
        ? "NANP prefix"
        : cityFromGeo
          ? "libphonenumber geocoding"
          : base.region
            ? "national numbering plan"
            : undefined,
    mcc: hw?.country?.mcc != null ? String(hw.country.mcc) : undefined,
    nanp,
    lineType: directory?.phoneType || base.type,
    sightings,
    reputation,
    directory,
    notes: notes.length ? [...new Set(notes)] : undefined,
  };
}

const HASH_BITS: Record<HashIntel["algo"], number> = {
  MD5: 128,
  "SHA-1": 160,
  "SHA-256": 256,
  "SHA-384": 384,
  "SHA-512": 512,
  unknown: 0,
};

export async function collectHash(value: string, algo: HashIntel["algo"]): Promise<HashIntel> {
  const bits = HASH_BITS[algo] ?? 0;
  const kind = algo === "MD5" ? "md5" : algo === "SHA-1" ? "sha1" : algo === "SHA-256" ? "sha256" : null;
  if (!kind) {
    return { value, algo, bits, known: false, message: "CIRCL lookup covers MD5, SHA-1, and SHA-256." };
  }
  const { status, data } = await fetchJson<{
    FileName?: string;
    FileSize?: string;
    MD5?: string;
    "SHA-1"?: string;
    KnownMalicious?: string;
    message?: string;
  }>(`https://hashlookup.circl.lu/lookup/${kind}/${encodeURIComponent(value)}`, { timeout: 8000 });
  if (status !== 200 || !data?.FileName) {
    return { value, algo, bits, known: false, message: "Not in the public CIRCL hash lookup." };
  }
  return {
    value,
    algo,
    bits,
    known: true,
    fileName: data.FileName,
    fileSize: data.FileSize,
    md5: data.MD5,
    sha1: data["SHA-1"],
    source: data.KnownMalicious || "CIRCL hashlookup",
    message: data.KnownMalicious ? `Known file, flagged by ${data.KnownMalicious}` : "Known file",
  };
}

function formatWei(wei: string): string {
  try {
    const n = BigInt(wei);
    const whole = n / 10n ** 18n;
    const frac = (n % 10n ** 18n).toString().padStart(18, "0").slice(0, 4);
    return `${whole.toString()}.${frac} ETH`;
  } catch {
    return wei;
  }
}

export async function collectWallet(address: string, chain: WalletIntel["chain"]): Promise<WalletIntel> {
  if (chain === "bitcoin") {
    const { status, data } = await fetchJson<{
      chain_stats?: { funded_txo_sum?: number; spent_txo_sum?: number; tx_count?: number };
    }>(`https://blockstream.info/api/address/${encodeURIComponent(address)}`, { timeout: 8000 });
    const stats = data?.chain_stats;
    if (status !== 200 || !stats) {
      return { address, chain, message: "Blockstream did not return this address." };
    }
    const funded = stats.funded_txo_sum ?? 0;
    const spent = stats.spent_txo_sum ?? 0;
    const sats = funded - spent;
    return {
      address,
      chain,
      balance: `${(sats / 1e8).toFixed(8)} BTC`,
      received: `${(funded / 1e8).toFixed(8)} BTC`,
      txCount: stats.tx_count,
      explorer: `https://blockstream.info/address/${address}`,
    };
  }

  if (chain === "ethereum") {
    const { status, data } = await fetchJson<{
      coin_balance?: string;
      ens_domain_name?: string | null;
    }>(`https://eth.blockscout.com/api/v2/addresses/${encodeURIComponent(address)}`, { timeout: 8000 });
    if (status !== 200 || !data?.coin_balance) {
      return { address, chain, message: "Blockscout did not return this address." };
    }
    return {
      address,
      chain,
      balance: formatWei(data.coin_balance),
      ens: data.ens_domain_name || undefined,
      explorer: `https://eth.blockscout.com/address/${address}`,
    };
  }

  return { address, chain, message: "No public explorer is wired for this chain." };
}

