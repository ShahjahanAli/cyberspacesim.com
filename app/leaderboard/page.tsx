import Sidebar from "@/components/Sidebar";

interface Entry {
  rank: number;
  handle: string;
  country: string;
  xp: number;
  scenariosCompleted: number;
  streak: number;
  badge: string;
}

const leaderboard: Entry[] = [
  { rank: 1, handle: "gh0st0p3rat0r", country: "🇺🇸", xp: 48200, scenariosCompleted: 67, streak: 21, badge: "Elite" },
  { rank: 2, handle: "kr4kensh3ll", country: "🇩🇪", xp: 44500, scenariosCompleted: 61, streak: 14, badge: "Expert" },
  { rank: 3, handle: "nix_r3ap3r", country: "🇬🇧", xp: 41800, scenariosCompleted: 58, streak: 9, badge: "Expert" },
  { rank: 4, handle: "BytePhantom", country: "🇯🇵", xp: 38100, scenariosCompleted: 52, streak: 17, badge: "Advanced" },
  { rank: 5, handle: "vect0r_x", country: "🇧🇷", xp: 35600, scenariosCompleted: 48, streak: 6, badge: "Advanced" },
  { rank: 6, handle: "CipherWolf", country: "🇨🇦", xp: 31200, scenariosCompleted: 43, streak: 11, badge: "Advanced" },
  { rank: 7, handle: "0xC4f3", country: "🇳🇱", xp: 28900, scenariosCompleted: 39, streak: 4, badge: "Intermediate" },
  { rank: 8, handle: "darksector_7", country: "🇦🇺", xp: 25400, scenariosCompleted: 35, streak: 8, badge: "Intermediate" },
  { rank: 9, handle: "sk1llz_r34l", country: "🇮🇳", xp: 22100, scenariosCompleted: 31, streak: 3, badge: "Intermediate" },
  { rank: 10, handle: "netwr4ith", country: "🇫🇷", xp: 19700, scenariosCompleted: 27, streak: 12, badge: "Intermediate" },
];

const badgeConfig: Record<string, { color: string; bg: string; border: string }> = {
  Elite: { color: "text-[var(--cyber-green)]", bg: "bg-[var(--cyber-green)]/10", border: "border-[var(--cyber-green)]/30" },
  Expert: { color: "text-[var(--cyber-amber)]", bg: "bg-[var(--cyber-amber)]/10", border: "border-[var(--cyber-amber)]/30" },
  Advanced: { color: "text-[var(--cyber-blue)]", bg: "bg-[var(--cyber-blue)]/10", border: "border-[var(--cyber-blue)]/30" },
  Intermediate: { color: "text-[var(--foreground)]/40", bg: "bg-[var(--surface-3)]", border: "border-[var(--border-dim)]" },
};

const rankMedal = (rank: number) => {
  if (rank === 1) return "🥇";
  if (rank === 2) return "🥈";
  if (rank === 3) return "🥉";
  return `#${rank}`;
};

export default function LeaderboardPage() {
  return (
    <div className="flex flex-1 min-h-0">
      <Sidebar />

      <div className="flex flex-col flex-1 overflow-auto px-6 py-6 gap-6">
        {/* Header */}
        <div>
          <p className="font-mono text-[10px] tracking-[0.2em] uppercase text-[var(--cyber-green)]/50 mb-1">
            Operations
          </p>
          <h1 className="text-2xl font-bold text-[var(--foreground)]">Global Leaderboard</h1>
          <p className="text-sm text-[var(--foreground)]/40 font-mono mt-1">
            Top agents ranked by total XP · Updated every hour
          </p>
        </div>

        {/* Podium */}
        <div className="grid grid-cols-3 gap-4 max-w-xl">
          {leaderboard.slice(0, 3).map((entry) => {
            const b = badgeConfig[entry.badge];
            return (
              <div
                key={entry.rank}
                className={`flex flex-col items-center p-4 rounded border ${b.border} ${b.bg} gap-2`}
              >
                <span className="text-2xl">{rankMedal(entry.rank)}</span>
                <span className={`font-mono text-xs font-bold ${b.color}`}>{entry.handle}</span>
                <span className="font-mono text-[10px] text-[var(--foreground)]/30">{entry.xp.toLocaleString()} XP</span>
              </div>
            );
          })}
        </div>

        {/* Full table */}
        <div className="border border-[var(--border-dim)] rounded bg-[var(--surface-1)] overflow-hidden">
          <div className="grid grid-cols-[40px_1fr_80px_80px_70px_80px] px-4 py-2.5 bg-[var(--surface-2)] border-b border-[var(--border-dim)]">
            {["Rank", "Agent", "XP", "Scenarios", "Streak", "Rank"].map((h) => (
              <span key={h} className="font-mono text-[9px] tracking-widest uppercase text-[var(--foreground)]/30">
                {h}
              </span>
            ))}
          </div>

          <ul className="divide-y divide-[var(--border-dim)]">
            {leaderboard.map((entry) => {
              const b = badgeConfig[entry.badge];
              return (
                <li
                  key={entry.rank}
                  className="grid grid-cols-[40px_1fr_80px_80px_70px_80px] items-center px-4 py-3 hover:bg-[var(--surface-3)] transition-colors"
                >
                  <span className="font-mono text-sm text-[var(--foreground)]/40">
                    {rankMedal(entry.rank)}
                  </span>
                  <div className="flex items-center gap-2 min-w-0">
                    <span className="text-sm">{entry.country}</span>
                    <span className="font-mono text-sm text-[var(--foreground)]/80 truncate">{entry.handle}</span>
                  </div>
                  <span className="font-mono text-xs text-[var(--cyber-green)]">{entry.xp.toLocaleString()}</span>
                  <span className="font-mono text-xs text-[var(--foreground)]/40">{entry.scenariosCompleted}</span>
                  <span className="font-mono text-xs text-[var(--cyber-blue)]">{entry.streak}d 🔥</span>
                  <span className={`font-mono text-[9px] font-bold px-2 py-0.5 rounded border w-fit ${b.color} ${b.bg} ${b.border}`}>
                    {entry.badge}
                  </span>
                </li>
              );
            })}
          </ul>
        </div>
      </div>
    </div>
  );
}
