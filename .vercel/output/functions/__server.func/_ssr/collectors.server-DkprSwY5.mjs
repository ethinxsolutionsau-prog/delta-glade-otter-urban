import { a as phoneIntel } from "./phone-B5bXib8h.mjs";
import { createHash } from "node:crypto";
import { lookup } from "node:dns/promises";
import { isIP } from "node:net";
//#region node_modules/.nitro/vite/services/ssr/assets/collectors.server-DkprSwY5.js
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
var BROWSER_UA = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36";
async function fetchRes(url, opts = {}) {
	const ctrl = new AbortController();
	const t = setTimeout(() => ctrl.abort(), opts.timeout ?? 8e3);
	try {
		return await fetch(url, {
			redirect: opts.redirect ?? "follow",
			signal: ctrl.signal,
			headers: {
				"User-Agent": BROWSER_UA,
				Accept: opts.accept ?? "*/*",
				...opts.headers ?? {}
			}
		});
	} catch {
		return null;
	} finally {
		clearTimeout(t);
	}
}
async function fetchJson(url, opts = {}) {
	const res = await fetchRes(url, {
		timeout: opts.timeout ?? 8e3,
		headers: opts.headers,
		accept: opts.accept ?? "application/json"
	});
	if (!res) return {
		status: 0,
		data: null
	};
	try {
		const data = await res.json();
		return {
			status: res.status,
			data
		};
	} catch {
		return {
			status: res.status,
			data: null
		};
	}
}
async function fetchText(url, timeout = 7e3) {
	const res = await fetchRes(url, {
		timeout,
		accept: "text/plain, text/html, */*"
	});
	if (!res) return {
		status: 0,
		text: ""
	};
	try {
		return {
			status: res.status,
			text: (await res.text()).slice(0, 8e4)
		};
	} catch {
		return {
			status: res.status,
			text: ""
		};
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
	await Promise.all(Array.from({ length: Math.min(limit, Math.max(items.length, 1)) }, () => worker()));
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
	const encoded = encodeURIComponent(name);
	const endpoints = [`https://cloudflare-dns.com/dns-query?name=${encoded}&type=${type}`, `https://dns.google/resolve?name=${encoded}&type=${type}`];
	for (const url of endpoints) {
		const { data } = await fetchJson(url, {
			timeout: 6e3,
			accept: "application/dns-json, application/json"
		});
		if (data?.Answer?.length) return data.Answer.map((a) => ({
			type: DOH_TYPES[a.type] ?? String(a.type),
			name: a.name,
			ttl: a.TTL,
			data: String(a.data).replace(/^"|"$/g, "")
		}));
	}
	return [];
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
	const { status, data } = await fetchJson(`https://rdap.org/${kind}/${encodeURIComponent(query)}`, {
		timeout: 8e3,
		accept: "application/rdap+json, application/json"
	});
	if (status >= 200 && status < 300) return data;
	return null;
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
	const res = await fetchRes(rawUrl, {
		timeout: 8e3,
		redirect: "follow"
	});
	if (!res) return {
		url: rawUrl,
		securityTxt: false,
		robots: false,
		sitemaps: []
	};
	const buf = new Uint8Array(await res.arrayBuffer());
	const html = new TextDecoder("utf-8", { fatal: false }).decode(buf.slice(0, 48e3));
	const headers = res.headers;
	const origin = new URL(rawUrl).origin;
	const [sec, robots] = await Promise.all([fetchRes(`${origin}/.well-known/security.txt`, { timeout: 4e3 }), fetchRes(`${origin}/robots.txt`, { timeout: 4e3 })]);
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
var COMMON_HOSTS = [
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
	"img"
];
async function collectSubdomains(host) {
	const names = /* @__PURE__ */ new Set();
	const certs = [];
	const certReq = fetchJson(`https://api.certspotter.com/v1/issuances?domain=${encodeURIComponent(host)}&include_subdomains=true&expand=dns_names`, { timeout: 8e3 });
	const htReq = fetchText(`https://api.hackertarget.com/hostsearch/?q=${encodeURIComponent(host)}`, 7e3);
	const bruteReq = mapPool(COMMON_HOSTS, 8, async (prefix) => {
		const fqdn = `${prefix}.${host}`;
		return (await doh(fqdn, "A")).length ? fqdn : null;
	});
	const [certRes, ht, brute] = await Promise.all([
		certReq,
		htReq,
		bruteReq
	]);
	if (Array.isArray(certRes.data)) for (const row of certRes.data.slice(0, 30)) {
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
			notAfter: row.not_after
		});
	}
	if (ht.status === 200 && ht.text && !ht.text.toLowerCase().startsWith("error")) for (const line of ht.text.split("\n")) {
		const name = line.split(",")[0]?.trim().toLowerCase();
		if (name && (name === host || name.endsWith(`.${host}`))) names.add(name);
	}
	brute.filter(Boolean).forEach((n) => names.add(n));
	return {
		names: [...names].filter((n) => n !== host).sort().slice(0, 40),
		certs: certs.slice(0, 16)
	};
}
async function collectDomain(domain) {
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
		fetchJson(`https://archive.org/wayback/available?url=${encodeURIComponent(host)}`, { timeout: 7e3 })
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
	const closest = wayback.data?.archived_snapshots?.closest;
	const samples = closest?.timestamp ? [{
		timestamp: closest.timestamp,
		original: closest.url ?? host,
		status: closest.status
	}] : [];
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
		rdap: rdapJson ? {
			handle: rdapJson.handle,
			status: rdapJson.status,
			registrar: vcardFn(registrarEntity),
			registered,
			expires,
			nameservers: rdapJson.nameservers?.map((n) => n.ldhName ?? "").filter(Boolean),
			abuse: vcardFn(abuseEntity)
		} : null,
		certs: extra.certs,
		subdomains: extra.names,
		wayback: {
			first: samples[0]?.timestamp,
			last: samples[0]?.timestamp,
			count: samples.length,
			samples
		},
		http,
		emailAuth: {
			spf,
			spfAll,
			dmarc,
			dmarcPolicy
		}
	};
}
async function collectIp(ip) {
	const ptr = ptrName(ip);
	const [ipApi, info, rdapJson, ptrRec] = await Promise.all([
		fetchJson(`http://ip-api.com/json/${encodeURIComponent(ip)}?fields=status,country,countryCode,regionName,city,zip,lat,lon,isp,org,as,asname,reverse,proxy,hosting,mobile,timezone`, { timeout: 7e3 }),
		fetchJson(`https://ipinfo.io/${encodeURIComponent(ip)}/json`, { timeout: 7e3 }),
		rdap("ip", ip),
		ptr ? doh(ptr, "PTR") : Promise.resolve([])
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
		lat: geo?.lat ?? (loc?.[0] ? Number(loc[0]) : void 0),
		lon: geo?.lon ?? (loc?.[1] ? Number(loc[1]) : void 0),
		timezone: geo?.timezone ?? fallback?.timezone,
		isp: geo?.isp ?? fallback?.org,
		org: geo?.org ?? fallback?.org,
		asn: asnNum,
		asname: asname || void 0,
		reverse: geo?.reverse || ptrRec[0]?.data?.replace(/\.$/, "") || fallback?.hostname,
		isProxy: geo?.proxy,
		isHosting: geo?.hosting,
		isMobile: geo?.mobile,
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
function plain(value) {
	return value?.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim().slice(0, 180) || void 0;
}
async function statusFromHttp(url) {
	const res = await fetchRes(url, {
		timeout: 6e3,
		redirect: "follow"
	});
	if (!res) return { status: "unknown" };
	if (res.status === 404 || res.status === 410) return {
		status: "absent",
		httpStatus: res.status
	};
	if (res.status >= 200 && res.status < 300) return {
		status: "found",
		httpStatus: res.status
	};
	return {
		status: "unknown",
		httpStatus: res.status
	};
}
async function checkGithubUser(username) {
	const official = await fetchRes(`https://api.github.com/users/${encodeURIComponent(username)}`, {
		timeout: 6e3,
		headers: { Accept: "application/vnd.github+json" }
	});
	if (official?.status === 404) return {
		status: "absent",
		httpStatus: 404
	};
	if (official?.ok) try {
		const u = await official.json();
		return {
			status: "found",
			detail: u.name || u.login,
			httpStatus: 200
		};
	} catch {
		return {
			status: "found",
			httpStatus: 200
		};
	}
	const ungh = await fetchJson(`https://ungh.cc/users/${encodeURIComponent(username)}`, { timeout: 6e3 });
	if (ungh.status === 404) return {
		status: "absent",
		httpStatus: 404
	};
	if (ungh.data?.user?.username) return {
		status: "found",
		detail: ungh.data.user.name || ungh.data.user.username,
		httpStatus: 200
	};
	return statusFromHttp(`https://github.com/${encodeURIComponent(username)}`);
}
var CHECKERS = [
	{
		id: "github",
		name: "GitHub",
		category: "Code",
		url: (u) => `https://github.com/${u}`,
		check: checkGithubUser
	},
	{
		id: "gitlab",
		name: "GitLab",
		category: "Code",
		url: (u) => `https://gitlab.com/${u}`,
		check: async (u) => {
			const { status, data } = await fetchJson(`https://gitlab.com/api/v4/users?username=${encodeURIComponent(u)}`);
			if (Array.isArray(data)) {
				const hit = data.find((row) => row.username?.toLowerCase() === u.toLowerCase());
				return hit ? {
					status: "found",
					detail: hit.name,
					httpStatus: status
				} : {
					status: "absent",
					httpStatus: status
				};
			}
			return {
				status: "unknown",
				httpStatus: status
			};
		}
	},
	{
		id: "dockerhub",
		name: "Docker Hub",
		category: "Code",
		url: (u) => `https://hub.docker.com/u/${u}`,
		check: async (u) => {
			const { status, data } = await fetchJson(`https://hub.docker.com/v2/users/${encodeURIComponent(u)}`);
			if (status === 404) return {
				status: "absent",
				httpStatus: 404
			};
			if (status === 200 && data) return {
				status: "found",
				detail: data.full_name || data.username,
				httpStatus: 200
			};
			return {
				status: "unknown",
				httpStatus: status
			};
		}
	},
	{
		id: "huggingface",
		name: "Hugging Face",
		category: "Code",
		url: (u) => `https://huggingface.co/${u}`,
		check: async (u) => {
			const { status, data } = await fetchJson(`https://huggingface.co/api/users/${encodeURIComponent(u)}/overview`);
			if (status === 404) return {
				status: "absent",
				httpStatus: 404
			};
			if (status === 200 && data && !data.error) return {
				status: "found",
				detail: data.fullname,
				httpStatus: 200
			};
			return {
				status: "unknown",
				httpStatus: status
			};
		}
	},
	{
		id: "crates",
		name: "crates.io",
		category: "Code",
		url: (u) => `https://crates.io/users/${u}`,
		check: async (u) => {
			const { status, data } = await fetchJson(`https://crates.io/api/v1/users/${encodeURIComponent(u)}`);
			if (status === 404) return {
				status: "absent",
				httpStatus: 404
			};
			if (data?.user) return {
				status: "found",
				detail: data.user.name || data.user.login,
				httpStatus: 200
			};
			return {
				status: "unknown",
				httpStatus: status
			};
		}
	},
	{
		id: "keybase",
		name: "Keybase",
		category: "Community",
		url: (u) => `https://keybase.io/${u}`,
		check: async (u) => {
			const { status, data } = await fetchJson(`https://keybase.io/_/api/1.0/user/lookup.json?username=${encodeURIComponent(u)}`);
			if (data?.status?.name === "NOT_FOUND" || data?.status?.code === 205) return {
				status: "absent",
				httpStatus: status
			};
			if (data?.status?.code === 0) return {
				status: "found",
				detail: data.them?.profile?.full_name,
				httpStatus: 200
			};
			return {
				status: "unknown",
				httpStatus: status
			};
		}
	},
	{
		id: "hn",
		name: "Hacker News",
		category: "Community",
		url: (u) => `https://news.ycombinator.com/user?id=${u}`,
		check: async (u) => {
			const { status, data } = await fetchJson(`https://hacker-news.firebaseio.com/v0/user/${encodeURIComponent(u)}.json`);
			if (data && data.id) return {
				status: "found",
				detail: `${data.karma ?? 0} karma`,
				httpStatus: status
			};
			if (status === 200 && data === null) return {
				status: "absent",
				httpStatus: 200
			};
			return {
				status: "unknown",
				httpStatus: status
			};
		}
	},
	{
		id: "devto",
		name: "Dev.to",
		category: "Community",
		url: (u) => `https://dev.to/${u}`,
		check: async (u) => {
			const { status, data } = await fetchJson(`https://dev.to/api/users/by_username?url=${encodeURIComponent(u)}`);
			if (status === 404) return {
				status: "absent",
				httpStatus: 404
			};
			if (data?.username) return {
				status: "found",
				detail: data.name,
				httpStatus: 200
			};
			return {
				status: "unknown",
				httpStatus: status
			};
		}
	},
	{
		id: "mastodon",
		name: "Mastodon",
		category: "Social",
		url: (u) => `https://mastodon.social/@${u}`,
		check: async (u) => {
			const { status, data } = await fetchJson(`https://mastodon.social/api/v1/accounts/lookup?acct=${encodeURIComponent(u)}`);
			if (status === 404) return {
				status: "absent",
				httpStatus: 404
			};
			if (data?.username) {
				const page = await fetchRes(`https://mastodon.social/@${encodeURIComponent(u)}`, { timeout: 5e3 });
				if (page && (page.status === 404 || page.status === 410)) return {
					status: "absent",
					httpStatus: page.status
				};
				const row = data;
				return {
					status: "found",
					detail: row.display_name || row.username,
					bio: plain(row.note),
					followers: row.followers_count,
					avatar: row.avatar,
					httpStatus: 200
				};
			}
			return {
				status: "unknown",
				httpStatus: status
			};
		}
	},
	{
		id: "bsky",
		name: "Bluesky",
		category: "Social",
		url: (u) => `https://bsky.app/profile/${u.includes(".") ? u : `${u}.bsky.social`}`,
		check: async (u) => {
			const actor = u.includes(".") ? u : `${u}.bsky.social`;
			const { status, data } = await fetchJson(`https://public.api.bsky.app/xrpc/app.bsky.actor.getProfile?actor=${encodeURIComponent(actor)}`);
			if (status === 400 || status === 404 || data?.error) return {
				status: "absent",
				httpStatus: status
			};
			if (data?.handle) return {
				status: "found",
				detail: data.displayName || data.handle,
				bio: plain(data.description),
				followers: data.followersCount,
				avatar: data.avatar,
				httpStatus: 200
			};
			return {
				status: "unknown",
				httpStatus: status
			};
		}
	},
	{
		id: "wikipedia",
		name: "Wikipedia",
		category: "Other",
		url: (u) => `https://en.wikipedia.org/wiki/User:${u}`,
		check: async (u) => {
			const { status, data } = await fetchJson(`https://en.wikipedia.org/w/api.php?action=query&list=users&ususers=${encodeURIComponent(u)}&format=json`);
			const row = data?.query?.users?.[0];
			if (!row) return {
				status: "unknown",
				httpStatus: status
			};
			if ("missing" in row || !row.userid) return {
				status: "absent",
				httpStatus: 200
			};
			return {
				status: "found",
				httpStatus: 200
			};
		}
	},
	{
		id: "codeberg",
		name: "Codeberg",
		category: "Code",
		url: (u) => `https://codeberg.org/${u}`,
		check: async (u) => {
			const { status, data } = await fetchJson(`https://codeberg.org/api/v1/users/${encodeURIComponent(u)}`);
			if (status === 404) return {
				status: "absent",
				httpStatus: 404
			};
			if (status === 200 && data?.login) return {
				status: "found",
				detail: data.full_name || data.login,
				httpStatus: 200
			};
			return {
				status: "unknown",
				httpStatus: status
			};
		}
	},
	{
		id: "npm",
		name: "npm",
		category: "Code",
		url: (u) => `https://www.npmjs.com/~${u}`,
		check: async (u) => {
			const { status, data } = await fetchJson(`https://api.npms.io/v2/search?q=${encodeURIComponent(`maintainer:${u}`)}&size=1`);
			if (status !== 200) return {
				status: "unknown",
				httpStatus: status
			};
			const name = data?.results?.[0]?.package?.name;
			if ((data?.total ?? 0) > 0 && name) return {
				status: "found",
				detail: name,
				httpStatus: 200
			};
			return {
				status: "absent",
				httpStatus: 200
			};
		}
	},
	{
		id: "rubygems",
		name: "RubyGems",
		category: "Code",
		url: (u) => `https://rubygems.org/profiles/${u}`,
		check: async (u) => {
			const { status, data } = await fetchJson(`https://rubygems.org/api/v1/profiles/${encodeURIComponent(u)}.json`);
			if (status === 404) return {
				status: "absent",
				httpStatus: 404
			};
			if (data?.handle) return {
				status: "found",
				detail: data.handle,
				httpStatus: 200
			};
			return {
				status: "unknown",
				httpStatus: status
			};
		}
	},
	{
		id: "youtube",
		name: "YouTube",
		category: "Social",
		url: (u) => `https://www.youtube.com/user/${u}`,
		check: async (u) => {
			const res = await fetchRes(`https://www.youtube.com/feeds/videos.xml?user=${encodeURIComponent(u)}`, {
				timeout: 7e3,
				accept: "application/atom+xml, application/xml, text/xml"
			});
			if (!res || res.status === 404) return {
				status: "absent",
				httpStatus: res?.status ?? 404
			};
			if (!res.ok) return {
				status: "unknown",
				httpStatus: res.status
			};
			const text = (await res.text()).slice(0, 4e3);
			if (!text.includes("<feed")) return {
				status: "unknown",
				httpStatus: res.status
			};
			return {
				status: "found",
				detail: text.match(/<title>([^<]+)<\/title>/)?.[1],
				httpStatus: 200
			};
		}
	},
	{
		id: "tiktok",
		name: "TikTok",
		category: "Social",
		url: (u) => `https://www.tiktok.com/@${u}`,
		check: async (u) => {
			const { status, data } = await fetchJson(`https://www.tiktok.com/oembed?url=${encodeURIComponent(`https://www.tiktok.com/@${u}`)}`);
			if (status === 400 || status === 404) return {
				status: "absent",
				httpStatus: status
			};
			if (status === 200 && data?.author_name) return {
				status: "found",
				detail: data.author_name,
				httpStatus: 200
			};
			return {
				status: "unknown",
				httpStatus: status
			};
		}
	},
	{
		id: "twitch",
		name: "Twitch",
		category: "Social",
		url: (u) => `https://www.twitch.tv/${u}`,
		check: async (u) => {
			const { status, data } = await fetchJson(`https://api.ivr.fi/v2/twitch/user?login=${encodeURIComponent(u)}`);
			if (status !== 200) return {
				status: "unknown",
				httpStatus: status
			};
			const row = data?.find((item) => item.login?.toLowerCase() === u.toLowerCase());
			if (!row) return {
				status: "absent",
				httpStatus: 200
			};
			return {
				status: "found",
				detail: row.displayName || row.login,
				bio: plain(row.bio),
				followers: row.followers,
				avatar: row.logo,
				httpStatus: 200
			};
		}
	},
	{
		id: "tumblr",
		name: "Tumblr",
		category: "Social",
		url: (u) => `https://${u}.tumblr.com`,
		check: async (u) => {
			if (!/^[a-z0-9-]{2,32}$/i.test(u)) return {
				status: "absent",
				httpStatus: 0
			};
			const res = await fetchRes(`https://${u}.tumblr.com/api/read/json?num=0`, { timeout: 7e3 });
			if (!res || res.status === 404) return {
				status: "absent",
				httpStatus: res?.status ?? 404
			};
			if (!res.ok) return {
				status: "unknown",
				httpStatus: res.status
			};
			const raw = await res.text();
			const start = raw.indexOf("{");
			const end = raw.lastIndexOf("}");
			if (start < 0 || end < start) return {
				status: "unknown",
				httpStatus: res.status
			};
			try {
				const data = JSON.parse(raw.slice(start, end + 1));
				if (data.tumblelog?.name?.toLowerCase() === u.toLowerCase()) {
					const title = data.tumblelog.title?.trim();
					return {
						status: "found",
						detail: (title && !/[./]/.test(title) && title.toLowerCase() !== u.toLowerCase() ? title : void 0) || data.tumblelog.name,
						httpStatus: 200
					};
				}
			} catch {
				return {
					status: "unknown",
					httpStatus: res.status
				};
			}
			return {
				status: "absent",
				httpStatus: 200
			};
		}
	},
	{
		id: "vimeo",
		name: "Vimeo",
		category: "Social",
		url: (u) => `https://vimeo.com/${u}`,
		check: async (u) => {
			const { status, data } = await fetchJson(`https://vimeo.com/api/v2/${encodeURIComponent(u)}/info.json`);
			if (status === 404) return {
				status: "absent",
				httpStatus: 404
			};
			if (data?.display_name) return {
				status: "found",
				detail: data.display_name,
				bio: plain(data.bio || data.location),
				httpStatus: 200
			};
			return {
				status: "unknown",
				httpStatus: status
			};
		}
	},
	{
		id: "mixcloud",
		name: "Mixcloud",
		category: "Social",
		url: (u) => `https://www.mixcloud.com/${u}/`,
		check: async (u) => {
			const { status, data } = await fetchJson(`https://api.mixcloud.com/${encodeURIComponent(u)}/`);
			if (status === 404) return {
				status: "absent",
				httpStatus: 404
			};
			if (data?.username) return {
				status: "found",
				detail: data.name || data.username,
				bio: plain(data.biog),
				avatar: data.pictures?.large,
				httpStatus: 200
			};
			return {
				status: "unknown",
				httpStatus: status
			};
		}
	},
	{
		id: "steam",
		name: "Steam",
		category: "Social",
		url: (u) => `https://steamcommunity.com/id/${u}`,
		check: async (u) => {
			const res = await fetchRes(`https://steamcommunity.com/id/${encodeURIComponent(u)}?xml=1`, {
				timeout: 7e3,
				accept: "application/xml, text/xml"
			});
			if (!res) return { status: "unknown" };
			if (res.status === 404) return {
				status: "absent",
				httpStatus: 404
			};
			const text = (await res.text()).slice(0, 8e3);
			if (/could not be found/i.test(text)) return {
				status: "absent",
				httpStatus: res.status
			};
			const name = text.match(/<steamID><!\[CDATA\[(.*?)\]\]>/)?.[1];
			const vanity = text.match(/<customURL><!\[CDATA\[(.*?)\]\]>/)?.[1];
			const avatar = text.match(/<avatarFull><!\[CDATA\[(.*?)\]\]>/)?.[1];
			if (!name || vanity?.toLowerCase() !== u.toLowerCase()) return {
				status: "absent",
				httpStatus: res.status
			};
			return {
				status: "found",
				detail: name,
				avatar,
				httpStatus: 200
			};
		}
	},
	{
		id: "chess",
		name: "Chess.com",
		category: "Community",
		url: (u) => `https://www.chess.com/member/${u}`,
		check: async (u) => {
			const { status, data } = await fetchJson(`https://api.chess.com/pub/player/${encodeURIComponent(u)}`);
			if (status === 404) return {
				status: "absent",
				httpStatus: 404
			};
			if (data?.username) return {
				status: "found",
				detail: [data.title, data.name || data.username].filter(Boolean).join(" "),
				bio: data.location,
				followers: data.followers,
				avatar: data.avatar,
				httpStatus: 200
			};
			return {
				status: "unknown",
				httpStatus: status
			};
		}
	},
	{
		id: "lichess",
		name: "Lichess",
		category: "Community",
		url: (u) => `https://lichess.org/@/${u}`,
		check: async (u) => {
			const { status, data } = await fetchJson(`https://lichess.org/api/user/${encodeURIComponent(u)}`, { headers: { Accept: "application/json" } });
			if (status === 404) return {
				status: "absent",
				httpStatus: 404
			};
			if (data?.username) return {
				status: "found",
				detail: [data.title, data.username].filter(Boolean).join(" "),
				bio: plain(data.profile?.bio || data.profile?.location),
				httpStatus: 200
			};
			return {
				status: "unknown",
				httpStatus: status
			};
		}
	},
	{
		id: "soundcloud",
		name: "SoundCloud",
		category: "Creative",
		url: (u) => `https://soundcloud.com/${u}`,
		check: (u) => statusFromHttp(`https://soundcloud.com/${encodeURIComponent(u)}`)
	}
];
async function collectUsername(username) {
	const hits = await mapPool(CHECKERS, 8, async (p) => {
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
				httpStatus: result.httpStatus
			};
		} catch {
			return {
				id: p.id,
				name: p.name,
				category: p.category,
				url: p.url(username),
				status: "unknown"
			};
		}
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
	const official = await fetchRes(`https://api.github.com/users/${encodeURIComponent(username)}`, {
		timeout: 7e3,
		headers: { Accept: "application/vnd.github+json" }
	});
	if (official?.status === 404) return {
		found: false,
		message: "No public GitHub user"
	};
	if (official?.ok) {
		const u = await official.json();
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
	const ungh = await fetchJson(`https://ungh.cc/users/${encodeURIComponent(username)}`, { timeout: 6e3 });
	if (ungh.data?.user?.username) {
		const u = ungh.data.user;
		return {
			found: true,
			login: u.username,
			name: u.name,
			twitter: u.twitter,
			avatarUrl: u.avatar,
			htmlUrl: `https://github.com/${u.username}`
		};
	}
	const html = await fetchRes(`https://github.com/${encodeURIComponent(username)}`, { timeout: 6e3 });
	if (html?.status === 404) return {
		found: false,
		message: "No public GitHub user"
	};
	if (html?.ok) return {
		found: true,
		login: username,
		htmlUrl: `https://github.com/${username}`
	};
	return {
		found: false,
		message: "GitHub did not respond"
	};
}
async function collectEmail(email) {
	const normalized = email.trim().toLowerCase();
	const [local, domain] = normalized.split("@");
	const hash = createHash("md5").update(normalized).digest("hex");
	const avatarCheck = `https://www.gravatar.com/avatar/${hash}?d=404&s=128`;
	const profileUrl = `https://www.gravatar.com/${hash}`;
	const [avatarRes, profile, mx] = await Promise.all([
		fetchRes(avatarCheck, { timeout: 5e3 }),
		fetchJson(`https://en.gravatar.com/${hash}.json`, { timeout: 5e3 }),
		domain ? doh(domain, "MX") : Promise.resolve([])
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
			displayName: profile.data?.entry?.[0]?.displayName
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
		const res = await fetchRes(current, {
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
function stripMarkup(html) {
	return html.replace(/<script[\s\S]*?<\/script>/gi, " ").replace(/<style[\s\S]*?<\/style>/gi, " ").replace(/<[^>]+>/g, " ").replace(/&nbsp;/gi, " ").replace(/* @__PURE__ */ new RegExp("&amp;", "gi"), "&").replace(/* @__PURE__ */ new RegExp("&quot;", "gi"), "\"").replace(/* @__PURE__ */ new RegExp("&#39;", "g"), "'").replace(/\s+/g, " ").trim();
}
function mentionsNumber(text, candidates) {
	const compact = text.replace(/\D/g, "");
	return candidates.some((digits) => digits.length >= 9 && compact.includes(digits));
}
var prefixCache = /* @__PURE__ */ new Map();
async function fetchBody(url, timeout = 12e3) {
	const res = await fetchRes(url, {
		timeout,
		accept: "text/plain, */*"
	});
	if (!res) return {
		status: 0,
		text: ""
	};
	try {
		const text = await res.text();
		return {
			status: res.status,
			text: text.length > 4e6 ? text.slice(0, 4e6) : text
		};
	} catch {
		return {
			status: res.status,
			text: ""
		};
	}
}
function parsePrefixFile(text) {
	const rows = [];
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
async function loadPrefixFile(kind, cc) {
	const key = `${kind}:${cc}`;
	const cached = prefixCache.get(key);
	if (cached) return cached;
	const urls = [`https://cdn.jsdelivr.net/gh/google/libphonenumber@master/resources/${kind}/en/${cc}.txt`, `https://raw.githubusercontent.com/google/libphonenumber/master/resources/${kind}/en/${cc}.txt`];
	let rows = [];
	for (const url of urls) {
		const { status, text } = await fetchBody(url, kind === "geocoding" ? 15e3 : 8e3);
		if (status === 200 && text.includes("|")) {
			rows = parsePrefixFile(text);
			if (rows.length) break;
		}
	}
	prefixCache.set(key, rows);
	return rows;
}
function longestPrefix(rows, haystack) {
	for (const [prefix, value] of rows) if (haystack.startsWith(prefix) && value) return {
		prefix,
		value
	};
}
async function bingSightings(queries, candidates) {
	const seen = /* @__PURE__ */ new Set();
	const out = [];
	for (const q of queries) {
		const rssRes = await fetchRes(`https://www.bing.com/search?format=rss&q=${encodeURIComponent(`"${q}"`)}`, {
			timeout: 8e3,
			accept: "application/rss+xml, application/xml, text/xml, */*"
		});
		if (!rssRes || rssRes.status !== 200) continue;
		const text = (await rssRes.text()).slice(0, 8e4);
		if (!text.includes("<item>")) continue;
		const blocks = text.match(/<item>([\s\S]*?)<\/item>/g) ?? [];
		for (const block of blocks) {
			const tag = (name) => {
				return stripMarkup((block.match(new RegExp(`<${name}>([\\s\\S]*?)</${name}>`))?.[1] ?? "").replace(/<!\[CDATA\[([\s\S]*?)\]\]>/g, "$1"));
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
			out.push({
				title,
				url,
				snippet: snippet || void 0,
				source: "Bing"
			});
			if (out.length >= 8) return out;
		}
	}
	return out;
}
async function hnSightings(query, candidates) {
	const { data } = await fetchJson(`https://hn.algolia.com/api/v1/search?query=${encodeURIComponent(`"${query}"`)}&hitsPerPage=8`, { timeout: 7e3 });
	const out = [];
	for (const hit of data?.hits ?? []) {
		const title = stripMarkup(hit.story_title || hit.title || "Hacker News thread");
		const url = hit.url || hit.story_url || (hit.objectID ? `https://news.ycombinator.com/item?id=${hit.objectID}` : "");
		const snippet = hit.comment_text ? stripMarkup(hit.comment_text).slice(0, 180) : void 0;
		if (!url || !mentionsNumber(`${title} ${snippet ?? ""} ${url}`, candidates)) continue;
		out.push({
			title,
			url,
			snippet,
			source: "Hacker News"
		});
		if (out.length >= 4) break;
	}
	return out;
}
async function collectNanp(national10) {
	if (!/^\d{10}$/.test(national10)) return void 0;
	const npa = national10.slice(0, 3);
	const nxx = national10.slice(3, 6);
	const { status, text } = await fetchText(`https://localcallingguide.com/xmlprefix.php?npa=${npa}&nxx=${nxx}`, 8e3);
	if (status !== 200 || !text.includes("<prefixdata>")) return void 0;
	const block = text.match(/<prefixdata>([\s\S]*?)<\/prefixdata>/)?.[1] ?? "";
	const tag = (name) => block.match(new RegExp(`<${name}>([\\s\\S]*?)</${name}>`))?.[1]?.trim();
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
		lat: Number.isFinite(lat) ? lat : void 0,
		lon: Number.isFinite(lon) ? lon : void 0
	};
}
function splitListedNames(raw) {
	const parts = raw.split(/\s+(?=[A-Z][A-Za-z'.-]+,)/).map((s) => s.trim()).filter((s) => s.length > 1);
	return (parts.length ? parts : [raw.trim()]).slice(0, 8);
}
function between(text, start, end) {
	const re = new RegExp(`${start}\\s+([\\s\\S]+?)\\s+${end}`, "i");
	const value = text.match(re)?.[1]?.replace(/\s+/g, " ").trim();
	if (!value || /^unknown$/i.test(value)) return void 0;
	return value;
}
async function collectReverseAustralia(nationalDigits) {
	if (!/^0\d{9}$/.test(nationalDigits)) return void 0;
	const url = `https://www.reverseaustralia.com/lookup/${nationalDigits}/`;
	const res = await fetchRes(url, {
		timeout: 9e3,
		accept: "text/html"
	});
	if (!res || res.status === 404) return void 0;
	if (!res.ok) return {
		source: "Reverse Australia",
		url
	};
	const text = stripMarkup((await res.text()).slice(0, 12e4));
	if (!/Latest Holder|Phone Type|total complaints/i.test(text)) return {
		source: "Reverse Australia",
		url
	};
	const complaints = text.match(/(\d+)\s+complaints this year,\s+(\d+)\s+total complaints/i);
	const namesRaw = between(text, "Names found on this computer", "Address");
	const address = between(text, "Address", "History");
	const spam = /likely being a scam/i.test(text) ? "Directory flags this number as a likely scam caller" : void 0;
	return {
		source: "Reverse Australia",
		url: res.url || url,
		phoneType: between(text, "Phone Type", "Latest Holder"),
		holder: between(text, "Latest Holder", "Numbering Area"),
		area: between(text, "Numbering Area", "Last Found"),
		lastFound: text.match(/Last Found\s+([A-Z][a-z]+ \d{4})/)?.[1],
		complaintsYear: complaints ? Number(complaints[1]) : void 0,
		complaintsTotal: complaints ? Number(complaints[2]) : void 0,
		spamNote: spam,
		names: namesRaw ? splitListedNames(namesRaw) : void 0,
		address
	};
}
function genericDirectoryTitle(title) {
	return /free reverse phone|reverse phone number lookup by truecaller|^home\b|okcaller\.com$/i.test(title);
}
async function collectReputation(base) {
	const digits = base.digits || "";
	const iso = (base.country ?? "au").toLowerCase();
	const national = (base.national ?? "").replace(/\D/g, "");
	const n10 = base.country === "US" || base.country === "CA" ? digits.replace(/^1/, "").slice(0, 10) : "";
	const candidates = [];
	if (n10.length === 10) candidates.push({
		source: "okcaller",
		url: `https://www.okcaller.com/${n10}`
	}, {
		source: "Should I Answer",
		url: `https://www.shouldianswer.com/phone-number/${n10}`
	}, {
		source: "ReportedCalls",
		url: `https://www.reportedcalls.com/${n10}`
	});
	if (base.country === "AU" && digits) candidates.push({
		source: "Should I Answer",
		url: `https://www.shouldianswer.com/phone-number/${digits}`
	});
	if (national) candidates.push({
		source: "Truecaller",
		url: `https://www.truecaller.com/search/${iso}/${encodeURIComponent(national)}`
	});
	const out = [];
	const seen = /* @__PURE__ */ new Set();
	for (const row of candidates) {
		const res = await fetchRes(row.url, {
			timeout: 7e3,
			accept: "text/html"
		});
		if (!res || res.status >= 400) continue;
		const html = (await res.text()).slice(0, 4e4);
		const title = stripMarkup(html.match(/<title[^>]*>([\s\S]*?)<\/title>/i)?.[1] ?? "");
		if (!title || genericDirectoryTitle(title)) continue;
		const finalUrl = res.url || row.url;
		if (seen.has(finalUrl)) continue;
		seen.add(finalUrl);
		const body = stripMarkup(html).slice(0, 1800);
		const loc = title.match(/\bin ([A-Za-z][A-Za-z .'-]+,\s*[A-Z]{2,3})\b/);
		let summary = title.replace(/\s+\|.*$/, "").slice(0, 160);
		if (loc) summary = `Listed in ${loc[1]}`;
		else if (/has no rating|no users reviews|no information about any suspicious/i.test(body)) summary = "Directory page exists — no public ratings";
		else if (/\b(spam|scam|telemarketer|robocall)\b/i.test(body)) summary = "Directory mentions spam or scam reports — open the source to verify";
		out.push({
			source: row.source,
			summary,
			url: finalUrl
		});
		if (out.length >= 5) break;
	}
	return out;
}
function searchQueries(base) {
	const national = (base.national ?? "").trim();
	const dashed = national.replace(/[()]/g, "").replace(/\s+/g, "-").replace(/-+/g, "-");
	const intl = (base.international ?? "").replace(/^\+/, "");
	const n10 = base.country === "US" || base.country === "CA" ? (base.digits ?? "").replace(/^1/, "").slice(0, 10) : "";
	const nanpDash = n10.length === 10 ? `${n10.slice(0, 3)}-${n10.slice(3, 6)}-${n10.slice(6)}` : "";
	return [...new Set([
		nanpDash,
		dashed,
		national,
		intl
	].filter((q) => q.replace(/\D/g, "").length >= 8))];
}
async function collectPhone(raw) {
	const base = phoneIntel(raw);
	const digits = base.digits || raw.replace(/\D/g, "");
	const cc = (base.countryCallingCode ?? "").replace("+", "");
	const notes = [...base.notes ?? []];
	const queries = searchQueries(base).slice(0, 3);
	const nationalDigits = (base.national ?? "").replace(/\D/g, "");
	const nationalSig = nationalDigits.replace(/^0+/, "");
	const candidates = [...new Set([
		digits,
		nationalDigits,
		nationalSig
	].filter((d) => d.length >= 9))];
	const national10 = base.country === "US" || base.country === "CA" ? (base.e164 ?? "").replace(/\D/g, "").replace(/^1/, "").slice(0, 10) : "";
	const isMobile = /mobile/i.test(base.type ?? "");
	const haystacks = [...new Set([digits, (base.e164 ?? "").replace(/\D/g, "")].filter(Boolean))];
	const [carriers, geos, nanp, bingHits, hnHits, reputation, htmlweb, directory] = await Promise.all([
		cc ? loadPrefixFile("carrier", cc) : Promise.resolve([]),
		cc && !isMobile ? loadPrefixFile("geocoding", cc) : Promise.resolve([]),
		national10 ? collectNanp(national10) : Promise.resolve(void 0),
		queries.length ? bingSightings(queries, candidates) : Promise.resolve([]),
		queries[0] ? hnSightings(queries[0], candidates) : Promise.resolve([]),
		collectReputation(base),
		fetchJson(`https://htmlweb.ru/geo/api.php?json&telcod=${encodeURIComponent(digits)}`, { timeout: 7e3 }),
		base.country === "AU" ? collectReverseAustralia(nationalDigits) : Promise.resolve(void 0)
	]);
	let carrier;
	let carrierPrefix;
	let geo;
	for (const hay of haystacks) {
		const hit = longestPrefix(carriers, hay);
		if (hit && !carrier) {
			carrier = hit.value;
			carrierPrefix = hit.prefix;
		}
		geo ??= longestPrefix(geos, hay)?.value;
	}
	if (carrier) notes.push("Carrier is the original number-range allocation. Ported numbers may sit on a different network.");
	else if (base.valid && !directory?.holder) notes.push("No published carrier block matched this prefix. That is common for newer ranges and for countries with a thin open allocation table.");
	const hw = htmlweb.data;
	const geoIsBroad = Boolean(geo && /^(new south wales|victoria|queensland|south australia|western australia|tasmania|northern territory|australian capital territory|australia|united states|canada|united kingdom)$/i.test(geo));
	const cityFromGeo = geo && !geoIsBroad ? geo.includes(",") ? geo.split(",")[0]?.trim() : geo : void 0;
	const directoryArea = directory?.area;
	const stateFromAddress = directory?.address?.match(/\b(NSW|VIC|QLD|SA|WA|TAS|NT|ACT)\b/)?.[1];
	const STATE_NAME = {
		NSW: "New South Wales",
		VIC: "Victoria",
		QLD: "Queensland",
		SA: "South Australia",
		WA: "Western Australia",
		TAS: "Tasmania",
		NT: "Northern Territory",
		ACT: "Australian Capital Territory"
	};
	const seenUrl = /* @__PURE__ */ new Set();
	const sightings = [];
	for (const hit of [...bingHits, ...hnHits]) {
		if (seenUrl.has(hit.url)) continue;
		seenUrl.add(hit.url);
		sightings.push(hit);
	}
	const city = directoryArea || nanp?.rateCenter || cityFromGeo;
	const stateName = stateFromAddress ? STATE_NAME[stateFromAddress] : void 0;
	return {
		...base,
		carrier,
		carrierPrefix,
		carrierNote: carrier ? "Original allocation (not live HLR, not corrected for porting)" : void 0,
		city,
		region: stateName && city ? `${city}, ${stateName}` : base.region || (geoIsBroad ? geo : void 0) || nanp?.region || cityFromGeo,
		geoSource: directoryArea ? "Reverse Australia" : nanp ? "NANP prefix" : cityFromGeo ? "libphonenumber geocoding" : base.region ? "national numbering plan" : void 0,
		mcc: hw?.country?.mcc != null ? String(hw.country.mcc) : void 0,
		nanp,
		lineType: directory?.phoneType || base.type,
		sightings,
		reputation,
		directory,
		notes: notes.length ? [...new Set(notes)] : void 0
	};
}
var HASH_BITS = {
	MD5: 128,
	"SHA-1": 160,
	"SHA-256": 256,
	"SHA-384": 384,
	"SHA-512": 512,
	unknown: 0
};
async function collectHash(value, algo) {
	const bits = HASH_BITS[algo] ?? 0;
	const kind = algo === "MD5" ? "md5" : algo === "SHA-1" ? "sha1" : algo === "SHA-256" ? "sha256" : null;
	if (!kind) return {
		value,
		algo,
		bits,
		known: false,
		message: "CIRCL lookup covers MD5, SHA-1, and SHA-256."
	};
	const { status, data } = await fetchJson(`https://hashlookup.circl.lu/lookup/${kind}/${encodeURIComponent(value)}`, { timeout: 8e3 });
	if (status !== 200 || !data?.FileName) return {
		value,
		algo,
		bits,
		known: false,
		message: "Not in the public CIRCL hash lookup."
	};
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
		message: data.KnownMalicious ? `Known file, flagged by ${data.KnownMalicious}` : "Known file"
	};
}
function formatWei(wei) {
	try {
		const n = BigInt(wei);
		const whole = n / 10n ** 18n;
		const frac = (n % 10n ** 18n).toString().padStart(18, "0").slice(0, 4);
		return `${whole.toString()}.${frac} ETH`;
	} catch {
		return wei;
	}
}
async function collectWallet(address, chain) {
	if (chain === "bitcoin") {
		const { status, data } = await fetchJson(`https://blockstream.info/api/address/${encodeURIComponent(address)}`, { timeout: 8e3 });
		const stats = data?.chain_stats;
		if (status !== 200 || !stats) return {
			address,
			chain,
			message: "Blockstream did not return this address."
		};
		const funded = stats.funded_txo_sum ?? 0;
		return {
			address,
			chain,
			balance: `${((funded - (stats.spent_txo_sum ?? 0)) / 1e8).toFixed(8)} BTC`,
			received: `${(funded / 1e8).toFixed(8)} BTC`,
			txCount: stats.tx_count,
			explorer: `https://blockstream.info/address/${address}`
		};
	}
	if (chain === "ethereum") {
		const { status, data } = await fetchJson(`https://eth.blockscout.com/api/v2/addresses/${encodeURIComponent(address)}`, { timeout: 8e3 });
		if (status !== 200 || !data?.coin_balance) return {
			address,
			chain,
			message: "Blockscout did not return this address."
		};
		return {
			address,
			chain,
			balance: formatWei(data.coin_balance),
			ens: data.ens_domain_name || void 0,
			explorer: `https://eth.blockscout.com/address/${address}`
		};
	}
	return {
		address,
		chain,
		message: "No public explorer is wired for this chain."
	};
}
//#endregion
export { collectDomain, collectEmail, collectGithub, collectHash, collectIp, collectPhone, collectUrl, collectUsername, collectWallet };
