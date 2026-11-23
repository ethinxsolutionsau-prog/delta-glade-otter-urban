import { i as __toESM } from "../_runtime.mjs";
import { i as phoneHint, n as parseAnyPhone, r as phoneFindings, t as looksLikePhone } from "./phone-B5bXib8h.mjs";
import { u as require_react } from "../_libs/@floating-ui/react-dom+[...].mjs";
import { n as Slot, s as require_jsx_runtime } from "../_libs/@radix-ui/react-collection+[...].mjs";
import { C as ExternalLink, D as AtSign, E as ChevronDown, S as FileCode, T as Copy, _ as Hash, a as Trash2, b as FolderOpen, c as Server, d as Printer, f as Plus, g as Image, h as LoaderCircle, l as Search, m as Network, n as Wallet, o as StickyNote, p as Phone, r as User, s as Shield, t as X, u as ScanText, v as Globe, w as Download, x as FileText, y as Github } from "../_libs/lucide-react.mjs";
import { a as DialogPortal, i as DialogOverlay, n as DialogClose, o as DialogTitle, r as DialogContent, t as Dialog } from "../_libs/@radix-ui/react-dialog+[...].mjs";
import { a as Trigger, i as Root2, n as Item2, r as Portal2, t as Content2 } from "../_libs/@radix-ui/react-dropdown-menu+[...].mjs";
import { n as toast } from "../_libs/sonner.mjs";
import { n as Route } from "./router-CcgGT8vJ.mjs";
import { n as TSS_SERVER_FUNCTION, r as getServerFnById, t as createServerFn } from "./ssr.mjs";
import { n as clsx, t as cva } from "../_libs/class-variance-authority+clsx.mjs";
import { t as twMerge } from "../_libs/tailwind-merge.mjs";
import { t as tt } from "../_libs/exifr.mjs";
import { n as format, t as formatDistanceToNow } from "../_libs/date-fns.mjs";
import { n as create, t as persist } from "../_libs/zustand.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/routes-gxLYBV5M.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
function cn(...inputs) {
	return twMerge(clsx(inputs));
}
function uid(prefix = "c") {
	return `${prefix}_${Math.random().toString(36).slice(2, 8)}${Date.now().toString(36).slice(-4)}`;
}
function copyText(value) {
	return navigator.clipboard.writeText(value);
}
var badgeVariants = cva("inline-flex items-center rounded-full border px-2 py-0.5 text-xs font-medium tracking-wide", {
	variants: { variant: {
		default: "border-border text-muted bg-elevated",
		accent: "border-accent/30 text-accent bg-accent/10",
		ok: "border-ok/30 text-ok bg-ok/10",
		warn: "border-warn/30 text-warn bg-warn/10",
		danger: "border-danger/30 text-danger bg-danger/10"
	} },
	defaultVariants: { variant: "default" }
});
function Badge({ className, variant, ...props }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
		className: cn(badgeVariants({ variant }), className),
		...props
	});
}
var buttonVariants = cva("inline-flex items-center justify-center gap-2 whitespace-nowrap font-medium transition-[opacity,transform,background-color,border-color] duration-[var(--motion-quick)] ease-[var(--ease-out)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/60 disabled:pointer-events-none disabled:opacity-40 active:scale-[0.98]", {
	variants: {
		variant: {
			default: "bg-primary text-primary-fg hover:opacity-90",
			secondary: "bg-elevated text-fg border border-border hover:bg-surface",
			outline: "border border-border bg-transparent text-fg hover:bg-elevated",
			ghost: "text-muted hover:text-fg hover:bg-elevated",
			danger: "border border-danger/40 text-danger hover:bg-danger/10"
		},
		size: {
			default: "h-11 px-4 rounded-md text-sm",
			sm: "h-9 px-3 rounded-sm text-sm",
			lg: "h-12 px-5 rounded-md text-sm",
			icon: "size-11 rounded-md",
			"icon-sm": "size-9 rounded-sm"
		}
	},
	defaultVariants: {
		variant: "default",
		size: "default"
	}
});
function Button({ className, variant, size, asChild, ...props }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(asChild ? Slot : "button", {
		className: cn(buttonVariants({
			variant,
			size
		}), className),
		...props
	});
}
var MAX_CASES = 40;
var useCaseStore = create()(persist((set, get) => ({
	cases: [],
	activeId: null,
	hasHydrated: false,
	setHasHydrated: (v) => set({ hasHydrated: v }),
	setActive: (id) => set({ activeId: id }),
	openNew: () => set({ activeId: null }),
	createCase: (query, type) => {
		const record = {
			id: uid("FTH"),
			query,
			type,
			createdAt: Date.now(),
			updatedAt: Date.now(),
			notes: "",
			brief: null,
			briefStatus: "idle",
			runId: 1,
			modules: {}
		};
		set((s) => ({
			cases: [record, ...s.cases].slice(0, MAX_CASES),
			activeId: record.id
		}));
		return record;
	},
	patch: (id, fn) => {
		set((s) => ({ cases: s.cases.map((c) => c.id === id ? fn(c) : c) }));
	},
	remove: (id) => {
		const { activeId, cases } = get();
		const next = cases.filter((c) => c.id !== id);
		set({
			cases: next,
			activeId: activeId === id ? next[0]?.id ?? null : activeId
		});
	},
	setNotes: (id, notes) => {
		get().patch(id, (c) => ({
			...c,
			notes,
			updatedAt: Date.now()
		}));
	}
}), {
	name: "fathom-cases",
	skipHydration: true,
	partialize: (s) => ({
		cases: s.cases,
		activeId: s.activeId
	})
}));
function useActiveCase() {
	return useCaseStore((s) => s.cases.find((c) => c.id === s.activeId) ?? null);
}
var EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/i;
var IPV4_RE = /^(?:(?:25[0-5]|2[0-4]\d|1?\d?\d)\.){3}(?:25[0-5]|2[0-4]\d|1?\d?\d)$/;
var HASH_RE = /^[0-9a-f]+$/i;
var DOMAIN_RE = /^(?:[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?\.)+[a-z]{2,24}\.?$/i;
var USER_RE = /^@?[a-zA-Z0-9._-]{2,39}$/;
var BTC_LEGACY = /^(?:[13]|bc1)[a-zA-HJ-NP-Z0-9]{24,90}$/;
var ETH_RE = /^0x[0-9a-fA-F]{40}$/;
var HASH_LEN = {
	32: "MD5",
	40: "SHA-1",
	64: "SHA-256",
	96: "SHA-384",
	128: "SHA-512"
};
function looksLikeIpv6(q) {
	if (!q.includes(":")) return false;
	if (!/^[0-9a-f:]+$/i.test(q)) return false;
	const parts = q.split(":");
	return parts.length >= 3 && parts.length <= 8;
}
function stripWww(host) {
	return host.replace(/^www\./i, "");
}
function classify(raw) {
	const display = raw.trim();
	const q = display;
	if (!q) return {
		type: "unknown",
		normalized: "",
		display: ""
	};
	if (/^https?:\/\//i.test(q) || /^www\./i.test(q) || /\/.+/.test(q) && DOMAIN_RE.test(q.split("/")[0] ?? "")) try {
		const url = new URL(q.includes("://") ? q : `https://${q}`);
		if (url.hostname) return {
			type: "url",
			normalized: url.toString(),
			display
		};
	} catch {}
	if (EMAIL_RE.test(q)) return {
		type: "email",
		normalized: q.toLowerCase(),
		display
	};
	if (IPV4_RE.test(q)) return {
		type: "ipv4",
		normalized: q,
		display
	};
	if (looksLikeIpv6(q)) return {
		type: "ipv6",
		normalized: q,
		display
	};
	if (ETH_RE.test(q) || BTC_LEGACY.test(q)) return {
		type: "wallet",
		normalized: q,
		display,
		chain: ETH_RE.test(q) ? "ethereum" : "bitcoin"
	};
	if (HASH_RE.test(q) && HASH_LEN[q.length]) return {
		type: "hash",
		normalized: q.toLowerCase(),
		display,
		hashAlgo: HASH_LEN[q.length]
	};
	if (looksLikePhone(q)) {
		const phone = parseAnyPhone(q);
		if (phone?.isPossible()) return {
			type: "phone",
			normalized: phone.number,
			display
		};
	}
	const asDomain = q.replace(/\.$/, "").toLowerCase();
	if (DOMAIN_RE.test(asDomain) && asDomain.includes(".")) return {
		type: "domain",
		normalized: stripWww(asDomain),
		display
	};
	if (USER_RE.test(q)) return {
		type: "username",
		normalized: q.replace(/^@/, ""),
		display
	};
	return {
		type: "unknown",
		normalized: q,
		display
	};
}
function typeLabel(type) {
	switch (type) {
		case "ipv4": return "IPv4";
		case "ipv6": return "IPv6";
		case "url": return "URL";
		case "image": return "Image";
		default: return type.charAt(0).toUpperCase() + type.slice(1);
	}
}
function extractHost(input) {
	try {
		return new URL(input.includes("://") ? input : `https://${input}`).hostname.replace(/\.$/, "").toLowerCase();
	} catch {
		return null;
	}
}
function extractDomain(host) {
	const h = host.replace(/^www\./, "").toLowerCase();
	const parts = h.split(".");
	if (parts.length <= 2) return h;
	const last = parts.at(-1) ?? "";
	const second = parts.at(-2) ?? "";
	if ((/* @__PURE__ */ new Set([
		"co",
		"com",
		"net",
		"org",
		"gov",
		"ac",
		"edu"
	])).has(second) && last.length === 2) return parts.slice(-3).join(".");
	return parts.slice(-2).join(".");
}
function escapeHtml(value) {
	return value.replace(/[&<>"']/g, (ch) => {
		switch (ch) {
			case "&": return "&amp;";
			case "<": return "&lt;";
			case ">": return "&gt;";
			case "\"": return "&quot;";
			default: return "&#39;";
		}
	});
}
function fileStem(record) {
	return `fathom-${record.query.trim().replace(/[^\w.-]+/g, "_").replace(/^_+|_+$/g, "").slice(0, 60) || record.id}`;
}
function compactFacts(record) {
	const username = record.modules.username?.data;
	const github = record.modules.github?.data;
	const email = record.modules.email?.data;
	const domain = record.modules.domain?.data;
	const ips = record.modules.ip?.data;
	const url = record.modules.url?.data;
	const phone = record.modules.phone?.data;
	const hash = record.modules.hash?.data;
	const wallet = record.modules.wallet?.data;
	const image = record.modules.image?.data;
	return {
		query: record.query,
		type: record.type,
		github: github?.found ? {
			login: github.login,
			name: github.name,
			bio: github.bio,
			company: github.company,
			location: github.location,
			blog: github.blog,
			twitter: github.twitter,
			repos: github.publicRepos,
			followers: github.followers,
			createdAt: github.createdAt
		} : github?.message,
		profiles: username?.hits.filter((h) => h.status === "found").map((h) => ({
			name: h.name,
			url: h.url,
			detail: h.detail
		})),
		absent: username?.hits.filter((h) => h.status === "absent").map((h) => h.name),
		email: email ? {
			email: email.email,
			disposable: email.disposable,
			role: email.roleAccount,
			mx: email.mx,
			gravatar: email.gravatar.hasImage,
			gravatarName: email.gravatar.displayName
		} : void 0,
		domain: domain ? {
			domain: domain.domain,
			ips: domain.ips,
			mx: domain.mx,
			ns: domain.nameservers,
			registrar: domain.rdap?.registrar,
			registered: domain.rdap?.registered,
			expires: domain.rdap?.expires,
			status: domain.rdap?.status,
			title: domain.http?.title,
			server: domain.http?.server,
			spf: domain.emailAuth?.spfAll,
			dmarc: domain.emailAuth?.dmarcPolicy,
			subdomains: domain.subdomains.slice(0, 20),
			waybackFirst: domain.wayback.first,
			txtSample: domain.txt.slice(0, 6)
		} : void 0,
		ips: ips?.map((ip) => ({
			ip: ip.ip,
			geo: [
				ip.city,
				ip.region,
				ip.country
			].filter(Boolean).join(", "),
			isp: ip.isp,
			org: ip.org,
			asn: ip.asn,
			reverse: ip.reverse,
			hosting: ip.isHosting,
			proxy: ip.isProxy
		})),
		url: url ? {
			final: url.finalUrl,
			chain: url.chain,
			title: url.http?.title,
			server: url.http?.server
		} : void 0,
		phone: phone ? {
			e164: phone.e164,
			valid: phone.valid,
			type: phone.type,
			country: phone.countryName || phone.country,
			carrier: phone.carrier,
			holder: phone.directory?.holder,
			area: phone.directory?.area,
			names: phone.directory?.names,
			address: phone.directory?.address,
			complaints: phone.directory?.complaintsTotal,
			city: phone.city,
			region: phone.region,
			sightings: phone.sightings?.length
		} : void 0,
		hash: hash ? {
			algo: hash.algo,
			known: hash.known,
			file: hash.fileName,
			source: hash.source
		} : void 0,
		wallet: wallet ? {
			chain: wallet.chain,
			balance: wallet.balance,
			txCount: wallet.txCount,
			ens: wallet.ens
		} : void 0,
		image: image ? {
			file: image.fileName,
			camera: [image.make, image.model].filter(Boolean).join(" "),
			date: image.dateOriginal,
			gps: image.gps,
			software: image.software
		} : void 0,
		notes: record.notes || void 0
	};
}
function kv(label, value) {
	if (value === void 0 || value === null || value === "") return [];
	return [`- **${label}:** ${typeof value === "boolean" ? value ? "Yes" : "No" : String(value)}`];
}
function toMarkdown(record) {
	const lines = [
		`# Fathom dossier — ${record.query}`,
		``,
		`- **Type:** ${typeLabel(record.type)}`,
		`- **Collected:** ${new Date(record.updatedAt).toISOString()}`,
		`- **Case:** ${record.id}`,
		`- **Signals:** ${signalCount(record)}`,
		``
	];
	if (record.brief) lines.push(`## Analyst brief`, ``, record.brief.trim(), ``);
	const github = record.modules.github?.data;
	if (github?.found) {
		lines.push(`## GitHub`, ``);
		lines.push(...kv("Login", github.login));
		lines.push(...kv("Name", github.name));
		lines.push(...kv("Profile", github.htmlUrl));
		lines.push(...kv("Bio", github.bio));
		lines.push(...kv("Company", github.company));
		lines.push(...kv("Location", github.location));
		lines.push(...kv("Blog", github.blog));
		lines.push(...kv("X", github.twitter));
		lines.push(...kv("Repos", github.publicRepos));
		lines.push(...kv("Followers", github.followers));
		lines.push(...kv("Created", github.createdAt));
		lines.push(``);
	} else if (github && !github.found) lines.push(`## GitHub`, ``, github.message ?? "No public profile", ``);
	const email = record.modules.email?.data;
	if (email) {
		lines.push(`## Email`, ``);
		lines.push(...kv("Address", email.email));
		lines.push(...kv("Role account", email.roleAccount));
		lines.push(...kv("Disposable", email.disposable));
		lines.push(...kv("MX", email.mx.join(", ") || void 0));
		lines.push(...kv("Gravatar", email.gravatar.hasImage ? email.gravatar.displayName || "Image present" : "No public image"));
		lines.push(``);
	}
	const username = record.modules.username?.data;
	if (username) {
		const found = username.hits.filter((h) => h.status === "found");
		const absent = username.hits.filter((h) => h.status === "absent");
		lines.push(`## Username sweep`, ``, `Checked ${username.checked} platforms. ${found.length} confirmed.`, ``);
		if (found.length) {
			lines.push(`### Confirmed profiles`, ``);
			for (const h of found) lines.push(`- [${h.name}](${h.url})${h.detail ? ` — ${h.detail}` : ""}`);
			lines.push(``);
		}
		if (absent.length) lines.push(`### Not found`, ``, absent.map((h) => h.name).join(", "), ``);
	}
	const domain = record.modules.domain?.data;
	if (domain) {
		lines.push(`## Domain`, ``);
		lines.push(...kv("Domain", domain.domain));
		lines.push(...kv("Registrar", domain.rdap?.registrar));
		lines.push(...kv("Registered", domain.rdap?.registered));
		lines.push(...kv("Expires", domain.rdap?.expires));
		lines.push(...kv("Status", domain.rdap?.status?.join(", ")));
		lines.push(...kv("Nameservers", domain.nameservers.join(", ") || void 0));
		lines.push(...kv("MX", domain.mx.join(", ") || void 0));
		lines.push(...kv("A / AAAA", domain.ips.join(", ") || void 0));
		lines.push(...kv("Title", domain.http?.title));
		lines.push(...kv("Server", domain.http?.server));
		lines.push(...kv("SPF", domain.emailAuth?.spfAll));
		lines.push(...kv("DMARC", domain.emailAuth?.dmarcPolicy));
		if (domain.subdomains.length) lines.push(``, `### Hostnames`, ``, domain.subdomains.map((s) => `- \`${s}\``).join("\n"), ``);
	}
	const ips = record.modules.ip?.data;
	if (ips?.length) {
		lines.push(`## IP`, ``);
		for (const ip of ips) {
			lines.push(`### ${ip.ip}`, ``);
			lines.push(...kv("Geo", [
				ip.city,
				ip.region,
				ip.country
			].filter(Boolean).join(", ")));
			lines.push(...kv("ISP", ip.isp));
			lines.push(...kv("Org", ip.org));
			lines.push(...kv("ASN", ip.asn ? `AS${ip.asn}` : void 0));
			lines.push(...kv("Name", ip.asname));
			lines.push(...kv("Reverse", ip.reverse));
			lines.push(...kv("Hosting", ip.isHosting));
			lines.push(...kv("CIDR", ip.rdap?.cidr));
			lines.push(``);
		}
	}
	const url = record.modules.url?.data;
	if (url) {
		lines.push(`## URL`, ``);
		lines.push(...kv("Final", url.finalUrl));
		lines.push(...kv("Title", url.http?.title));
		lines.push(...kv("Server", url.http?.server));
		lines.push(``);
	}
	const phone = record.modules.phone?.data;
	if (phone) {
		lines.push(`## Phone`, ``);
		lines.push(...kv("Valid", phone.valid));
		lines.push(...kv("E.164", phone.e164));
		lines.push(...kv("International", phone.international));
		lines.push(...kv("Country", phone.countryName || phone.country));
		lines.push(...kv("Type", phone.type));
		lines.push(...kv("Carrier", phone.carrier));
		lines.push(...kv("Holder", phone.directory?.holder));
		lines.push(...kv("Area", phone.directory?.area));
		lines.push(...kv("Names", phone.directory?.names?.join(", ")));
		lines.push(...kv("Address", phone.directory?.address));
		lines.push(...kv("Complaints", phone.directory?.complaintsTotal));
		lines.push(...kv("City", phone.city));
		lines.push(...kv("Region", phone.region));
		if (phone.sightings?.length) {
			lines.push(``, `### Public mentions`, ``);
			for (const hit of phone.sightings) lines.push(`- [${hit.title}](${hit.url})`);
			lines.push(``);
		}
	}
	const image = record.modules.image?.data;
	if (image) {
		lines.push(`## Image EXIF`, ``);
		lines.push(...kv("File", image.fileName));
		lines.push(...kv("Camera", [image.make, image.model].filter(Boolean).join(" ")));
		lines.push(...kv("Taken", image.dateOriginal));
		lines.push(...kv("GPS", image.gps ? `${image.gps.lat}, ${image.gps.lon}` : void 0));
		lines.push(``);
	}
	if (record.notes.trim()) lines.push(`## Notes`, ``, record.notes.trim(), ``);
	return lines.join("\n").replace(/\n{3,}/g, "\n\n");
}
function toHtml(record) {
	const body = escapeHtml(toMarkdown(record)).replace(/^# (.*)$/gm, "<h1>$1</h1>").replace(/^## (.*)$/gm, "<h2>$1</h2>").replace(/^### (.*)$/gm, "<h3>$1</h3>").replace(/^- \*\*(.*?):\*\* (.*)$/gm, "<p><span>$1</span> $2</p>").replace(/^- \[(.*?)\]\((.*?)\)(?: — (.*))?$/gm, "<p><a href=\"$2\">$1</a> $3</p>").replace(/^- `(.*)`$/gm, "<p><code>$1</code></p>").replace(/^- (.*)$/gm, "<p>$1</p>").replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>").replace(/`([^`]+)`/g, "<code>$1</code>").replace(/\n\n/g, "\n");
	return `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8"/>
<meta name="viewport" content="width=device-width, initial-scale=1"/>
<title>Fathom — ${escapeHtml(record.query)}</title>
<style>
  :root { color-scheme: light; }
  body { margin: 0; background: #f4f4f2; color: #16161a; font: 15px/1.5 "IBM Plex Sans", ui-sans-serif, system-ui, sans-serif; }
  main { max-width: 44rem; margin: 2.5rem auto; background: #fff; border: 1px solid #d8d8de; padding: 2rem 2.25rem; }
  h1 { font-size: 1.5rem; font-weight: 500; margin: 0 0 1rem; letter-spacing: -0.02em; }
  h2 { font-size: 0.72rem; font-weight: 600; letter-spacing: 0.14em; text-transform: uppercase; color: #6b6b73; margin: 1.75rem 0 0.6rem; }
  h3 { font-size: 1rem; font-weight: 500; margin: 1rem 0 0.4rem; }
  p { margin: 0.2rem 0; }
  p span { display: inline-block; min-width: 7.5rem; color: #6b6b73; }
  a { color: #3d5270; }
  code { font-family: "IBM Plex Mono", ui-monospace, Menlo, monospace; font-size: 0.86em; }
  footer { margin-top: 2rem; color: #6b6b73; font-size: 12px; }
  @media print { body { background: #fff; } main { border: 0; margin: 0; padding: 0; } }
</style>
</head>
<body>
<main>${body}
<footer>Public-source collection only. Generated by Fathom.</footer>
</main>
</body>
</html>`;
}
function signalCount(record) {
	let n = 0;
	const u = record.modules.username?.data;
	if (u) n += u.found;
	if (record.modules.github?.data?.found) n += 1;
	if (record.modules.email?.data?.gravatar.hasImage) n += 1;
	const d = record.modules.domain?.data;
	if (d) n += d.ips.length + (d.rdap ? 1 : 0) + (d.http?.title ? 1 : 0) + d.subdomains.length;
	n += record.modules.ip?.data?.length ?? 0;
	if (record.modules.url?.data?.http?.status) n += 1;
	const phone = record.modules.phone?.data;
	if (phone) {
		n += phoneFindings(phone).length;
		if (phone.directory?.holder) n += 1;
		if (phone.directory?.names?.length) n += phone.directory.names.length;
		n += phone.sightings?.length ?? 0;
		n += phone.reputation?.length ?? 0;
	}
	if (record.modules.image?.data?.gps) n += 1;
	if ((record.modules.hash?.data)?.known) n += 1;
	if (record.modules.wallet?.data?.balance) n += 1;
	if (record.modules.domain?.data?.emailAuth?.spf) n += 1;
	if (record.modules.domain?.data?.emailAuth?.dmarc) n += 1;
	return n;
}
function downloadText(filename, text, mime) {
	const blob = new Blob([text], { type: `${mime};charset=utf-8` });
	const url = URL.createObjectURL(blob);
	const a = document.createElement("a");
	a.href = url;
	a.download = filename;
	a.rel = "noopener";
	document.body.appendChild(a);
	a.click();
	a.remove();
	window.setTimeout(() => URL.revokeObjectURL(url), 2500);
}
function exportMarkdown(record) {
	downloadText(`${fileStem(record)}.md`, toMarkdown(record), "text/markdown");
}
function exportJson(record) {
	downloadText(`${fileStem(record)}.json`, JSON.stringify(record, null, 2), "application/json");
}
function exportHtml(record) {
	downloadText(`${fileStem(record)}.html`, toHtml(record), "text/html");
}
function exportAllCases(cases) {
	downloadText(`fathom-cases-${(/* @__PURE__ */ new Date()).toISOString().slice(0, 10)}.json`, JSON.stringify(cases, null, 2), "application/json");
}
function CaseRail() {
	const cases = useCaseStore((s) => s.cases);
	const activeId = useCaseStore((s) => s.activeId);
	const setActive = useCaseStore((s) => s.setActive);
	const openNew = useCaseStore((s) => s.openNew);
	const remove = useCaseStore((s) => s.remove);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "flex h-full flex-col",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "mb-3 flex items-center justify-between",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "text-xs font-medium uppercase tracking-[0.16em] text-subtle",
				children: "Cases"
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex items-center",
				children: [cases.length > 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
					variant: "ghost",
					size: "icon-sm",
					"aria-label": "Export all cases",
					onClick: () => {
						exportAllCases(cases);
						toast.success("All cases downloaded");
					},
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Download, { className: "size-4" })
				}) : null, /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
					variant: "ghost",
					size: "icon-sm",
					onClick: openNew,
					"aria-label": "New investigation",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Plus, { className: "size-4" })
				})]
			})]
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			className: "flex min-h-0 flex-1 flex-col gap-1 overflow-y-auto scrollbar-thin",
			children: cases.length === 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "text-sm text-muted",
				children: "No saved cases yet. Run an investigation to start a dossier."
			}) : cases.map((c) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: cn("group flex items-start gap-2 rounded-md border px-3 py-2.5 transition-colors duration-[var(--motion-quick)]", c.id === activeId ? "border-border bg-elevated" : "border-transparent hover:bg-elevated/70"),
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
					type: "button",
					className: "min-h-11 min-w-0 flex-1 text-left",
					onClick: () => setActive(c.id),
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "truncate font-mono text-sm text-fg",
						children: c.query
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "mt-1 flex items-center gap-2",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Badge, { children: typeLabel(c.type) }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: "text-xs text-subtle tabular-nums",
							children: formatDistanceToNow(c.updatedAt, { addSuffix: true })
						})]
					})]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
					variant: "ghost",
					size: "icon-sm",
					className: "opacity-0 group-hover:opacity-100",
					"aria-label": `Delete ${c.query}`,
					onClick: () => remove(c.id),
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Trash2, { className: "size-3.5 text-muted" })
				})]
			}, c.id))
		})]
	});
}
var Input = (0, import_react.forwardRef)(function Input({ className, ...props }, ref) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
		ref,
		className: cn("flex h-11 w-full rounded-md border border-border bg-elevated px-3 text-sm text-fg placeholder:text-subtle", "transition-[border-color,box-shadow] duration-[var(--motion-quick)] ease-[var(--ease-out)]", "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/50", "disabled:opacity-40", className),
		...props
	});
});
var createSsrRpc = (functionId) => {
	const url = "/_serverFn/" + functionId;
	const serverFnMeta = { id: functionId };
	const fn = async (...args) => {
		return (await getServerFnById(functionId, { origin: "server" }))(...args);
	};
	return Object.assign(fn, {
		url,
		serverFnMeta,
		[TSS_SERVER_FUNCTION]: true
	});
};
function str(v, max) {
	if (typeof v !== "string") throw new Error("invalid");
	const s = v.trim();
	if (!s || s.length > max) throw new Error("invalid");
	return s;
}
var reconUsername = createServerFn({ method: "POST" }).validator((d) => ({ username: str(d.username, 64) })).handler(createSsrRpc("2e5be6340dd9c6843a4b18735df4fca0f045acdf15fe81094ca05ed8d4f3a2f0"));
var reconGithub = createServerFn({ method: "POST" }).validator((d) => ({ username: str(d.username, 64) })).handler(createSsrRpc("08fd78146b6a2704000b5bc41ff939602049612259f94365920686808a66fdba"));
var reconEmail = createServerFn({ method: "POST" }).validator((d) => ({ email: str(d.email, 254).toLowerCase() })).handler(createSsrRpc("8dc1747b8478f261a46decf96efcbad9adc9972a1863ca6c7b4e167c0ae22540"));
var reconDomain = createServerFn({ method: "POST" }).validator((d) => ({ domain: str(d.domain, 253).toLowerCase() })).handler(createSsrRpc("41ffc14549090a732f3bae82665d4016a6a115f3ced5159e6baf0ce0da9ba3a7"));
var reconIp = createServerFn({ method: "POST" }).validator((d) => ({ ip: str(d.ip, 64) })).handler(createSsrRpc("8cba289e0b70e1a31198868f7cddf7c13468da10482f7f63ee2ea3b420926908"));
var reconUrl = createServerFn({ method: "POST" }).validator((d) => ({ url: str(d.url, 2048) })).handler(createSsrRpc("e4282222e931c5bc279173b6e243e5a1fcf65b6f56b3cd17e1aa4593ef07f691"));
var reconPhone = createServerFn({ method: "POST" }).validator((d) => ({ phone: str(d.phone, 32) })).handler(createSsrRpc("4ad3655e047f1cbd9ebae198a5a08ae3db8e2fdf7730badcf97fdac01dcbd22c"));
var reconHash = createServerFn({ method: "POST" }).validator((d) => ({
	hash: str(d.hash, 128).toLowerCase(),
	algo: str(d.algo, 16)
})).handler(createSsrRpc("1ca4320098cc64c9934ca7068483826153503970b4eddf60a8ded1da3722a974"));
var reconWallet = createServerFn({ method: "POST" }).validator((d) => ({
	address: str(d.address, 128),
	chain: str(d.chain, 16)
})).handler(createSsrRpc("2b14b4f8a8a1bce53f750cd24ab4c6077558acdfad4daac8e53c3c9c9d5ec5df"));
var generateBrief = createServerFn({ method: "POST" }).validator((d) => ({
	facts: str(d.facts, 12e3),
	query: str(d.query, 400)
})).handler(createSsrRpc("dc8ca333f29ea1e2ae48f9d52626e41eb77b5d246eb8f68fd7602016fac65e95"));
function setModule(id, runId, key, state) {
	useCaseStore.getState().patch(id, (c) => {
		if (c.runId !== runId) return c;
		return {
			...c,
			updatedAt: Date.now(),
			modules: {
				...c.modules,
				[key]: state
			}
		};
	});
}
async function load(id, runId, key, fn) {
	setModule(id, runId, key, { status: "loading" });
	try {
		setModule(id, runId, key, {
			status: "ready",
			data: await fn()
		});
	} catch (e) {
		setModule(id, runId, key, {
			status: "error",
			error: e instanceof Error ? e.message : "Failed"
		});
	}
}
async function runInvestigation(raw, extras) {
	if (extras?.image) {
		const record = useCaseStore.getState().createCase(extras.image.fileName, "image");
		const id = record.id;
		const runId = record.runId;
		setModule(id, runId, "image", {
			status: "ready",
			data: extras.image
		});
		return;
	}
	const classified = classify(raw);
	if (!classified.normalized || classified.type === "unknown") throw new Error("Could not classify that input");
	const store = useCaseStore.getState();
	const existing = store.cases.find((c) => c.query === classified.normalized && c.id === store.activeId);
	const record = existing ?? store.createCase(classified.normalized, classified.type);
	const id = record.id;
	const runId = existing ? record.runId + 1 : record.runId;
	store.patch(id, (c) => ({
		...c,
		query: classified.normalized,
		type: classified.type,
		runId,
		brief: null,
		briefStatus: "idle",
		updatedAt: Date.now(),
		modules: {}
	}));
	const jobs = [];
	const { type, normalized } = classified;
	if (type === "username") {
		jobs.push(load(id, runId, "username", () => reconUsername({ data: { username: normalized } })));
		jobs.push(load(id, runId, "github", () => reconGithub({ data: { username: normalized } })));
	}
	if (type === "email") {
		const local = normalized.split("@")[0] ?? "";
		const domain = normalized.split("@")[1] ?? "";
		jobs.push(load(id, runId, "email", () => reconEmail({ data: { email: normalized } })));
		if (local) jobs.push(load(id, runId, "username", () => reconUsername({ data: { username: local } })));
		if (domain) jobs.push(load(id, runId, "domain", () => reconDomain({ data: { domain } })));
	}
	if (type === "domain") jobs.push(load(id, runId, "domain", () => reconDomain({ data: { domain: normalized } })));
	if (type === "url") {
		jobs.push(load(id, runId, "url", () => reconUrl({ data: { url: normalized } })));
		const host = extractHost(normalized);
		if (host) {
			const domain = extractDomain(host);
			jobs.push(load(id, runId, "domain", () => reconDomain({ data: { domain } })));
		}
	}
	if (type === "ipv4" || type === "ipv6") jobs.push(load(id, runId, "ip", async () => {
		return [await reconIp({ data: { ip: normalized } })];
	}));
	if (type === "phone") jobs.push(load(id, runId, "phone", () => reconPhone({ data: { phone: normalized } })));
	if (type === "hash") jobs.push(load(id, runId, "hash", () => reconHash({ data: {
		hash: normalized,
		algo: classified.hashAlgo ?? "unknown"
	} })));
	if (type === "wallet") jobs.push(load(id, runId, "wallet", () => reconWallet({ data: {
		address: normalized,
		chain: classified.chain ?? "unknown"
	} })));
	await Promise.all(jobs);
	const latest = useCaseStore.getState().cases.find((c) => c.id === id);
	const domainIps = latest?.modules.domain?.data?.ips.filter((ip) => /^\d{1,3}(?:\.\d{1,3}){3}$/.test(ip)).slice(0, 2) ?? [];
	if (domainIps.length && !latest?.modules.ip?.data?.length) await load(id, runId, "ip", async () => {
		return await Promise.all(domainIps.map((ip) => reconIp({ data: { ip } })));
	});
}
async function runBrief(id) {
	const rec = useCaseStore.getState().cases.find((c) => c.id === id);
	if (!rec) return;
	useCaseStore.getState().patch(id, (c) => ({
		...c,
		briefStatus: "loading",
		briefError: void 0
	}));
	try {
		const result = await generateBrief({ data: {
			query: rec.query,
			facts: JSON.stringify(compactFacts(rec))
		} });
		if (!result.ok) {
			useCaseStore.getState().patch(id, (c) => ({
				...c,
				briefStatus: "error",
				briefError: result.error
			}));
			return;
		}
		useCaseStore.getState().patch(id, (c) => ({
			...c,
			brief: result.text,
			briefStatus: "ready",
			updatedAt: Date.now()
		}));
	} catch (e) {
		useCaseStore.getState().patch(id, (c) => ({
			...c,
			briefStatus: "error",
			briefError: e instanceof Error ? e.message : "Failed"
		}));
	}
}
function CommandBar({ initialQuery, compact }) {
	const [value, setValue] = (0, import_react.useState)(initialQuery ?? "");
	const [busy, setBusy] = (0, import_react.useState)(false);
	const inputRef = (0, import_react.useRef)(null);
	const classified = classify(value);
	(0, import_react.useEffect)(() => {
		const onKey = (e) => {
			if (e.key === "/" && !(e.target instanceof HTMLInputElement) && !(e.target instanceof HTMLTextAreaElement)) {
				e.preventDefault();
				inputRef.current?.focus();
			}
		};
		window.addEventListener("keydown", onKey);
		return () => window.removeEventListener("keydown", onKey);
	}, []);
	(0, import_react.useEffect)(() => {
		if (initialQuery) setValue(initialQuery);
	}, [initialQuery]);
	async function submit() {
		if (!value.trim() || busy) return;
		if (classified.type === "unknown") {
			toast.error("Could not classify that input. Try a username, email, domain, IP, URL, phone, hash, or wallet.");
			return;
		}
		setBusy(true);
		try {
			await runInvestigation(value);
		} catch (e) {
			toast.error(e instanceof Error ? e.message : "Investigation failed");
		} finally {
			setBusy(false);
		}
	}
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("form", {
		className: "flex w-full flex-col gap-2",
		onSubmit: (e) => {
			e.preventDefault();
			submit();
		},
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "flex gap-2",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "relative min-w-0 flex-1",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Search, { className: "pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-subtle" }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
						ref: inputRef,
						value,
						onChange: (e) => setValue(e.target.value),
						placeholder: "Username, email, domain, IP, URL, phone, hash…",
						className: "pl-10 pr-24 font-mono",
						autoComplete: "off",
						spellCheck: false,
						"aria-label": "Investigate"
					}),
					value && classified.type !== "unknown" ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Badge, {
						variant: "accent",
						className: "absolute right-2 top-1/2 -translate-y-1/2",
						children: typeLabel(classified.type)
					}) : null
				]
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
				type: "submit",
				disabled: busy || !value.trim(),
				className: "min-w-20",
				children: busy ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(LoaderCircle, { className: "size-4 animate-spin" }) : "Run"
			})]
		}), compact ? null : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
			className: cn("px-1 font-mono text-xs text-subtle", classified.type === "unknown" && value && "text-warn"),
			children: value ? classified.type === "unknown" ? "Unrecognized. Paste a public identifier." : classified.type === "phone" ? `Will collect numbering, carrier, directories, and public mentions for ${phoneHint(value) ?? classified.normalized}` : `Will collect ${typeLabel(classified.type).toLowerCase()} intelligence for ${classified.normalized}` : "Press / to focus. Public sources only."
		})]
	});
}
var DropdownMenu = Root2;
var DropdownMenuTrigger = Trigger;
function DropdownMenuContent({ className, sideOffset = 6, ...props }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Portal2, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Content2, {
		sideOffset,
		className: cn("z-50 min-w-48 rounded-md border border-border bg-surface p-1 shadow-lg outline-none", "data-[state=open]:opacity-100 data-[state=closed]:opacity-0", "origin-[var(--radix-dropdown-menu-content-transform-origin)]", "transition-[opacity,transform] duration-[var(--motion-fast)] ease-[var(--ease-smooth-out)]", className),
		...props
	}) });
}
function DropdownMenuItem({ className, ...props }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Item2, {
		className: cn("flex min-h-10 cursor-pointer items-center gap-2 rounded-sm px-2.5 text-sm text-fg outline-none", "data-[highlighted]:bg-elevated", className),
		...props
	});
}
function ExportMenu({ record }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DropdownMenu, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(DropdownMenuTrigger, {
		asChild: true,
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
			variant: "outline",
			size: "sm",
			"aria-label": "Export dossier",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Download, { className: "size-3.5" }),
				"Export",
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ChevronDown, { className: "size-3.5 text-muted" })
			]
		})
	}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DropdownMenuContent, {
		align: "end",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DropdownMenuItem, {
				onSelect: () => {
					exportMarkdown(record);
					toast.success("Markdown report downloaded");
				},
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(FileText, { className: "size-3.5 text-muted" }), "Markdown report"]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DropdownMenuItem, {
				onSelect: () => {
					exportHtml(record);
					toast.success("HTML report downloaded");
				},
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(FileCode, { className: "size-3.5 text-muted" }), "HTML report"]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DropdownMenuItem, {
				onSelect: () => {
					exportJson(record);
					toast.success("JSON case file downloaded");
				},
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Download, { className: "size-3.5 text-muted" }), "JSON case file"]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DropdownMenuItem, {
				onSelect: () => {
					copyText(toMarkdown(record)).then(() => toast.success("Report copied"), () => toast.error("Could not copy"));
				},
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Copy, { className: "size-3.5 text-muted" }), "Copy markdown"]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DropdownMenuItem, {
				onSelect: () => window.print(),
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Printer, { className: "size-3.5 text-muted" }), "Print / save PDF"]
			})
		]
	})] });
}
function Skeleton({ className }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: cn("rounded-md bg-elevated animate-fathom-pulse", className) });
}
function buildGraph(record) {
	const nodes = [{
		id: "target",
		label: record.query,
		kind: "target"
	}];
	const links = [];
	const seen = /* @__PURE__ */ new Set(["target"]);
	const add = (node, from, edge) => {
		if (!seen.has(node.id)) {
			nodes.push(node);
			seen.add(node.id);
		}
		links.push({
			source: from,
			target: node.id,
			label: edge
		});
	};
	const gh = record.modules.github?.data;
	if (gh?.found && gh.login) {
		add({
			id: `gh:${gh.login}`,
			label: gh.name || gh.login,
			kind: "identity",
			href: gh.htmlUrl,
			query: gh.login
		}, "target", "github");
		if (gh.location) add({
			id: `place:${gh.location}`,
			label: gh.location,
			kind: "place"
		}, `gh:${gh.login}`, "location");
		if (gh.blog) add({
			id: `blog:${gh.blog}`,
			label: gh.blog,
			kind: "infra",
			query: gh.blog
		}, `gh:${gh.login}`, "blog");
	}
	const user = record.modules.username?.data;
	if (user) user.hits.filter((h) => h.status === "found").slice(0, 10).forEach((h) => {
		add({
			id: `p:${h.id}`,
			label: h.name,
			kind: "profile",
			href: h.url,
			query: user.username
		}, "target", "profile");
	});
	const email = record.modules.email?.data;
	if (email) {
		add({
			id: `em:${email.email}`,
			label: email.email,
			kind: "identity",
			query: email.email
		}, "target", "email");
		add({
			id: `dom:${email.domain}`,
			label: email.domain,
			kind: "infra",
			query: email.domain
		}, `em:${email.email}`, "domain");
	}
	const domain = record.modules.domain?.data;
	if (domain) {
		add({
			id: `dom:${domain.domain}`,
			label: domain.domain,
			kind: "infra",
			query: domain.domain
		}, "target", "domain");
		domain.ips.slice(0, 4).forEach((ip) => {
			add({
				id: `ip:${ip}`,
				label: ip,
				kind: "infra",
				query: ip
			}, `dom:${domain.domain}`, "resolves");
		});
		if (domain.rdap?.registrar) add({
			id: `reg:${domain.rdap.registrar}`,
			label: domain.rdap.registrar,
			kind: "identity"
		}, `dom:${domain.domain}`, "registrar");
	}
	(record.modules.ip?.data ?? []).slice(0, 3).forEach((ip) => {
		add({
			id: `ip:${ip.ip}`,
			label: ip.ip,
			kind: "infra",
			query: ip.ip
		}, "target", "ip");
		if (ip.city || ip.country) {
			const place = [ip.city, ip.country].filter(Boolean).join(", ");
			add({
				id: `place:${place}`,
				label: place,
				kind: "place"
			}, `ip:${ip.ip}`, "geo");
		}
		if (ip.org) add({
			id: `org:${ip.org}`,
			label: ip.org,
			kind: "identity"
		}, `ip:${ip.ip}`, "org");
	});
	const url = record.modules.url?.data;
	if (url?.host) add({
		id: `dom:${url.host}`,
		label: url.host,
		kind: "infra",
		query: url.host
	}, "target", "host");
	const phone = record.modules.phone?.data;
	if (phone?.e164) {
		add({
			id: `ph:${phone.e164}`,
			label: phone.international ?? phone.e164,
			kind: "identity"
		}, "target", "phone");
		if (phone.carrier) add({
			id: `car:${phone.carrier}`,
			label: phone.carrier,
			kind: "infra"
		}, `ph:${phone.e164}`, "carrier");
		const place = [
			phone.city,
			phone.region,
			phone.countryName || phone.country
		].filter(Boolean).join(", ");
		if (place) add({
			id: `place:${place}`,
			label: place,
			kind: "place"
		}, `ph:${phone.e164}`, "geo");
	}
	const image = record.modules.image?.data;
	if (image?.gps) {
		const label = `${image.gps.lat.toFixed(4)}, ${image.gps.lon.toFixed(4)}`;
		add({
			id: `gps:${label}`,
			label,
			kind: "place"
		}, "target", "exif");
	}
	if (image?.make || image?.model) add({
		id: `cam:${image.make ?? ""} ${image.model ?? ""}`.trim(),
		label: `${image.make ?? ""} ${image.model ?? ""}`.trim(),
		kind: "identity"
	}, "target", "camera");
	return {
		nodes: nodes.slice(0, 18),
		links: links.filter((l) => seen.has(l.source) && seen.has(l.target)).slice(0, 24)
	};
}
var KIND_FILL = {
	target: "var(--color-fg)",
	profile: "var(--color-accent)",
	infra: "var(--color-ok)",
	identity: "var(--color-warn)",
	place: "var(--color-muted)"
};
function EntityGraph({ record }) {
	const graph = (0, import_react.useMemo)(() => buildGraph(record), [record]);
	if (graph.nodes.length <= 1) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
		className: "py-12 text-center text-sm text-muted",
		children: "The graph fills as confirmed identities, hosts, and places land."
	});
	const width = 720;
	const height = 420;
	const cx = width / 2;
	const cy = height / 2;
	const satellites = graph.nodes.filter((n) => n.id !== "target");
	const positions = /* @__PURE__ */ new Map();
	positions.set("target", {
		x: cx,
		y: cy
	});
	satellites.forEach((n, i) => {
		const angle = i / satellites.length * Math.PI * 2 - Math.PI / 2;
		const ring = i % 2 === 0 ? 148 : 188;
		positions.set(n.id, {
			x: cx + Math.cos(angle) * ring,
			y: cy + Math.sin(angle) * ring
		});
	});
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "overflow-x-auto scrollbar-thin",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("svg", {
			viewBox: `0 0 ${width} ${height}`,
			className: "mx-auto h-auto w-full max-w-3xl",
			children: [graph.links.map((l, i) => {
				const a = positions.get(l.source);
				const b = positions.get(l.target);
				if (!a || !b) return null;
				return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("g", { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("line", {
					x1: a.x,
					y1: a.y,
					x2: b.x,
					y2: b.y,
					stroke: "var(--color-border)",
					strokeWidth: "1"
				}) }, `${l.source}-${l.target}-${i}`);
			}), graph.nodes.map((n) => {
				const p = positions.get(n.id);
				if (!p) return null;
				const r = n.kind === "target" ? 18 : 8;
				const clickable = Boolean(n.query);
				return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("g", {
					transform: `translate(${p.x}, ${p.y})`,
					className: clickable ? "cursor-pointer" : void 0,
					onClick: () => {
						if (n.query) runInvestigation(n.query);
					},
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("circle", {
						r,
						fill: KIND_FILL[n.kind] ?? "var(--color-muted)"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("text", {
						y: r + 14,
						textAnchor: "middle",
						fill: "var(--color-fg)",
						fontSize: "11",
						fontFamily: "var(--font-mono)",
						children: n.label.length > 22 ? `${n.label.slice(0, 20)}…` : n.label
					})]
				}, n.id);
			})]
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
			className: "mt-2 text-center text-xs text-subtle",
			children: "Click a labeled node to pivot a new investigation."
		})]
	});
}
var TECHNIQUES = [
	{
		id: "classify",
		name: "Classification",
		applies: "all",
		mode: "live",
		summary: "Decide what the input is before any request leaves the desk."
	},
	{
		id: "username",
		name: "Username enumeration",
		applies: ["username", "email"],
		mode: "live",
		summary: "A profile counts only when that site's API confirms the account.",
		sample: "torvalds"
	},
	{
		id: "social",
		name: "Social profiles",
		applies: ["username", "email"],
		mode: "live",
		summary: "YouTube, TikTok, Twitch, Bluesky, Mastodon, Tumblr, Steam, and public communities. X, Instagram, and Reddit stay as pivots.",
		sample: "pokimane"
	},
	{
		id: "github",
		name: "Code profile",
		applies: ["username"],
		mode: "live",
		summary: "Public GitHub identity: name, company, repos, followers.",
		sample: "torvalds"
	},
	{
		id: "dns",
		name: "Passive DNS",
		applies: [
			"domain",
			"email",
			"url"
		],
		mode: "live",
		summary: "A, AAAA, MX, NS, TXT, and SOA over DNS-over-HTTPS. No port scan.",
		sample: "cloudflare.com"
	},
	{
		id: "rdap",
		name: "Registration",
		applies: [
			"domain",
			"ipv4",
			"ipv6"
		],
		mode: "live",
		summary: "Registrar, dates, status, and network name from RDAP.",
		sample: "cloudflare.com"
	},
	{
		id: "ct",
		name: "Certificate transparency",
		applies: ["domain", "url"],
		mode: "live",
		summary: "Hostnames published in certificate logs, plus a short name brute.",
		sample: "cloudflare.com"
	},
	{
		id: "mail",
		name: "Mail authentication",
		applies: ["domain", "email"],
		mode: "live",
		summary: "SPF from the domain TXT record and DMARC from _dmarc.",
		sample: "cloudflare.com"
	},
	{
		id: "http",
		name: "HTTP fingerprint",
		applies: ["domain", "url"],
		mode: "live",
		summary: "Title, server, HSTS, security.txt, and the redirect chain.",
		sample: "https://github.com"
	},
	{
		id: "geo",
		name: "IP geolocation",
		applies: [
			"ipv4",
			"ipv6",
			"domain"
		],
		mode: "live",
		summary: "Country, city, ASN, and whether the address looks like hosting.",
		sample: "1.1.1.1"
	},
	{
		id: "phone",
		name: "Numbering and directory",
		applies: ["phone"],
		mode: "live",
		summary: "National plan, original carrier block, and a published reverse listing if one exists.",
		sample: "+61 412 345 678"
	},
	{
		id: "hash",
		name: "File hash lookup",
		applies: ["hash"],
		mode: "live",
		summary: "CIRCL's public hash lookup for known files. Not a private malware sandbox.",
		sample: "275a021bbfb6489e54d471899f7db9d1663fc695ec2fe2a2c4538aabf651fd0f"
	},
	{
		id: "wallet",
		name: "Public chain",
		applies: ["wallet"],
		mode: "live",
		summary: "Balance and transaction count from a public block explorer.",
		sample: "1A1zP1eP5QGefi2DMPTfTL5SLmv7DivfNa"
	},
	{
		id: "exif",
		name: "Local EXIF",
		applies: ["image"],
		mode: "live",
		summary: "Camera, time, and GPS parsed in the browser. The file is not uploaded."
	},
	{
		id: "pivot",
		name: "Search pivots",
		applies: "all",
		mode: "pivot",
		summary: "Hand-off links for sites that block automated checks. They are not live hits."
	}
];
function techniquesFor(type) {
	return TECHNIQUES.filter((t) => t.applies === "all" || t.applies.includes(type));
}
function outcome(record, technique) {
	const m = record.modules;
	switch (technique.id) {
		case "classify": return record.type;
		case "username": return m.username?.data ? `${m.username.data.found} confirmed of ${m.username.data.checked}` : m.username?.status ?? "not run";
		case "social": {
			const social = m.username?.data?.hits.filter((h) => h.status === "found" && (h.category === "Social" || h.category === "Creative")) ?? [];
			if (social.length) return social.map((h) => h.name).join(", ");
			return m.username?.data ? "none confirmed" : m.username?.status ?? "not run";
		}
		case "github": return m.github?.data?.found ? m.github.data.login ?? "found" : m.github?.data ? "no profile" : m.github?.status ?? "not run";
		case "dns": return m.domain?.data ? `${m.domain.data.ips.length} addresses · ${m.domain.data.mx.length} MX` : m.domain?.status ?? "not run";
		case "rdap": return m.domain?.data?.rdap?.registrar || m.ip?.data?.[0]?.rdap?.name || (m.domain?.status ?? m.ip?.status ?? "not run");
		case "ct": return m.domain?.data ? `${m.domain.data.subdomains.length} hostnames · ${m.domain.data.certs.length} certs` : m.domain?.status ?? "not run";
		case "mail": {
			const auth = m.domain?.data?.emailAuth;
			if (!auth) return m.domain?.status ?? "not run";
			return [auth.spfAll ? `SPF ${auth.spfAll}` : "no SPF", auth.dmarcPolicy ? `DMARC ${auth.dmarcPolicy}` : "no DMARC"].join(" · ");
		}
		case "http": return m.url?.data?.http?.title || m.domain?.data?.http?.title || (m.url?.status ?? m.domain?.status ?? "not run");
		case "geo": return m.ip?.data?.[0] ? [m.ip.data[0].city, m.ip.data[0].country].filter(Boolean).join(", ") || "no geo" : m.ip?.status ?? "not run";
		case "phone": return m.phone?.data?.directory?.holder || m.phone?.data?.carrier || (m.phone?.status ?? "not run");
		case "hash": return m.hash?.data?.known ? m.hash.data.fileName || "known file" : m.hash?.data ? "not in CIRCL" : m.hash?.status ?? "not run";
		case "wallet": return m.wallet?.data?.balance || m.wallet?.data?.message || (m.wallet?.status ?? "not run");
		case "exif": return m.image?.data?.gps ? "GPS present" : m.image?.data ? "no GPS" : "not run";
		case "pivot": return "open from the Pivots tab";
		default: return "";
	}
}
function TechniqueReport({ record }) {
	const rows = techniquesFor(record.type);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
		className: "flex flex-col gap-2",
		children: rows.map((t) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", {
			className: "rounded-lg border border-border bg-surface px-4 py-3",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "flex flex-wrap items-center gap-2",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "text-sm font-medium text-fg",
						children: t.name
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Badge, {
						variant: t.mode === "live" ? "ok" : "default",
						children: t.mode === "live" ? "Live" : "Pivot"
					})]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "mt-1 text-sm text-muted",
					children: t.summary
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "mt-2 font-mono text-xs text-accent",
					children: outcome(record, t)
				})
			]
		}, t.id))
	});
}
function TechniqueSamples({ onRun }) {
	const rows = TECHNIQUES.filter((t) => t.sample);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "mt-10 w-full text-left",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
			className: "mb-3 text-xs font-medium uppercase tracking-[0.16em] text-subtle",
			children: "Techniques"
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
			className: "flex flex-col gap-2",
			children: rows.map((t) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", {
				className: "flex items-start justify-between gap-3 rounded-lg border border-border px-3 py-3",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "min-w-0",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "text-sm text-fg",
						children: t.name
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "mt-0.5 text-xs text-subtle",
						children: t.summary
					})]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
					variant: "outline",
					size: "sm",
					className: "shrink-0",
					"aria-label": `Try ${t.name}`,
					onClick: () => onRun(t.sample),
					children: "Try"
				})]
			}, t.id))
		})]
	});
}
function g(q) {
	return `https://www.google.com/search?q=${encodeURIComponent(q)}`;
}
function ddg(q) {
	return `https://duckduckgo.com/?q=${encodeURIComponent(q)}`;
}
function pivotLinks(type, value) {
	const q = value.trim();
	const enc = encodeURIComponent(q);
	const links = [{
		group: "Search",
		label: "Google",
		href: g(`"${q}"`)
	}, {
		group: "Search",
		label: "DuckDuckGo",
		href: ddg(`"${q}"`)
	}];
	if (type === "username") links.push({
		group: "Search",
		label: "Google dork",
		href: g(`"${q}" (profile OR username OR account)`)
	}, {
		group: "Code",
		label: "GitHub users",
		href: `https://github.com/${enc}`
	}, {
		group: "Code",
		label: "GitHub search",
		href: `https://github.com/search?q=${enc}&type=users`
	}, {
		group: "Social",
		label: "Reddit",
		href: `https://www.reddit.com/user/${enc}`
	}, {
		group: "Social",
		label: "X",
		href: `https://x.com/${enc}`
	}, {
		group: "Social",
		label: "LinkedIn",
		href: `https://www.linkedin.com/in/${enc}`
	}, {
		group: "Archives",
		label: "Wayback",
		href: `https://web.archive.org/web/*/${enc}`
	});
	if (type === "email") {
		const domain = q.split("@")[1] ?? "";
		links.push({
			group: "Breach",
			label: "Have I Been Pwned",
			href: `https://haveibeenpwned.com/account/${enc}`
		}, {
			group: "Breach",
			label: "DeHashed",
			href: `https://www.dehashed.com/search?query=${enc}`
		}, {
			group: "Code",
			label: "GitHub code",
			href: `https://github.com/search?q=${enc}&type=code`
		}, {
			group: "Search",
			label: `site:${domain}`,
			href: g(`"${q}"`)
		}, {
			group: "Search",
			label: "Pastebin",
			href: g(`site:pastebin.com "${q}"`)
		}, {
			group: "People",
			label: "Hunter",
			href: `https://hunter.io/search/${encodeURIComponent(domain)}`
		}, {
			group: "Archives",
			label: "Wayback",
			href: `https://web.archive.org/web/*/${enc}`
		});
	}
	if (type === "domain" || type === "url") {
		const host = q.replace(/^https?:\/\//, "").split("/")[0] ?? q;
		links.push({
			group: "DNS",
			label: "SecurityTrails",
			href: `https://securitytrails.com/domain/${host}/dns`
		}, {
			group: "DNS",
			label: "ViewDNS",
			href: `https://viewdns.info/whois/?domain=${host}`
		}, {
			group: "DNS",
			label: "crt.sh",
			href: `https://crt.sh/?q=${host}`
		}, {
			group: "Scan",
			label: "urlscan",
			href: `https://urlscan.io/domain/${host}`
		}, {
			group: "Scan",
			label: "VirusTotal",
			href: `https://www.virustotal.com/gui/domain/${host}`
		}, {
			group: "Scan",
			label: "Shodan",
			href: `https://www.shodan.io/search?query=hostname%3A${host}`
		}, {
			group: "Scan",
			label: "Censys",
			href: `https://search.censys.io/search?resource=hosts&q=${host}`
		}, {
			group: "Archives",
			label: "Wayback",
			href: `https://web.archive.org/web/*/${host}`
		}, {
			group: "Archives",
			label: "archive.today",
			href: `https://archive.ph/${host}`
		}, {
			group: "Tech",
			label: "BuiltWith",
			href: `https://builtwith.com/${host}`
		}, {
			group: "Search",
			label: "inurl dork",
			href: g(`site:${host}`)
		});
	}
	if (type === "ipv4" || type === "ipv6") links.push({
		group: "Net",
		label: "Shodan",
		href: `https://www.shodan.io/host/${q}`
	}, {
		group: "Net",
		label: "Censys",
		href: `https://search.censys.io/hosts/${q}`
	}, {
		group: "Net",
		label: "VirusTotal",
		href: `https://www.virustotal.com/gui/ip-address/${q}`
	}, {
		group: "Net",
		label: "AbuseIPDB",
		href: `https://www.abuseipdb.com/check/${q}`
	}, {
		group: "Net",
		label: "BGPView",
		href: `https://bgpview.io/ip/${q}`
	}, {
		group: "DNS",
		label: "ViewDNS reverse",
		href: `https://viewdns.info/reverseip/?host=${q}&t=1`
	});
	if (type === "phone") {
		const parsed = parseAnyPhone(q);
		const digits = q.replace(/\D/g, "");
		const e164 = parsed?.number ?? (q.startsWith("+") ? q : `+${digits}`);
		const national = parsed?.formatNational() ?? digits;
		const iso = (parsed?.country ?? "AU").toLowerCase();
		const wa = e164.replace(/\D/g, "");
		links.push({
			group: "Search",
			label: "Google quoted E.164",
			href: g(`"${e164}"`)
		}, {
			group: "Search",
			label: "Google national format",
			href: g(`"${national}"`)
		}, {
			group: "Search",
			label: "DuckDuckGo",
			href: ddg(`"${e164}" OR "${national}"`)
		}, {
			group: "Search",
			label: "Paste sites",
			href: g(`"${e164}" OR "${national}" site:pastebin.com OR site:ghostbin.com`)
		}, {
			group: "People",
			label: "Truecaller",
			href: `https://www.truecaller.com/search/${iso}/${encodeURIComponent(national.replace(/\s+/g, ""))}`
		}, {
			group: "People",
			label: "Should I Answer",
			href: `https://www.shouldianswer.com/phone-number/${wa}`
		}, {
			group: "People",
			label: "NumLookup",
			href: `https://www.numlookup.com/phone-number/${encodeURIComponent(e164)}`
		}, {
			group: "People",
			label: "Sync.me",
			href: `https://sync.me/search/?number=${encodeURIComponent(e164)}`
		}, {
			group: "Messaging",
			label: "WhatsApp",
			href: `https://wa.me/${wa}`
		}, {
			group: "Code",
			label: "GitHub code",
			href: `https://github.com/search?q=${encodeURIComponent(e164)}&type=code`
		});
		if (iso === "au") {
			const local = national.replace(/\D/g, "");
			links.push({
				group: "Australia",
				label: "Reverse Australia",
				href: `https://www.reverseaustralia.com/lookup/${local}/`
			}, {
				group: "Australia",
				label: "White Pages",
				href: "https://www.whitepages.com.au/"
			}, {
				group: "Australia",
				label: "ACMA numbering",
				href: "https://www.acma.gov.au/phone-numbers"
			});
		}
		if (iso === "us" || iso === "ca") {
			const n = wa.replace(/^1/, "");
			links.push({
				group: "NANP",
				label: "800notes",
				href: `https://800notes.com/Phone.aspx/${n.slice(0, 3)}-${n.slice(3, 6)}-${n.slice(6)}`
			}, {
				group: "NANP",
				label: "Whitepages",
				href: `https://www.whitepages.com/phone/${n}`
			});
		}
	}
	if (type === "hash") links.push({
		group: "Malware",
		label: "VirusTotal",
		href: `https://www.virustotal.com/gui/search/${q}`
	}, {
		group: "Malware",
		label: "MalwareBazaar",
		href: `https://bazaar.abuse.ch/sample/${q}/`
	}, {
		group: "Malware",
		label: "Hybrid Analysis",
		href: `https://www.hybrid-analysis.com/search?query=${q}`
	}, {
		group: "Search",
		label: "Google",
		href: g(q)
	});
	if (type === "wallet") {
		const eth = q.startsWith("0x");
		links.push({
			group: "Chain",
			label: eth ? "Etherscan" : "mempool.space",
			href: eth ? `https://etherscan.io/address/${q}` : `https://mempool.space/address/${q}`
		}, {
			group: "Chain",
			label: "Blockchain.com",
			href: `https://www.blockchain.com/explorer/search?search=${enc}`
		}, {
			group: "Search",
			label: "Wallet dork",
			href: g(`"${q}"`)
		});
	}
	if (type === "image") links.push({
		group: "Image",
		label: "Google Lens",
		href: "https://lens.google.com/upload"
	}, {
		group: "Image",
		label: "Yandex Images",
		href: "https://yandex.com/images"
	}, {
		group: "Image",
		label: "TinEye",
		href: "https://tineye.com"
	}, {
		group: "Image",
		label: "PimEyes",
		href: "https://pimeyes.com"
	});
	return links;
}
var PLATFORMS = [
	{
		id: "github",
		name: "GitHub",
		category: "Code",
		url: (u) => `https://github.com/${u}`,
		live: true
	},
	{
		id: "gitlab",
		name: "GitLab",
		category: "Code",
		url: (u) => `https://gitlab.com/${u}`,
		live: true
	},
	{
		id: "dockerhub",
		name: "Docker Hub",
		category: "Code",
		url: (u) => `https://hub.docker.com/u/${u}`,
		live: true
	},
	{
		id: "huggingface",
		name: "Hugging Face",
		category: "Code",
		url: (u) => `https://huggingface.co/${u}`,
		live: true
	},
	{
		id: "crates",
		name: "crates.io",
		category: "Code",
		url: (u) => `https://crates.io/users/${u}`,
		live: true
	},
	{
		id: "npm",
		name: "npm",
		category: "Code",
		url: (u) => `https://www.npmjs.com/~${u}`,
		live: true
	},
	{
		id: "codeberg",
		name: "Codeberg",
		category: "Code",
		url: (u) => `https://codeberg.org/${u}`,
		live: true
	},
	{
		id: "rubygems",
		name: "RubyGems",
		category: "Code",
		url: (u) => `https://rubygems.org/profiles/${u}`,
		live: true
	},
	{
		id: "bitbucket",
		name: "Bitbucket",
		category: "Code",
		url: (u) => `https://bitbucket.org/${u}`,
		live: false
	},
	{
		id: "replit",
		name: "Replit",
		category: "Code",
		url: (u) => `https://replit.com/@${u}`,
		live: false
	},
	{
		id: "codepen",
		name: "CodePen",
		category: "Code",
		url: (u) => `https://codepen.io/${u}`,
		live: false
	},
	{
		id: "kaggle",
		name: "Kaggle",
		category: "Code",
		url: (u) => `https://www.kaggle.com/${u}`,
		live: false
	},
	{
		id: "reddit",
		name: "Reddit",
		category: "Social",
		url: (u) => `https://www.reddit.com/user/${u}`,
		live: false
	},
	{
		id: "youtube",
		name: "YouTube",
		category: "Social",
		url: (u) => `https://www.youtube.com/user/${u}`,
		live: true
	},
	{
		id: "twitch",
		name: "Twitch",
		category: "Social",
		url: (u) => `https://www.twitch.tv/${u}`,
		live: true
	},
	{
		id: "bsky",
		name: "Bluesky",
		category: "Social",
		url: (u) => `https://bsky.app/profile/${u}`,
		live: true
	},
	{
		id: "mastodon",
		name: "Mastodon",
		category: "Social",
		url: (u) => `https://mastodon.social/@${u}`,
		live: true
	},
	{
		id: "tiktok",
		name: "TikTok",
		category: "Social",
		url: (u) => `https://www.tiktok.com/@${u}`,
		live: true
	},
	{
		id: "tumblr",
		name: "Tumblr",
		category: "Social",
		url: (u) => `https://${u}.tumblr.com`,
		live: true
	},
	{
		id: "vimeo",
		name: "Vimeo",
		category: "Social",
		url: (u) => `https://vimeo.com/${u}`,
		live: true
	},
	{
		id: "mixcloud",
		name: "Mixcloud",
		category: "Social",
		url: (u) => `https://www.mixcloud.com/${u}/`,
		live: true
	},
	{
		id: "x",
		name: "X",
		category: "Social",
		url: (u) => `https://x.com/${u}`,
		live: false
	},
	{
		id: "instagram",
		name: "Instagram",
		category: "Social",
		url: (u) => `https://www.instagram.com/${u}/`,
		live: false
	},
	{
		id: "tiktok",
		name: "TikTok",
		category: "Social",
		url: (u) => `https://www.tiktok.com/@${u}`,
		live: false
	},
	{
		id: "linkedin",
		name: "LinkedIn",
		category: "Social",
		url: (u) => `https://www.linkedin.com/in/${u}`,
		live: false
	},
	{
		id: "facebook",
		name: "Facebook",
		category: "Social",
		url: (u) => `https://www.facebook.com/${u}`,
		live: false
	},
	{
		id: "threads",
		name: "Threads",
		category: "Social",
		url: (u) => `https://www.threads.net/@${u}`,
		live: false
	},
	{
		id: "hn",
		name: "Hacker News",
		category: "Community",
		url: (u) => `https://news.ycombinator.com/user?id=${u}`,
		live: true
	},
	{
		id: "devto",
		name: "Dev.to",
		category: "Community",
		url: (u) => `https://dev.to/${u}`,
		live: true
	},
	{
		id: "keybase",
		name: "Keybase",
		category: "Community",
		url: (u) => `https://keybase.io/${u}`,
		live: true
	},
	{
		id: "hashnode",
		name: "Hashnode",
		category: "Community",
		url: (u) => `https://hashnode.com/@${u}`,
		live: false
	},
	{
		id: "producthunt",
		name: "Product Hunt",
		category: "Community",
		url: (u) => `https://www.producthunt.com/@${u}`,
		live: false
	},
	{
		id: "stackoverflow",
		name: "Stack Overflow",
		category: "Community",
		url: (u) => `https://stackoverflow.com/users/${u}`,
		live: false
	},
	{
		id: "soundcloud",
		name: "SoundCloud",
		category: "Creative",
		url: (u) => `https://soundcloud.com/${u}`,
		live: true
	},
	{
		id: "dribbble",
		name: "Dribbble",
		category: "Creative",
		url: (u) => `https://dribbble.com/${u}`,
		live: false
	},
	{
		id: "behance",
		name: "Behance",
		category: "Creative",
		url: (u) => `https://www.behance.net/${u}`,
		live: false
	},
	{
		id: "wikipedia",
		name: "Wikipedia",
		category: "Other",
		url: (u) => `https://en.wikipedia.org/wiki/User:${u}`,
		live: true
	},
	{
		id: "telegram",
		name: "Telegram",
		category: "Other",
		url: (u) => `https://t.me/${u}`,
		live: false
	},
	{
		id: "patreon",
		name: "Patreon",
		category: "Other",
		url: (u) => `https://www.patreon.com/${u}`,
		live: false
	},
	{
		id: "steam",
		name: "Steam",
		category: "Social",
		url: (u) => `https://steamcommunity.com/id/${u}`,
		live: true
	},
	{
		id: "chess",
		name: "Chess.com",
		category: "Community",
		url: (u) => `https://www.chess.com/member/${u}`,
		live: true
	},
	{
		id: "lichess",
		name: "Lichess",
		category: "Community",
		url: (u) => `https://lichess.org/@/${u}`,
		live: true
	}
];
PLATFORMS.filter((p) => p.live);
var PIVOT_PLATFORMS = PLATFORMS.filter((p) => !p.live);
function StatusBadge({ status }) {
	if (status === "loading") return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Badge, {
		variant: "accent",
		children: "Collecting"
	});
	if (status === "error") return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Badge, {
		variant: "danger",
		children: "Failed"
	});
	if (status === "ready") return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Badge, {
		variant: "ok",
		children: "Ready"
	});
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Badge, { children: "Idle" });
}
function Card({ title, icon, state, children }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
		className: "rounded-xl border border-border bg-surface p-4 sm:p-5",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("header", {
			className: "mb-4 flex items-center justify-between gap-3",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex items-center gap-2 text-fg",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
					className: "text-muted",
					children: icon
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
					className: "text-sm font-medium tracking-wide",
					children: title
				})]
			}), state ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(StatusBadge, { status: state.status }) : null]
		}), state?.status === "loading" ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "space-y-2",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Skeleton, { className: "h-4 w-3/4" }),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Skeleton, { className: "h-4 w-1/2" }),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Skeleton, { className: "h-20 w-full" })
			]
		}) : state?.status === "error" ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
			className: "text-sm text-danger",
			children: state.error ?? "Collector failed"
		}) : children]
	});
}
function Kv({ label, value, mono }) {
	if (value === void 0 || value === null || value === "") return null;
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "grid grid-cols-[7.5rem_1fr] gap-2 py-1.5 text-sm",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("dt", {
			className: "text-subtle",
			children: label
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("dd", {
			className: cn("min-w-0 break-words text-fg", mono && "font-mono text-xs sm:text-sm"),
			children: value
		})]
	});
}
function Ext({ href, children }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("a", {
		href,
		target: "_blank",
		rel: "noreferrer",
		className: "inline-flex items-center gap-1 text-accent hover:underline",
		children: [children, /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ExternalLink, { className: "size-3" })]
	});
}
function UsernameCard({ data }) {
	const social = data.hits.filter((h) => h.status === "found" && (h.category === "Social" || h.category === "Creative"));
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "space-y-5",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
				className: "font-mono text-xs text-muted",
				children: [
					data.found,
					" found · ",
					data.checked,
					" live-checked · ",
					social.length,
					" social"
				]
			}),
			social.length ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
				className: "flex flex-col gap-2",
				children: social.map((h) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("li", {
					className: "rounded-lg border border-border bg-elevated px-3 py-3",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "flex items-start gap-3",
						children: [h.avatar ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("img", {
							src: h.avatar,
							alt: "",
							width: 40,
							height: 40,
							className: "size-10 rounded-md border border-border object-cover"
						}) : null, /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "min-w-0 flex-1",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "flex items-center justify-between gap-2",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
										className: "truncate text-sm text-fg",
										children: [h.name, h.detail ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
											className: "text-muted",
											children: [" · ", h.detail]
										}) : null]
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Ext, {
										href: h.url,
										children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Badge, {
											variant: "ok",
											children: "Open"
										})
									})]
								}),
								h.followers != null ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
									className: "text-xs text-subtle",
									children: [h.followers.toLocaleString(), " followers"]
								}) : null,
								h.bio ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
									className: "mt-1 text-sm text-muted",
									children: h.bio
								}) : null
							]
						})]
					})
				}, h.id))
			}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "text-sm text-muted",
				children: "No confirmed YouTube, TikTok, Twitch, Bluesky, Mastodon, Tumblr, or Steam account."
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "text-xs text-subtle",
				children: "A hit means that username is registered. It does not prove the accounts belong to the same person. X, Instagram, Reddit, and Facebook are not checked."
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
				className: "grid grid-cols-1 gap-1 sm:grid-cols-2",
				children: data.hits.filter((h) => !(h.status === "found" && (h.category === "Social" || h.category === "Creative"))).map((h) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", {
					className: "flex items-center justify-between gap-2 rounded-md px-2 py-2 hover:bg-elevated",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "min-w-0",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "truncate text-sm text-fg",
							children: h.name
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "text-xs text-subtle",
							children: h.category
						})]
					}), h.status === "found" ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Ext, {
						href: h.url,
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Badge, {
							variant: "ok",
							children: "Found"
						})
					}) : h.status === "absent" ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Badge, { children: "Absent" }) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Ext, {
						href: h.url,
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Badge, {
							variant: "warn",
							children: "Check"
						})
					})]
				}, h.id))
			})
		]
	});
}
function GithubCard({ data }) {
	if (!data.found) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
		className: "text-sm text-muted",
		children: data.message ?? "No public profile"
	});
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "flex gap-4",
		children: [data.avatarUrl ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("img", {
			src: data.avatarUrl,
			alt: "",
			width: 72,
			height: 72,
			className: "size-16 rounded-lg border border-border"
		}) : null, /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("dl", {
			className: "min-w-0 flex-1",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Kv, {
					label: "Login",
					value: data.htmlUrl ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Ext, {
						href: data.htmlUrl,
						children: data.login
					}) : data.login,
					mono: true
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Kv, {
					label: "Name",
					value: data.name
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Kv, {
					label: "Bio",
					value: data.bio
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Kv, {
					label: "Company",
					value: data.company
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Kv, {
					label: "Location",
					value: data.location
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Kv, {
					label: "Blog",
					value: data.blog ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Ext, {
						href: data.blog.startsWith("http") ? data.blog : `https://${data.blog}`,
						children: data.blog
					}) : null
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Kv, {
					label: "X",
					value: data.twitter
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Kv, {
					label: "Repos",
					value: data.publicRepos
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Kv, {
					label: "Followers",
					value: data.followers
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Kv, {
					label: "Created",
					value: data.createdAt ? format(new Date(data.createdAt), "d MMM yyyy") : void 0
				})
			]
		})]
	});
}
function EmailCard({ data }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "flex flex-col gap-4 sm:flex-row",
		children: [data.gravatar.hasImage ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("img", {
			src: data.gravatar.avatarUrl,
			alt: "",
			className: "size-16 rounded-lg border border-border"
		}) : null, /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("dl", {
			className: "flex-1",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Kv, {
					label: "Local",
					value: data.local,
					mono: true
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Kv, {
					label: "Domain",
					value: data.domain,
					mono: true
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Kv, {
					label: "Role account",
					value: data.roleAccount ? "Yes" : "No"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Kv, {
					label: "Disposable",
					value: data.disposable ? "Likely" : "Unlikely"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Kv, {
					label: "MX",
					value: data.mx?.join(" · ") || void 0,
					mono: true
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Kv, {
					label: "Gravatar",
					value: data.gravatar.hasImage ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Ext, {
						href: data.gravatar.profileUrl,
						children: data.gravatar.displayName ?? "Profile image"
					}) : "No public image"
				})
			]
		})]
	});
}
function DomainCard({ data }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "space-y-4",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("dl", { children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Kv, {
					label: "Registrar",
					value: data.rdap?.registrar
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Kv, {
					label: "Registered",
					value: data.rdap?.registered ? format(new Date(data.rdap.registered), "d MMM yyyy") : void 0
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Kv, {
					label: "Expires",
					value: data.rdap?.expires ? format(new Date(data.rdap.expires), "d MMM yyyy") : void 0
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Kv, {
					label: "Status",
					value: data.rdap?.status?.join(", ")
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Kv, {
					label: "NS",
					value: data.nameservers.join(" · ") || void 0,
					mono: true
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Kv, {
					label: "MX",
					value: data.mx.join(" · ") || void 0,
					mono: true
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Kv, {
					label: "SPF",
					value: data.emailAuth?.spfAll || (data.emailAuth?.spf ? "Present" : data.emailAuth ? "Absent" : void 0)
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Kv, {
					label: "DMARC",
					value: data.emailAuth?.dmarcPolicy ? `p=${data.emailAuth.dmarcPolicy}` : data.emailAuth ? "Absent" : void 0
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Kv, {
					label: "A / AAAA",
					value: data.ips.join(" · ") || void 0,
					mono: true
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Kv, {
					label: "Title",
					value: data.http?.title
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Kv, {
					label: "Server",
					value: data.http?.server
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Kv, {
					label: "HSTS",
					value: data.http?.hsts ? "Yes" : data.http ? "No" : void 0
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Kv, {
					label: "security.txt",
					value: data.http ? data.http.securityTxt ? "Present" : "Absent" : void 0
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Kv, {
					label: "Wayback",
					value: data.wayback.first ? `${data.wayback.first.slice(0, 8)} → ${data.wayback.last?.slice(0, 8) ?? ""}` : void 0
				})
			] }),
			data.subdomains.length > 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "mb-2 text-xs uppercase tracking-[0.14em] text-subtle",
				children: "Names from CT"
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "flex flex-wrap gap-1.5",
				children: data.subdomains.map((s) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Badge, {
					className: "font-mono",
					children: s
				}, s))
			})] }) : null,
			data.txt.length > 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "mb-2 text-xs uppercase tracking-[0.14em] text-subtle",
				children: "TXT"
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
				className: "space-y-1 font-mono text-xs text-muted",
				children: data.txt.slice(0, 8).map((t) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("li", {
					className: "break-all rounded-md bg-elevated px-2 py-1",
					children: t
				}, t))
			})] }) : null
		]
	});
}
function IpCard({ rows }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: "space-y-5",
		children: rows.map((ip) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("dl", {
			className: "border-t border-border pt-3 first:border-0 first:pt-0",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Kv, {
					label: "Address",
					value: ip.ip,
					mono: true
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Kv, {
					label: "Geo",
					value: [
						ip.city,
						ip.region,
						ip.country
					].filter(Boolean).join(", ") || void 0
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Kv, {
					label: "Coords",
					value: ip.lat != null && ip.lon != null ? `${ip.lat.toFixed(3)}, ${ip.lon.toFixed(3)}` : void 0,
					mono: true
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Kv, {
					label: "Timezone",
					value: ip.timezone
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Kv, {
					label: "ISP",
					value: ip.isp
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Kv, {
					label: "Org",
					value: ip.org
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Kv, {
					label: "ASN",
					value: ip.asn ? `AS${ip.asn}` : void 0,
					mono: true
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Kv, {
					label: "Reverse",
					value: ip.reverse,
					mono: true
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Kv, {
					label: "Hosting",
					value: ip.isHosting ? "Likely" : ip.isHosting === false ? "Unlikely" : void 0
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Kv, {
					label: "Proxy",
					value: ip.isProxy ? "Flagged" : void 0
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Kv, {
					label: "Net name",
					value: ip.rdap?.name
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Kv, {
					label: "CIDR",
					value: ip.rdap?.cidr,
					mono: true
				})
			]
		}, ip.ip))
	});
}
function UrlCard({ data }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("dl", { children: [
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Kv, {
			label: "Final",
			value: data.finalUrl ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Ext, {
				href: data.finalUrl,
				children: data.finalUrl
			}) : void 0
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Kv, {
			label: "Chain",
			value: data.chain.length ? data.chain.map((c) => `${c.status ?? "—"} ${c.url}`).join(" → ") : void 0,
			mono: true
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Kv, {
			label: "Title",
			value: data.http?.title
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Kv, {
			label: "Server",
			value: data.http?.server
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Kv, {
			label: "Type",
			value: data.http?.contentType
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Kv, {
			label: "HSTS",
			value: data.http?.hsts
		})
	] });
}
function PhoneCard({ data }) {
	const pivots = pivotLinks("phone", data.e164 || data.raw);
	const findings = phoneFindings(data);
	const mentionCount = data.sightings?.length ?? 0;
	const dirCount = data.reputation?.length ?? 0;
	const directory = data.directory;
	const mapQuery = directory?.address || (data.city ? `${data.city}, ${data.countryName ?? ""}` : void 0);
	const mapHref = data.nanp?.lat != null && data.nanp.lon != null ? `https://www.google.com/maps?q=${data.nanp.lat},${data.nanp.lon}` : mapQuery ? `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(mapQuery)}` : void 0;
	const directoryRows = [
		directory?.holder ? {
			label: "Holder",
			value: directory.holder
		} : null,
		directory?.area ? {
			label: "Area",
			value: directory.area
		} : null,
		directory?.phoneType ? {
			label: "Line",
			value: directory.phoneType
		} : null,
		directory?.lastFound ? {
			label: "Last seen",
			value: directory.lastFound
		} : null,
		directory?.complaintsTotal != null ? {
			label: "Reports",
			value: `${directory.complaintsYear ?? 0} this year · ${directory.complaintsTotal} total`
		} : null,
		directory?.names?.length ? {
			label: "Names",
			value: directory.names.join(" · ")
		} : null,
		directory?.address ? {
			label: "Address",
			value: directory.address
		} : null
	].filter((row) => Boolean(row));
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "space-y-5",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
				className: "font-mono text-xs text-muted",
				children: [
					directoryRows.length,
					" directory fields · ",
					findings.length,
					" numbering results · ",
					mentionCount,
					" public pages"
				]
			}),
			directory && directoryRows.length > 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "rounded-lg border border-border bg-elevated p-3",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "mb-2 flex items-center justify-between gap-2",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "text-xs uppercase tracking-[0.14em] text-subtle",
							children: directory.source
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("a", {
							href: directory.url,
							target: "_blank",
							rel: "noreferrer",
							className: "text-sm text-accent hover:underline",
							children: "Open listing"
						})]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("dl", { children: directoryRows.map((row) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Kv, {
						label: row.label,
						value: row.label === "Address" && mapHref ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Ext, {
							href: mapHref,
							children: row.value
						}) : row.value
					}, row.label)) }),
					directory.spamNote ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "mt-2 text-sm text-warn",
						children: directory.spamNote
					}) : null
				]
			}) : data.country === "AU" ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "text-sm text-muted",
				children: "No Reverse Australia listing published a holder, area, or name for this number."
			}) : null,
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
				className: "grid grid-cols-1 gap-1 sm:grid-cols-2",
				children: findings.map((row) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", {
					className: "rounded-md px-2 py-2",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "text-xs text-subtle",
							children: row.label
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "text-sm text-fg",
							children: row.id === "coords" && mapHref ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Ext, {
								href: mapHref,
								children: row.value
							}) : row.value
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "text-xs text-subtle",
							children: row.source
						})
					]
				}, row.id))
			}),
			data.nanp?.switchName ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("dl", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Kv, {
				label: "Switch",
				value: data.nanp.switchName,
				mono: true
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Kv, {
				label: "NPA-NXX",
				value: `${data.nanp.npa}-${data.nanp.nxx}`,
				mono: true
			})] }) : null,
			dirCount > 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
				className: "mb-2 text-xs uppercase tracking-[0.14em] text-subtle",
				children: ["Reverse directories · ", dirCount]
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
				className: "grid grid-cols-1 gap-1 sm:grid-cols-2",
				children: data.reputation?.map((row) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("li", { children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("a", {
					href: row.url,
					target: "_blank",
					rel: "noreferrer",
					className: "flex items-center justify-between gap-2 rounded-md px-2 py-2 hover:bg-elevated",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "min-w-0",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "truncate text-sm text-fg",
							children: row.source
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "truncate text-xs text-subtle",
							children: row.summary
						})]
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Badge, {
						variant: "ok",
						children: "Open"
					})]
				}) }, row.url))
			})] }) : null,
			mentionCount > 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
				className: "mb-2 text-xs uppercase tracking-[0.14em] text-subtle",
				children: ["Pages that quote this number · ", mentionCount]
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
				className: "space-y-1",
				children: data.sightings?.map((hit) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("li", { children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("a", {
					href: hit.url,
					target: "_blank",
					rel: "noreferrer",
					className: "block rounded-md px-2 py-2 hover:bg-elevated",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "text-sm text-fg",
						children: hit.title
					}), hit.snippet ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "mt-0.5 text-xs text-subtle",
						children: hit.snippet
					}) : null]
				}) }, hit.url))
			})] }) : directory?.names?.length ? null : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "text-sm text-muted",
				children: "No extra web page quotes this exact number. Subscriber name only appears when a public directory already publishes it."
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "mb-2 text-xs uppercase tracking-[0.14em] text-subtle",
				children: "Open on"
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "flex flex-wrap gap-2",
				children: pivots.map((p) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("a", {
					href: p.href,
					target: "_blank",
					rel: "noreferrer",
					className: "inline-flex h-11 items-center rounded-md border border-border bg-elevated px-3 text-sm text-fg hover:border-accent/40",
					children: p.label
				}, p.href))
			})] }),
			data.carrierNote ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "text-xs text-subtle",
				children: data.carrierNote
			}) : null,
			data.notes?.map((n) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "text-xs text-subtle",
				children: n
			}, n))
		]
	});
}
function HashCard({ data }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("dl", { children: [
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Kv, {
			label: "Algorithm",
			value: data.algo
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Kv, {
			label: "Bits",
			value: data.bits || void 0
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Kv, {
			label: "Known",
			value: data.known === void 0 ? void 0 : data.known ? "Yes" : "No"
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Kv, {
			label: "File",
			value: data.fileName
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Kv, {
			label: "Size",
			value: data.fileSize ? `${data.fileSize} bytes` : void 0
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Kv, {
			label: "Source",
			value: data.source
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Kv, {
			label: "MD5",
			value: data.md5,
			mono: true
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Kv, {
			label: "SHA-1",
			value: data.sha1,
			mono: true
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Kv, {
			label: "Value",
			value: data.value,
			mono: true
		}),
		data.message ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
			className: "mt-2 text-sm text-muted",
			children: data.message
		}) : null
	] });
}
function WalletCard({ data }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("dl", { children: [
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Kv, {
			label: "Chain",
			value: data.chain
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Kv, {
			label: "Address",
			value: data.address,
			mono: true
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Kv, {
			label: "Balance",
			value: data.balance,
			mono: true
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Kv, {
			label: "Received",
			value: data.received,
			mono: true
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Kv, {
			label: "Transactions",
			value: data.txCount
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Kv, {
			label: "ENS",
			value: data.ens
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Kv, {
			label: "Explorer",
			value: data.explorer ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Ext, {
				href: data.explorer,
				children: "Open"
			}) : void 0
		}),
		data.message ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
			className: "mt-2 text-sm text-muted",
			children: data.message
		}) : null
	] });
}
function ImageCard({ data }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("dl", { children: [
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Kv, {
			label: "File",
			value: data.fileName
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Kv, {
			label: "Size",
			value: data.width && data.height ? `${data.width} × ${data.height}` : void 0
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Kv, {
			label: "Camera",
			value: [data.make, data.model].filter(Boolean).join(" ") || void 0
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Kv, {
			label: "Lens",
			value: data.lens
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Kv, {
			label: "Software",
			value: data.software
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Kv, {
			label: "Taken",
			value: data.dateOriginal
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Kv, {
			label: "GPS",
			value: data.gps ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Ext, {
				href: `https://www.google.com/maps?q=${data.gps.lat},${data.gps.lon}`,
				children: [
					data.gps.lat.toFixed(5),
					", ",
					data.gps.lon.toFixed(5)
				]
			}) : "Not present"
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
			className: "mt-2 text-xs text-subtle",
			children: "EXIF is parsed in the browser. The file never leaves this device."
		})
	] });
}
function Dossier({ record }) {
	const [tab, setTab] = (0, import_react.useState)("overview");
	(0, import_react.useEffect)(() => {
		setTab("overview");
	}, [record.id]);
	const m = record.modules;
	const pivots = pivotLinks(record.type, record.query);
	const groups = [...new Set(pivots.map((p) => p.group))];
	const signals = signalCount(record);
	const collecting = Object.values(m).some((mod) => mod?.status === "loading");
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "mx-auto flex w-full max-w-4xl flex-col gap-6 px-4 py-6 sm:px-6",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("header", {
				className: "flex flex-col gap-4 border-b border-border pb-5",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "flex flex-wrap items-start justify-between gap-3",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "min-w-0",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "font-mono text-xs uppercase tracking-[0.18em] text-subtle",
								children: record.id
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
								className: "mt-1 break-all font-mono text-2xl font-medium tracking-tight text-fg sm:text-3xl",
								children: record.query
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "mt-3 flex flex-wrap items-center gap-2",
								children: [
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Badge, {
										variant: "accent",
										children: typeLabel(record.type)
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Badge, { children: [signals, " signals"] }),
									collecting ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Badge, {
										variant: "warn",
										children: "Live"
									}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Badge, {
										variant: "ok",
										children: "Settled"
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
										className: "text-xs text-subtle tabular-nums",
										children: format(record.updatedAt, "d MMM yyyy HH:mm")
									})
								]
							})
						]
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "flex shrink-0 items-center gap-2",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
							variant: "outline",
							size: "sm",
							onClick: () => {
								copyText(record.query).then(() => toast.success("Copied target"));
							},
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Copy, { className: "size-3.5" }), "Copy"]
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ExportMenu, { record })]
					})]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "flex gap-1 rounded-lg bg-elevated p-1",
					children: [
						["overview", "Overview"],
						["methods", "Methods"],
						["graph", "Graph"],
						["pivots", "Pivots"]
					].map(([id, label]) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
						type: "button",
						onClick: () => setTab(id),
						className: cn("flex-1 rounded-md px-3 py-2 text-sm font-medium transition-colors duration-[var(--motion-quick)]", tab === id ? "bg-surface text-fg" : "text-muted hover:text-fg"),
						children: label
					}, id))
				})]
			}),
			tab === "methods" ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(TechniqueReport, { record }) : null,
			tab === "graph" ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(EntityGraph, { record }) : null,
			tab === "pivots" ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "space-y-6",
				children: [groups.map((g) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
					className: "mb-2 text-xs font-medium uppercase tracking-[0.16em] text-subtle",
					children: g
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "flex flex-wrap gap-2",
					children: pivots.filter((p) => p.group === g).map((p) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("a", {
						href: p.href,
						target: "_blank",
						rel: "noreferrer",
						className: "inline-flex h-11 items-center rounded-md border border-border bg-elevated px-3 text-sm text-fg hover:border-accent/40",
						children: p.label
					}, p.href))
				})] }, g)), record.type === "username" ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
					className: "mb-2 text-xs font-medium uppercase tracking-[0.16em] text-subtle",
					children: "Platforms that block live checks"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "flex flex-wrap gap-2",
					children: PIVOT_PLATFORMS.map((p) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("a", {
						href: p.url(record.query),
						target: "_blank",
						rel: "noreferrer",
						className: "inline-flex h-11 items-center rounded-md border border-border px-3 text-sm text-muted hover:text-fg",
						children: p.name
					}, p.id))
				})] }) : null]
			}) : null,
			tab === "overview" ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex flex-col gap-4",
				children: [
					record.brief ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
						className: "rounded-xl border border-border bg-surface p-4 sm:p-5",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
							className: "mb-3 text-sm font-medium tracking-wide",
							children: "Analyst brief"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("pre", {
							className: "whitespace-pre-wrap font-sans text-sm leading-relaxed text-fg",
							children: record.brief
						})]
					}) : null,
					m.github ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Card, {
						title: "GitHub",
						icon: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Github, { className: "size-4" }),
						state: m.github,
						children: m.github.data ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(GithubCard, { data: m.github.data }) : null
					}) : null,
					m.email ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Card, {
						title: "Email",
						icon: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(AtSign, { className: "size-4" }),
						state: m.email,
						children: m.email.data ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(EmailCard, { data: m.email.data }) : null
					}) : null,
					m.username ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Card, {
						title: "Username sweep",
						icon: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(User, { className: "size-4" }),
						state: m.username,
						children: m.username.data ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(UsernameCard, { data: m.username.data }) : null
					}) : null,
					m.domain ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Card, {
						title: "Domain",
						icon: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Globe, { className: "size-4" }),
						state: m.domain,
						children: m.domain.data ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(DomainCard, { data: m.domain.data }) : null
					}) : null,
					m.ip ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Card, {
						title: "IP",
						icon: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Network, { className: "size-4" }),
						state: m.ip,
						children: m.ip.data ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(IpCard, { rows: m.ip.data }) : null
					}) : null,
					m.url ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Card, {
						title: "URL",
						icon: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Server, { className: "size-4" }),
						state: m.url,
						children: m.url.data ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(UrlCard, { data: m.url.data }) : null
					}) : null,
					m.phone ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Card, {
						title: "Phone",
						icon: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Phone, { className: "size-4" }),
						state: m.phone,
						children: m.phone.data ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(PhoneCard, { data: m.phone.data }) : null
					}) : null,
					m.hash ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Card, {
						title: "Hash",
						icon: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Hash, { className: "size-4" }),
						state: m.hash,
						children: m.hash.data ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(HashCard, { data: m.hash.data }) : null
					}) : null,
					m.wallet ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Card, {
						title: "Wallet",
						icon: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Wallet, { className: "size-4" }),
						state: m.wallet,
						children: m.wallet.data ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(WalletCard, { data: m.wallet.data }) : null
					}) : null,
					m.image ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Card, {
						title: "Image EXIF",
						icon: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Image, { className: "size-4" }),
						state: m.image,
						children: m.image.data ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ImageCard, { data: m.image.data }) : null
					}) : null,
					!collecting && Object.keys(m).length === 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "text-sm text-muted",
						children: "No collectors ran for this case."
					}) : null
				]
			}) : null,
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
				className: "flex items-center gap-2 text-xs text-subtle",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Shield, { className: "size-3.5" }), "Public registries and unauthenticated profile URLs. Private ranges are blocked."]
			})
		]
	});
}
function FathomMark({ className }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("svg", {
		viewBox: "0 0 24 24",
		className: cn("text-fg", className),
		"aria-hidden": true,
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("circle", {
				cx: "12",
				cy: "12",
				r: "9",
				fill: "none",
				stroke: "currentColor",
				strokeWidth: "1.5"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("path", {
				d: "M3 12h18",
				stroke: "currentColor",
				strokeWidth: "1.5"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("circle", {
				cx: "12",
				cy: "12",
				r: "2.15",
				fill: "currentColor",
				className: "text-accent"
			})
		]
	});
}
var SAMPLES = [
	{
		label: "torvalds",
		hint: "username"
	},
	{
		label: "cloudflare.com",
		hint: "domain"
	},
	{
		label: "+61 412 345 678",
		hint: "AU mobile"
	},
	{
		label: "+1 650-253-0000",
		hint: "US phone"
	}
];
function EmptyDesk() {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "mx-auto flex max-w-2xl flex-col items-center px-4 py-16 text-center sm:py-24",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(FathomMark, { className: "mb-6 size-12" }),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
				className: "font-sans text-4xl font-medium tracking-tight text-fg sm:text-5xl",
				children: "Fathom"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "mt-3 max-w-md text-base leading-relaxed text-muted",
				children: "Public-source intelligence desk. Classify an identifier, collect DNS, RDAP, certificates, profiles, and infrastructure, then brief the dossier."
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "mt-8 w-full text-left",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CommandBar, {})
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "mt-6 flex flex-wrap justify-center gap-2",
				children: SAMPLES.map((s) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
					variant: "outline",
					size: "sm",
					className: "font-mono",
					onClick: () => void runInvestigation(s.label),
					children: [s.label, /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
						className: "text-subtle",
						children: s.hint
					})]
				}, s.label))
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TechniqueSamples, { onRun: (sample) => void runInvestigation(sample) }),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "mt-10 max-w-sm text-xs leading-relaxed text-subtle",
				children: "Queries public registries and profile URLs only. No port scans, no credential stuffing, no paid breach dumps. Cases stay in this browser. Drop a photo to read EXIF locally."
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("label", {
				htmlFor: "exif-file",
				className: "mt-4 cursor-pointer text-sm text-accent hover:underline",
				children: "Read image EXIF"
			})
		]
	});
}
function Textarea({ className, ...props }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("textarea", {
		className: cn("flex min-h-32 w-full rounded-md border border-border bg-elevated px-3 py-2 text-sm text-fg placeholder:text-subtle", "transition-[border-color,box-shadow] duration-[var(--motion-quick)] ease-[var(--ease-out)]", "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/50", className),
		...props
	});
}
function NotesPanel({ record }) {
	const setNotes = useCaseStore((s) => s.setNotes);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "flex h-full flex-col gap-4",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "mb-2 text-xs font-medium uppercase tracking-[0.16em] text-subtle",
				children: "Notes"
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Textarea, {
				value: record.notes,
				onChange: (e) => setNotes(record.id, e.target.value),
				placeholder: "Working notes stay on this device.",
				className: "min-h-36"
			})] }),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex flex-col gap-2",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
					variant: "secondary",
					onClick: () => {
						runBrief(record.id).then(() => {
							const latest = useCaseStore.getState().cases.find((c) => c.id === record.id);
							if (latest?.briefStatus === "error") toast.error(latest.briefError ?? "Brief failed");
						});
					},
					disabled: record.briefStatus === "loading",
					children: [record.briefStatus === "loading" ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(LoaderCircle, { className: "size-4 animate-spin" }) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ScanText, { className: "size-4" }), "Analyst brief"]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ExportMenu, { record })]
			}),
			record.brief ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("article", {
				className: "rounded-lg border border-border bg-elevated p-3",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "mb-2 text-xs font-medium uppercase tracking-[0.16em] text-subtle",
					children: "Brief"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("pre", {
					className: "whitespace-pre-wrap font-sans text-sm leading-relaxed text-fg",
					children: record.brief
				})]
			}) : record.briefStatus === "error" ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "text-sm text-danger",
				children: record.briefError
			}) : null
		]
	});
}
function Sheet({ open, onOpenChange, title, children, side = "left" }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Dialog, {
		open,
		onOpenChange,
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DialogPortal, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(DialogOverlay, { className: "fixed inset-0 z-50 bg-bg/70 data-[state=open]:opacity-100 data-[state=closed]:opacity-0 transition-opacity duration-[var(--motion-fast)]" }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DialogContent, {
			className: cn("fixed z-50 top-0 flex h-dvh w-[min(100%,20rem)] flex-col bg-surface border-border p-4 shadow-xl", "transition-transform duration-[var(--motion-slow)] ease-[var(--ease-smooth-out)]", side === "left" ? "left-0 border-r" : "right-0 border-l"),
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "mb-4 flex items-center justify-between",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(DialogTitle, {
					className: "text-sm font-medium tracking-wide text-fg",
					children: title
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(DialogClose, {
					asChild: true,
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
						variant: "ghost",
						size: "icon-sm",
						"aria-label": "Close",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(X, { className: "size-4" })
					})
				})]
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "min-h-0 flex-1 overflow-y-auto scrollbar-thin",
				children
			})]
		})] })
	});
}
async function readExif(file) {
	const parsed = await tt.parse(file, { gps: true });
	const gps = typeof parsed?.latitude === "number" && typeof parsed?.longitude === "number" ? {
		lat: parsed.latitude,
		lon: parsed.longitude
	} : void 0;
	let width;
	let height;
	if (typeof createImageBitmap === "function") try {
		const bmp = await createImageBitmap(file);
		width = bmp.width;
		height = bmp.height;
		bmp.close();
	} catch {}
	return {
		fileName: file.name,
		mime: file.type,
		width,
		height,
		make: typeof parsed?.Make === "string" ? parsed.Make : void 0,
		model: typeof parsed?.Model === "string" ? parsed.Model : void 0,
		software: typeof parsed?.Software === "string" ? parsed.Software : void 0,
		dateOriginal: parsed?.DateTimeOriginal instanceof Date ? parsed.DateTimeOriginal.toISOString() : typeof parsed?.DateTimeOriginal === "string" ? parsed.DateTimeOriginal : void 0,
		lens: typeof parsed?.LensModel === "string" ? parsed.LensModel : void 0,
		gps,
		localOnly: true
	};
}
function Desk({ initialQuery }) {
	const hydrated = useCaseStore((s) => s.hasHydrated);
	const active = useActiveCase();
	const [casesOpen, setCasesOpen] = (0, import_react.useState)(false);
	const [notesOpen, setNotesOpen] = (0, import_react.useState)(false);
	const ranQuery = (0, import_react.useRef)(false);
	(0, import_react.useEffect)(() => {
		const result = useCaseStore.persist.rehydrate();
		Promise.resolve(result).finally(() => {
			useCaseStore.getState().setHasHydrated(true);
		});
	}, []);
	(0, import_react.useEffect)(() => {
		if (!initialQuery || !hydrated || ranQuery.current) return;
		ranQuery.current = true;
		runInvestigation(initialQuery).catch((e) => {
			toast.error(e instanceof Error ? e.message : "Investigation failed");
		});
	}, [hydrated, initialQuery]);
	async function onDrop(files) {
		const file = files?.[0];
		if (!file || !file.type.startsWith("image/")) return;
		try {
			const intel = await readExif(file);
			await runInvestigation(file.name.replace(/\.[^.]+$/, ""), { image: intel });
			toast.success("EXIF extracted locally");
		} catch {
			toast.error("Could not read that image");
		}
	}
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "flex min-h-dvh flex-col bg-bg text-fg",
		onDragOver: (e) => {
			e.preventDefault();
		},
		onDrop: (e) => {
			e.preventDefault();
			onDrop(e.dataTransfer.files);
		},
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("header", {
				className: "no-print sticky top-0 z-30 border-b border-border bg-bg/95 backdrop-blur-sm",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "flex items-center gap-3 px-3 py-3 sm:px-4",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
							variant: "ghost",
							size: "icon-sm",
							className: "lg:hidden",
							"aria-label": "Open cases",
							onClick: () => setCasesOpen(true),
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(FolderOpen, { className: "size-4" })
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "flex items-center gap-2",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(FathomMark, { className: "size-6" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								className: "hidden font-medium tracking-tight sm:inline",
								children: "Fathom"
							})]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "min-w-0 flex-1",
							children: active ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CommandBar, { compact: true }) : null
						}),
						active ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
							variant: "ghost",
							size: "icon-sm",
							className: "xl:hidden",
							"aria-label": "Open notes",
							onClick: () => setNotesOpen(true),
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(StickyNote, { className: "size-4" })
						}) : null
					]
				})
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex min-h-0 flex-1",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("aside", {
						className: "no-print hidden w-64 shrink-0 border-r border-border p-4 lg:block",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CaseRail, {})
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("main", {
						className: "min-w-0 flex-1 overflow-y-auto scrollbar-thin",
						children: active ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Dossier, { record: active }) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(EmptyDesk, {})
					}),
					active ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("aside", {
						className: "no-print hidden w-80 shrink-0 border-l border-border p-4 xl:block",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(NotesPanel, { record: active })
					}) : null
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Sheet, {
				open: casesOpen,
				onOpenChange: setCasesOpen,
				title: "Cases",
				side: "left",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CaseRail, {})
			}),
			active ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Sheet, {
				open: notesOpen,
				onOpenChange: setNotesOpen,
				title: "Notes",
				side: "right",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(NotesPanel, { record: active })
			}) : null,
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
				type: "file",
				accept: "image/*",
				className: "sr-only",
				id: "exif-file",
				onChange: (e) => {
					onDrop(e.target.files);
					e.target.value = "";
				}
			})
		]
	});
}
function Home() {
	const { q } = Route.useSearch();
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Desk, { initialQuery: q });
}
//#endregion
export { Home as component };
