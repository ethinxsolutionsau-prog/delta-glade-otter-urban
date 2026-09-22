import { useMemo } from "react";
import { buildGraph } from "@/lib/osint/graph";
import { runInvestigation } from "@/lib/osint/run";
import type { CaseRecord } from "@/lib/osint/types";

const KIND_FILL: Record<string, string> = {
  target: "var(--color-fg)",
  profile: "var(--color-accent)",
  infra: "var(--color-ok)",
  identity: "var(--color-warn)",
  place: "var(--color-muted)",
};

export function EntityGraph({ record }: { record: CaseRecord }) {
  const graph = useMemo(() => buildGraph(record), [record]);

  if (graph.nodes.length <= 1) {
    return (
      <p className="py-12 text-center text-sm text-muted">
        The graph fills as confirmed identities, hosts, and places land.
      </p>
    );
  }

  const width = 720;
  const height = 420;
  const cx = width / 2;
  const cy = height / 2;
  const satellites = graph.nodes.filter((n) => n.id !== "target");
  const positions = new Map<string, { x: number; y: number }>();
  positions.set("target", { x: cx, y: cy });
  satellites.forEach((n, i) => {
    const angle = (i / satellites.length) * Math.PI * 2 - Math.PI / 2;
    const ring = i % 2 === 0 ? 148 : 188;
    positions.set(n.id, {
      x: cx + Math.cos(angle) * ring,
      y: cy + Math.sin(angle) * ring,
    });
  });

  return (
    <div className="overflow-x-auto scrollbar-thin">
      <svg viewBox={`0 0 ${width} ${height}`} className="mx-auto h-auto w-full max-w-3xl">
        {graph.links.map((l, i) => {
          const a = positions.get(l.source);
          const b = positions.get(l.target);
          if (!a || !b) return null;
          return (
            <g key={`${l.source}-${l.target}-${i}`}>
              <line
                x1={a.x}
                y1={a.y}
                x2={b.x}
                y2={b.y}
                stroke="var(--color-border)"
                strokeWidth="1"
              />
            </g>
          );
        })}
        {graph.nodes.map((n) => {
          const p = positions.get(n.id);
          if (!p) return null;
          const r = n.kind === "target" ? 18 : 8;
          const clickable = Boolean(n.query);
          return (
            <g
              key={n.id}
              transform={`translate(${p.x}, ${p.y})`}
              className={clickable ? "cursor-pointer" : undefined}
              onClick={() => {
                if (n.query) void runInvestigation(n.query);
              }}
            >
              <circle r={r} fill={KIND_FILL[n.kind] ?? "var(--color-muted)"} />
              <text
                y={r + 14}
                textAnchor="middle"
                fill="var(--color-fg)"
                fontSize="11"
                fontFamily="var(--font-mono)"
              >
                {n.label.length > 22 ? `${n.label.slice(0, 20)}…` : n.label}
              </text>
            </g>
          );
        })}
      </svg>
      <p className="mt-2 text-center text-xs text-subtle">Click a labeled node to pivot a new investigation.</p>
    </div>
  );
}
