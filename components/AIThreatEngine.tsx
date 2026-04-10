"use client";

import { useEffect, useState, useRef } from "react";

interface ThreatSignal {
  id: string;
  category: string;
  signal: string;
  confidence: number;
  weight: number;
}

interface Attribution {
  actor: string;
  probability: number;
  color: string;
}

const SIGNALS: ThreatSignal[] = [
  { id: "s1", category: "Network", signal: "SMBv1 exploit attempt detected", confidence: 98, weight: 4 },
  { id: "s2", category: "Process", signal: "LSASS memory read by non-system process", confidence: 94, weight: 4 },
  { id: "s3", category: "Network", signal: "Beacon jitter pattern matches Cobalt Strike", confidence: 87, weight: 3 },
  { id: "s4", category: "Registry", signal: "RunKey persistence in HKLM\\Software\\Microsoft\\Windows\\CurrentVersion\\Run", confidence: 91, weight: 3 },
  { id: "s5", category: "DNS", signal: "DNS-over-HTTPS tunnelling detected", confidence: 79, weight: 2 },
  { id: "s6", category: "File", signal: "Encrypted payload dropped in %TEMP%", confidence: 85, weight: 3 },
  { id: "s7", category: "Auth", signal: "Pass-the-hash lateral movement pattern", confidence: 88, weight: 3 },
  { id: "s8", category: "Network", signal: "Large outbound data transfer — potential exfiltration", confidence: 96, weight: 4 },
];

const ATTRIBUTIONS: Attribution[] = [
  { actor: "APT28 (Fancy Bear)", probability: 62, color: "var(--cyber-red)" },
  { actor: "APT41 (Double Dragon)", probability: 21, color: "var(--cyber-amber)" },
  { actor: "Unknown Actor", probability: 17, color: "var(--cyber-blue)" },
];

const RECOMMENDATIONS = [
  { priority: "CRITICAL", action: "Isolate host 192.168.1.42 from network immediately", ttm: "< 2 min" },
  { priority: "CRITICAL", action: "Block outbound to 203.0.113.99 at perimeter firewall", ttm: "< 2 min" },
  { priority: "HIGH",     action: "Reset all credentials harvested from LSASS dump", ttm: "< 15 min" },
  { priority: "HIGH",     action: "Deploy Sysmon ruleset to monitor LSASS access", ttm: "< 30 min" },
  { priority: "MEDIUM",   action: "Enforce SMBv2+ across all hosts via GPO", ttm: "< 1 hr" },
  { priority: "MEDIUM",   action: "Apply MS17-010 patch to remaining unpatched hosts", ttm: "< 1 hr" },
];

const priorityConfig: Record<string, { color: string; bg: string; border: string }> = {
  CRITICAL: { color: "text-[var(--cyber-red)]",    bg: "bg-[var(--cyber-red)]/10",    border: "border-[var(--cyber-red)]/30" },
  HIGH:     { color: "text-[var(--cyber-amber)]",  bg: "bg-[var(--cyber-amber)]/10",  border: "border-[var(--cyber-amber)]/30" },
  MEDIUM:   { color: "text-[var(--cyber-blue)]",   bg: "bg-[var(--cyber-blue)]/10",   border: "border-[var(--cyber-blue)]/30" },
};

function AnimatedBar({ value, color, delay = 0 }: { value: number; color: string; delay?: number }) {
  const [width, setWidth] = useState(0);
  useEffect(() => {
    const t = setTimeout(() => setWidth(value), delay);
    return () => clearTimeout(t);
  }, [value, delay]);
  return (
    <div className="h-1.5 w-full bg-[var(--surface-3)] rounded-full overflow-hidden">
      <div
        className="h-full rounded-full transition-all duration-1000"
        style={{ width: `${width}%`, background: color }}
      />
    </div>
  );
}

