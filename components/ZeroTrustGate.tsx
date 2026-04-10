"use client";

import { useEffect, useState } from "react";

interface TrustLayer {
  id: string;
  name: string;
  icon: string;
  description: string;
  checks: string[];
  trustScore: number;
  status: "verified" | "evaluating" | "denied" | "pending";
}

const LAYERS: TrustLayer[] = [
  {
    id: "identity",
    name: "Identity",
    icon: "◈",
    description: "Verify who is making the request. No implicit trust based on network location.",
    checks: ["MFA completed", "SSO token valid (JWT exp > 3600s)", "Privileged account — requires step-up auth", "Session anomaly: new geo-location flagged"],
    trustScore: 72,
    status: "verified",
  },
  {
    id: "device",
    name: "Device",
    icon: "⬡",
    description: "Assess device posture. Unmanaged or compromised devices are denied.",
    checks: ["EDR agent present — CrowdStrike v7.2", "OS patch level: ⚠ 12 patches behind", "Disk encryption: BitLocker active", "TPM 2.0 attestation: passed"],
    trustScore: 64,
    status: "verified",
  },
  {
    id: "network",
    name: "Network",
    icon: "⬢",
    description: "Treat every network as hostile. Enforce micro-segmentation and encrypted transits.",
    checks: ["mTLS session established", "Originating VLAN: untrusted guest network ✗", "No intranet peering bypass", "Network flow anomaly score: 31/100"],
    trustScore: 45,
    status: "evaluating",
  },
  {
    id: "application",
    name: "Application",
    icon: "⊕",
    description: "Authorise per-request at the application layer with fine-grained ABAC policies.",
    checks: ["API scope: read:financial — authorised", "Endpoint /api/v2/records — policy: ALLOW", "Rate limit: 480/500 req/min (warn)", "Input validation: passed"],
    trustScore: 81,
    status: "verified",
  },
  {
    id: "data",
    name: "Data",
    icon: "⬛",
    description: "Classify and protect data at rest and in transit. Enforce least-privilege data access.",
    checks: ["Data label: CONFIDENTIAL", "User clearance: STANDARD — ✗ insufficient", "DLP policy: block exfil to external", "Encryption: AES-256-GCM enforced"],
    trustScore: 20,
    status: "denied",
  },
];

interface RequestSummary {
  label: string;
  value: string;
  color?: string;
}

const REQUEST_META: RequestSummary[] = [
  { label: "User",     value: "j.smith@corp.internal" },
  { label: "Device",   value: "CORP-LAPTOP-4421 (Windows 11)" },
  { label: "Source IP",value: "10.0.4.87 (Guest VLAN)" },
  { label: "Resource", value: "/api/v2/financial/records" },
  { label: "Time",     value: new Date().toISOString().replace("T", " ").split(".")[0] + " UTC" },
  { label: "Result",   value: "ACCESS DENIED — Step 5 failed", color: "var(--cyber-red)" },
];

const statusConfig = {
  verified:   { label: "VERIFIED",   color: "var(--cyber-green)",  glow: true },
  evaluating: { label: "EVALUATING", color: "var(--cyber-amber)",  glow: false },
  denied:     { label: "DENIED",     color: "var(--cyber-red)",    glow: false },
  pending:    { label: "PENDING",    color: "rgba(255,255,255,0.2)", glow: false },
};

function TrustScoreGauge({ score, color }: { score: number; color: string }) {
  const [w, setW] = useState(0);
  useEffect(() => { const t = setTimeout(() => setW(score), 400); return () => clearTimeout(t); }, [score]);
  return (
    <div className="flex items-center gap-2">
      <div className="flex-1 h-1 bg-[var(--surface-3)] rounded overflow-hidden">
        <div
          className="h-full rounded transition-all duration-700"
          style={{ width: `${w}%`, background: color }}
        />
      </div>
      <span className="font-mono text-[10px] w-7 text-right" style={{ color }}>{score}</span>
    </div>
  );
}

