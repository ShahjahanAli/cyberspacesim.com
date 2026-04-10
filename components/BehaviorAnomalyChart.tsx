"use client";

import { useEffect, useRef, useState } from "react";

interface Entity {
  id: string;
  name: string;
  type: "user" | "host" | "service";
  riskScore: number;
  anomalyDelta: number;
  baselineAvg: number;
  liveAvg: number;
  color: string;
}

const ENTITIES: Entity[] = [
  { id: "e1", name: "j.smith",       type: "user",    riskScore: 91, anomalyDelta: +38, baselineAvg: 42, liveAvg: 80, color: "var(--cyber-red)" },
  { id: "e2", name: "CORP-SRV-04",   type: "host",    riskScore: 73, anomalyDelta: +24, baselineAvg: 30, liveAvg: 54, color: "var(--cyber-amber)" },
  { id: "e3", name: "api-gateway",   type: "service", riskScore: 48, anomalyDelta: +11, baselineAvg: 55, liveAvg: 66, color: "var(--cyber-blue)" },
  { id: "e4", name: "k.jones",       type: "user",    riskScore: 31, anomalyDelta: +4,  baselineAvg: 38, liveAvg: 42, color: "var(--cyber-green)" },
  { id: "e5", name: "db-replica-02", type: "host",    riskScore: 19, anomalyDelta: +2,  baselineAvg: 22, liveAvg: 24, color: "var(--cyber-green)" },
];

function generateBaseline(steps: number, avg: number, noise: number): number[] {
  const out: number[] = [];
  let v = avg;
  for (let i = 0; i < steps; i++) {
    v += (Math.random() - 0.5) * noise;
    v = Math.max(5, Math.min(100, v));
    out.push(Math.round(v));
  }
  return out;
}

const STEPS = 32;

function sparklinePoints(data: number[], w: number, h: number): string {
  const minV = Math.min(...data);
  const maxV = Math.max(...data);
  const range = maxV - minV || 1;
  return data
    .map((v, i) => {
      const x = (i / (data.length - 1)) * w;
      const y = h - ((v - minV) / range) * (h - 8) - 4;
      return `${x.toFixed(1)},${y.toFixed(1)}`;
    })
    .join(" ");
}

interface BehaviorChartProps {
  entity: Entity;
}

function BehaviorChart({ entity }: BehaviorChartProps) {
  const [baseline] = useState(() => generateBaseline(STEPS, entity.baselineAvg, 6));
  const [live, setLive] = useState<number[]>(() => generateBaseline(STEPS, entity.baselineAvg, 8));
  const tickRef = useRef(0);

  useEffect(() => {
    const id = setInterval(() => {
      tickRef.current++;
      setLive((prev) => {
        const next = [...prev.slice(1)];
        const last = prev[prev.length - 1];
        // spike logic: every 8 ticks, bump high-risk entities
        const spike = tickRef.current % 8 === 0 && entity.riskScore > 60;
        const bump = spike ? entity.anomalyDelta * 0.7 : (Math.random() - 0.45) * 10;
        const newVal = Math.max(5, Math.min(100, last + bump));
        next.push(Math.round(newVal));
        return next;
      });
    }, 1200);
    return () => clearInterval(id);
  }, [entity]);

  const W = 280;
  const H = 80;
  const basePoints = sparklinePoints(baseline, W, H);
  const livePoints = sparklinePoints(live, W, H);

  const liveAvgNow = Math.round(live.reduce((a, v) => a + v, 0) / live.length);
  const anomaly = liveAvgNow - entity.baselineAvg;

  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="w-full" style={{ height: 80 }}>
      {/* Baseline */}
      <polyline
        points={basePoints}
        fill="none"
        stroke="rgba(255,255,255,0.12)"
        strokeWidth="1.5"
        strokeDasharray="4 3"
      />
      {/* Live */}
      <polyline
        points={livePoints}
        fill="none"
        stroke={entity.color}
        strokeWidth="1.5"
        strokeLinejoin="round"
        style={{ filter: `drop-shadow(0 0 2px ${entity.color})` }}
      />
      {/* Anomaly fill between baseline and live (approximate) */}
      <polyline
        points={livePoints}
        fill={entity.color + "18"}
        stroke="none"
      />
    </svg>
  );
}

