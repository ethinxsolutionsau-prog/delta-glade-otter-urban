import { useEffect, useState, type ReactNode } from "react";
import { format } from "date-fns";
import {
  AtSign,
  Copy,
  ExternalLink,
  Github,
  Globe,
  Hash,
  Image as ImageIcon,
  Network,
  Phone,
  Server,
  Shield,
  User,
  Wallet,
} from "lucide-react";
import { toast } from "sonner";
import { ExportMenu } from "@/components/export-menu";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { EntityGraph } from "@/components/entity-graph";
import { TechniqueReport } from "@/components/techniques-panel";
import { typeLabel } from "@/lib/osint/classify";
import { pivotLinks } from "@/lib/osint/dorks";
import { phoneFindings } from "@/lib/osint/phone";
import { PIVOT_PLATFORMS } from "@/lib/osint/platforms";
import { signalCount } from "@/lib/osint/report";
import { copyText, cn } from "@/lib/utils";
import type {
  CaseRecord,
  DomainIntel,
  EmailIntel,
  GithubIntel,
  HashIntel,
  ImageIntel,
  IpIntel,
  ModuleState,
  PhoneIntel,
  UrlIntel,
  UsernameIntel,
  WalletIntel,
} from "@/lib/osint/types";

type Tab = "overview" | "graph" | "pivots" | "methods";

function StatusBadge({ status }: { status: ModuleState<unknown>["status"] }) {
  if (status === "loading") return <Badge variant="accent">Collecting</Badge>;
  if (status === "error") return <Badge variant="danger">Failed</Badge>;
  if (status === "ready") return <Badge variant="ok">Ready</Badge>;
  return <Badge>Idle</Badge>;
}

function Card({
  title,
  icon,
  state,
  children,
}: {
  title: string;
  icon: React.ReactNode;
  state?: ModuleState<unknown>;
  children: ReactNode;
}) {
  return (
    <section className="rounded-xl border border-border bg-surface p-4 sm:p-5">
      <header className="mb-4 flex items-center justify-between gap-3">
        <div className="flex items-center gap-2 text-fg">
          <span className="text-muted">{icon}</span>
          <h2 className="text-sm font-medium tracking-wide">{title}</h2>
        </div>
        {state ? <StatusBadge status={state.status} /> : null}
      </header>
      {state?.status === "loading" ? (
        <div className="space-y-2">
          <Skeleton className="h-4 w-3/4" />
          <Skeleton className="h-4 w-1/2" />
          <Skeleton className="h-20 w-full" />
        </div>
      ) : state?.status === "error" ? (
        <p className="text-sm text-danger">{state.error ?? "Collector failed"}</p>
      ) : (
        children
      )}
    </section>
  );
}

function Kv({ label, value, mono }: { label: string; value?: ReactNode; mono?: boolean }) {
  if (value === undefined || value === null || value === "") return null;
  return (
    <div className="grid grid-cols-[7.5rem_1fr] gap-2 py-1.5 text-sm">
      <dt className="text-subtle">{label}</dt>
      <dd className={cn("min-w-0 break-words text-fg", mono && "font-mono text-xs sm:text-sm")}>{value}</dd>
    </div>
  );
}

function Ext({ href, children }: { href: string; children: ReactNode }) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noreferrer"
      className="inline-flex items-center gap-1 text-accent hover:underline"
    >
      {children}
      <ExternalLink className="size-3" />
    </a>
  );
}

