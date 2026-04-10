interface StatCardProps {
  label: string;
  value: string | number;
  sub?: string;
  accent?: "green" | "blue" | "red" | "amber" | "purple";
  pulse?: boolean;
}

const accentMap = {
  green: {
    border: "border-[var(--cyber-green)]/40",
    text: "text-[var(--cyber-green)]",
    bg: "bg-[var(--cyber-green)]/5",
    dot: "bg-[var(--cyber-green)]",
  },
  blue: {
    border: "border-[var(--cyber-blue)]/40",
    text: "text-[var(--cyber-blue)]",
    bg: "bg-[var(--cyber-blue)]/5",
    dot: "bg-[var(--cyber-blue)]",
  },
  red: {
    border: "border-[var(--cyber-red)]/40",
    text: "text-[var(--cyber-red)]",
    bg: "bg-[var(--cyber-red)]/5",
    dot: "bg-[var(--cyber-red)]",
  },
  amber: {
    border: "border-[var(--cyber-amber)]/40",
    text: "text-[var(--cyber-amber)]",
    bg: "bg-[var(--cyber-amber)]/5",
    dot: "bg-[var(--cyber-amber)]",
  },
  purple: {
    border: "border-[var(--cyber-purple)]/40",
    text: "text-[var(--cyber-purple)]",
    bg: "bg-[var(--cyber-purple)]/5",
    dot: "bg-[var(--cyber-purple)]",
  },
};

export default function StatCard({ label, value, sub, accent = "green", pulse }: StatCardProps) {
  const a = accentMap[accent];
  return (
    <div className={`relative rounded border ${a.border} ${a.bg} p-4 flex flex-col gap-1 overflow-hidden`}>
      {/* corner decoration */}
      <span className={`absolute top-0 left-0 w-6 h-px ${a.dot} opacity-60`} />
      <span className={`absolute top-0 left-0 w-px h-6 ${a.dot} opacity-60`} />
      <span className={`absolute bottom-0 right-0 w-6 h-px ${a.dot} opacity-60`} />
      <span className={`absolute bottom-0 right-0 w-px h-6 ${a.dot} opacity-60`} />

      <div className="flex items-center gap-2">
        {pulse && (
          <span className={`h-1.5 w-1.5 rounded-full ${a.dot} animate-pulse`} />
        )}
        <p className="font-mono text-[10px] tracking-[0.15em] uppercase text-[var(--foreground)]/40">{label}</p>
      </div>
      <p className={`font-mono text-2xl font-bold ${a.text}`}>{value}</p>
      {sub && <p className="font-mono text-[10px] text-[var(--foreground)]/30">{sub}</p>}
    </div>
  );
}