export default function ZeroTrustGate() {
  const [activeLayer, setActiveLayer] = useState<TrustLayer>(LAYERS[0]);
  const [animStep, setAnimStep] = useState(0);

  useEffect(() => {
    const id = setInterval(() => setAnimStep((s) => (s + 1) % (LAYERS.length + 2)), 2000);
    return () => clearInterval(id);
  }, []);

  const overallScore = Math.round(LAYERS.reduce((a, l) => a + l.trustScore, 0) / LAYERS.length);

  return (
    <div className="flex flex-col gap-6">
      {/* Request meta bar */}
      <div className="border border-[var(--border-dim)] rounded bg-[var(--surface-2)] px-5 py-3 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        {REQUEST_META.map(({ label, value, color }) => (
          <div key={label}>
            <p className="font-mono text-[8px] uppercase tracking-widest text-[var(--foreground)]/25">{label}</p>
            <p className="font-mono text-[10px] truncate" style={{ color: color || "var(--foreground)" }}>{value}</p>
          </div>
        ))}
      </div>

      {/* Verification pipeline + detail */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-4">
        {/* Pipeline visual */}
        <div className="xl:col-span-1 flex flex-col border border-[var(--border-dim)] rounded bg-[var(--surface-1)] overflow-hidden">
          <div className="px-4 py-2.5 border-b border-[var(--border-dim)] bg-[var(--surface-2)]">
            <span className="font-mono text-xs tracking-widest uppercase text-[var(--cyber-blue)]">Verification Pipeline</span>
          </div>
          <div className="flex flex-col p-4 gap-0">
            {/* Entry node */}
            <div className="flex flex-col items-center gap-0">
              <div className="h-8 w-px bg-[var(--border-dim)]" />
              <div className="h-10 w-10 rounded-full border-2 border-[var(--cyber-green)] bg-[var(--cyber-green)]/10 flex items-center justify-center font-mono text-xs text-[var(--cyber-green)]">
                REQ
              </div>
            </div>

            {LAYERS.map((layer, i) => {
              const s = statusConfig[layer.status];
              const isActive = activeLayer.id === layer.id;
              const isAnimating = animStep % (LAYERS.length + 2) === i;
              return (
                <div key={layer.id} className="flex flex-col items-center">
                  {/* Connector */}
                  <div
                    className="w-px transition-colors duration-500"
                    style={{
                      height: 32,
                      background: isAnimating ? s.color : "var(--border-dim)",
                    }}
                  />
                  {/* Node */}
                  <button
                    onClick={() => setActiveLayer(layer)}
                    className="h-14 w-14 rounded-full border-2 flex flex-col items-center justify-center gap-0.5 transition-all hover:scale-105"
                    style={{
                      borderColor: isActive ? s.color : s.color + "40",
                      background: isActive ? s.color + "20" : "var(--surface-2)",
                      boxShadow: isActive && s.glow ? `0 0 12px ${s.color}` : "none",
                    }}
                  >
                    <span className="font-mono text-base" style={{ color: s.color }}>{layer.icon}</span>
                    <span className="font-mono text-[7px] uppercase tracking-wider" style={{ color: s.color + "aa" }}>{layer.name}</span>
                  </button>
                </div>
              );
            })}

            {/* Outcome node */}
            <div className="flex flex-col items-center">
              <div className="h-8 w-px bg-[var(--cyber-red)]/40" />
              <div className="h-10 w-10 rounded-full border-2 border-[var(--cyber-red)] bg-[var(--cyber-red)]/10 flex items-center justify-center font-mono text-[8px] text-[var(--cyber-red)] text-center leading-tight">
                DENY
              </div>
            </div>
          </div>

          {/* Overall trust score */}
          <div className="mt-auto border-t border-[var(--border-dim)] px-4 py-3 flex flex-col gap-1.5">
            <div className="flex justify-between">
              <span className="font-mono text-[9px] uppercase tracking-widest text-[var(--foreground)]/30">Overall Trust Score</span>
              <span className="font-mono text-xs font-bold" style={{ color: overallScore > 70 ? "var(--cyber-green)" : overallScore > 45 ? "var(--cyber-amber)" : "var(--cyber-red)" }}>
                {overallScore}/100
              </span>
            </div>
            <div className="h-1.5 w-full bg-[var(--surface-3)] rounded overflow-hidden">
              <div
                className="h-full rounded"
                style={{
                  width: `${overallScore}%`,
                  background: overallScore > 70 ? "var(--cyber-green)" : overallScore > 45 ? "var(--cyber-amber)" : "var(--cyber-red)",
                  transition: "width 1s ease",
                }}
              />
            </div>
          </div>
        </div>

        {/* Layer detail */}
        <div className="xl:col-span-2 flex flex-col border border-[var(--border-dim)] rounded bg-[var(--surface-1)] overflow-hidden">
          {(() => {
            const s = statusConfig[activeLayer.status];
            return (
              <>
                <div className="px-5 py-3 border-b border-[var(--border-dim)] bg-[var(--surface-2)] flex items-center gap-3">
                  <span className="text-xl" style={{ color: s.color }}>{activeLayer.icon}</span>
                  <div className="flex-1">
                    <h3 className="font-bold text-sm text-[var(--foreground)]">{activeLayer.name} Layer</h3>
                    <p className="font-mono text-[10px] text-[var(--foreground)]/30">{activeLayer.description}</p>
                  </div>
                  <div className="flex flex-col items-end gap-1">
                    <span className="font-mono text-[8px] font-bold px-2 py-0.5 rounded border" style={{ color: s.color, borderColor: s.color + "40", background: s.color + "15" }}>
                      {s.label}
                    </span>
                  </div>
                </div>

                <div className="flex flex-col gap-4 p-5">
                  <div className="flex flex-col gap-1.5">
                    <p className="font-mono text-[8px] uppercase tracking-widest text-[var(--foreground)]/25 mb-0.5">Trust Score</p>
                    <TrustScoreGauge score={activeLayer.trustScore} color={s.color} />
                  </div>

                  <div>
                    <p className="font-mono text-[8px] uppercase tracking-widest text-[var(--foreground)]/25 mb-3">Policy Checks</p>
                    <ul className="flex flex-col gap-2">
                      {activeLayer.checks.map((check, i) => {
                        const isFail = check.includes("✗");
                        const isWarn = check.includes("⚠");
                        return (
                          <li key={i} className="flex items-start gap-2.5">
                            <span
                              className="shrink-0 font-mono text-xs mt-0.5"
                              style={{ color: isFail ? "var(--cyber-red)" : isWarn ? "var(--cyber-amber)" : "var(--cyber-green)" }}
                            >
                              {isFail ? "✗" : isWarn ? "!" : "✓"}
                            </span>
                            <span
                              className="font-mono text-xs leading-relaxed"
                              style={{ color: isFail ? "var(--cyber-red)" : isWarn ? "var(--cyber-amber)" : "var(--foreground)" + "aa" }}
                            >
                              {check.replace(" ✗", "").replace(" ⚠", "")}
                            </span>
                          </li>
                        );
                      })}
                    </ul>
                  </div>
                </div>
              </>
            );
          })()}
        </div>
      </div>
    </div>
  );
}
