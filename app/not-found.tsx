import Link from "next/link";

export default function NotFound() {
  return (
    <div className="flex flex-col flex-1 items-center justify-center px-6 py-24 text-center relative">
      {/* Grid bg */}
      <div className="cyber-grid absolute inset-0 pointer-events-none opacity-40" />

      {/* Error code */}
      <div className="relative mb-8">
        <p className="font-mono text-[120px] sm:text-[180px] font-black leading-none text-[var(--cyber-green)]/10 select-none">
          404
        </p>
        <div className="absolute inset-0 flex items-center justify-center">
          <p className="font-mono text-6xl sm:text-8xl font-black text-[var(--cyber-green)] text-glow-green flicker">
            404
          </p>
        </div>
      </div>

      {/* Terminal-style message */}
      <div className="w-full max-w-md rounded border border-[var(--border-dim)] bg-[var(--surface-1)] font-mono text-left text-xs overflow-hidden mb-8">
        <div className="flex items-center gap-1.5 px-4 py-2 bg-[var(--surface-2)] border-b border-[var(--border-dim)]">
          <span className="h-2 w-2 rounded-full bg-[var(--cyber-red)]" />
          <span className="h-2 w-2 rounded-full bg-[var(--cyber-amber)]" />
          <span className="h-2 w-2 rounded-full bg-[var(--cyber-green)]" />
          <span className="ml-2 text-[var(--foreground)]/20 text-[10px]">sim-shell</span>
        </div>
        <div className="p-4 space-y-1">
          <p className="text-[var(--foreground)]/40">agent@sim:~$ <span className="text-[var(--foreground)]/70">navigate /requested-path</span></p>
          <p className="text-[var(--cyber-red)]">Error 404: Route not found in simulation topology</p>
          <p className="text-[var(--foreground)]/40">Possible causes:</p>
          <p className="text-[var(--foreground)]/30 pl-2">· Path does not exist in this mission</p>
          <p className="text-[var(--foreground)]/30 pl-2">· Insufficient clearance level</p>
          <p className="text-[var(--foreground)]/30 pl-2">· Target host offline</p>
          <p className="text-[var(--cyber-green)]">agent@sim:~$<span className="terminal-cursor" /></p>
        </div>
      </div>

      <h1 className="text-xl font-bold text-[var(--foreground)] mb-2">Route not found</h1>
      <p className="text-sm text-[var(--foreground)]/40 mb-8 max-w-sm">
        The path you requested doesn't exist in the current simulation.
        Return to mission control or select a valid scenario.
      </p>

      <div className="flex flex-wrap gap-3 justify-center">
        <Link
          href="/"
          className="px-5 py-2 rounded border border-[var(--cyber-green)] text-[var(--cyber-green)] font-mono text-sm uppercase tracking-wider hover:bg-[var(--cyber-green)] hover:text-black transition-all"
        >
          Home Base
        </Link>
        <Link
          href="/dashboard"
          className="px-5 py-2 rounded border border-[var(--border-dim)] text-[var(--foreground)]/50 font-mono text-sm uppercase tracking-wider hover:border-[var(--cyber-green)] hover:text-[var(--cyber-green)] transition-all"
        >
          Dashboard
        </Link>
      </div>
    </div>
  );
}
