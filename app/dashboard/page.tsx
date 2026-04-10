import Sidebar from "@/components/Sidebar";
import StatCard from "@/components/StatCard";
import AlertFeed from "@/components/AlertFeed";
import TerminalConsole from "@/components/TerminalConsole";
import ThreatMap from "@/components/ThreatMap";
import EventLog from "@/components/EventLog";
import Link from "next/link";

const objectives = [
  { id: 1, label: "Enumerate target network", done: true },
  { id: 2, label: "Identify vulnerable services", done: true },
  { id: 3, label: "Gain initial foothold", done: true },
  { id: 4, label: "Escalate privileges to ADMIN", done: false },
  { id: 5, label: "Exfiltrate sensitive data", done: false },
];

export default function DashboardPage() {
  return (
    <div className="flex flex-1 min-h-0">
      <Sidebar />

      <div className="flex flex-col flex-1 overflow-auto px-6 py-6 gap-6 max-w-full">
        {/* Page header */}
        <div className="flex items-start justify-between gap-4 flex-wrap">
          <div>
            <p className="font-mono text-[10px] tracking-[0.2em] uppercase text-[var(--cyber-green)]/50 mb-1">
              Mission Control
            </p>
            <h1 className="text-2xl font-bold text-[var(--foreground)]">Dashboard</h1>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 border border-[var(--cyber-amber)]/30 bg-[var(--cyber-amber)]/5 rounded px-3 py-1.5">
              <span className="h-2 w-2 rounded-full bg-[var(--cyber-amber)] animate-pulse" />
              <span className="font-mono text-xs text-[var(--cyber-amber)]">SCENARIO ACTIVE</span>
            </div>
            <Link
              href="/scenarios"
              className="px-4 py-1.5 rounded border border-[var(--border-dim)] font-mono text-xs text-[var(--foreground)]/60 hover:border-[var(--cyber-green)] hover:text-[var(--cyber-green)] transition-all"
            >
              Switch Scenario
            </Link>
          </div>
        </div>

        {/* Stat cards */}
        <div className="grid grid-cols-2 xl:grid-cols-4 gap-4">
          <StatCard label="Score" value="840" sub="/ 1000 pts" accent="green" pulse />
          <StatCard label="Elapsed" value="00:14:22" sub="Corporate Breach Drill #3" accent="blue" />
          <StatCard label="Objectives" value="3 / 5" sub="2 remaining" accent="amber" pulse />
          <StatCard label="Threat Level" value="MEDIUM" sub="Elevated activity detected" accent="red" pulse />
        </div>

        {/* Main grid */}
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
          {/* Terminal — 2 cols */}
          <div className="xl:col-span-2 flex flex-col gap-4">
            <div className="h-80">
              <TerminalConsole />
            </div>

            {/* Objectives */}
            <div className="border border-[var(--border-dim)] rounded bg-[var(--surface-1)]">
              <div className="px-4 py-2.5 border-b border-[var(--border-dim)] bg-[var(--surface-2)]">
                <span className="font-mono text-xs tracking-widest uppercase text-[var(--cyber-blue)]">
                  Objectives
                </span>
              </div>
              <ul className="divide-y divide-[var(--border-dim)]">
                {objectives.map((obj) => (
                  <li key={obj.id} className="flex items-center gap-3 px-4 py-2.5">
                    <span
                      className={`h-4 w-4 rounded-sm border-2 flex items-center justify-center text-[10px] font-bold shrink-0 ${
                        obj.done
                          ? "border-[var(--cyber-green)] bg-[var(--cyber-green)]/10 text-[var(--cyber-green)]"
                          : "border-[var(--border-dim)] text-[var(--foreground)]/20"
                      }`}
                    >
                      {obj.done ? "✓" : ""}
                    </span>
                    <span
                      className={`font-mono text-xs ${
                        obj.done
                          ? "text-[var(--foreground)]/40 line-through"
                          : "text-[var(--foreground)]/80"
                      }`}
                    >
                      {obj.label}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Right column */}
          <div className="flex flex-col gap-4">
            {/* Network map */}
            <div className="h-64">
              <ThreatMap compact />
            </div>

            {/* Alert feed */}
            <AlertFeed />
          </div>
        </div>

        {/* Event log — full width */}
        <EventLog />
      </div>
    </div>
  );
}