export default function AIThreatEngine() {
  const [threatScore, setThreatScore] = useState(0);
  const [phase, setPhase] = useState<"scanning" | "analysing" | "complete">("scanning");
  const [visibleSignals, setVisibleSignals] = useState<ThreatSignal[]>([]);
  const [scanLine, setScanLine] = useState(0);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    // Boot sequence
    let sigIdx = 0;
    const scanTimer = setInterval(() => {
      setScanLine((l) => (l + 7) % 100);
    }, 50);

    const sigTimer = setInterval(() => {
      if (sigIdx < SIGNALS.length) {
        const sig = SIGNALS[sigIdx];
        if (sig) setVisibleSignals((prev) => [...prev, sig]);
        sigIdx++;
      } else {
        clearInterval(sigTimer);
        setPhase("analysing");
        // Score ramp
        let s = 0;
        const scoreTimer = setInterval(() => {
          s += 3;
          if (s >= 91) { s = 91; clearInterval(scoreTimer); setPhase("complete"); clearInterval(scanTimer); }
          setThreatScore(s);
        }, 30);
      }
    }, 400);

    intervalRef.current = sigTimer;
    return () => { clearInterval(sigTimer); clearInterval(scanTimer); };
  }, []);

  const scoreColor = threatScore >= 80 ? "var(--cyber-red)" : threatScore >= 50 ? "var(--cyber-amber)" : "var(--cyber-green)";
  const scoreLabel = threatScore >= 80 ? "CRITICAL THREAT" : threatScore >= 50 ? "ELEVATED RISK" : "LOW RISK";

  return (
    <div className="flex flex-col gap-6">
      {/* Score + attribution row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Threat score */}
        <div className="flex flex-col items-center justify-center border border-[var(--border-dim)] rounded bg-[var(--surface-2)] p-6 gap-3 relative overflow-hidden">
          {/* Animated scan overlay */}
          {phase !== "complete" && (
            <div
              className="absolute left-0 right-0 h-px opacity-40 pointer-events-none transition-none"
              style={{ top: `${scanLine}%`, background: "var(--cyber-green)", boxShadow: "0 0 8px var(--cyber-green)" }}
            />
          )}
          <p className="font-mono text-[9px] uppercase tracking-[0.3em] text-[var(--foreground)]/30">
            {phase === "scanning" ? "Scanning..." : phase === "analysing" ? "Analysing..." : "AI Threat Score"}
          </p>
          <div className="relative flex items-center justify-center">
            <svg viewBox="0 0 100 100" className="w-36 h-36 -rotate-90">
              <circle cx="50" cy="50" r="40" fill="none" stroke="var(--surface-3)" strokeWidth="8" />
              <circle
                cx="50" cy="50" r="40" fill="none"
                stroke={scoreColor}
                strokeWidth="8"
                strokeDasharray={`${(threatScore / 100) * 251.2} 251.2`}
                strokeLinecap="round"
                style={{ transition: "stroke-dasharray 0.05s linear", filter: `drop-shadow(0 0 4px ${scoreColor})` }}
              />
            </svg>
            <div className="absolute flex flex-col items-center">
              <span className="font-mono text-3xl font-black" style={{ color: scoreColor }}>{threatScore}</span>
              <span className="font-mono text-[8px] text-[var(--foreground)]/30">/100</span>
            </div>
          </div>
          <span className="font-mono text-xs font-bold tracking-widest" style={{ color: scoreColor }}>{scoreLabel}</span>
        </div>

        {/* Attribution */}
        <div className="flex flex-col border border-[var(--border-dim)] rounded bg-[var(--surface-2)] p-5 gap-4">
          <p className="font-mono text-[9px] uppercase tracking-[0.25em] text-[var(--foreground)]/30">
            ⬢ AI Attribution Analysis
          </p>
          {ATTRIBUTIONS.map((a, i) => (
            <div key={a.actor} className="flex flex-col gap-1.5">
              <div className="flex justify-between items-center">
                <span className="font-mono text-xs" style={{ color: a.color }}>{a.actor}</span>
                <span className="font-mono text-xs font-bold" style={{ color: a.color }}>{a.probability}%</span>
              </div>
              <AnimatedBar value={a.probability} color={a.color} delay={i * 300 + 1500} />
            </div>
          ))}
          <p className="font-mono text-[9px] text-[var(--foreground)]/20 mt-auto">
            Based on TTP fingerprint, tooling signature & infrastructure overlap
          </p>
        </div>

        {/* MITRE heatmap mini */}
        <div className="flex flex-col border border-[var(--border-dim)] rounded bg-[var(--surface-2)] p-5 gap-3">
          <p className="font-mono text-[9px] uppercase tracking-[0.25em] text-[var(--foreground)]/30">
            MITRE ATT&CK — Active Tactics
          </p>
          <div className="grid grid-cols-3 gap-1.5">
            {[
              { tactic: "Recon", hits: 3, color: "var(--cyber-red)" },
              { tactic: "Resource Dev", hits: 0, color: "" },
              { tactic: "Initial Access", hits: 2, color: "var(--cyber-red)" },
              { tactic: "Execution", hits: 4, color: "var(--cyber-red)" },
              { tactic: "Persistence", hits: 2, color: "var(--cyber-amber)" },
              { tactic: "Priv Esc", hits: 3, color: "var(--cyber-red)" },
              { tactic: "Defense Evasion", hits: 1, color: "var(--cyber-amber)" },
              { tactic: "Credential Access", hits: 3, color: "var(--cyber-red)" },
              { tactic: "Discovery", hits: 4, color: "var(--cyber-red)" },
              { tactic: "Lateral Move", hits: 2, color: "var(--cyber-amber)" },
              { tactic: "Collection", hits: 1, color: "var(--cyber-blue)" },
              { tactic: "Exfiltration", hits: 2, color: "var(--cyber-red)" },
            ].map(({ tactic, hits, color }) => (
              <div
                key={tactic}
                className="flex flex-col items-center justify-center p-1.5 rounded text-center"
                style={{
                  background: hits > 0 ? `${color}18` : "var(--surface-3)",
                  border: `1px solid ${hits > 0 ? color + "40" : "var(--border-dim)"}`,
                }}
              >
                <span className="font-mono text-[7px] leading-tight" style={{ color: hits > 0 ? color : "rgba(255,255,255,0.15)" }}>
                  {tactic}
                </span>
                {hits > 0 && (
                  <span className="font-mono text-[8px] font-bold mt-0.5" style={{ color }}>
                    {hits}
                  </span>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Signals detected */}
      <div className="border border-[var(--border-dim)] rounded bg-[var(--surface-1)] overflow-hidden">
        <div className="px-4 py-2.5 border-b border-[var(--border-dim)] bg-[var(--surface-2)] flex items-center justify-between">
          <span className="font-mono text-xs tracking-widest uppercase text-[var(--cyber-purple)]">
            ⬢ AI Signal Detection
          </span>
          <span className="font-mono text-[9px] text-[var(--foreground)]/30">{visibleSignals.length}/{SIGNALS.length} signals</span>
        </div>
        <ul className="divide-y divide-[var(--border-dim)]">
          {visibleSignals.filter(Boolean).map((sig) => (
            <li key={sig.id} className="flex items-center gap-4 px-4 py-2.5 hover:bg-[var(--surface-3)] transition-colors">
              <span className="shrink-0 font-mono text-[9px] px-1.5 py-0.5 rounded border border-[var(--cyber-purple)]/30 text-[var(--cyber-purple)] bg-[var(--cyber-purple)]/10">
                {sig.category}
              </span>
              <span className="flex-1 font-mono text-xs text-[var(--foreground)]/70">{sig.signal}</span>
              <div className="flex items-center gap-2 shrink-0 w-28">
                <AnimatedBar
                  value={sig.confidence}
                  color={sig.confidence > 90 ? "var(--cyber-red)" : sig.confidence > 75 ? "var(--cyber-amber)" : "var(--cyber-green)"}
                  delay={100}
                />
                <span className="font-mono text-[10px] w-8 text-right" style={{ color: sig.confidence > 90 ? "var(--cyber-red)" : "var(--cyber-amber)" }}>
                  {sig.confidence}%
                </span>
              </div>
            </li>
          ))}
        </ul>
      </div>

      {/* Automated response recommendations */}
      <div className="border border-[var(--border-dim)] rounded bg-[var(--surface-1)] overflow-hidden">
        <div className="px-4 py-2.5 border-b border-[var(--border-dim)] bg-[var(--surface-2)]">
          <span className="font-mono text-xs tracking-widest uppercase text-[var(--cyber-green)]">
            ⚡ AI-Generated SOAR Playbook
          </span>
        </div>
        <ul className="divide-y divide-[var(--border-dim)]">
          {RECOMMENDATIONS.map((rec, i) => {
            const p = priorityConfig[rec.priority];
            return (
              <li key={i} className="flex items-center gap-4 px-4 py-3 hover:bg-[var(--surface-3)] transition-colors">
                <span className={`shrink-0 font-mono text-[9px] font-bold px-2 py-0.5 rounded border ${p.color} ${p.bg} ${p.border}`}>
                  {rec.priority}
                </span>
                <span className="flex-1 font-mono text-xs text-[var(--foreground)]/70">{rec.action}</span>
                <span className="shrink-0 font-mono text-[10px] text-[var(--cyber-blue)] border border-[var(--cyber-blue)]/20 px-2 py-0.5 rounded">
                  TTM: {rec.ttm}
                </span>
                <button className="shrink-0 font-mono text-[9px] px-2 py-1 rounded border border-[var(--cyber-green)]/30 text-[var(--cyber-green)] hover:bg-[var(--cyber-green)] hover:text-black transition-all uppercase tracking-wider">
                  Execute
                </button>
              </li>
            );
          })}
        </ul>
      </div>
    </div>
  );
}
