import QuantumRiskAnalyzer from "@/components/QuantumRiskAnalyzer";
import Sidebar from "@/components/Sidebar";

export const metadata = {
  title: "Quantum Risk Analyzer — CyberSpace Sim",
};

export default function QuantumPage() {
  return (
    <div className="flex h-[calc(100vh-56px)]">
      <Sidebar />
      <div className="flex-1 overflow-y-auto">
        <div className="px-6 py-6 max-w-7xl mx-auto flex flex-col gap-6">
          {/* Header */}
          <div className="flex flex-col gap-1">
            <div className="flex items-center gap-3">
              <span className="font-mono text-2xl">∞</span>
              <h1 className="font-mono text-xl font-bold text-[var(--foreground)]">Quantum Risk Analyzer</h1>
            </div>
            <p className="font-mono text-sm text-[var(--foreground)]/40">
              Post-quantum cryptography readiness · NIST PQC standards · Harvest-now-decrypt-later threat modelling
            </p>
          </div>

          {/* Threat context */}
          <div className="border border-[var(--cyber-amber)]/30 rounded px-5 py-4 bg-[var(--cyber-amber)]/5 flex flex-col gap-2">
            <p className="font-mono text-xs font-bold text-[var(--cyber-amber)]">⚠ Q-Day Threat Assessment</p>
            <p className="font-mono text-[10px] text-[var(--foreground)]/50 leading-relaxed">
              A Cryptographically Relevant Quantum Computer (CRQC) capable of breaking RSA-2048 is estimated to require ~4,000 logical (error-corrected) qubits.
              Current SOTA: ~1,000 physical qubits (IBM Condor, 2023). Nation-state adversaries are executing <strong className="text-[var(--cyber-amber)]">Harvest Now, Decrypt Later</strong> (HNDL) attacks — intercepting encrypted traffic today to decrypt once Q-Day arrives.
              Begin post-quantum migration now to protect long-lived secrets.
            </p>
          </div>

          <QuantumRiskAnalyzer />

          {/* NIST PQC standards footer */}
          <div className="border border-[var(--border-dim)] rounded p-5 bg-[var(--surface-2)] flex flex-col gap-3">
            <p className="font-mono text-[9px] uppercase tracking-widest text-[var(--foreground)]/25">NIST Post-Quantum Cryptography Standards (2024)</p>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {[
                { std: "FIPS 203", algo: "ML-KEM (CRYSTALS-Kyber)", use: "Key encapsulation mechanism (KEM)", color: "var(--cyber-green)" },
                { std: "FIPS 204", algo: "ML-DSA (CRYSTALS-Dilithium)", use: "Digital signatures", color: "var(--cyber-green)" },
                { std: "FIPS 205", algo: "SLH-DSA (SPHINCS+)", use: "Hash-based signatures (stateless)", color: "var(--cyber-blue)" },
              ].map(({ std, algo, use, color }) => (
                <div key={std} className="flex flex-col gap-1 border border-[var(--border-dim)] rounded p-3" style={{ borderColor: color + "30" }}>
                  <span className="font-mono text-[8px] font-bold" style={{ color }}>{std}</span>
                  <span className="font-mono text-xs text-[var(--foreground)]/70">{algo}</span>
                  <span className="font-mono text-[9px] text-[var(--foreground)]/30">{use}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
