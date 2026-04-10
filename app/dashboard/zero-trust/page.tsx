import ZeroTrustGate from "@/components/ZeroTrustGate";
import Sidebar from "@/components/Sidebar";

export const metadata = {
  title: "Zero Trust Verifier — CyberSpace Sim",
};

export default function ZeroTrustPage() {
  return (
    <div className="flex h-[calc(100vh-56px)]">
      <Sidebar />
      <div className="flex-1 overflow-y-auto">
        <div className="px-6 py-6 max-w-7xl mx-auto flex flex-col gap-6">
          {/* Header */}
          <div className="flex flex-col gap-1">
            <div className="flex items-center gap-3">
              <span className="font-mono text-2xl">⊛</span>
              <h1 className="font-mono text-xl font-bold text-[var(--foreground)]">Zero Trust Verifier</h1>
            </div>
            <p className="font-mono text-sm text-[var(--foreground)]/40">
              Never trust, always verify · NIST SP 800-207 · Per-request policy evaluation
            </p>
          </div>

          {/* Principle bar */}
          <div className="grid grid-cols-3 gap-3">
            {[
              { label: "Verify Explicitly", desc: "Always authenticate and authorise based on all available data points.", icon: "◈" },
              { label: "Least Privilege", desc: "Limit user access with JIT/JEA, risk-based adaptive policies.", icon: "⊖" },
              { label: "Assume Breach", desc: "Minimise blast radius. Segment access. Verify end-to-end encryption.", icon: "⚡" },
            ].map(({ label, desc, icon }) => (
              <div key={label} className="flex flex-col gap-1.5 border border-[var(--border-dim)] rounded p-4 bg-[var(--surface-2)]">
                <div className="flex items-center gap-2">
                  <span className="font-mono text-[var(--cyber-blue)]">{icon}</span>
                  <p className="font-mono text-xs font-bold text-[var(--foreground)]">{label}</p>
                </div>
                <p className="font-mono text-[9px] text-[var(--foreground)]/35 leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>

          <ZeroTrustGate />
        </div>
      </div>
    </div>
  );
}
