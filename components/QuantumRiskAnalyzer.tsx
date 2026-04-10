"use client";

import { useMemo, useState } from "react";

type QSafety = "Quantum-Safe" | "Deprecated" | "At Risk" | "Vulnerable";

interface Algorithm {
  id: string;
  name: string;
  category: string;
  keyBits: number;
  usage: string;
  qSafety: QSafety;
  qVulnReason: string;
  replacement: string;
  migrationUrgency: "IMMEDIATE" | "HIGH" | "MEDIUM" | "LOW";
  shorYears: string;
  groverImpact: string;
}

const ALGORITHMS: Algorithm[] = [
  {
    id: "rsa2048",
    name: "RSA-2048",
    category: "Asymmetric",
    keyBits: 2048,
    usage: "TLS key exchange, certificate signing",
    qSafety: "Vulnerable",
    qVulnReason: "Shor's algorithm factors RSA in polynomial time on a CRQC with ~4096 logical qubits.",
    replacement: "CRYSTALS-Kyber (FIPS 203)",
    migrationUrgency: "IMMEDIATE",
    shorYears: "Estimated ~8–15 years to CRQC availability",
    groverImpact: "N/A (asymmetric)",
  },
  {
    id: "ecc256",
    name: "ECDSA P-256",
    category: "Asymmetric",
    keyBits: 256,
    usage: "Digital signatures, JWT signing",
    qSafety: "Vulnerable",
    qVulnReason: "Shor's algorithm solves ECDLP in polynomial time. Equivalent classical security offers no quantum protection.",
    replacement: "CRYSTALS-Dilithium (FIPS 204)",
    migrationUrgency: "IMMEDIATE",
    shorYears: "~8–15 years",
    groverImpact: "N/A (asymmetric)",
  },
  {
    id: "dh3072",
    name: "Diffie-Hellman 3072",
    category: "Key Exchange",
    keyBits: 3072,
    usage: "Key agreement in legacy TLS",
    qSafety: "Vulnerable",
    qVulnReason: "Discrete logarithm problem solved by Shor's algorithm. Harvest-now-decrypt-later attacks possible.",
    replacement: "CRYSTALS-Kyber / X-Wing hybrid KEM",
    migrationUrgency: "HIGH",
    shorYears: "~8–15 years",
    groverImpact: "N/A",
  },
  {
    id: "aes256",
    name: "AES-256",
    category: "Symmetric",
    keyBits: 256,
    usage: "Bulk data encryption, disk encryption",
    qSafety: "Quantum-Safe",
    qVulnReason: "Grover's algorithm provides quadratic speedup, reducing effective security to ~128 bits — still computationally infeasible.",
    replacement: "No change needed (AES-256 remains standard)",
    migrationUrgency: "LOW",
    shorYears: "Not applicable",
    groverImpact: "128-bit effective security — acceptable",
  },
  {
    id: "sha256",
    name: "SHA-256",
    category: "Hash",
    keyBits: 256,
    usage: "Integrity checks, HMAC, TLS",
    qSafety: "At Risk",
    qVulnReason: "Grover halves collision resistance to 128-bit. Considered acceptable but SHA-384/512 preferred.",
    replacement: "SHA-384 / SHA-512 for high-security contexts",
    migrationUrgency: "MEDIUM",
    shorYears: "Not applicable",
    groverImpact: "128-bit collision resistance — marginal",
  },
  {
    id: "sha1",
    name: "SHA-1",
    category: "Hash",
    keyBits: 160,
    usage: "Legacy systems, git object IDs",
    qSafety: "Deprecated",
    qVulnReason: "Already broken classically (SHAttered, 2017). Quantum further reduces collision resistance to 80 bits. Do not use.",
    replacement: "SHA-256 minimum, SHA-3 preferred",
    migrationUrgency: "IMMEDIATE",
    shorYears: "Already broken",
    groverImpact: "80-bit effective — broken",
  },
  {
    id: "tls13",
    name: "TLS 1.3",
    category: "Protocol",
    keyBits: 0,
    usage: "Transport encryption (web, API)",
    qSafety: "At Risk",
    qVulnReason: "TLS 1.3 uses ECDHE for key exchange — quantum-vulnerable. Payload cipher (AES-256-GCM) is safe. Needs PQ KEM extension (RFC 9258 / OQS).",
    replacement: "TLS 1.3 + X-Wing hybrid KEM (IETF draft)",
    migrationUrgency: "HIGH",
    shorYears: "~8–15 years for key exchange break",
    groverImpact: "Payload encryption: safe",
  },
  {
    id: "kyber768",
    name: "CRYSTALS-Kyber (ML-KEM)",
    category: "Post-Quantum KEM",
    keyBits: 768,
    usage: "Post-quantum key encapsulation (FIPS 203)",
    qSafety: "Quantum-Safe",
    qVulnReason: "Based on Module Learning With Errors (MLWE) — no known quantum algorithm provides significant speedup.",
    replacement: "This IS the replacement",
    migrationUrgency: "LOW",
    shorYears: "Not vulnerable",
    groverImpact: "Not significantly impacted",
  },
];

