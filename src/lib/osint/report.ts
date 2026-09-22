import { typeLabel } from "./classify";
import type { CaseRecord } from "./types";

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
    profiles: username?.hits.filter((h) => h.status === "found").map((h) => ({ name: h.name, url: h.url })),
    email: email
      ? {
          email: email.email,
          disposable: email.disposable,
          role: email.roleAccount,
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
      ? { e164: phone.e164, valid: phone.valid, type: phone.type, country: phone.country }
      : undefined,
    hash,
    wallet,
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

export function toMarkdown(record: CaseRecord) {
  const lines: string[] = [
    `# Fathom dossier — ${record.query}`,
    ``,
    `- Type: ${typeLabel(record.type)}`,
    `- Collected: ${new Date(record.updatedAt).toISOString()}`,
    `- Case: ${record.id}`,
    ``,
  ];

  if (record.brief) {
    lines.push(`## Analyst brief`, ``, record.brief, ``);
  }

  const facts = compactFacts(record);
  lines.push(`## Structured findings`, ``, "```json", JSON.stringify(facts, null, 2), "```");
  if (record.notes) {
    lines.push(``, `## Notes`, ``, record.notes);
  }
  return lines.join("\n");
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
  if (record.modules.phone?.data?.valid) n += 1;
  if (record.modules.image?.data?.gps) n += 1;
  return n;
}
