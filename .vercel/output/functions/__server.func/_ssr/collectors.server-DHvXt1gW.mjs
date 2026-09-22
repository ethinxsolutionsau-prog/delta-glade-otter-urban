import { t as LIVE_PLATFORMS } from "./platforms-BrjVkNGf.mjs";
import { createHash } from "node:crypto";
import { lookup } from "node:dns/promises";
import { isIP } from "node:net";
//#region node_modules/.nitro/vite/services/ssr/assets/collectors.server-DHvXt1gW.js
var ROLE_LOCALS = /* @__PURE__ */ new Set([
	"admin",
	"administrator",
	"abuse",
	"billing",
	"contact",
	"hello",
	"help",
	"info",
	"noreply",
	"no-reply",
	"office",
	"postmaster",
	"privacy",
	"sales",
	"security",
	"support",
	"webmaster",
	"jobs",
	"press",
	"legal",
	"team"
]);
var DISPOSABLE = /* @__PURE__ */ new Set([
	"10minutemail.com",
	"guerrillamail.com",
	"guerrillamail.org",
	"sharklasers.com",
	"grr.la",
	"mailinator.com",
	"mailinator.net",
	"tempmail.com",
	"temp-mail.org",
	"temp-mail.io",
	"throwawaymail.com",
	"yopmail.com",
	"yopmail.fr",
	"trashmail.com",
	"trashmail.de",
	"getnada.com",
	"nada.email",
	"maildrop.cc",
	"mailnesia.com",
	"dispostable.com",
	"fakeinbox.com",
	"discard.email",
	"discardmail.com",
	"getairmail.com",
	"moakt.com",
	"inboxkitten.com",
	"tempail.com",
	"emailondeck.com",
	"mintemail.com",
	"mytrashmail.com",
	"anonaddy.com",
	"simplelogin.io",
	"guerrillamailblock.com",
	"spamgourmet.com",
	"mailcatch.com",
	"maildax.com",
	"tmpmail.org",
	"tmpmail.net",
	"dropmail.me",
	"easytrashmail.com"
]);
function isRoleAccount(local) {
	return ROLE_LOCALS.has(local.toLowerCase());
}
function isDisposableDomain(domain) {
	return DISPOSABLE.has(domain.toLowerCase());
}
function isPrivateIp(ip) {
	const v = ip.toLowerCase();
	if (v === "::1" || v === "0.0.0.0") return true;
	if (v.startsWith("127.") || v.startsWith("10.") || v.startsWith("192.168.")) return true;
	if (v.startsWith("169.254.") || v.startsWith("100.64.")) return true;
	if (v.startsWith("fc") || v.startsWith("fd") || v.startsWith("fe80")) return true;
	const m = v.match(/^172\.(\d+)\./);
	if (m) {
		const n = Number(m[1]);
		if (n >= 16 && n <= 31) return true;
	}
	return false;
}
var BLOCKED_HOSTS = /^(localhost|metadata\.google\.internal|.*\.(local|internal|localhost))$/i;
async function assertPublicHost(host) {
	const h = host.replace(/\.$/, "").toLowerCase();
	if (!h || BLOCKED_HOSTS.test(h)) throw new Error("Host is not allowed");
	if (isIP(h)) {
		if (isPrivateIp(h)) throw new Error("Private address blocked");
		return [h];
	}
	const ips = (await lookup(h, { all: true })).map((a) => a.address);
	if (ips.length === 0) throw new Error("Could not resolve host");
	if (ips.some(isPrivateIp)) throw new Error("Private address blocked");
	return ips;
}
function parseHttpUrl(raw) {
	const url = new URL(raw);
	if (url.protocol !== "http:" && url.protocol !== "https:") throw new Error("Only http(s) URLs are allowed");
	if (url.username || url.password) throw new Error("Credentials in URL are not allowed");
	return url;
}
var UA = "Mozilla/5.0 (compatible; FathomResearch/1.0; +https://grok.com) AppleWebKit/537.36 Chrome/124.0.0.0";
function withTimeout(promise, ms, fallback) {
	return new Promise((resolve) => {
		const t = setTimeout(() => resolve(fallback), ms);
		promise.then((v) => {
			clearTimeout(t);
			resolve(v);
		}).catch(() => {
			clearTimeout(t);
			resolve(fallback);
		});
	});
}
async function fetchOk(url, init = {}) {
	const ctrl = new AbortController();
	const t = setTimeout(() => ctrl.abort(), init.timeout ?? 8e3);
	try {
		return await fetch(url, {
			...init,
			signal: ctrl.signal,
			headers: {
				"User-Agent": UA,
				Accept: "*/*",
				...init.headers ?? {}
			}
		});
	} catch {
		return null;
	} finally {
		clearTimeout(t);
	}
}
async function fetchJson(url, opts = {}) {
	const res = await fetchOk(url, {
		timeout: opts.timeout ?? 8e3,
		headers: {
			Accept: "application/json",
			...opts.headers ?? {}
		}
	});
	if (!res || !res.ok) return null;
	try {
		return await res.json();
	} catch {
		return null;
	}
}
async function mapPool(items, limit, fn) {
	const out = new Array(items.length);
	let i = 0;
	async function worker() {
		while (i < items.length) {
			const idx = i++;
			const item = items[idx];
			if (item === void 0) continue;
			out[idx] = await fn(item);
		}
	}
	await Promise.all(Array.from({ length: Math.min(limit, items.length) }, () => worker()));
	return out;
}
var DOH_TYPES = {
	1: "A",
	2: "NS",
	5: "CNAME",
	6: "SOA",
	12: "PTR",
	15: "MX",
	16: "TXT",
	28: "AAAA"
};
async function doh(name, type) {
	return ((await fetchJson(`https://cloudflare-dns.com/dns-query?name=${encodeURIComponent(name)}&type=${type}`, {
		timeout: 6e3,
		headers: { Accept: "application/dns-json" }
	}))?.Answer ?? []).map((a) => ({
		type: DOH_TYPES[a.type] ?? String(a.type),
		name: a.name,
		ttl: a.TTL,
		data: a.data.replace(/^"|"$/g, "")
	}));
}
function ptrName(ip) {
	if (/^\d{1,3}(?:\.\d{1,3}){3}$/.test(ip)) return `${ip.split(".").reverse().join(".")}.in-addr.arpa`;
	return null;
}
function vcardFn(entity) {
	const rows = entity?.vcardArray?.[1] ?? [];
	for (const row of rows) {
		if (Array.isArray(row) && row[0] === "fn" && typeof row[3] === "string") return row[3];
		if (Array.isArray(row) && row[0] === "email" && typeof row[3] === "string") return row[3];
	}
}
async function rdap(kind, query) {
	return fetchJson(`https://rdap.org/${kind}/${encodeURIComponent(query)}`, { timeout: 8e3 });
}
function extractTitle(html) {
	return html.match(/<title[^>]*>([\s\S]{0,200}?)<\/title>/i)?.[1]?.replace(/\s+/g, " ").trim();
}
function extractGenerator(html) {
	return html.match(/<meta[^>]+name=["']generator["'][^>]+content=["']([^"']+)/i)?.[1];
}
async function probeHttp(rawUrl) {
	try {
		await assertPublicHost(parseHttpUrl(rawUrl).hostname);
	} catch (e) {
		return {
			url: rawUrl,
			securityTxt: false,
			robots: false,
			sitemaps: [],
			blocked: e instanceof Error ? e.message : "blocked"
		};
	}
	const res = await fetchOk(rawUrl, {
		timeout: 8e3,
		redirect: "follow"
	});
	if (!res) return {
		url: rawUrl,
		securityTxt: false,
		robots: false,
		sitemaps: []
	};
	const slice = new Uint8Array(await res.arrayBuffer()).slice(0, 48e3);
	const html = new TextDecoder("utf-8", { fatal: false }).decode(slice);
	const headers = res.headers;
	const origin = new URL(rawUrl).origin;
	const [sec, robots] = await Promise.all([fetchOk(`${origin}/.well-known/security.txt`, {
		timeout: 4e3,
		redirect: "follow"
	}), fetchOk(`${origin}/robots.txt`, {
		timeout: 4e3,
		redirect: "follow"
	})]);
	let robotsText = "";
	if (robots && robots.ok) robotsText = (await robots.text()).slice(0, 4e3);
	const sitemaps = [...robotsText.matchAll(/sitemap:\s*(\S+)/gi)].map((m) => m[1] ?? "").filter(Boolean);
	return {
		url: rawUrl,
		status: res.status,
		server: headers.get("server") ?? void 0,
		poweredBy: headers.get("x-powered-by") ?? void 0,
		contentType: headers.get("content-type") ?? void 0,
		hsts: headers.get("strict-transport-security") ?? void 0,
		csp: headers.get("content-security-policy") ?? void 0,
		title: extractTitle(html),
		generator: extractGenerator(html),
		securityTxt: Boolean(sec && sec.ok),
		robots: Boolean(robots && robots.ok),
		sitemaps
	};
}
async function collectDomain(domain) {
	const host = domain.toLowerCase().replace(/\.$/, "");
	const [a, aaaa, mx, ns, txt, soa, rdapJson, certsRaw, waybackRaw, http] = await Promise.all([
		doh(host, "A"),
		doh(host, "AAAA"),
		doh(host, "MX"),
		doh(host, "NS"),
		doh(host, "TXT"),
		doh(host, "SOA"),
		rdap("domain", host),
		withTimeout(fetchJson(`https://crt.sh/?q=${encodeURIComponent(host)}&output=json`, { timeout: 1e4 }), 1e4, null),
		fetchJson(`https://web.archive.org/cdx/search/cdx?url=${encodeURIComponent(host)}&output=json&fl=timestamp,original,statuscode&limit=12&filter=statuscode:200`, { timeout: 8e3 }),
		probeHttp(`https://${host}`)
	]);
	const dns = [
		...a,
		...aaaa,
		...mx,
		...ns,
		...txt,
		...soa
	];
	const nameservers = ns.map((r) => r.data.replace(/\.$/, ""));
	const mxHosts = mx.map((r) => r.data.replace(/\.$/, ""));
	const ips = [...a, ...aaaa].map((r) => r.data);
	const registrarEntity = rdapJson?.entities?.find((e) => e.roles?.includes("registrar"));
	const abuseEntity = rdapJson?.entities?.find((e) => e.roles?.includes("abuse"));
	const registered = rdapJson?.events?.find((e) => e.eventAction === "registration")?.eventDate;
	const expires = rdapJson?.events?.find((e) => e.eventAction === "expiration")?.eventDate;
	const sans = /* @__PURE__ */ new Set();
	const certs = (Array.isArray(certsRaw) ? certsRaw : []).slice(0, 40).map((row) => {
		const names = (row.name_value ?? "").split(/\n/g).map((s) => s.trim().toLowerCase()).filter(Boolean);
		names.forEach((n) => {
			if (!n.startsWith("*.") && n.endsWith(host)) sans.add(n);
		});
		return {
			commonName: row.common_name ?? names[0] ?? host,
			sans: names,
			issuer: row.issuer_name ?? "",
			notBefore: row.not_before,
			notAfter: row.not_after
		};
	});
	const subdomains = [...sans].filter((n) => n !== host && n.endsWith(`.${host}`)).sort().slice(0, 40);
	const samples = (Array.isArray(waybackRaw) ? waybackRaw.slice(1) : []).slice(0, 8).map((r) => ({
		timestamp: r[0] ?? "",
		original: r[1] ?? "",
		status: r[2]
	}));
	return {
		domain: host,
		dns,
		nameservers,
		mx: mxHosts,
		ips,
		txt: txt.map((r) => r.data),
		rdap: rdapJson ? {
			handle: rdapJson.handle,
			status: rdapJson.status,
			registrar: vcardFn(registrarEntity),
			registered,
			expires,
			nameservers: rdapJson.nameservers?.map((n) => n.ldhName ?? "").filter(Boolean),
			abuse: vcardFn(abuseEntity)
		} : null,
		certs,
		subdomains,
		wayback: {
			first: samples[0]?.timestamp,
			last: samples.at(-1)?.timestamp,
			count: samples.length,
			samples
		},
		http
	};
}
async function collectIp(ip) {
	const ptr = ptrName(ip);
	const [geo, rdapJson, ptrRec] = await Promise.all([
		fetchJson(`https://ipwho.is/${encodeURIComponent(ip)}`, { timeout: 7e3 }),
		rdap("ip", ip),
		ptr ? doh(ptr, "PTR") : Promise.resolve([])
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
		rdap: rdapJson ? {
			handle: rdapJson.handle,
			name: rdapJson.name,
			type: rdapJson.type,
			country: rdapJson.country,
			startAddress: rdapJson.startAddress,
			endAddress: rdapJson.endAddress,
			cidr: cidr?.v4prefix ? `${cidr.v4prefix}/${cidr.length}` : void 0
		} : null
	};
}
async function collectUsername(username) {
	const hits = await mapPool(LIVE_PLATFORMS, 10, async (p) => {
		const url = p.url(username);
		const res = await fetchOk(url, {
			timeout: 4500,
			redirect: "manual",
			method: "GET"
		});
		if (!res) return {
			id: p.id,
			name: p.name,
			category: p.category,
			url,
			status: "unknown"
		};
		const code = res.status;
		let status = "unknown";
		if (code >= 200 && code < 300) status = "found";
		else if (code === 404 || code === 410) status = "absent";
		else if (code >= 300 && code < 400) status = (res.headers.get("location") ?? "").includes(username) ? "found" : "unknown";
		return {
			id: p.id,
			name: p.name,
			category: p.category,
			url,
			status,
			httpStatus: code
		};
	});
	hits.sort((a, b) => {
		const rank = {
			found: 0,
			unknown: 1,
			absent: 2
		};
		return rank[a.status] - rank[b.status] || a.name.localeCompare(b.name);
	});
	return {
		username,
		hits,
		found: hits.filter((h) => h.status === "found").length,
		checked: hits.length
	};
}
async function collectGithub(username) {
	const res = await fetchOk(`https://api.github.com/users/${encodeURIComponent(username)}`, {
		timeout: 7e3,
		headers: {
			Accept: "application/vnd.github+json",
			"User-Agent": "FathomResearch/1.0"
		}
	});
	if (!res) return {
		found: false,
		message: "GitHub did not respond"
	};
	if (res.status === 404) return {
		found: false,
		message: "No public GitHub user"
	};
	if (!res.ok) return {
		found: false,
		message: `GitHub HTTP ${res.status}`
	};
	const u = await res.json();
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
		htmlUrl: u.html_url
	};
}
async function collectEmail(email) {
	const normalized = email.trim().toLowerCase();
	const [local, domain] = normalized.split("@");
	const hash = createHash("md5").update(normalized).digest("hex");
	const avatarUrl = `https://www.gravatar.com/avatar/${hash}?d=404&s=128`;
	const profileUrl = `https://www.gravatar.com/${hash}`;
	const [avatarRes, profile] = await Promise.all([fetchOk(avatarUrl, { timeout: 5e3 }), fetchJson(`https://en.gravatar.com/${hash}.json`, { timeout: 5e3 })]);
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
			displayName: profile?.entry?.[0]?.displayName
		}
	};
}
async function collectUrl(raw) {
	let normalized = raw;
	try {
		normalized = parseHttpUrl(raw.includes("://") ? raw : `https://${raw}`).toString();
	} catch {
		normalized = raw.startsWith("http") ? raw : `https://${raw}`;
	}
	const chain = [];
	let current = normalized;
	let finalUrl = normalized;
	for (let i = 0; i < 5; i++) {
		try {
			await assertPublicHost(parseHttpUrl(current).hostname);
		} catch {
			chain.push({ url: current });
			break;
		}
		const res = await fetchOk(current, {
			timeout: 7e3,
			redirect: "manual"
		});
		if (!res) {
			chain.push({ url: current });
			break;
		}
		chain.push({
			url: current,
			status: res.status
		});
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
	return {
		input: raw,
		normalized,
		host,
		chain,
		finalUrl,
		http
	};
}
//#endregion
export { collectDomain, collectEmail, collectGithub, collectIp, collectUrl, collectUsername };
