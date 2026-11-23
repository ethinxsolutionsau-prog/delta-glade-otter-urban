import { typeLabel } from "./classify";
import { phoneFindings } from "./phone";
import type { CaseRecord } from "./types";

function escapeHtml(value: string) {
  return value.replace(/[&<>"']/g, (ch) => {
    switch (ch) {
      case "&":
        return "&" + "amp;";
      case "<":
        return "&" + "lt;";
      case ">":
        return "&" + "gt;";
      case '"':
        return "&" + "quot;";
      default:
        return "&" + "#39;";
    }
  });
}

function fileStem(record: CaseRecord) {
  const q = record.query
    .trim()
    .replace(/[^\w.-]+/g, "_")
    .replace(/^_+|_+$/g, "")
    .slice(0, 60);
  return `fathom-${q || record.id}`;
}

export function compactFacts(record: CaseRecord) {
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
    github: github?.found
      ? {
          login: github.login,
          name: github.name,
          bio: github.bio,
          company: github.company,
          location: github.location,
          blog: github.blog,
          twitter: github.twitter,
          repos: github.publicRepos,
          followers: github.followers,
          createdAt: github.createdAt,
        }
      : github?.message,
    profiles: username?.hits.filter((h) => h.status === "found").map((h) => ({ name: h.name, url: h.url, detail: h.detail })),
    absent: username?.hits.filter((h) => h.status === "absent").map((h) => h.name),
    email: email
      ? {
          email: email.email,
          disposable: email.disposable,
          role: email.roleAccount,
          mx: email.mx,
          gravatar: email.gravatar.hasImage,
          gravatarName: email.gravatar.displayName,
        }
      : undefined,
    domain: domain
      ? {
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
          txtSample: domain.txt.slice(0, 6),
        }
      : undefined,
    ips: ips?.map((ip) => ({
      ip: ip.ip,
      geo: [ip.city, ip.region, ip.country].filter(Boolean).join(", "),
      isp: ip.isp,
      org: ip.org,
      asn: ip.asn,
      reverse: ip.reverse,
      hosting: ip.isHosting,
      proxy: ip.isProxy,
    })),
    url: url
      ? { final: url.finalUrl, chain: url.chain, title: url.http?.title, server: url.http?.server }
      : undefined,
    phone: phone
      ? {
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
          sightings: phone.sightings?.length,
        }
      : undefined,
    hash: hash
      ? { algo: hash.algo, known: hash.known, file: hash.fileName, source: hash.source }
      : undefined,
    wallet: wallet
      ? { chain: wallet.chain, balance: wallet.balance, txCount: wallet.txCount, ens: wallet.ens }
      : undefined,
    image: image
      ? {
          file: image.fileName,
          camera: [image.make, image.model].filter(Boolean).join(" "),
          date: image.dateOriginal,
          gps: image.gps,
          software: image.software,
        }
      : undefined,
    notes: record.notes || undefined,
  };
}

function kv(label: string, value?: string | number | boolean | null) {
  if (value === undefined || value === null || value === "") return [];
  return [`- **${label}:** ${typeof value === "boolean" ? (value ? "Yes" : "No") : String(value)}`];
}

