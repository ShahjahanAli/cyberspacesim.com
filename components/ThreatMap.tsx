"use client";

import { useEffect, useRef, useState } from "react";

interface Node {
  id: string;
  label: string;
  x: number;
  y: number;
  status: "safe" | "warning" | "danger" | "compromised";
  type: "gateway" | "server" | "workstation" | "external";
  ip: string;
}

interface Edge {
  from: string;
  to: string;
  active?: boolean;
}

const NODES: Node[] = [
  { id: "ext1", label: "Attacker", x: 10, y: 50, status: "danger", type: "external", ip: "203.0.113.5" },
  { id: "gw", label: "Firewall/GW", x: 28, y: 50, status: "warning", type: "gateway", ip: "192.168.1.1" },
  { id: "srv1", label: "Web Server", x: 48, y: 20, status: "safe", type: "server", ip: "192.168.1.10" },
  { id: "srv2", label: "SMB Server", x: 48, y: 50, status: "compromised", type: "server", ip: "192.168.1.42" },
  { id: "dc", label: "Domain Ctrl", x: 48, y: 80, status: "warning", type: "server", ip: "192.168.1.200" },
  { id: "ws1", label: "Workstation A", x: 70, y: 15, status: "safe", type: "workstation", ip: "192.168.1.101" },
  { id: "ws2", label: "Workstation B", x: 70, y: 40, status: "danger", type: "workstation", ip: "192.168.1.102" },
  { id: "ws3", label: "Workstation C", x: 70, y: 65, status: "safe", type: "workstation", ip: "192.168.1.103" },
  { id: "db", label: "Database", x: 88, y: 50, status: "warning", type: "server", ip: "192.168.1.50" },
];

const EDGES: Edge[] = [
  { from: "ext1", to: "gw", active: true },
  { from: "gw", to: "srv1" },
  { from: "gw", to: "srv2", active: true },
  { from: "gw", to: "dc" },
  { from: "srv1", to: "ws1" },
  { from: "srv2", to: "ws2", active: true },
  { from: "srv2", to: "ws3" },
  { from: "dc", to: "ws3" },
  { from: "ws2", to: "db", active: true },
];

const statusColor: Record<string, string> = {
  safe: "#00ff88",
  warning: "#ffc300",
  danger: "#ff2d4a",
  compromised: "#9b59ff",
};

const typeIcon: Record<string, string> = {
  gateway: "⬡",
  server: "▣",
  workstation: "▪",
  external: "◆",
};