function UsernameCard({ data }: { data: UsernameIntel }) {
  const social = data.hits.filter(
    (h) => h.status === "found" && (h.category === "Social" || h.category === "Creative"),
  );
  return (
    <div className="space-y-5">
      <p className="font-mono text-xs text-muted">
        {data.found} found · {data.checked} live-checked · {social.length} social
      </p>
      {social.length ? (
        <ul className="flex flex-col gap-2">
          {social.map((h) => (
            <li key={h.id} className="rounded-lg border border-border bg-elevated px-3 py-3">
              <div className="flex items-start gap-3">
                {h.avatar ? (
                  <img src={h.avatar} alt="" width={40} height={40} className="size-10 rounded-md border border-border object-cover" />
                ) : null}
                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between gap-2">
                    <p className="truncate text-sm text-fg">
                      {h.name}
                      {h.detail ? <span className="text-muted"> · {h.detail}</span> : null}
                    </p>
                    <Ext href={h.url}>
                      <Badge variant="ok">Open</Badge>
                    </Ext>
                  </div>
                  {h.followers != null ? (
                    <p className="text-xs text-subtle">{h.followers.toLocaleString()} followers</p>
                  ) : null}
                  {h.bio ? <p className="mt-1 text-sm text-muted">{h.bio}</p> : null}
                </div>
              </div>
            </li>
          ))}
        </ul>
      ) : (
        <p className="text-sm text-muted">No confirmed YouTube, TikTok, Twitch, Bluesky, Mastodon, Tumblr, or Steam account.</p>
      )}
      <p className="text-xs text-subtle">
        A hit means that username is registered. It does not prove the accounts belong to the same person. X, Instagram,
        Reddit, and Facebook are not checked.
      </p>
      <ul className="grid grid-cols-1 gap-1 sm:grid-cols-2">
        {data.hits
          .filter((h) => !(h.status === "found" && (h.category === "Social" || h.category === "Creative")))
          .map((h) => (
          <li
            key={h.id}
            className="flex items-center justify-between gap-2 rounded-md px-2 py-2 hover:bg-elevated"
          >
            <div className="min-w-0">
              <p className="truncate text-sm text-fg">{h.name}</p>
              <p className="text-xs text-subtle">{h.category}</p>
            </div>
            {h.status === "found" ? (
              <Ext href={h.url}>
                <Badge variant="ok">Found</Badge>
              </Ext>
            ) : h.status === "absent" ? (
              <Badge>Absent</Badge>
            ) : (
              <Ext href={h.url}>
                <Badge variant="warn">Check</Badge>
              </Ext>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
}

function GithubCard({ data }: { data: GithubIntel }) {
  if (!data.found) return <p className="text-sm text-muted">{data.message ?? "No public profile"}</p>;
  return (
    <div className="flex gap-4">
      {data.avatarUrl ? (
        <img
          src={data.avatarUrl}
          alt=""
          width={72}
          height={72}
          className="size-16 rounded-lg border border-border"
        />
      ) : null}
      <dl className="min-w-0 flex-1">
        <Kv label="Login" value={data.htmlUrl ? <Ext href={data.htmlUrl}>{data.login}</Ext> : data.login} mono />
        <Kv label="Name" value={data.name} />
        <Kv label="Bio" value={data.bio} />
        <Kv label="Company" value={data.company} />
        <Kv label="Location" value={data.location} />
        <Kv label="Blog" value={data.blog ? <Ext href={data.blog.startsWith("http") ? data.blog : `https://${data.blog}`}>{data.blog}</Ext> : null} />
        <Kv label="X" value={data.twitter} />
        <Kv label="Repos" value={data.publicRepos} />
        <Kv label="Followers" value={data.followers} />
        <Kv
          label="Created"
          value={data.createdAt ? format(new Date(data.createdAt), "d MMM yyyy") : undefined}
        />
      </dl>
    </div>
  );
}

function EmailCard({ data }: { data: EmailIntel }) {
  return (
    <div className="flex flex-col gap-4 sm:flex-row">
      {data.gravatar.hasImage ? (
        <img src={data.gravatar.avatarUrl} alt="" className="size-16 rounded-lg border border-border" />
      ) : null}
      <dl className="flex-1">
        <Kv label="Local" value={data.local} mono />
        <Kv label="Domain" value={data.domain} mono />
        <Kv label="Role account" value={data.roleAccount ? "Yes" : "No"} />
        <Kv label="Disposable" value={data.disposable ? "Likely" : "Unlikely"} />
        <Kv label="MX" value={data.mx?.join(" · ") || undefined} mono />
        <Kv
          label="Gravatar"
          value={
            data.gravatar.hasImage ? (
              <Ext href={data.gravatar.profileUrl}>{data.gravatar.displayName ?? "Profile image"}</Ext>
            ) : (
              "No public image"
            )
          }
        />
      </dl>
    </div>
  );
}

function DomainCard({ data }: { data: DomainIntel }) {
  return (
    <div className="space-y-4">
      <dl>
        <Kv label="Registrar" value={data.rdap?.registrar} />
        <Kv
          label="Registered"
          value={data.rdap?.registered ? format(new Date(data.rdap.registered), "d MMM yyyy") : undefined}
        />
        <Kv
          label="Expires"
          value={data.rdap?.expires ? format(new Date(data.rdap.expires), "d MMM yyyy") : undefined}
        />
        <Kv label="Status" value={data.rdap?.status?.join(", ")} />
        <Kv label="NS" value={data.nameservers.join(" · ") || undefined} mono />
        <Kv label="MX" value={data.mx.join(" · ") || undefined} mono />
        <Kv label="SPF" value={data.emailAuth?.spfAll || (data.emailAuth?.spf ? "Present" : data.emailAuth ? "Absent" : undefined)} />
        <Kv
          label="DMARC"
          value={
            data.emailAuth?.dmarcPolicy
              ? `p=${data.emailAuth.dmarcPolicy}`
              : data.emailAuth
                ? "Absent"
                : undefined
          }
        />
        <Kv label="A / AAAA" value={data.ips.join(" · ") || undefined} mono />
        <Kv label="Title" value={data.http?.title} />
        <Kv label="Server" value={data.http?.server} />
        <Kv label="HSTS" value={data.http?.hsts ? "Yes" : data.http ? "No" : undefined} />
        <Kv label="security.txt" value={data.http ? (data.http.securityTxt ? "Present" : "Absent") : undefined} />
        <Kv
          label="Wayback"
          value={
            data.wayback.first
              ? `${data.wayback.first.slice(0, 8)} → ${data.wayback.last?.slice(0, 8) ?? ""}`
              : undefined
          }
        />
      </dl>
      {data.subdomains.length > 0 ? (
        <div>
          <p className="mb-2 text-xs uppercase tracking-[0.14em] text-subtle">Names from CT</p>
          <div className="flex flex-wrap gap-1.5">
            {data.subdomains.map((s) => (
              <Badge key={s} className="font-mono">
                {s}
              </Badge>
            ))}
          </div>
        </div>
      ) : null}
      {data.txt.length > 0 ? (
        <div>
          <p className="mb-2 text-xs uppercase tracking-[0.14em] text-subtle">TXT</p>
          <ul className="space-y-1 font-mono text-xs text-muted">
            {data.txt.slice(0, 8).map((t) => (
              <li key={t} className="break-all rounded-md bg-elevated px-2 py-1">
                {t}
              </li>
            ))}
          </ul>
        </div>
      ) : null}
    </div>
  );
}

function IpCard({ rows }: { rows: IpIntel[] }) {
  return (
    <div className="space-y-5">
      {rows.map((ip) => (
        <dl key={ip.ip} className="border-t border-border pt-3 first:border-0 first:pt-0">
          <Kv label="Address" value={ip.ip} mono />
          <Kv label="Geo" value={[ip.city, ip.region, ip.country].filter(Boolean).join(", ") || undefined} />
          <Kv label="Coords" value={ip.lat != null && ip.lon != null ? `${ip.lat.toFixed(3)}, ${ip.lon.toFixed(3)}` : undefined} mono />
          <Kv label="Timezone" value={ip.timezone} />
          <Kv label="ISP" value={ip.isp} />
          <Kv label="Org" value={ip.org} />
          <Kv label="ASN" value={ip.asn ? `AS${ip.asn}` : undefined} mono />
          <Kv label="Reverse" value={ip.reverse} mono />
          <Kv label="Hosting" value={ip.isHosting ? "Likely" : ip.isHosting === false ? "Unlikely" : undefined} />
          <Kv label="Proxy" value={ip.isProxy ? "Flagged" : undefined} />
          <Kv label="Net name" value={ip.rdap?.name} />
          <Kv label="CIDR" value={ip.rdap?.cidr} mono />
        </dl>
      ))}
    </div>
  );
}

function UrlCard({ data }: { data: UrlIntel }) {
  return (
    <dl>
      <Kv label="Final" value={data.finalUrl ? <Ext href={data.finalUrl}>{data.finalUrl}</Ext> : undefined} />
      <Kv
        label="Chain"
        value={
          data.chain.length
            ? data.chain.map((c) => `${c.status ?? "—"} ${c.url}`).join(" → ")
            : undefined
        }
        mono
      />
      <Kv label="Title" value={data.http?.title} />
      <Kv label="Server" value={data.http?.server} />
      <Kv label="Type" value={data.http?.contentType} />
      <Kv label="HSTS" value={data.http?.hsts} />
    </dl>
  );
}

function PhoneCard({ data }: { data: PhoneIntel }) {
  const pivots = pivotLinks("phone", data.e164 || data.raw);
  const findings = phoneFindings(data);
  const mentionCount = data.sightings?.length ?? 0;
  const dirCount = data.reputation?.length ?? 0;
  const directory = data.directory;
  const mapQuery = directory?.address || (data.city ? `${data.city}, ${data.countryName ?? ""}` : undefined);
  const mapHref = data.nanp?.lat != null && data.nanp.lon != null
    ? `https://www.google.com/maps?q=${data.nanp.lat},${data.nanp.lon}`
    : mapQuery
      ? `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(mapQuery)}`
      : undefined;
  const directoryRows = [
    directory?.holder ? { label: "Holder", value: directory.holder } : null,
    directory?.area ? { label: "Area", value: directory.area } : null,
    directory?.phoneType ? { label: "Line", value: directory.phoneType } : null,
    directory?.lastFound ? { label: "Last seen", value: directory.lastFound } : null,
    directory?.complaintsTotal != null
      ? { label: "Reports", value: `${directory.complaintsYear ?? 0} this year · ${directory.complaintsTotal} total` }
      : null,
    directory?.names?.length ? { label: "Names", value: directory.names.join(" · ") } : null,
    directory?.address ? { label: "Address", value: directory.address } : null,
  ].filter((row): row is { label: string; value: string } => Boolean(row));

  return (
    <div className="space-y-5">
      <p className="font-mono text-xs text-muted">
        {directoryRows.length} directory fields · {findings.length} numbering results · {mentionCount} public pages
      </p>
      {directory && directoryRows.length > 0 ? (
        <div className="rounded-lg border border-border bg-elevated p-3">
          <div className="mb-2 flex items-center justify-between gap-2">
            <p className="text-xs uppercase tracking-[0.14em] text-subtle">{directory.source}</p>
            <a href={directory.url} target="_blank" rel="noreferrer" className="text-sm text-accent hover:underline">
              Open listing
            </a>
          </div>
          <dl>
            {directoryRows.map((row) => (
              <Kv
                key={row.label}
                label={row.label}
                value={
                  row.label === "Address" && mapHref ? <Ext href={mapHref}>{row.value}</Ext> : row.value
                }
              />
            ))}
          </dl>
          {directory.spamNote ? <p className="mt-2 text-sm text-warn">{directory.spamNote}</p> : null}
        </div>
      ) : data.country === "AU" ? (
        <p className="text-sm text-muted">No Reverse Australia listing published a holder, area, or name for this number.</p>
      ) : null}
      <ul className="grid grid-cols-1 gap-1 sm:grid-cols-2">
        {findings.map((row) => (
          <li key={row.id} className="rounded-md px-2 py-2">
            <p className="text-xs text-subtle">{row.label}</p>
            <p className="text-sm text-fg">
              {row.id === "coords" && mapHref ? <Ext href={mapHref}>{row.value}</Ext> : row.value}
            </p>
            <p className="text-xs text-subtle">{row.source}</p>
          </li>
        ))}
      </ul>
      {data.nanp?.switchName ? (
        <dl>
          <Kv label="Switch" value={data.nanp.switchName} mono />
          <Kv label="NPA-NXX" value={`${data.nanp.npa}-${data.nanp.nxx}`} mono />
        </dl>
      ) : null}
      {dirCount > 0 ? (
        <div>
          <p className="mb-2 text-xs uppercase tracking-[0.14em] text-subtle">Reverse directories · {dirCount}</p>
          <ul className="grid grid-cols-1 gap-1 sm:grid-cols-2">
            {data.reputation?.map((row) => (
              <li key={row.url}>
                <a
                  href={row.url}
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center justify-between gap-2 rounded-md px-2 py-2 hover:bg-elevated"
                >
                  <div className="min-w-0">
                    <p className="truncate text-sm text-fg">{row.source}</p>
                    <p className="truncate text-xs text-subtle">{row.summary}</p>
                  </div>
                  <Badge variant="ok">Open</Badge>
                </a>
              </li>
            ))}
          </ul>
        </div>
      ) : null}
      {mentionCount > 0 ? (
        <div>
          <p className="mb-2 text-xs uppercase tracking-[0.14em] text-subtle">
            Pages that quote this number · {mentionCount}
          </p>
          <ul className="space-y-1">
            {data.sightings?.map((hit) => (
              <li key={hit.url}>
                <a
                  href={hit.url}
                  target="_blank"
                  rel="noreferrer"
                  className="block rounded-md px-2 py-2 hover:bg-elevated"
                >
                  <p className="text-sm text-fg">{hit.title}</p>
                  {hit.snippet ? <p className="mt-0.5 text-xs text-subtle">{hit.snippet}</p> : null}
                </a>
              </li>
            ))}
          </ul>
        </div>
      ) : directory?.names?.length ? null : (
        <p className="text-sm text-muted">
          No extra web page quotes this exact number. Subscriber name only appears when a public directory already
          publishes it.
        </p>
      )}
      <div>
        <p className="mb-2 text-xs uppercase tracking-[0.14em] text-subtle">Open on</p>
        <div className="flex flex-wrap gap-2">
          {pivots.map((p) => (
            <a
              key={p.href}
              href={p.href}
              target="_blank"
              rel="noreferrer"
              className="inline-flex h-11 items-center rounded-md border border-border bg-elevated px-3 text-sm text-fg hover:border-accent/40"
            >
              {p.label}
            </a>
          ))}
        </div>
      </div>
      {data.carrierNote ? <p className="text-xs text-subtle">{data.carrierNote}</p> : null}
      {data.notes?.map((n) => (
        <p key={n} className="text-xs text-subtle">
          {n}
        </p>
      ))}
    </div>
  );
}

function HashCard({ data }: { data: HashIntel }) {
  return (
    <dl>
      <Kv label="Algorithm" value={data.algo} />
      <Kv label="Bits" value={data.bits || undefined} />
      <Kv label="Known" value={data.known === undefined ? undefined : data.known ? "Yes" : "No"} />
      <Kv label="File" value={data.fileName} />
      <Kv label="Size" value={data.fileSize ? `${data.fileSize} bytes` : undefined} />
      <Kv label="Source" value={data.source} />
      <Kv label="MD5" value={data.md5} mono />
      <Kv label="SHA-1" value={data.sha1} mono />
      <Kv label="Value" value={data.value} mono />
      {data.message ? <p className="mt-2 text-sm text-muted">{data.message}</p> : null}
    </dl>
  );
}

function WalletCard({ data }: { data: WalletIntel }) {
  return (
    <dl>
      <Kv label="Chain" value={data.chain} />
      <Kv label="Address" value={data.address} mono />
      <Kv label="Balance" value={data.balance} mono />
      <Kv label="Received" value={data.received} mono />
      <Kv label="Transactions" value={data.txCount} />
      <Kv label="ENS" value={data.ens} />
      <Kv label="Explorer" value={data.explorer ? <Ext href={data.explorer}>Open</Ext> : undefined} />
      {data.message ? <p className="mt-2 text-sm text-muted">{data.message}</p> : null}
    </dl>
  );
}

function ImageCard({ data }: { data: ImageIntel }) {
  return (
    <dl>
      <Kv label="File" value={data.fileName} />
      <Kv label="Size" value={data.width && data.height ? `${data.width} × ${data.height}` : undefined} />
      <Kv label="Camera" value={[data.make, data.model].filter(Boolean).join(" ") || undefined} />
      <Kv label="Lens" value={data.lens} />
      <Kv label="Software" value={data.software} />
      <Kv label="Taken" value={data.dateOriginal} />
      <Kv
        label="GPS"
        value={
          data.gps ? (
            <Ext href={`https://www.google.com/maps?q=${data.gps.lat},${data.gps.lon}`}>
              {data.gps.lat.toFixed(5)}, {data.gps.lon.toFixed(5)}
            </Ext>
          ) : (
            "Not present"
          )
        }
      />
      <p className="mt-2 text-xs text-subtle">EXIF is parsed in the browser. The file never leaves this device.</p>
    </dl>
  );
}

export function Dossier({ record }: { record: CaseRecord }) {
  const [tab, setTab] = useState<Tab>("overview");
  useEffect(() => {
    setTab("overview");
  }, [record.id]);
  const m = record.modules;
  const pivots = pivotLinks(record.type, record.query);
  const groups = [...new Set(pivots.map((p) => p.group))];
  const signals = signalCount(record);
  const collecting = Object.values(m).some((mod) => mod?.status === "loading");

  return (
    <div className="mx-auto flex w-full max-w-4xl flex-col gap-6 px-4 py-6 sm:px-6">
      <header className="flex flex-col gap-4 border-b border-border pb-5">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div className="min-w-0">
            <p className="font-mono text-xs uppercase tracking-[0.18em] text-subtle">{record.id}</p>
            <h1 className="mt-1 break-all font-mono text-2xl font-medium tracking-tight text-fg sm:text-3xl">
              {record.query}
            </h1>
            <div className="mt-3 flex flex-wrap items-center gap-2">
              <Badge variant="accent">{typeLabel(record.type)}</Badge>
              <Badge>{signals} signals</Badge>
              {collecting ? <Badge variant="warn">Live</Badge> : <Badge variant="ok">Settled</Badge>}
              <span className="text-xs text-subtle tabular-nums">
                {format(record.updatedAt, "d MMM yyyy HH:mm")}
              </span>
            </div>
          </div>
          <div className="flex shrink-0 items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                void copyText(record.query).then(() => toast.success("Copied target"));
              }}
            >
              <Copy className="size-3.5" />
              Copy
            </Button>
            <ExportMenu record={record} />
          </div>
        </div>
        <div className="flex gap-1 rounded-lg bg-elevated p-1">
          {(
            [
              ["overview", "Overview"],
              ["methods", "Methods"],
              ["graph", "Graph"],
              ["pivots", "Pivots"],
            ] as const
          ).map(([id, label]) => (
            <button
              key={id}
              type="button"
              onClick={() => setTab(id)}
              className={cn(
                "flex-1 rounded-md px-3 py-2 text-sm font-medium transition-colors duration-[var(--motion-quick)]",
                tab === id ? "bg-surface text-fg" : "text-muted hover:text-fg",
              )}
            >
              {label}
            </button>
          ))}
        </div>
      </header>

      {tab === "methods" ? <TechniqueReport record={record} /> : null}

      {tab === "graph" ? <EntityGraph record={record} /> : null}

      {tab === "pivots" ? (
        <div className="space-y-6">
          {groups.map((g) => (
            <section key={g}>
              <h2 className="mb-2 text-xs font-medium uppercase tracking-[0.16em] text-subtle">{g}</h2>
              <div className="flex flex-wrap gap-2">
                {pivots
                  .filter((p) => p.group === g)
                  .map((p) => (
                    <a
                      key={p.href}
                      href={p.href}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex h-11 items-center rounded-md border border-border bg-elevated px-3 text-sm text-fg hover:border-accent/40"
                    >
                      {p.label}
                    </a>
                  ))}
              </div>
            </section>
          ))}
          {record.type === "username" ? (
            <section>
              <h2 className="mb-2 text-xs font-medium uppercase tracking-[0.16em] text-subtle">
                Platforms that block live checks
              </h2>
              <div className="flex flex-wrap gap-2">
                {PIVOT_PLATFORMS.map((p) => (
                  <a
                    key={p.id}
                    href={p.url(record.query)}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex h-11 items-center rounded-md border border-border px-3 text-sm text-muted hover:text-fg"
                  >
                    {p.name}
                  </a>
                ))}
              </div>
            </section>
          ) : null}
        </div>
      ) : null}

      {tab === "overview" ? (
        <div className="flex flex-col gap-4">
          {record.brief ? (
            <section className="rounded-xl border border-border bg-surface p-4 sm:p-5">
              <h2 className="mb-3 text-sm font-medium tracking-wide">Analyst brief</h2>
              <pre className="whitespace-pre-wrap font-sans text-sm leading-relaxed text-fg">{record.brief}</pre>
            </section>
          ) : null}
          {m.github ? (
            <Card title="GitHub" icon={<Github className="size-4" />} state={m.github}>
              {m.github.data ? <GithubCard data={m.github.data} /> : null}
            </Card>
          ) : null}
          {m.email ? (
            <Card title="Email" icon={<AtSign className="size-4" />} state={m.email}>
              {m.email.data ? <EmailCard data={m.email.data} /> : null}
            </Card>
          ) : null}
          {m.username ? (
            <Card title="Username sweep" icon={<User className="size-4" />} state={m.username}>
              {m.username.data ? <UsernameCard data={m.username.data} /> : null}
            </Card>
          ) : null}
          {m.domain ? (
            <Card title="Domain" icon={<Globe className="size-4" />} state={m.domain}>
              {m.domain.data ? <DomainCard data={m.domain.data} /> : null}
            </Card>
          ) : null}
          {m.ip ? (
            <Card title="IP" icon={<Network className="size-4" />} state={m.ip}>
              {m.ip.data ? <IpCard rows={m.ip.data} /> : null}
            </Card>
          ) : null}
          {m.url ? (
            <Card title="URL" icon={<Server className="size-4" />} state={m.url}>
              {m.url.data ? <UrlCard data={m.url.data} /> : null}
            </Card>
          ) : null}
          {m.phone ? (
            <Card title="Phone" icon={<Phone className="size-4" />} state={m.phone}>
              {m.phone.data ? <PhoneCard data={m.phone.data} /> : null}
            </Card>
          ) : null}
          {m.hash ? (
            <Card title="Hash" icon={<Hash className="size-4" />} state={m.hash}>
              {m.hash.data ? <HashCard data={m.hash.data} /> : null}
            </Card>
          ) : null}
          {m.wallet ? (
            <Card title="Wallet" icon={<Wallet className="size-4" />} state={m.wallet}>
              {m.wallet.data ? <WalletCard data={m.wallet.data} /> : null}
            </Card>
          ) : null}
          {m.image ? (
            <Card title="Image EXIF" icon={<ImageIcon className="size-4" />} state={m.image}>
              {m.image.data ? <ImageCard data={m.image.data} /> : null}
            </Card>
          ) : null}
          {!collecting && Object.keys(m).length === 0 ? (
            <p className="text-sm text-muted">No collectors ran for this case.</p>
          ) : null}
        </div>
      ) : null}

      <p className="flex items-center gap-2 text-xs text-subtle">
        <Shield className="size-3.5" />
        Public registries and unauthenticated profile URLs. Private ranges are blocked.
      </p>
    </div>
  );
}