export default function BehaviorAnomalyChart() {
  const [selected, setSelected] = useState<Entity>(ENTITIES[0]);

  return (
    <div className="flex flex-col gap-6">
      {/* Entity risk leaderboard */}
      <div className="border border-[var(--border-dim)] rounded bg-[var(--surface-1)] overflow-hidden">
        <div className="px-4 py-2.5 border-b border-[var(--border-dim)] bg-[var(--surface-2)] flex items-center justify-between">
          <span className="font-mono text-xs tracking-widest uppercase text-[var(--cyber-purple)]">
            ∿ Entity Risk Leaderboard — Live UBA
          </span>
          <span className="flex items-center gap-1.5 font-mono text-[9px] text-[var(--cyber-green)]">
            <span className="inline-block h-1.5 w-1.5 rounded-full bg-[var(--cyber-green)] animate-pulse" />
            LIVE
          </span>
        </div>
        <div className="divide-y divide-[var(--border-dim)]">
          {ENTITIES.map((entity, i) => (
            <button
              key={entity.id}
              onClick={() => setSelected(entity)}
              className={`w-full flex items-center gap-4 px-4 py-3 text-left transition-all hover:bg-[var(--surface-3)] ${
                selected.id === entity.id ? "bg-[var(--surface-3)]" : ""
              }`}
            >
              {/* Rank */}
              <span className="shrink-0 font-mono text-xs w-5 text-center text-[var(--foreground)]/30">{i + 1}</span>
              {/* Type icon */}
              <span className="shrink-0 font-mono text-xs text-[var(--foreground)]/30">
                {entity.type === "user" ? "👤" : entity.type === "host" ? "⬛" : "⊕"}
              </span>
              {/* Name */}
              <div className="flex-1 min-w-0">
                <p className="font-mono text-xs truncate" style={{ color: selected.id === entity.id ? entity.color : "var(--foreground)" }}>
                  {entity.name}
                </p>
                <p className="font-mono text-[9px] text-[var(--foreground)]/30 capitalize">{entity.type}</p>
              </div>
              {/* Anomaly delta */}
              <span className="shrink-0 font-mono text-xs text-right" style={{ color: entity.anomalyDelta > 20 ? "var(--cyber-red)" : entity.anomalyDelta > 10 ? "var(--cyber-amber)" : "var(--cyber-green)" }}>
                +{entity.anomalyDelta}%
              </span>
              {/* Risk score bar */}
              <div className="shrink-0 w-20 flex items-center gap-2">
                <div className="flex-1 h-1 bg-[var(--surface-3)] rounded overflow-hidden">
                  <div
                    className="h-full rounded"
                    style={{ width: `${entity.riskScore}%`, background: entity.color }}
                  />
                </div>
                <span className="font-mono text-[10px]" style={{ color: entity.color }}>{entity.riskScore}</span>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Behavior detail chart */}
      <div className="border border-[var(--border-dim)] rounded bg-[var(--surface-1)] overflow-hidden">
        <div className="px-5 py-3 border-b border-[var(--border-dim)] bg-[var(--surface-2)] flex items-center justify-between gap-3">
          <div>
            <p className="font-mono text-sm font-bold" style={{ color: selected.color }}>{selected.name}</p>
            <p className="font-mono text-[9px] text-[var(--foreground)]/30 capitalize">{selected.type} · Risk score: {selected.riskScore}/100</p>
          </div>
          <div className="flex items-center gap-4 text-[9px] font-mono text-[var(--foreground)]/40">
            <span className="flex items-center gap-1.5">
              <span className="inline-block h-px w-4 bg-white/20 border-dashed" style={{ borderTop: "1.5px dashed rgba(255,255,255,0.2)" }} />
              Baseline
            </span>
            <span className="flex items-center gap-1.5">
              <span className="inline-block h-px w-4" style={{ background: selected.color }} />
              Live
            </span>
          </div>
        </div>
        <div className="p-5">
          <BehaviorChart entity={selected} />
        </div>
        <div className="px-5 pb-5 grid grid-cols-3 gap-4">
          {[
            { label: "Baseline Avg", value: `${selected.baselineAvg}`, color: "rgba(255,255,255,0.4)" },
            { label: "Anomaly Delta", value: `+${selected.anomalyDelta}%`, color: selected.color },
            { label: "Risk Score", value: `${selected.riskScore}/100`, color: selected.color },
          ].map(({ label, value, color }) => (
            <div key={label} className="flex flex-col gap-0.5 border border-[var(--border-dim)] rounded p-3">
              <p className="font-mono text-[8px] uppercase tracking-widest text-[var(--foreground)]/25">{label}</p>
              <p className="font-mono text-lg font-bold" style={{ color }}>{value}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
