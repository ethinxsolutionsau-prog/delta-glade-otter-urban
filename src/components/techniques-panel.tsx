import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { techniquesFor, TECHNIQUES, type Technique } from "@/lib/osint/techniques";
import type { CaseRecord } from "@/lib/osint/types";

function outcome(record: CaseRecord, technique: Technique): string {
  const m = record.modules;
  switch (technique.id) {
    case "classify":
      return record.type;
    case "username":
      return m.username?.data
        ? `${m.username.data.found} confirmed of ${m.username.data.checked}`
        : (m.username?.status ?? "not run");
    case "social": {
      const social =
        m.username?.data?.hits.filter(
          (h) => h.status === "found" && (h.category === "Social" || h.category === "Creative"),
        ) ?? [];
      if (social.length) return social.map((h) => h.name).join(", ");
      return m.username?.data ? "none confirmed" : (m.username?.status ?? "not run");
    }
    case "github":
      return m.github?.data?.found ? m.github.data.login ?? "found" : m.github?.data ? "no profile" : (m.github?.status ?? "not run");
    case "dns":
      return m.domain?.data ? `${m.domain.data.ips.length} addresses · ${m.domain.data.mx.length} MX` : (m.domain?.status ?? "not run");
    case "rdap":
      return m.domain?.data?.rdap?.registrar || m.ip?.data?.[0]?.rdap?.name || (m.domain?.status ?? m.ip?.status ?? "not run");
    case "ct":
      return m.domain?.data ? `${m.domain.data.subdomains.length} hostnames · ${m.domain.data.certs.length} certs` : (m.domain?.status ?? "not run");
    case "mail": {
      const auth = m.domain?.data?.emailAuth;
      if (!auth) return m.domain?.status ?? "not run";
      return [auth.spfAll ? `SPF ${auth.spfAll}` : "no SPF", auth.dmarcPolicy ? `DMARC ${auth.dmarcPolicy}` : "no DMARC"].join(" · ");
    }
    case "http":
      return m.url?.data?.http?.title || m.domain?.data?.http?.title || (m.url?.status ?? m.domain?.status ?? "not run");
    case "geo":
      return m.ip?.data?.[0] ? [m.ip.data[0].city, m.ip.data[0].country].filter(Boolean).join(", ") || "no geo" : (m.ip?.status ?? "not run");
    case "phone":
      return m.phone?.data?.directory?.holder || m.phone?.data?.carrier || (m.phone?.status ?? "not run");
    case "hash":
      return m.hash?.data?.known ? m.hash.data.fileName || "known file" : m.hash?.data ? "not in CIRCL" : (m.hash?.status ?? "not run");
    case "wallet":
      return m.wallet?.data?.balance || m.wallet?.data?.message || (m.wallet?.status ?? "not run");
    case "exif":
      return m.image?.data?.gps ? "GPS present" : m.image?.data ? "no GPS" : "not run";
    case "pivot":
      return "open from the Pivots tab";
    default:
      return "";
  }
}

export function TechniqueReport({ record }: { record: CaseRecord }) {
  const rows = techniquesFor(record.type);
  return (
    <ul className="flex flex-col gap-2">
      {rows.map((t) => (
        <li key={t.id} className="rounded-lg border border-border bg-surface px-4 py-3">
          <div className="flex flex-wrap items-center gap-2">
            <p className="text-sm font-medium text-fg">{t.name}</p>
            <Badge variant={t.mode === "live" ? "ok" : "default"}>{t.mode === "live" ? "Live" : "Pivot"}</Badge>
          </div>
          <p className="mt-1 text-sm text-muted">{t.summary}</p>
          <p className="mt-2 font-mono text-xs text-accent">{outcome(record, t)}</p>
        </li>
      ))}
    </ul>
  );
}

export function TechniqueSamples({ onRun }: { onRun: (sample: string) => void }) {
  const rows = TECHNIQUES.filter((t) => t.sample);
  return (
    <div className="mt-10 w-full text-left">
      <p className="mb-3 text-xs font-medium uppercase tracking-[0.16em] text-subtle">Techniques</p>
      <ul className="flex flex-col gap-2">
        {rows.map((t) => (
          <li key={t.id} className="flex items-start justify-between gap-3 rounded-lg border border-border px-3 py-3">
            <div className="min-w-0">
              <p className="text-sm text-fg">{t.name}</p>
              <p className="mt-0.5 text-xs text-subtle">{t.summary}</p>
            </div>
            <Button variant="outline" size="sm" className="shrink-0" aria-label={`Try ${t.name}`} onClick={() => onRun(t.sample!)}>
              Try
            </Button>
          </li>
        ))}
      </ul>
    </div>
  );
}
