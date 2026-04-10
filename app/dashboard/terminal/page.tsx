import TerminalConsole from "@/components/TerminalConsole";
import Sidebar from "@/components/Sidebar";

export default function TerminalPage() {
  return (
    <div className="flex flex-1 min-h-0">
      <Sidebar />
      <div className="flex flex-col flex-1 overflow-hidden px-6 py-6 gap-4">
        {/* Header */}
        <div>
          <p className="font-mono text-[10px] tracking-[0.2em] uppercase text-[var(--cyber-green)]/50 mb-1">
            Tools
          </p>
          <h1 className="text-2xl font-bold text-[var(--foreground)]">Secure Terminal</h1>
          <p className="font-mono text-xs text-[var(--foreground)]/30 mt-1">
            Sandboxed shell · AES-256 encrypted · Session isolated
          </p>
        </div>

        {/* Info bar */}
        <div className="flex flex-wrap gap-4 border border-[var(--border-dim)] bg-[var(--surface-2)] rounded px-4 py-2.5">
          {[
            { label: "Session", value: "SIM-0xF4A2", color: "var(--cyber-green)" },
            { label: "Privilege", value: "USER", color: "var(--cyber-amber)" },
            { label: "Target", value: "192.168.1.0/24", color: "var(--cyber-blue)" },
            { label: "Encryption", value: "AES-256-GCM", color: "var(--cyber-green)" },
          ].map(({ label, value, color }) => (
            <div key={label} className="flex flex-col gap-0.5">
              <span className="font-mono text-[9px] uppercase tracking-widest text-[var(--foreground)]/30">{label}</span>
              <span className="font-mono text-xs font-bold" style={{ color }}>{value}</span>
            </div>
          ))}
        </div>

        {/* Full-height terminal */}
        <div className="flex-1 min-h-0">
          <TerminalConsole />
        </div>

        {/* Quick command bar */}
        <div className="flex flex-wrap gap-2 border border-[var(--border-dim)] bg-[var(--surface-2)] rounded px-4 py-3">
          <span className="font-mono text-[9px] uppercase tracking-widest text-[var(--foreground)]/20 self-center mr-2">
            Quick:
          </span>
          {["scan", "exploit", "defend", "status", "help"].map((cmd) => (
            <button
              key={cmd}
              className="font-mono text-[10px] px-3 py-1 rounded border border-[var(--border-dim)] text-[var(--foreground)]/40 hover:border-[var(--cyber-green)]/50 hover:text-[var(--cyber-green)] transition-all uppercase tracking-wider"
            >
              {cmd}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
