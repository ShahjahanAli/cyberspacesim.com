import EventLog from "@/components/EventLog";
import Sidebar from "@/components/Sidebar";
import StatCard from "@/components/StatCard";

export default function LogsPage() {
  return (
    <div className="flex flex-1 min-h-0">
      <Sidebar />
      <div className="flex flex-col flex-1 overflow-auto px-6 py-6 gap-6">
        {/* Header */}
        <div>
          <p className="font-mono text-[10px] tracking-[0.2em] uppercase text-[var(--cyber-green)]/50 mb-1">
            Tools
          </p>
          <h1 className="text-2xl font-bold text-[var(--foreground)]">Event Logs</h1>
          <p className="font-mono text-xs text-[var(--foreground)]/30 mt-1">
            Live sim telemetry · Filter by severity · Pause to inspect
          </p>
        </div>

        {/* Summary stats */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <StatCard label="Critical Events" value="3"   accent="red"   pulse />
          <StatCard label="Errors"          value="2"   accent="amber" />
          <StatCard label="Warnings"        value="4"   accent="amber" />
          <StatCard label="Total Events"    value="14"  accent="green" />
        </div>

        {/* Full-height log */}
        <div className="flex-1 min-h-0">
          <EventLog maxHeight="flex-1 min-h-[500px]" />
        </div>
      </div>
    </div>
  );
}
