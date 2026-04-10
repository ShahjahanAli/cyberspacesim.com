"use client";

import { useEffect, useState } from "react";

type LogLevel = "INFO" | "WARN" | "ERROR" | "CRIT" | "DEBUG";

interface LogEntry {
  id: number;
  ts: string;
  level: LogLevel;
  source: string;
  message: string;
}

const levelConfig: Record<LogLevel, { color: string; bg: string; border: string }> = {
  INFO:  { color: "text-[var(--cyber-green)]",  bg: "bg-[var(--cyber-green)]/5",  border: "border-[var(--cyber-green)]/20" },
  WARN:  { color: "text-[var(--cyber-amber)]",  bg: "bg-[var(--cyber-amber)]/5",  border: "border-[var(--cyber-amber)]/20" },
  ERROR: { color: "text-[var(--cyber-red)]",    bg: "bg-[var(--cyber-red)]/5",    border: "border-[var(--cyber-red)]/20" },
  CRIT:  { color: "text-[var(--cyber-red)]",    bg: "bg-[var(--cyber-red)]/10",   border: "border-[var(--cyber-red)]/40" },
  DEBUG: { color: "text-[var(--foreground)]/30", bg: "bg-transparent",             border: "border-transparent" },
};

const SEED_LOGS: Omit<LogEntry, "id">[] = [
  { ts: "00:00:01.042", level: "INFO",  source: "sim-engine",    message: "Scenario 'Corporate Breach Drill #3' initialised" },
  { ts: "00:00:03.118", level: "INFO",  source: "network",       message: "Virtual network 192.168.1.0/24 provisioned" },
  { ts: "00:01:12.555", level: "WARN",  source: "ids",           message: "Port scan detected from 203.0.113.5 on 192.168.1.1" },
  { ts: "00:01:15.003", level: "INFO",  source: "firewall",      message: "Inbound connection 203.0.113.5→192.168.1.1:445 allowed (ruleset: default)" },
  { ts: "00:02:04.780", level: "ERROR", source: "host:192.168.1.42", message: "SMB negotiation anomaly — protocol downgrade to SMBv1 detected" },
  { ts: "00:02:11.204", level: "CRIT",  source: "ids",           message: "Exploit attempt: EternalBlue (MS17-010) targeting 192.168.1.42:445" },
  { ts: "00:02:14.901", level: "CRIT",  source: "host:192.168.1.42", message: "Shellcode execution detected — SYSTEM shell spawned" },
  { ts: "00:03:40.332", level: "WARN",  source: "network",       message: "Lateral movement: SMB relay attempt to 192.168.1.102" },
  { ts: "00:05:22.110", level: "ERROR", source: "host:192.168.1.102", message: "Credential harvesting via LSASS memory dump" },
  { ts: "00:08:47.009", level: "WARN",  source: "dns-monitor",   message: "Unusual DNS TXT query pattern from 192.168.1.102 (possible C2 beacon)" },
  { ts: "00:09:01.445", level: "DEBUG", source: "net-flow",      message: "Outbound HTTPS to 203.0.113.88:443 (3.4 KB) — within baseline" },
  { ts: "00:12:02.789", level: "WARN",  source: "auth",          message: "Failed SSH login for root@192.168.1.200 (3 attempts from 10.0.0.55)" },
  { ts: "00:14:19.561", level: "CRIT",  source: "dlp",           message: "Data exfiltration alert: 8.2 MB transfer to 203.0.113.99 via HTTPS" },
  { ts: "00:14:22.103", level: "INFO",  source: "sim-engine",    message: "Objective 3/5 completed — agent score updated to 840" },
];

const LIVE_EVENTS: Omit<LogEntry, "id" | "ts">[] = [
  { level: "WARN",  source: "ids",             message: "Anomalous process spawn: cmd.exe spawned by svchost.exe on 192.168.1.102" },
  { level: "INFO",  source: "net-flow",        message: "Outbound connection 192.168.1.42→192.168.1.50:5432 (PostgreSQL)" },
  { level: "ERROR", source: "host:192.168.1.50", message: "SQL authentication failure — brute force pattern detected" },
  { level: "CRIT",  source: "dlp",             message: "Sensitive file access: /etc/shadow read on host 192.168.1.200" },
  { level: "INFO",  source: "sim-engine",      message: "Hint available: check firewall ruleset for outbound restrictions" },
  { level: "DEBUG", source: "net-flow",        message: "ICMP echo-request flood from 192.168.1.42 (112 pkt/s)" },
];

function nowTs(): string {
  const d = new Date();
  const pad = (n: number, len = 2) => String(n).padStart(len, "0");
  const ms = String(d.getMilliseconds()).padStart(3, "0");
  return `${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}.${ms}`;
}

let idCounter = SEED_LOGS.length + 1;

