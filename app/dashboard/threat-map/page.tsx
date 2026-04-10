import ThreatMap from "@/components/ThreatMap";
import Sidebar from "@/components/Sidebar";
import StatCard from "@/components/StatCard";

export default function ThreatMapPage() {
  return (
    <div className="flex flex-1 min-h-0">
      <Sidebar />
      <div className="flex flex-col flex-1 overflow-auto px-6 py-6 gap-6">
        {/* Header */}
        <div>
          <p className="font-mono text-[10px] tracking-[0.2em] uppercase text-[var(--cyber-green)]/50 mb-1">
            Tools
          </p>
          <h1 className="text-2xl font-bold text-[var(--foreground)]">Live Threat Map</h1>
          <p className="font-mono text-xs text-[var(--foreground)]/30 mt-1">
            Real-time network topology · Click nodes to inspect
          </p>
        </div>

        {/* Quick stats */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <StatCard label="Total Hosts"      value="9"       accent="green" />
          <StatCard label="Compromised"      value="1"       accent="purple" pulse />
          <StatCard label="Under Attack"     value="2"       accent="red"    pulse />
          <StatCard label="Active Vectors"   value="4"       accent="amber"  pulse />
        </div>

        {/* Full map */}
        <div className="flex-1 min-h-[420px]">
          <ThreatMap />
        </div>

        {/* Attack path summary */}
        <div className="border border-[var(--border-dim)] rounded bg-[var(--surface-1)]">
          <div className="px-4 py-2.5 border-b border-[var(--border-dim)] bg-[var(--surface-2)]">
            <span className="font-mono text-xs tracking-widest uppercase text-[var(--cyber-red)]">
              ⚠ Detected Attack Path
            </span>
          </div>
          <div className="px-4 py-4 flex flex-wrap items-center gap-2 font-mono text-xs">
            {[
              { label: "203.0.113.5", role: "Attacker", color: "var(--cyber-red)" },
              { label: "→" },
              { label: "192.168.1.1", role: "Firewall/GW", color: "var(--cyber-amber)" },
              { label: "→" },
              { label: "192.168.1.42", role: "SMB Server", color: "var(--cyber-purple)" },
              { label: "→" },
              { label: "192.168.1.102", role: "Workstation B", color: "var(--cyber-red)" },
              { label: "→" },
              { label: "192.168.1.50", role: "Database", color: "var(--cyber-amber)" },
            ].map((item, i) =>
              item.label === "→" ? (
                <span key={i} className="text-[var(--foreground)]/20">→</span>
              ) : (
                <div key={i} className="flex flex-col items-center border border-[var(--border-dim)] rounded px-3 py-1.5 bg-[var(--surface-2)]">
                  <span style={{ color: item.color }} className="font-bold">{item.label}</span>
                  <span className="text-[9px] text-[var(--foreground)]/30">{item.role}</span>
                </div>
              )
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