export default function ThreatMap({ compact = false }: { compact?: boolean }) {
  const svgRef = useRef<SVGSVGElement>(null);
  const [selected, setSelected] = useState<Node | null>(null);
  const [tick, setTick] = useState(0);

  // Animate active edges
  useEffect(() => {
    const id = setInterval(() => setTick((t) => t + 1), 800);
    return () => clearInterval(id);
  }, []);

  const nodeMap = Object.fromEntries(NODES.map((n) => [n.id, n]));

  return (
    <div className="flex flex-col border border-[var(--border-dim)] rounded bg-[var(--surface-1)] overflow-hidden h-full">
      {/* Title bar */}
      <div className="flex items-center justify-between px-4 py-2.5 border-b border-[var(--border-dim)] bg-[var(--surface-2)] shrink-0">
        <span className="font-mono text-xs tracking-widest uppercase text-[var(--cyber-purple)]">
          ◉ Live Threat Map
        </span>
        <div className="flex items-center gap-3">
          {(["safe", "warning", "danger", "compromised"] as const).map((s) => (
            <span key={s} className="flex items-center gap-1">
              <span className="h-1.5 w-1.5 rounded-full" style={{ background: statusColor[s] }} />
              <span className="font-mono text-[9px] text-[var(--foreground)]/30 capitalize">{s}</span>
            </span>
          ))}
        </div>
      </div>

      <div className={`flex ${compact ? "flex-col" : "flex-row"} flex-1 min-h-0`}>
        {/* SVG map */}
        <div className="relative flex-1 min-h-0">
          <svg
            ref={svgRef}
            viewBox="0 0 100 100"
            preserveAspectRatio="xMidYMid meet"
            className="w-full h-full"
            style={{ background: "var(--surface-1)" }}
          >
            {/* Grid */}
            <defs>
              <pattern id="grid" width="10" height="10" patternUnits="userSpaceOnUse">
                <path d="M 10 0 L 0 0 0 10" fill="none" stroke="rgba(0,255,136,0.04)" strokeWidth="0.3" />
              </pattern>
            </defs>
            <rect width="100" height="100" fill="url(#grid)" />

            {/* Edges */}
            {EDGES.map((edge) => {
              const a = nodeMap[edge.from];
              const b = nodeMap[edge.to];
              if (!a || !b) return null;
              const isActive = edge.active && tick % 2 === 0;
              return (
                <line
                  key={`${edge.from}-${edge.to}`}
                  x1={a.x}
                  y1={a.y}
                  x2={b.x}
                  y2={b.y}
                  stroke={edge.active ? "rgba(255,45,74,0.6)" : "rgba(26,58,85,0.8)"}
                  strokeWidth={edge.active ? "0.6" : "0.4"}
                  strokeDasharray={isActive ? "2 1" : undefined}
                />
              );
            })}

            {/* Nodes */}
            {NODES.map((node) => {
              const color = statusColor[node.status];
              const isSelected = selected?.id === node.id;
              return (
                <g
                  key={node.id}
                  onClick={() => setSelected(selected?.id === node.id ? null : node)}
                  style={{ cursor: "pointer" }}
                >
                  {/* Pulse ring for danger/compromised */}
                  {(node.status === "danger" || node.status === "compromised") && (
                    <circle
                      cx={node.x}
                      cy={node.y}
                      r={isSelected ? 7 : 5.5}
                      fill="none"
                      stroke={color}
                      strokeWidth="0.3"
                      opacity={tick % 2 === 0 ? 0.4 : 0.1}
                    />
                  )}
                  {/* Node circle */}
                  <circle
                    cx={node.x}
                    cy={node.y}
                    r={isSelected ? 4.5 : 3.5}
                    fill={`${color}22`}
                    stroke={color}
                    strokeWidth={isSelected ? "1" : "0.7"}
                  />
                  {/* Label */}
                  <text
                    x={node.x}
                    y={node.y - 5}
                    textAnchor="middle"
                    fontSize="2.8"
                    fill="rgba(255,255,255,0.5)"
                    fontFamily="monospace"
                  >
                    {node.label}
                  </text>
                  {/* IP */}
                  <text
                    x={node.x}
                    y={node.y + 6.5}
                    textAnchor="middle"
                    fontSize="2.2"
                    fill="rgba(255,255,255,0.2)"
                    fontFamily="monospace"
                  >
                    {node.ip}
                  </text>
                </g>
              );
            })}
          </svg>
        </div>

        {/* Info panel */}
        {!compact && (
          <div className="w-52 shrink-0 border-l border-[var(--border-dim)] bg-[var(--surface-2)] p-4 flex flex-col gap-4">
            {selected ? (
              <>
                <div>
                  <p className="font-mono text-[9px] uppercase tracking-widest text-[var(--foreground)]/30 mb-1">Selected Host</p>
                  <p className="font-mono text-sm font-bold" style={{ color: statusColor[selected.status] }}>
                    {selected.label}
                  </p>
                  <p className="font-mono text-[10px] text-[var(--foreground)]/40 mt-0.5">{selected.ip}</p>
                </div>
                <div className="flex flex-col gap-2">
                  {[
                    { k: "Status", v: selected.status.toUpperCase(), color: statusColor[selected.status] },
                    { k: "Type", v: selected.type, color: "var(--foreground)" },
                  ].map(({ k, v, color }) => (
                    <div key={k} className="flex justify-between items-center border-b border-[var(--border-dim)] pb-1.5">
                      <span className="font-mono text-[10px] text-[var(--foreground)]/30">{k}</span>
                      <span className="font-mono text-[10px] font-bold" style={{ color }}>{v}</span>
                    </div>
                  ))}
                </div>
                <p className="font-mono text-[9px] text-[var(--foreground)]/20 mt-auto">
                  Click node to deselect
                </p>
              </>
            ) : (
              <div className="flex flex-col gap-3">
                <p className="font-mono text-[9px] uppercase tracking-widest text-[var(--foreground)]/30">
                  Network Summary
                </p>
                {(["safe", "warning", "danger", "compromised"] as const).map((s) => {
                  const count = NODES.filter((n) => n.status === s).length;
                  return (
                    <div key={s} className="flex justify-between items-center">
                      <div className="flex items-center gap-1.5">
                        <span className="h-2 w-2 rounded-full" style={{ background: statusColor[s] }} />
                        <span className="font-mono text-[10px] text-[var(--foreground)]/40 capitalize">{s}</span>
                      </div>
                      <span className="font-mono text-[10px] font-bold" style={{ color: statusColor[s] }}>{count}</span>
                    </div>
                  );
                })}
                <p className="font-mono text-[9px] text-[var(--foreground)]/20 mt-2">
                  Click a node for details
                </p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