export default function EventLog({ maxHeight = "h-96" }: { maxHeight?: string }) {
  const [logs, setLogs] = useState<LogEntry[]>(() =>
    SEED_LOGS.map((l, i) => ({ ...l, id: i + 1 }))
  );
  const [filter, setFilter] = useState<LogLevel | "ALL">("ALL");
  const [paused, setPaused] = useState(false);

  useEffect(() => {
    if (paused) return;
    let eventIdx = 0;
    const id = setInterval(() => {
      const evt = LIVE_EVENTS[eventIdx % LIVE_EVENTS.length];
      eventIdx++;
      setLogs((prev) => {
        const next = [...prev, { ...evt, id: idCounter++, ts: nowTs() }];
        return next.slice(-200); // cap at 200 entries
      });
    }, 3500);
    return () => clearInterval(id);
  }, [paused]);

  const visible = filter === "ALL" ? logs : logs.filter((l) => l.level === filter);

  return (
    <div className="flex flex-col border border-[var(--border-dim)] rounded bg-[var(--surface-1)] overflow-hidden">
      {/* Toolbar */}
      <div className="flex items-center justify-between gap-3 px-4 py-2.5 border-b border-[var(--border-dim)] bg-[var(--surface-2)] shrink-0 flex-wrap">
        <span className="font-mono text-xs tracking-widest uppercase text-[var(--cyber-blue)]">≡ Event Log</span>

        <div className="flex items-center gap-2 flex-wrap">
          {(["ALL", "CRIT", "ERROR", "WARN", "INFO", "DEBUG"] as const).map((lvl) => {
            const cfg = lvl === "ALL" ? null : levelConfig[lvl as LogLevel];
            return (
              <button
                key={lvl}
                onClick={() => setFilter(lvl)}
                className={`font-mono text-[9px] px-2 py-0.5 rounded border uppercase tracking-wider transition-all ${
                  filter === lvl
                    ? lvl === "ALL"
                      ? "border-[var(--cyber-blue)] text-[var(--cyber-blue)] bg-[var(--cyber-blue)]/10"
                      : `${cfg!.color} ${cfg!.bg} ${cfg!.border}`
                    : "border-[var(--border-dim)] text-[var(--foreground)]/30 hover:text-[var(--foreground)]/60"
                }`}
              >
                {lvl}
              </button>
            );
          })}
          <button
            onClick={() => setPaused((p) => !p)}
            className={`font-mono text-[9px] px-2 py-0.5 rounded border uppercase tracking-wider transition-all ${
              paused
                ? "border-[var(--cyber-amber)] text-[var(--cyber-amber)] bg-[var(--cyber-amber)]/10"
                : "border-[var(--border-dim)] text-[var(--foreground)]/30 hover:text-[var(--foreground)]/60"
            }`}
          >
            {paused ? "▶ Resume" : "⏸ Pause"}
          </button>
        </div>
      </div>

      {/* Log lines */}
      <div className={`${maxHeight} overflow-y-auto font-mono text-[11px]`}>
        {visible.map((log) => {
          const cfg = levelConfig[log.level];
          return (
            <div
              key={log.id}
              className={`flex items-start gap-3 px-4 py-1.5 border-b border-[var(--border-dim)]/40 hover:bg-[var(--surface-3)] transition-colors`}
            >
              <span className="text-[var(--foreground)]/20 shrink-0 tabular-nums">{log.ts}</span>
              <span className={`shrink-0 px-1 rounded border font-bold text-[9px] uppercase ${cfg.color} ${cfg.bg} ${cfg.border}`}>
                {log.level}
              </span>
              <span className="text-[var(--cyber-blue)]/60 shrink-0 truncate max-w-[120px]">{log.source}</span>
              <span className="text-[var(--foreground)]/60 flex-1 leading-relaxed">{log.message}</span>
            </div>
          );
        })}
        {visible.length === 0 && (
          <div className="flex items-center justify-center h-24 text-[var(--foreground)]/20 font-mono text-xs">
            No events matching filter
          </div>
        )}
      </div>

      {/* Status bar */}
      <div className="flex items-center justify-between px-4 py-1.5 border-t border-[var(--border-dim)] bg-[var(--surface-2)] shrink-0">
        <span className="font-mono text-[9px] text-[var(--foreground)]/20">
          Showing {visible.length} / {logs.length} events
        </span>
        <span className={`flex items-center gap-1 font-mono text-[9px] ${paused ? "text-[var(--cyber-amber)]" : "text-[var(--cyber-green)]"}`}>
          <span className={`h-1 w-1 rounded-full ${paused ? "bg-[var(--cyber-amber)]" : "bg-[var(--cyber-green)] animate-pulse"}`} />
          {paused ? "PAUSED" : "LIVE"}
        </span>
      </div>
    </div>
  );
}