export function toMarkdown(record: CaseRecord) {
  const lines: string[] = [
    `# Fathom dossier — ${record.query}`,
    ``,
    `- **Type:** ${typeLabel(record.type)}`,
    `- **Collected:** ${new Date(record.updatedAt).toISOString()}`,
    `- **Case:** ${record.id}`,
    `- **Signals:** ${signalCount(record)}`,
    ``,
  ];

  if (record.brief) {
    lines.push(`## Analyst brief`, ``, record.brief.trim(), ``);
  }

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
  } else if (github && !github.found) {
    lines.push(`## GitHub`, ``, github.message ?? "No public profile", ``);
  }

  const email = record.modules.email?.data;
  if (email) {
    lines.push(`## Email`, ``);
    lines.push(...kv("Address", email.email));
    lines.push(...kv("Role account", email.roleAccount));
    lines.push(...kv("Disposable", email.disposable));
    lines.push(...kv("MX", email.mx.join(", ") || undefined));
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
      for (const h of found) {
        lines.push(`- [${h.name}](${h.url})${h.detail ? ` — ${h.detail}` : ""}`);
      }
      lines.push(``);
    }
    if (absent.length) {
      lines.push(`### Not found`, ``, absent.map((h) => h.name).join(", "), ``);
    }
  }

  const domain = record.modules.domain?.data;
  if (domain) {
    lines.push(`## Domain`, ``);
    lines.push(...kv("Domain", domain.domain));
    lines.push(...kv("Registrar", domain.rdap?.registrar));
    lines.push(...kv("Registered", domain.rdap?.registered));
    lines.push(...kv("Expires", domain.rdap?.expires));
    lines.push(...kv("Status", domain.rdap?.status?.join(", ")));
    lines.push(...kv("Nameservers", domain.nameservers.join(", ") || undefined));
    lines.push(...kv("MX", domain.mx.join(", ") || undefined));
    lines.push(...kv("A / AAAA", domain.ips.join(", ") || undefined));
    lines.push(...kv("Title", domain.http?.title));
    lines.push(...kv("Server", domain.http?.server));
    lines.push(...kv("SPF", domain.emailAuth?.spfAll));
    lines.push(...kv("DMARC", domain.emailAuth?.dmarcPolicy));
    if (domain.subdomains.length) {
      lines.push(``, `### Hostnames`, ``, domain.subdomains.map((s) => `- \`${s}\``).join("\n"), ``);
    }
  }

  const ips = record.modules.ip?.data;
  if (ips?.length) {
    lines.push(`## IP`, ``);
    for (const ip of ips) {
      lines.push(`### ${ip.ip}`, ``);
      lines.push(...kv("Geo", [ip.city, ip.region, ip.country].filter(Boolean).join(", ")));
      lines.push(...kv("ISP", ip.isp));
      lines.push(...kv("Org", ip.org));
      lines.push(...kv("ASN", ip.asn ? `AS${ip.asn}` : undefined));
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
      for (const hit of phone.sightings) {
        lines.push(`- [${hit.title}](${hit.url})`);
      }
      lines.push(``);
    }
  }

  const image = record.modules.image?.data;
  if (image) {
    lines.push(`## Image EXIF`, ``);
    lines.push(...kv("File", image.fileName));
    lines.push(...kv("Camera", [image.make, image.model].filter(Boolean).join(" ")));
    lines.push(...kv("Taken", image.dateOriginal));
    lines.push(...kv("GPS", image.gps ? `${image.gps.lat}, ${image.gps.lon}` : undefined));
    lines.push(``);
  }

  if (record.notes.trim()) {
    lines.push(`## Notes`, ``, record.notes.trim(), ``);
  }

  return lines.join("\n").replace(/\n{3,}/g, "\n\n");
}

export function toHtml(record: CaseRecord) {
  const md = toMarkdown(record);
  const body = escapeHtml(md)
    .replace(/^# (.*)$/gm, "<h1>$1</h1>")
    .replace(/^## (.*)$/gm, "<h2>$1</h2>")
    .replace(/^### (.*)$/gm, "<h3>$1</h3>")
    .replace(/^- \*\*(.*?):\*\* (.*)$/gm, "<p><span>$1</span> $2</p>")
    .replace(/^- \[(.*?)\]\((.*?)\)(?: — (.*))?$/gm, '<p><a href="$2">$1</a> $3</p>')
    .replace(/^- `(.*)`$/gm, "<p><code>$1</code></p>")
    .replace(/^- (.*)$/gm, "<p>$1</p>")
    .replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>")
    .replace(/`([^`]+)`/g, "<code>$1</code>")
    .replace(/\n\n/g, "\n");

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

export function signalCount(record: CaseRecord): number {
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
  const hash = record.modules.hash?.data;
  if (hash?.known) n += 1;
  if (record.modules.wallet?.data?.balance) n += 1;
  if (record.modules.domain?.data?.emailAuth?.spf) n += 1;
  if (record.modules.domain?.data?.emailAuth?.dmarc) n += 1;
  return n;
}

export function downloadText(filename: string, text: string, mime: string) {
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

export function exportMarkdown(record: CaseRecord) {
  downloadText(`${fileStem(record)}.md`, toMarkdown(record), "text/markdown");
}

export function exportJson(record: CaseRecord) {
  downloadText(`${fileStem(record)}.json`, JSON.stringify(record, null, 2), "application/json");
}

export function exportHtml(record: CaseRecord) {
  downloadText(`${fileStem(record)}.html`, toHtml(record), "text/html");
}

export function exportAllCases(cases: CaseRecord[]) {
  const stamp = new Date().toISOString().slice(0, 10);
  downloadText(`fathom-cases-${stamp}.json`, JSON.stringify(cases, null, 2), "application/json");
}
