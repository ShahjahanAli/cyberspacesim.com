import KillChainTracker from "@/components/KillChainTracker";
import Sidebar from "@/components/Sidebar";

export const metadata = {
  title: "Kill Chain Tracker — CyberSpace Sim",
};

export default function KillChainPage() {
  return (
    <div className="flex h-[calc(100vh-56px)]">
      <Sidebar />
      <div className="flex-1 overflow-y-auto">
        <div className="px-6 py-6 max-w-7xl mx-auto flex flex-col gap-6">
          {/* Header */}
          <div className="flex flex-col gap-1">
            <div className="flex items-center gap-3">
              <span className="font-mono text-2xl">⛓</span>
              <h1 className="font-mono text-xl font-bold text-[var(--foreground)]">Kill Chain Tracker</h1>
            </div>
            <p className="font-mono text-sm text-[var(--foreground)]/40">
              Real-time attacker progression mapping · Lockheed Martin Cyber Kill Chain® · MITRE ATT&amp;CK
            </p>
          </div>

          {/* Scenario context */}
          <div className="flex items-center gap-4 border border-[var(--cyber-amber)]/30 rounded px-4 py-3 bg-[var(--cyber-amber)]/5 font-mono text-xs">
            <span className="text-[var(--cyber-amber)] font-bold shrink-0">⚡ ACTIVE INCIDENT</span>
            <span className="text-[var(--foreground)]/50">Scenario: EternalBlue Lateral Movement — Host 192.168.1.42 · Attacker at Stage 4 (Exploitation)</span>
            <span className="ml-auto text-[var(--cyber-red)] shrink-0 animate-pulse">BREACH IN PROGRESS</span>
          </div>

          <KillChainTracker />

          {/* Legend */}
          <div className="flex flex-wrap gap-4 border border-[var(--border-dim)] rounded px-5 py-3 bg-[var(--surface-2)]">
            <p className="font-mono text-[9px] uppercase tracking-widest text-[var(--foreground)]/25 w-full">Stage Status Legend</p>
            {[
              { status: "BREACHED", color: "var(--cyber-red)",   icon: "✗", desc: "Stage successfully exploited by attacker" },
              { status: "ACTIVE",   color: "var(--cyber-amber)", icon: "⚡", desc: "Attacker currently operating at this stage" },
              { status: "BLOCKED",  color: "var(--cyber-green)", icon: "✓", desc: "Defender successfully mitigated this stage" },
              { status: "PENDING",  color: "rgba(255,255,255,0.2)", icon: "○", desc: "Not yet reached" },
            ].map(({ status, color, icon, desc }) => (
              <div key={status} className="flex items-center gap-2">
                <span className="font-mono text-sm" style={{ color }}>{icon}</span>
                <span className="font-mono text-[10px] font-bold" style={{ color }}>{status}</span>
                <span className="font-mono text-[9px] text-[var(--foreground)]/30">{desc}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
