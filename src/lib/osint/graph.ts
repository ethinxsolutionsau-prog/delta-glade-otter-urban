import type { CaseRecord } from "./types";

export type GraphNode = {
  id: string;
  label: string;
  kind: "target" | "profile" | "infra" | "identity" | "place";
  href?: string;
  query?: string;
};

export type GraphLink = { source: string; target: string; label: string };

export type GraphModel = { nodes: GraphNode[]; links: GraphLink[] };

export function buildGraph(record: CaseRecord): GraphModel {
  const nodes: GraphNode[] = [
    { id: "target", label: record.query, kind: "target" },
  ];
  const links: GraphLink[] = [];
  const seen = new Set(["target"]);

  const add = (node: GraphNode, from: string, edge: string) => {
    if (!seen.has(node.id)) {
      nodes.push(node);
      seen.add(node.id);
    }
    links.push({ source: from, target: node.id, label: edge });
  };

  const gh = record.modules.github?.data;
  if (gh?.found && gh.login) {
    add(
      {
        id: `gh:${gh.login}`,
        label: gh.name || gh.login,
        kind: "identity",
        href: gh.htmlUrl,
        query: gh.login,
      },
      "target",
      "github",
    );
    if (gh.location) {
      add({ id: `place:${gh.location}`, label: gh.location, kind: "place" }, `gh:${gh.login}`, "location");
    }
    if (gh.blog) {
      add({ id: `blog:${gh.blog}`, label: gh.blog, kind: "infra", query: gh.blog }, `gh:${gh.login}`, "blog");
    }
  }

  const user = record.modules.username?.data;
  if (user) {
    user.hits
      .filter((h) => h.status === "found")
      .slice(0, 10)
      .forEach((h) => {
        add(
          { id: `p:${h.id}`, label: h.name, kind: "profile", href: h.url, query: user.username },
          "target",
          "profile",
        );
      });
  }

  const email = record.modules.email?.data;
  if (email) {
    add(
      { id: `em:${email.email}`, label: email.email, kind: "identity", query: email.email },
      "target",
      "email",
    );
    add(
      { id: `dom:${email.domain}`, label: email.domain, kind: "infra", query: email.domain },
      `em:${email.email}`,
      "domain",
    );
  }

  const domain = record.modules.domain?.data;
  if (domain) {
    add(
      { id: `dom:${domain.domain}`, label: domain.domain, kind: "infra", query: domain.domain },
      "target",
      "domain",
    );
    domain.ips.slice(0, 4).forEach((ip) => {
      add({ id: `ip:${ip}`, label: ip, kind: "infra", query: ip }, `dom:${domain.domain}`, "resolves");
    });
    if (domain.rdap?.registrar) {
      add(
        { id: `reg:${domain.rdap.registrar}`, label: domain.rdap.registrar, kind: "identity" },
        `dom:${domain.domain}`,
        "registrar",
      );
    }
  }

  const ips = record.modules.ip?.data ?? [];
  ips.slice(0, 3).forEach((ip) => {
    add({ id: `ip:${ip.ip}`, label: ip.ip, kind: "infra", query: ip.ip }, "target", "ip");
    if (ip.city || ip.country) {
      const place = [ip.city, ip.country].filter(Boolean).join(", ");
      add({ id: `place:${place}`, label: place, kind: "place" }, `ip:${ip.ip}`, "geo");
    }
    if (ip.org) {
      add({ id: `org:${ip.org}`, label: ip.org, kind: "identity" }, `ip:${ip.ip}`, "org");
    }
  });

  const url = record.modules.url?.data;
  if (url?.host) {
    add({ id: `dom:${url.host}`, label: url.host, kind: "infra", query: url.host }, "target", "host");
  }

  const phone = record.modules.phone?.data;
  if (phone?.e164) {
    add({ id: `ph:${phone.e164}`, label: phone.international ?? phone.e164, kind: "identity" }, "target", "phone");
    if (phone.country) {
      add({ id: `place:${phone.country}`, label: phone.country, kind: "place" }, `ph:${phone.e164}`, "country");
    }
  }

  const image = record.modules.image?.data;
  if (image?.gps) {
    const label = `${image.gps.lat.toFixed(4)}, ${image.gps.lon.toFixed(4)}`;
    add({ id: `gps:${label}`, label, kind: "place" }, "target", "exif");
  }
  if (image?.make || image?.model) {
    add(
      { id: `cam:${image.make ?? ""} ${image.model ?? ""}`.trim(), label: `${image.make ?? ""} ${image.model ?? ""}`.trim(), kind: "identity" },
      "target",
      "camera",
    );
  }

  return { nodes: nodes.slice(0, 18), links: links.filter((l) => seen.has(l.source) && seen.has(l.target)).slice(0, 24) };
}
