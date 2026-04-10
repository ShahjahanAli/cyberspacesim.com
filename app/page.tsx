import Link from "next/link";

const features = [
  {
    icon: "◈",
    title: "Realistic Scenarios",
    description:
      "Hands-on simulations modelled on real-world breaches — ransomware, APT campaigns, insider threats, and more.",
    accent: "green",
  },
  {
    icon: "⬡",
    title: "Red & Blue Team Modes",
    description:
      "Switch between attacker and defender perspectives. Train both sides of the cyber battle.",
    accent: "blue",
  },
  {
    icon: "≡",
    title: "Live Threat Analytics",
    description:
      "Real-time event logs, alert feeds, and network maps to monitor and respond to simulated attacks.",
    accent: "amber",
  },
  {
    icon: ">_",
    title: "Integrated Terminal",
    description:
      "Execute commands in a sandboxed secure shell. Practise tools like nmap, metasploit, and more.",
    accent: "purple",
  },
  {
    icon: "▲",
    title: "Ranked Leaderboard",
    description:
      "Compete globally. Earn XP, climb ranks, and unlock advanced scenarios as your skills grow.",
    accent: "green",
  },
  {
    icon: "◉",
    title: "Threat Intelligence",
    description:
      "Access a curated database of CVEs, TTPs, and MITRE ATT&CK mappings for every scenario.",
    accent: "red",
  },
];

const accentText: Record<string, string> = {
  green: "text-[var(--cyber-green)]",
  blue: "text-[var(--cyber-blue)]",
  red: "text-[var(--cyber-red)]",
  amber: "text-[var(--cyber-amber)]",
  purple: "text-[var(--cyber-purple)]",
};
const accentBorder: Record<string, string> = {
  green: "border-[var(--cyber-green)]/30 hover:border-[var(--cyber-green)]/70",
  blue: "border-[var(--cyber-blue)]/30 hover:border-[var(--cyber-blue)]/70",
  red: "border-[var(--cyber-red)]/30 hover:border-[var(--cyber-red)]/70",
  amber: "border-[var(--cyber-amber)]/30 hover:border-[var(--cyber-amber)]/70",
  purple: "border-[var(--cyber-purple)]/30 hover:border-[var(--cyber-purple)]/70",
};

const stats = [
  { label: "Active Agents", value: "12,400+" },
  { label: "Scenarios", value: "80+" },
  { label: "CVEs Covered", value: "340+" },
  { label: "Avg. Session", value: "42 min" },
];

