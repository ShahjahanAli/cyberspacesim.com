"use client";

import { useState } from "react";

type Sophistication = "Nation-State" | "Advanced" | "Intermediate";

interface TTP {
  id: string;
  tactic: string;
  technique: string;
  tool: string;
  mitre: string;
}

interface APTGroup {
  id: string;
  name: string;
  alias: string;
  nation: string;
  flag: string;
  sophistication: Sophistication;
  targets: string[];
  motivation: string;
  active: string;
  description: string;
  primaryTools: string[];
  ttps: TTP[];
  color: string;
}

const GROUPS: APTGroup[] = [
  {
    id: "apt28",
    name: "APT28",
    alias: "Fancy Bear / Sofacy",
    nation: "Russia",
    flag: "🇷🇺",
    sophistication: "Nation-State",
    targets: ["Government", "Military", "Energy", "Media"],
    motivation: "Intelligence collection, political disruption",
    active: "2004 – present",
    description:
      "APT28 is a sophisticated Russian GRU-linked threat group known for aggressive espionage, disinformation campaigns, and destructive attacks. Responsible for DNC breach (2016), NotPetya (2017), and Olympic Destroyer.",
    primaryTools: ["X-Agent", "Sofacy", "Zebrocy", "Mimikatz", "Cobalt Strike"],
    color: "var(--cyber-red)",
    ttps: [
      { id: "t1", tactic: "Initial Access",    technique: "Spearphishing Link",             tool: "X-Agent mailer",   mitre: "T1566.002" },
      { id: "t2", tactic: "Execution",         technique: "Scripting — PowerShell",          tool: "X-Agent",          mitre: "T1059.001" },
      { id: "t3", tactic: "Persistence",       technique: "Scheduled Task / Job",            tool: "Windows schtasks", mitre: "T1053.005" },
      { id: "t4", tactic: "Credential Access", technique: "OS Credential Dumping (LSASS)",  tool: "Mimikatz",         mitre: "T1003.001" },
      { id: "t5", tactic: "Lateral Movement",  technique: "Pass the Hash",                   tool: "Mimikatz / SMB",   mitre: "T1550.002" },
      { id: "t6", tactic: "C2",               technique: "Encrypted Channel — HTTPS",        tool: "X-Agent C2",       mitre: "T1573.002" },
      { id: "t7", tactic: "Exfiltration",      technique: "Exfil Over C2 Channel",           tool: "X-Agent",          mitre: "T1041" },
    ],
  },
  {
    id: "apt29",
    name: "APT29",
    alias: "Cozy Bear / Midnight Blizzard",
    nation: "Russia",
    flag: "🇷🇺",
    sophistication: "Nation-State",
    targets: ["Government", "Think Tanks", "Healthcare", "Tech"],
    motivation: "Long-term intelligence collection, supply-chain compromise",
    active: "2008 – present",
    description:
      "APT29 is Russia's SVR cyber arm. Known for extreme operational security, living-off-the-land techniques, and the SolarWinds Orion supply chain attack (2020). Highly patient adversary with dwell times measured in years.",
    primaryTools: ["SUNBURST", "TEARDROP", "WellMess", "GraphicalNeutrino", "GoldMax"],
    color: "var(--cyber-purple)",
    ttps: [
      { id: "t1", tactic: "Initial Access",    technique: "Supply Chain Compromise",         tool: "SolarWinds Orion", mitre: "T1195.002" },
      { id: "t2", tactic: "Execution",         technique: "Trusted Developer Utilities",     tool: "MSBuild.exe",      mitre: "T1127.001" },
      { id: "t3", tactic: "Defense Evasion",   technique: "Masquerading — Match Legit Name", tool: "SUNBURST DLL",     mitre: "T1036.005" },
      { id: "t4", tactic: "Discovery",         technique: "Domain Trust Discovery",           tool: "BloodHound",       mitre: "T1482" },
      { id: "t5", tactic: "Lateral Movement",  technique: "Remote Services — WMI",           tool: "WMImplant",        mitre: "T1021.006" },
      { id: "t6", tactic: "C2",               technique: "Domain Generation Algorithm",      tool: "GoldMax",          mitre: "T1568.002" },
      { id: "t7", tactic: "Exfiltration",      technique: "Scheduled Transfer",               tool: "TEARDROP",         mitre: "T1029" },
    ],
  },
  {
    id: "lazarus",
    name: "Lazarus Group",
    alias: "HIDDEN COBRA / ZINC",
    nation: "North Korea",
    flag: "🇰🇵",
    sophistication: "Nation-State",
    targets: ["Finance", "Crypto", "Defense", "Media"],
    motivation: "Revenue generation, espionage, sabotage",
    active: "2009 – present",
    description:
      "Lazarus Group is North Korea's premier offensive cyber unit. Known for the Sony Pictures hack (2014), WannaCry ransomware (2017), and over $3B in cryptocurrency theft. Unique dual-mission: espionage and financial crime.",
    primaryTools: ["BLINDINGCAN", "HOPLIGHT", "ELECTRICFISH", "AppleJeus", "DTrack"],
    color: "var(--cyber-amber)",
    ttps: [
      { id: "t1", tactic: "Initial Access",    technique: "Phishing — Job Lure (LinkedIn)",  tool: "AppleJeus dropper", mitre: "T1566.001" },
      { id: "t2", tactic: "Execution",         technique: "User Execution — Malicious File", tool: "BLINDINGCAN",       mitre: "T1204.002" },
      { id: "t3", tactic: "Persistence",       technique: "Boot/Logon Autostart — Winlogon",tool: "DTrack",            mitre: "T1547.004" },
      { id: "t4", tactic: "Impact",            technique: "Data Destruction",                tool: "Destover wiper",   mitre: "T1485" },
      { id: "t5", tactic: "Collection",        technique: "Clipboard Data",                   tool: "HOPLIGHT",         mitre: "T1115" },
      { id: "t6", tactic: "C2",               technique: "Multi-hop Proxy",                  tool: "ELECTRICFISH",     mitre: "T1090.003" },
      { id: "t7", tactic: "Exfiltration",      technique: "Crypto wallet draining",           tool: "AppleJeus",        mitre: "T1657" },
    ],
  },
  {
    id: "apt41",
    name: "APT41",
    alias: "Double Dragon / Winnti",
    nation: "China",
    flag: "🇨🇳",
    sophistication: "Nation-State",
    targets: ["Healthcare", "Telecom", "Gaming", "Government"],
    motivation: "Dual espionage + financial crime (unique in APT landscape)",
    active: "2012 – present",
    description:
      "APT41 uniquely conducts both state-sponsored espionage and financially motivated cybercrime. Known for supply chain attacks on software vendors, ManageEngine exploits, and sophisticated rootkits.",
    primaryTools: ["MESSAGETAP", "PlugX", "ShadowPad", "Winnti rootkit", "Derusbi"],
    color: "var(--cyber-blue)",
    ttps: [
      { id: "t1", tactic: "Initial Access",    technique: "Exploit Public-Facing App",       tool: "CVE-2021-44228",   mitre: "T1190" },
      { id: "t2", tactic: "Execution",         technique: "Shared Modules",                  tool: "ShadowPad",        mitre: "T1129" },
      { id: "t3", tactic: "Persistence",       technique: "Rootkit — UEFI implant",          tool: "CosmicStrand",     mitre: "T1542.001" },
      { id: "t4", tactic: "Defense Evasion",   technique: "Rootkit — Kernel driver signing", tool: "Winnti rootkit",   mitre: "T1014" },
      { id: "t5", tactic: "Discovery",         technique: "Network Sniffing",                 tool: "MESSAGETAP",       mitre: "T1040" },
      { id: "t6", tactic: "C2",               technique: "Protocol Tunnelling over DNS",      tool: "PlugX",            mitre: "T1572" },
      { id: "t7", tactic: "Impact",            technique: "Financial fraud via supply chain", tool: "Winnti game mod",  mitre: "T1195.001" },
    ],
  },
];

