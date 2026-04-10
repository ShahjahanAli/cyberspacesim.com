interface AlertItem {
  id: string;
  severity: "critical" | "high" | "medium" | "low";
  message: string;
  source: string;
  time: string;
}

const severityConfig = {
  critical: { label: "CRIT", color: "text-[var(--cyber-red)]", bg: "bg-[var(--cyber-red)]/10", border: "border-[var(--cyber-red)]/30" },
  high: { label: "HIGH", color: "text-[var(--cyber-amber)]", bg: "bg-[var(--cyber-amber)]/10", border: "border-[var(--cyber-amber)]/30" },
  medium: { label: "MED", color: "text-[var(--cyber-blue)]", bg: "bg-[var(--cyber-blue)]/10", border: "border-[var(--cyber-blue)]/30" },
  low: { label: "LOW", color: "text-[var(--cyber-green)]", bg: "bg-[var(--cyber-green)]/10", border: "border-[var(--cyber-green)]/30" },
};

const MOCK_ALERTS: AlertItem[] = [
  { id: "a1", severity: "critical", message: "Privilege escalation attempt detected", source: "192.168.1.42", time: "00:02:11" },
  { id: "a2", severity: "high", message: "Lateral movement via SMB relay", source: "192.168.1.11", time: "00:05:33" },
  { id: "a3", severity: "medium", message: "Unusual DNS query pattern", source: "192.168.1.20", time: "00:08:47" },
  { id: "a4", severity: "low", message: "Failed SSH login (3 attempts)", source: "10.0.0.55", time: "00:12:02" },
  { id: "a5", severity: "critical", message: "Data exfiltration to external IP", source: "192.168.1.42", time: "00:14:19" },
];

export default function AlertFeed() {
  return (
    <div className="flex flex-col border border-[var(--border-dim)] rounded bg-[var(--surface-1)] overflow-hidden">
      <div className="flex items-center justify-between px-4 py-2.5 border-b border-[var(--border-dim)] bg-[var(--surface-2)]">
        <span className="font-mono text-xs tracking-widest uppercase text-[var(--cyber-red)]">
          ⚠ Alert Feed
        </span>
        <span className="font-mono text-[10px] text-[var(--foreground)]/30">LIVE</span>
      </div>
      <ul className="flex flex-col divide-y divide-[var(--border-dim)] max-h-64 overflow-y-auto">
        {MOCK_ALERTS.map((alert) => {
          const s = severityConfig[alert.severity];
          return (
            <li key={alert.id} className="flex items-start gap-3 px-4 py-2.5 hover:bg-[var(--surface-3)] transition-colors">
              <span className={`mt-0.5 shrink-0 font-mono text-[9px] font-bold px-1.5 py-0.5 rounded border ${s.color} ${s.bg} ${s.border}`}>
                {s.label}
              </span>
              <div className="flex-1 min-w-0">
                <p className="font-mono text-xs text-[var(--foreground)]/80 truncate">{alert.message}</p>
                <p className="font-mono text-[10px] text-[var(--foreground)]/30">{alert.source}</p>
              </div>
              <span className="shrink-0 font-mono text-[10px] text-[var(--foreground)]/30">{alert.time}</span>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