const urgencyConfig: Record<string, { color: string; bg: string; border: string }> = {
  IMMEDIATE: { color: "text-[var(--cyber-red)]",    bg: "bg-[var(--cyber-red)]/10",    border: "border-[var(--cyber-red)]/30" },
  HIGH:      { color: "text-[var(--cyber-amber)]",  bg: "bg-[var(--cyber-amber)]/10",  border: "border-[var(--cyber-amber)]/30" },
  MEDIUM:    { color: "text-[var(--cyber-blue)]",   bg: "bg-[var(--cyber-blue)]/10",   border: "border-[var(--cyber-blue)]/30" },
  LOW:       { color: "text-[var(--cyber-green)]",  bg: "bg-[var(--cyber-green)]/10",  border: "border-[var(--cyber-green)]/30" },
};

const safetyConfig: Record<QSafety, { color: string; icon: string }> = {
  "Quantum-Safe": { color: "var(--cyber-green)", icon: "✓" },
  "At Risk":      { color: "var(--cyber-amber)", icon: "⚠" },
  "Deprecated":   { color: "var(--cyber-red)",   icon: "✗" },
  "Vulnerable":   { color: "var(--cyber-red)",   icon: "☠" },
};

export default function QuantumRiskAnalyzer() {
  const [selected, setSelected] = useState<Algorithm>(ALGORITHMS[0]);
  const [filter, setFilter] = useState<string>("ALL");

  const categories = useMemo(() => ["ALL", ...Array.from(new Set(ALGORITHMS.map((a) => a.category)))], []);
  const filtered = filter === "ALL" ? ALGORITHMS : ALGORITHMS.filter((a) => a.category === filter);

  const safetyCounts = useMemo(() => ({
    vulnerable: ALGORITHMS.filter((a) => a.qSafety === "Vulnerable" || a.qSafety === "Deprecated").length,
    atRisk: ALGORITHMS.filter((a) => a.qSafety === "At Risk").length,
    safe: ALGORITHMS.filter((a) => a.qSafety === "Quantum-Safe").length,
  }), []);

  return (
    <div className="flex flex-col gap-6">
      {/* Summary cards */}
      <div className="grid grid-cols-3 gap-4">
        {[
          { label: "Exposed Algorithms", value: safetyCounts.vulnerable, color: "var(--cyber-red)", subtext: "Require immediate migration" },
          { label: "At Risk",            value: safetyCounts.atRisk,    color: "var(--cyber-amber)", subtext: "Quantum-degraded security" },
          { label: "Quantum-Safe",       value: safetyCounts.safe,      color: "var(--cyber-green)", subtext: "NIST PQC compliant or symmetric" },
        ].map(({ label, value, color, subtext }) => (
          <div key={label} className="flex flex-col border border-[var(--border-dim)] rounded bg-[var(--surface-2)] p-4 gap-1" style={{ borderColor: color + "30" }}>
            <p className="font-mono text-[8px] uppercase tracking-widest" style={{ color: color + "80" }}>{label}</p>
            <p className="font-mono text-3xl font-black" style={{ color }}>{value}</p>
            <p className="font-mono text-[9px] text-[var(--foreground)]/30">{subtext}</p>
          </div>
        ))}
      </div>

      {/* Filter + table */}
      <div className="border border-[var(--border-dim)] rounded bg-[var(--surface-1)] overflow-hidden">
        {/* Filter bar */}
        <div className="px-4 py-2 border-b border-[var(--border-dim)] bg-[var(--surface-2)] flex items-center gap-2 overflow-x-auto">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setFilter(cat)}
              className="shrink-0 font-mono text-[9px] uppercase tracking-wider px-2.5 py-1 rounded border transition-all"
              style={
                filter === cat
                  ? { borderColor: "var(--cyber-purple)", color: "var(--cyber-purple)", background: "var(--cyber-purple)18" }
                  : { borderColor: "var(--border-dim)", color: "rgba(255,255,255,0.3)" }
              }
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Rows */}
        <div className="divide-y divide-[var(--border-dim)]">
          {filtered.map((alg) => {
            const s = safetyConfig[alg.qSafety];
            const u = urgencyConfig[alg.migrationUrgency];
            const isSelected = selected.id === alg.id;
            return (
              <button
                key={alg.id}
                onClick={() => setSelected(alg)}
                className={`w-full flex items-center gap-3 px-4 py-3 text-left transition-all hover:bg-[var(--surface-3)] ${isSelected ? "bg-[var(--surface-3)]" : ""}`}
              >
                <span className="shrink-0 w-5 text-center font-mono text-sm" style={{ color: s.color }}>{s.icon}</span>
                <div className="flex-1 min-w-0">
                  <p className="font-mono text-xs font-bold text-[var(--foreground)] truncate">{alg.name}</p>
                  <p className="font-mono text-[9px] text-[var(--foreground)]/30 truncate">{alg.usage}</p>
                </div>
                <span className="shrink-0 font-mono text-[9px] px-1.5 py-0.5 rounded border text-[var(--foreground)]/30 border-[var(--border-dim)]">{alg.category}</span>
                <span className="shrink-0 font-mono text-[9px] font-bold" style={{ color: s.color }}>{alg.qSafety}</span>
                <span className={`shrink-0 font-mono text-[8px] font-bold px-2 py-0.5 rounded border ${u.color} ${u.bg} ${u.border}`}>
                  {alg.migrationUrgency}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Detail panel */}
      {selected && (() => {
        const s = safetyConfig[selected.qSafety];
        const u = urgencyConfig[selected.migrationUrgency];
        return (
          <div className="border border-[var(--border-dim)] rounded bg-[var(--surface-1)] overflow-hidden">
            <div className="px-5 py-3 border-b border-[var(--border-dim)] bg-[var(--surface-2)] flex items-center gap-3">
              <span className="font-mono text-2xl" style={{ color: s.color }}>{s.icon}</span>
              <div className="flex-1">
                <h3 className="font-bold font-mono text-sm text-[var(--foreground)]">{selected.name}</h3>
                <p className="font-mono text-[9px] text-[var(--foreground)]/30">{selected.category} · {selected.keyBits > 0 ? `${selected.keyBits}-bit key` : "Protocol"}</p>
              </div>
              <span className={`font-mono text-[9px] font-bold px-2.5 py-1 rounded border ${u.color} ${u.bg} ${u.border}`}>
                Migration: {selected.migrationUrgency}
              </span>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-0 divide-y md:divide-y-0 md:divide-x divide-[var(--border-dim)]">
              <div className="flex flex-col gap-4 p-5">
                <div>
                  <p className="font-mono text-[8px] uppercase tracking-widest text-[var(--foreground)]/25 mb-1.5">Current Usage</p>
                  <p className="font-mono text-xs text-[var(--foreground)]/60">{selected.usage}</p>
                </div>
                <div>
                  <p className="font-mono text-[8px] uppercase tracking-widest text-[var(--cyber-red)]/50 mb-1.5">Quantum Vulnerability</p>
                  <p className="font-mono text-xs text-[var(--foreground)]/60 leading-relaxed">{selected.qVulnReason}</p>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <p className="font-mono text-[8px] uppercase tracking-widest text-[var(--foreground)]/25 mb-1">Shor's Threat</p>
                    <p className="font-mono text-[10px] text-[var(--cyber-amber)]">{selected.shorYears}</p>
                  </div>
                  <div>
                    <p className="font-mono text-[8px] uppercase tracking-widest text-[var(--foreground)]/25 mb-1">Grover's Impact</p>
                    <p className="font-mono text-[10px] text-[var(--cyber-blue)]">{selected.groverImpact}</p>
                  </div>
                </div>
              </div>
              <div className="flex flex-col gap-3 p-5">
                <p className="font-mono text-[8px] uppercase tracking-widest text-[var(--cyber-green)]/50">Recommended Replacement</p>
                <div className="flex-1 flex flex-col items-start justify-center gap-2 border border-[var(--cyber-green)]/20 rounded p-4 bg-[var(--cyber-green)]/5">
                  <span className="font-mono text-[var(--cyber-green)] text-xl">✓</span>
                  <p className="font-mono text-sm font-bold text-[var(--cyber-green)]">{selected.replacement}</p>
                </div>
                {selected.migrationUrgency !== "LOW" && (
                  <p className="font-mono text-[9px] text-[var(--foreground)]/25 leading-relaxed">
                    NIST has standardised post-quantum algorithms under FIPS 203 (Kyber), FIPS 204 (Dilithium), and FIPS 205 (SPHINCS+). Begin migration planning now to address &apos;harvest now, decrypt later&apos; attack vectors.
                  </p>
                )}
              </div>
            </div>
          </div>
        );
      })()}
    </div>
  );
}
