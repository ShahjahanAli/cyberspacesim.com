import TerminalConsole from "@/components/TerminalConsole";
import AlertFeed from "@/components/AlertFeed";
import Link from "next/link";

const scenarioMeta: Record<string, { title: string; briefing: string; difficulty: string; xp: number }> = {
  "1": {
    title: "Corporate Breach Drill",
    briefing:
      "Intel suggests a critical SMB service on 192.168.1.42 is unpatched. Your mission: gain initial access, escalate privileges, and exfiltrate the file `secret_report.pdf` from the target without triggering the IDS. You have 45 minutes.",
    difficulty: "Beginner",
    xp: 200,
  },
  "2": {
    title: "Ransomware Containment",
    briefing:
      "Ransomware has been detected spreading from host 192.168.1.11. Isolate the patient zero, stop lateral movement, recover encrypted files from backup, and restore normal operations before 09:00.",
    difficulty: "Intermediate",
    xp: 400,
  },
};

export default async function ScenarioActivePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const meta = scenarioMeta[id] ?? {
    title: `Scenario #${id}`,
    briefing: "Briefing classified. Proceed with available intelligence.",
    difficulty: "Unknown",
    xp: 0,
  };

  return (
    <div className="flex flex-col flex-1 overflow-auto px-6 py-6 gap-6 max-w-full">
      {/* Header */}
      <div className="flex items-start justify-between flex-wrap gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Link
              href="/scenarios"
              className="font-mono text-[10px] text-[var(--foreground)]/30 hover:text-[var(--cyber-green)] tracking-wider uppercase transition-colors"
            >
              ← Scenarios
            </Link>
            <span className="text-[var(--foreground)]/20">/</span>
            <span className="font-mono text-[10px] text-[var(--cyber-green)]/60 uppercase tracking-wider">
              Active
            </span>
          </div>
          <h1 className="text-2xl font-bold text-[var(--foreground)]">{meta.title}</h1>
        </div>
        <div className="flex gap-3 items-center">
          <span className="font-mono text-xs text-[var(--cyber-green)]">+{meta.xp} XP on completion</span>
          <button className="px-4 py-1.5 rounded border border-[var(--cyber-red)]/40 font-mono text-xs text-[var(--cyber-red)] hover:bg-[var(--cyber-red)]/10 transition-all uppercase tracking-wider">
            Abandon
          </button>
        </div>
      </div>

      {/* Briefing */}
      <div className="border border-[var(--cyber-blue)]/30 bg-[var(--cyber-blue)]/5 rounded p-5">
        <p className="font-mono text-[10px] uppercase tracking-widest text-[var(--cyber-blue)]/60 mb-2">
          Mission Briefing
        </p>
        <p className="font-mono text-sm text-[var(--foreground)]/70 leading-relaxed">{meta.briefing}</p>
      </div>

      {/* Main content */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 flex-1">
        {/* Terminal — 2 cols */}
        <div className="xl:col-span-2 h-96 min-h-0">
          <TerminalConsole />
        </div>

        {/* Alert feed */}
        <AlertFeed />
      </div>
    </div>
  );
}