export default function HomePage() {
  return (
    <div className="flex flex-col flex-1 relative">
      {/* Grid background */}
      <div className="cyber-grid absolute inset-0 pointer-events-none opacity-60" />

      {/* ── HERO ── */}
      <section className="relative flex flex-col items-center justify-center text-center px-6 pt-28 pb-24 gap-8">
        {/* Badge */}
        <div className="inline-flex items-center gap-2 border border-[var(--cyber-green)]/30 bg-[var(--cyber-green)]/5 rounded-full px-4 py-1.5">
          <span className="h-1.5 w-1.5 rounded-full bg-[var(--cyber-green)] animate-pulse" />
          <span className="font-mono text-xs tracking-widest text-[var(--cyber-green)] uppercase">
            Simulation Platform Online
          </span>
        </div>

        {/* Headline */}
        <h1 className="max-w-3xl text-4xl sm:text-5xl md:text-6xl font-bold tracking-tight leading-tight">
          <span className="text-[var(--foreground)]">Master</span>{" "}
          <span className="text-[var(--cyber-green)] text-glow-green flicker">Cyber Warfare</span>
          <br />
          <span className="text-[var(--foreground)]">Before It Finds You</span>
        </h1>

        <p className="max-w-xl text-base sm:text-lg text-[var(--foreground)]/60 leading-relaxed">
          CyberSpaceSim puts you in the seat of both attacker and defender. Run live scenarios,
          analyse threats in real-time, and sharpen the skills that matter.
        </p>

        {/* CTA buttons */}
        <div className="flex flex-wrap items-center justify-center gap-4">
          <Link
            href="/dashboard"
            className="px-6 py-3 rounded border border-[var(--cyber-green)] bg-[var(--cyber-green)] text-black font-mono font-bold text-sm tracking-wider uppercase hover:bg-[var(--cyber-green-dim)] transition-all glow-green"
          >
            Launch Simulation
          </Link>
          <Link
            href="/scenarios"
            className="px-6 py-3 rounded border border-[var(--border-dim)] font-mono text-sm tracking-wider uppercase text-[var(--foreground)]/70 hover:border-[var(--cyber-green)] hover:text-[var(--cyber-green)] transition-all"
          >
            Browse Scenarios
          </Link>
        </div>

        {/* Terminal preview snippet */}
        <div className="mt-4 w-full max-w-lg rounded border border-[var(--border-dim)] bg-[var(--surface-1)] font-mono text-left text-xs overflow-hidden">
          <div className="flex items-center gap-1.5 px-4 py-2 bg-[var(--surface-2)] border-b border-[var(--border-dim)]">
            <span className="h-2 w-2 rounded-full bg-[var(--cyber-red)]" />
            <span className="h-2 w-2 rounded-full bg-[var(--cyber-amber)]" />
            <span className="h-2 w-2 rounded-full bg-[var(--cyber-green)]" />
            <span className="ml-2 text-[var(--foreground)]/20 text-[10px]">sim-shell</span>
          </div>
          <div className="p-4 space-y-1">
            <p className="text-[var(--foreground)]/40">CyberSpaceSim v2.4.1 — Tactical Security Simulation Platform</p>
            <p className="text-[var(--foreground)]/40">Initializing secure shell environment...</p>
            <p className="text-[var(--foreground)]/40">Loading threat intelligence modules......... [<span className="text-[var(--cyber-green)]">OK</span>]</p>
            <p className="text-[var(--cyber-green)]">agent@sim:~$ <span className="text-[var(--foreground)]/70">scan</span></p>
            <p className="text-[var(--foreground)]/40">Host 192.168.1.42 — OPEN [smb:445] <span className="text-[var(--cyber-amber)]">⚠ VULNERABLE</span></p>
            <p className="text-[var(--cyber-green)]">agent@sim:~$<span className="terminal-cursor" /></p>
          </div>
        </div>
      </section>

      {/* ── STATS BAR ── */}
      <section className="border-y border-[var(--border-dim)] bg-[var(--surface-1)]/60 backdrop-blur-sm">
        <div className="mx-auto max-w-5xl grid grid-cols-2 sm:grid-cols-4 divide-x divide-y sm:divide-y-0 divide-[var(--border-dim)]">
          {stats.map(({ label, value }) => (
            <div key={label} className="flex flex-col items-center py-8 px-4 gap-1">
              <span className="font-mono text-2xl font-bold text-[var(--cyber-green)] text-glow-green">{value}</span>
              <span className="font-mono text-[10px] tracking-widest uppercase text-[var(--foreground)]/40">{label}</span>
            </div>
          ))}
        </div>
      </section>

      {/* ── FEATURES ── */}
      <section className="relative mx-auto max-w-6xl w-full px-6 py-24">
        <div className="text-center mb-14">
          <p className="font-mono text-xs tracking-[0.3em] uppercase text-[var(--cyber-green)]/60 mb-3">
            Platform Capabilities
          </p>
          <h2 className="text-3xl sm:text-4xl font-bold text-[var(--foreground)]">
            Everything You Need to{" "}
            <span className="text-[var(--cyber-blue)] text-glow-blue">Level Up</span>
          </h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {features.map(({ icon, title, description, accent }) => (
            <div
              key={title}
              className={`relative rounded border ${accentBorder[accent]} bg-[var(--surface-2)] p-6 flex flex-col gap-3 transition-all group`}
            >
              <span className={`font-mono text-2xl ${accentText[accent]}`}>{icon}</span>
              <h3 className="font-bold text-base text-[var(--foreground)]">{title}</h3>
              <p className="text-sm text-[var(--foreground)]/50 leading-relaxed">{description}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── CTA BAND ── */}
      <section className="relative border-t border-[var(--border-dim)] bg-[var(--surface-1)] px-6 py-20 text-center flex flex-col items-center gap-6">
        <p className="font-mono text-xs tracking-[0.3em] uppercase text-[var(--cyber-green)]/60">
          Ready, Agent?
        </p>
        <h2 className="text-3xl sm:text-4xl font-bold max-w-2xl text-[var(--foreground)]">
          Your First Simulation is{" "}
          <span className="text-[var(--cyber-green)] text-glow-green">Free</span>
        </h2>
        <p className="max-w-md text-[var(--foreground)]/50 text-sm leading-relaxed">
          No credit card. No setup. Drop into a live scenario and start learning in under 60 seconds.
        </p>
        <Link
          href="/scenarios"
          className="mt-2 px-8 py-3 rounded border border-[var(--cyber-green)] bg-[var(--cyber-green)] text-black font-mono font-bold text-sm tracking-wider uppercase hover:bg-[var(--cyber-green-dim)] transition-all glow-green"
        >
          Start Free Scenario
        </Link>
      </section>

      {/* ── FOOTER ── */}
      <footer className="border-t border-[var(--border-dim)] bg-[var(--surface-1)] px-6 py-6 flex flex-col sm:flex-row items-center justify-between gap-3">
        <span className="font-mono text-xs text-[var(--cyber-green)] tracking-widest">
          CyberSpace<span className="text-[var(--cyber-blue)]">Sim</span>
        </span>
        <p className="font-mono text-[10px] text-[var(--foreground)]/20 tracking-wider">
          FOR EDUCATIONAL USE ONLY — ALL SIMULATIONS ARE SANDBOXED
        </p>
        <span className="font-mono text-[10px] text-[var(--foreground)]/20">v2.4.1</span>
      </footer>
    </div>
  );
}
