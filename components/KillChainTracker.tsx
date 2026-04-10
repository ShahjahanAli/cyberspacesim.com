"use client";

import { useEffect, useState } from "react";

interface KillChainStage {
  id: number;
  name: string;
  mitre: string;
  description: string;
  attackerAction: string;
  defenderAction: string;
  ioc: string[];
  status: "breached" | "active" | "blocked" | "pending";
}

const STAGES: KillChainStage[] = [
  {
    id: 1,
    name: "Reconnaissance",
    mitre: "TA0043",
    description: "Attacker gathers intelligence on the target.",
    attackerAction: "OSINT collection via LinkedIn, Shodan, Censys. Identified 3 exposed admin portals.",
    defenderAction: "Reduce digital footprint. Monitor external scanning sources.",
    ioc: ["Shodan scans from 203.0.113.5", "LinkedIn scraping bot detected", "Censys query on AS212345"],
    status: "breached",
  },
  {
    id: 2,
    name: "Weaponisation",
    mitre: "TA0001",
    description: "Attacker creates a deliverable payload paired with an exploit.",
    attackerAction: "EternalBlue exploit (MS17-010) packaged with Meterpreter reverse shell payload.",
    defenderAction: "Threat intelligence feeds — hunt for known exploit builders.",
    ioc: ["SHA256: 4f3a9c2d… (Meterpreter variant)", "Exploit-DB ref: 42315"],
    status: "breached",
  },
  {
    id: 3,
    name: "Delivery",
    mitre: "TA0001",
    description: "Weapon is transmitted to the target environment.",
    attackerAction: "Direct SMBv1 exploitation against 192.168.1.42:445.",
    defenderAction: "Block inbound SMBv1. Alert on anomalous SMB negotiation.",
    ioc: ["SMBv1 negotiation from 203.0.113.5", "445/tcp spike at 00:02:04"],
    status: "breached",
  },
  {
    id: 4,
    name: "Exploitation",
    mitre: "TA0002",
    description: "Exploit code executes on the victim system.",
    attackerAction: "EternalBlue triggers kernel exploit. SYSTEM shell spawned on 192.168.1.42.",
    defenderAction: "Patch MS17-010. Enable exploit protection (EMET/Defender).",
    ioc: ["svchost.exe spawning cmd.exe", "ntdll.dll shellcode injection"],
    status: "active",
  },
  {
    id: 5,
    name: "Installation",
    mitre: "TA0003",
    description: "Attacker installs a backdoor for persistent access.",
    attackerAction: "Deploying Cobalt Strike beacon with 60s check-in interval to C2 at 203.0.113.99.",
    defenderAction: "Hunt for scheduled tasks, registry RunKeys, and WMI subscriptions.",
    ioc: ["New service: WinUpdateSvc32", "Outbound HTTPS beaconing 60s intervals"],
    status: "pending",
  },
  {
    id: 6,
    name: "Command & Control",
    mitre: "TA0011",
    description: "Attacker establishes C2 channel to the compromised host.",
    attackerAction: "HTTPS C2 over port 443 with DNS-over-HTTPS fallback. Encrypted with AES-256.",
    defenderAction: "DNS sinkholing. SSL inspection. Beacon jitter analysis.",
    ioc: ["C2 domain: update-cdn[.]io", "Beacon: 60±15s jitter"],
    status: "pending",
  },
  {
    id: 7,
    name: "Actions on Objectives",
    mitre: "TA0040",
    description: "Attacker completes their mission goals.",
    attackerAction: "Lateral movement to 192.168.1.50 (DB). Credential dump via LSASS. Data exfil.",
    defenderAction: "DLP enforcement. Segment DB access. Monitor LSASS access via Sysmon.",
    ioc: ["LSASS memory read by non-system process", "8.2 MB outbound to 203.0.113.99"],
    status: "pending",
  },
];

const statusConfig = {
  breached: { label: "BREACHED", color: "var(--cyber-red)", bg: "bg-[var(--cyber-red)]/10", border: "border-[var(--cyber-red)]/50", icon: "✗" },
  active:   { label: "ACTIVE",   color: "var(--cyber-amber)", bg: "bg-[var(--cyber-amber)]/10", border: "border-[var(--cyber-amber)]/50", icon: "⚡" },
  blocked:  { label: "BLOCKED",  color: "var(--cyber-green)", bg: "bg-[var(--cyber-green)]/10", border: "border-[var(--cyber-green)]/50", icon: "✓" },
  pending:  { label: "PENDING",  color: "var(--foreground)", bg: "bg-[var(--surface-3)]", border: "border-[var(--border-dim)]", icon: "○" },
};