const sophisticationConfig: Record<Sophistication, { color: string; bg: string; border: string }> = {
  "Nation-State": { color: "text-[var(--cyber-red)]",    bg: "bg-[var(--cyber-red)]/10",    border: "border-[var(--cyber-red)]/30" },
  "Advanced":     { color: "text-[var(--cyber-amber)]",  bg: "bg-[var(--cyber-amber)]/10",  border: "border-[var(--cyber-amber)]/30" },
  "Intermediate": { color: "text-[var(--cyber-blue)]",   bg: "bg-[var(--cyber-blue)]/10",   border: "border-[var(--cyber-blue)]/30" },
};

export default function AdversaryEmulator() {
  const [selected, setSelected] = useState<APTGroup>(GROUPS[0]);
  const [simulating, setSimulating] = useState(false);
  const [simStep, setSimStep] = useState(-1);

  function startSim() {
    setSimulating(true);
    setSimStep(0);
    let step = 0;
    const id = setInterval(() => {
      step++;
      setSimStep(step);
      if (step >= selected.ttps.length - 1) clearInterval(id);
    }, 900);
  }

  const soph = sophisticationConfig[selected.sophistication];

  return (
    <div className="flex flex-col gap-6">
      {/* Group selector */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {GROUPS.map((g) => (
          <button
            key={g.id}
            onClick={() => { setSelected(g); setSimulating(false); setSimStep(-1); }}
            className={`flex flex-col items-start gap-2 p-4 rounded border transition-all text-left ${
              selected.id === g.id
                ? "border-opacity-70 bg-opacity-10"
                : "border-[var(--border-dim)] bg-[var(--surface-2)] hover:bg-[var(--surface-3)]"
            }`}
            style={selected.id === g.id ? { borderColor: g.color, background: g.color + "12" } : {}}
          >
            <span className="text-xl">{g.flag}</span>
            <div>
              <p className="font-mono text-xs font-bold" style={{ color: selected.id === g.id ? g.color : "rgba(255,255,255,0.6)" }}>
                {g.name}
              </p>
              <p className="font-mono text-[9px] text-[var(--foreground)]/30 truncate">{g.alias}</p>
            </div>
          </button>
        ))}
      </div>

      {/* Profile + TTP grid */}
      <div className="grid grid-cols-1 xl:grid-cols-5 gap-4">
        {/* Profile panel */}
        <div className="xl:col-span-2 flex flex-col border border-[var(--border-dim)] rounded bg-[var(--surface-1)] overflow-hidden">
          <div className="px-4 py-3 border-b border-[var(--border-dim)] bg-[var(--surface-2)] flex items-center gap-2">
            <span className="text-xl">{selected.flag}</span>
            <div>
              <p className="font-mono text-sm font-bold" style={{ color: selected.color }}>{selected.name}</p>
              <p className="font-mono text-[10px] text-[var(--foreground)]/30">{selected.alias}</p>
            </div>
          </div>
          <div className="flex flex-col gap-4 p-5">
            <p className="font-mono text-xs text-[var(--foreground)]/60 leading-relaxed">{selected.description}</p>

            <div className="grid grid-cols-2 gap-3">
              {[
                { label: "Sophistication", value: selected.sophistication, color: selected.color },
                { label: "Active Since", value: selected.active, color: "var(--foreground)" },
                { label: "Motivation", value: selected.motivation, color: "var(--cyber-amber)" },
                { label: "Origin", value: selected.nation, color: "var(--foreground)" },
              ].map(({ label, value, color }) => (
                <div key={label} className="flex flex-col gap-0.5">
                  <p className="font-mono text-[8px] uppercase tracking-widest text-[var(--foreground)]/30">{label}</p>
                  <p className="font-mono text-[10px] leading-snug" style={{ color }}>{value}</p>
                </div>
              ))}
            </div>

            <div>
              <p className="font-mono text-[8px] uppercase tracking-widest text-[var(--foreground)]/30 mb-2">Primary Targets</p>
              <div className="flex flex-wrap gap-1.5">
                {selected.targets.map((t) => (
                  <span key={t} className="font-mono text-[9px] px-2 py-0.5 rounded border border-[var(--border-dim)] text-[var(--foreground)]/40">
                    {t}
                  </span>
                ))}
              </div>
            </div>

            <div>
              <p className="font-mono text-[8px] uppercase tracking-widest text-[var(--foreground)]/30 mb-2">Known Tools</p>
              <div className="flex flex-wrap gap-1.5">
                {selected.primaryTools.map((t) => (
                  <span key={t} className="font-mono text-[9px] px-2 py-0.5 rounded border text-xs" style={{ borderColor: selected.color + "50", color: selected.color + "cc", background: selected.color + "10" }}>
                    {t}
                  </span>
                ))}
              </div>
            </div>

            <button
              onClick={startSim}
              disabled={simulating}
              className="mt-auto w-full py-2 rounded border font-mono text-xs tracking-wider uppercase transition-all"
              style={
                simulating
                  ? { borderColor: "var(--border-dim)", color: "rgba(255,255,255,0.2)", cursor: "not-allowed" }
                  : { borderColor: selected.color, color: selected.color, background: selected.color + "18" }
              }
            >
              {simulating ? "Simulation Running..." : `Simulate ${selected.name} Attack`}
            </button>
          </div>
        </div>

        {/* TTP chain */}
        <div className="xl:col-span-3 flex flex-col border border-[var(--border-dim)] rounded bg-[var(--surface-1)] overflow-hidden">
          <div className="px-4 py-2.5 border-b border-[var(--border-dim)] bg-[var(--surface-2)] flex items-center justify-between">
            <span className="font-mono text-xs tracking-widest uppercase" style={{ color: selected.color }}>
              TTP Execution Chain
            </span>
            <span className="font-mono text-[9px] text-[var(--foreground)]/30">MITRE ATT&CK mapped</span>
          </div>
          <div className="flex flex-col divide-y divide-[var(--border-dim)] overflow-y-auto">
            {selected.ttps.map((ttp, i) => {
              const isActive = simulating && i === simStep;
              const isPast   = simulating && i < simStep;
              return (
                <div
                  key={ttp.id}
                  className={`flex items-center gap-4 px-4 py-3 transition-all ${
                    isActive ? "bg-opacity-10" : isPast ? "opacity-40" : ""
                  }`}
                  style={isActive ? { background: selected.color + "15" } : {}}
                >
                  {/* Step number */}
                  <span
                    className="shrink-0 h-6 w-6 rounded-full border flex items-center justify-center font-mono text-[10px] font-bold"
                    style={{
                      borderColor: isActive ? selected.color : isPast ? selected.color + "40" : "var(--border-dim)",
                      color: isActive ? selected.color : isPast ? selected.color + "60" : "rgba(255,255,255,0.2)",
                      background: isActive ? selected.color + "20" : "transparent",
                      boxShadow: isActive ? `0 0 8px ${selected.color}` : "none",
                    }}
                  >
                    {isPast ? "✓" : i + 1}
                  </span>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-mono text-[9px] px-1.5 py-0.5 rounded" style={{ color: selected.color, background: selected.color + "18" }}>
                        {ttp.tactic}
                      </span>
                      <span className="font-mono text-xs text-[var(--foreground)]/70">{ttp.technique}</span>
                    </div>
                    <div className="flex gap-3 mt-1">
                      <span className="font-mono text-[9px] text-[var(--cyber-blue)]/60">Tool: {ttp.tool}</span>
                      <span className="font-mono text-[9px] text-[var(--foreground)]/25">{ttp.mitre}</span>
                    </div>
                  </div>

                  {isActive && (
                    <span className="shrink-0 font-mono text-[9px] animate-pulse" style={{ color: selected.color }}>
                      EXECUTING
                    </span>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
