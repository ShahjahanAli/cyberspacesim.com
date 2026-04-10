import AdversaryEmulator from "@/components/AdversaryEmulator";
import Sidebar from "@/components/Sidebar";

export const metadata = {
  title: "Adversary Emulator — CyberSpace Sim",
};

export default function AdversaryPage() {
  return (
    <div className="flex h-[calc(100vh-56px)]">
      <Sidebar />
      <div className="flex-1 overflow-y-auto">
        <div className="px-6 py-6 max-w-7xl mx-auto flex flex-col gap-6">
          {/* Header */}
          <div className="flex flex-col gap-1">
            <div className="flex items-center gap-3">
              <span className="font-mono text-2xl">◆</span>
              <h1 className="font-mono text-xl font-bold text-[var(--foreground)]">Adversary Emulator</h1>
            </div>
            <p className="font-mono text-sm text-[var(--foreground)]/40">
              APT group profiling · TTP emulation · MITRE ATT&amp;CK mapped · Red Team simulation
            </p>
          </div>

          {/* Warning banner */}
          <div className="flex items-start gap-3 border border-[var(--cyber-red)]/30 rounded px-5 py-3 bg-[var(--cyber-red)]/5 font-mono text-xs">
            <span className="text-[var(--cyber-red)] text-lg shrink-0 mt-0.5">⚠</span>
            <div className="flex flex-col gap-0.5">
              <p className="text-[var(--cyber-red)] font-bold">Simulation Environment Only</p>
              <p className="text-[var(--foreground)]/40 leading-relaxed">
                All adversary emulations run in an isolated sandbox. No real network traffic is generated. Techniques and tools listed are for educational and red team training purposes only.
                This module simulates attacker behaviour to improve defensive posture through threat-informed defence.
              </p>
            </div>
          </div>

          <AdversaryEmulator />

          {/* MITRE ATT&CK attribution note */}
          <div className="border border-[var(--border-dim)] rounded px-5 py-3 bg-[var(--surface-2)] font-mono text-[9px] text-[var(--foreground)]/25 leading-relaxed">
            <strong className="text-[var(--foreground)]/40">Data sources:</strong> MITRE ATT&CK® v15 · CISA threat advisories · Mandiant APT reports · CrowdStrike Adversary Intelligence.
            APT group attributions are based on publicly available threat intelligence and carry inherent uncertainty. False-flag operations and shared tooling may complicate attribution.
          </div>
        </div>
      </div>
    </div>
  );
}