export default function KillChainTracker() {
  const [selected, setSelected] = useState<KillChainStage>(STAGES[3]);
  const [tick, setTick] = useState(0);

  useEffect(() => {
    const id = setInterval(() => setTick((t) => t + 1), 1200);
    return () => clearInterval(id);
  }, []);

  return (
    <div className="flex flex-col gap-4">
      {/* Chain bar */}
      <div className="flex items-stretch gap-0 border border-[var(--border-dim)] rounded overflow-hidden">
        {STAGES.map((stage, i) => {
          const s = statusConfig[stage.status];
          const isSelected = selected.id === stage.id;
          const isPulse = stage.status === "active" && tick % 2 === 0;
          return (
            <button
              key={stage.id}
              onClick={() => setSelected(stage)}
              className={`flex-1 flex flex-col items-center justify-center px-2 py-3 gap-1 transition-all border-r border-[var(--border-dim)] last:border-r-0 font-mono group ${
                isSelected ? s.bg + " " + s.border.replace("border", "border-t-2") : "bg-[var(--surface-2)] hover:bg-[var(--surface-3)]"
              }`}
              style={isSelected ? { borderTopColor: s.color } : {}}
            >
              <span
                className="text-lg transition-all"
                style={{ color: isPulse ? s.color : s.color, filter: isPulse ? `drop-shadow(0 0 6px ${s.color})` : "none" }}
              >
                {s.icon}
              </span>
              <span className="text-[8px] uppercase tracking-wider text-center leading-tight" style={{ color: isSelected ? s.color : "rgba(255,255,255,0.3)" }}>
                {stage.name}
              </span>
              <span className="text-[7px] tracking-widest" style={{ color: `${s.color}80` }}>{s.label}</span>
            </button>
          );
        })}
      </div>

      {/* Stage detail */}
      {selected && (() => {
        const s = statusConfig[selected.status];
        return (
          <div className={`border rounded ${s.border} bg-[var(--surface-1)] overflow-hidden`}>
            {/* Header */}
            <div className="flex items-center justify-between gap-4 px-5 py-3 border-b border-[var(--border-dim)] bg-[var(--surface-2)]">
              <div className="flex items-center gap-3">
                <span className="font-mono text-xl" style={{ color: s.color }}>{s.icon}</span>
                <div>
                  <h3 className="font-bold text-sm text-[var(--foreground)]">
                    Stage {selected.id}: {selected.name}
                  </h3>
                  <p className="font-mono text-[10px] text-[var(--foreground)]/30">
                    MITRE ATT&CK · {selected.mitre}
                  </p>
                </div>
              </div>
              <span className={`font-mono text-[9px] font-bold px-2 py-1 rounded border ${s.border} ${s.bg}`} style={{ color: s.color }}>
                {s.label}
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-0 divide-y md:divide-y-0 md:divide-x divide-[var(--border-dim)]">
              {/* Left */}
              <div className="flex flex-col gap-4 p-5">
                <div>
                  <p className="font-mono text-[9px] uppercase tracking-widest text-[var(--foreground)]/30 mb-1.5">Description</p>
                  <p className="font-mono text-xs text-[var(--foreground)]/60 leading-relaxed">{selected.description}</p>
                </div>
                <div>
                  <p className="font-mono text-[9px] uppercase tracking-widest text-[var(--cyber-red)]/60 mb-1.5">⚔ Attacker Action</p>
                  <p className="font-mono text-xs text-[var(--foreground)]/70 leading-relaxed">{selected.attackerAction}</p>
                </div>
                <div>
                  <p className="font-mono text-[9px] uppercase tracking-widest text-[var(--cyber-green)]/60 mb-1.5">🛡 Defender Countermeasure</p>
                  <p className="font-mono text-xs text-[var(--foreground)]/70 leading-relaxed">{selected.defenderAction}</p>
                </div>
              </div>
              {/* Right — IOCs */}
              <div className="p-5 flex flex-col gap-3">
                <p className="font-mono text-[9px] uppercase tracking-widest text-[var(--cyber-amber)]/60">Indicators of Compromise</p>
                <ul className="flex flex-col gap-2">
                  {selected.ioc.map((ioc, i) => (
                    <li key={i} className="flex items-start gap-2">
                      <span className="font-mono text-[var(--cyber-amber)] text-xs mt-0.5 shrink-0">›</span>
                      <span className="font-mono text-xs text-[var(--foreground)]/60 leading-relaxed">{ioc}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        );
      })()}
    </div>
  );
}
