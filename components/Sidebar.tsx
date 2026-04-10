"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const sideLinks = [
  {
    section: "Operations",
    items: [
      { href: "/dashboard", label: "Mission Control", icon: "⬡" },
      { href: "/scenarios", label: "Scenarios", icon: "◈" },
      { href: "/leaderboard", label: "Leaderboard", icon: "▲" },
    ],
  },
  {
    section: "Tools",
    items: [
      { href: "/dashboard/terminal", label: "Terminal", icon: ">" },
      { href: "/dashboard/threat-map", label: "Threat Map", icon: "◉" },
      { href: "/dashboard/logs", label: "Event Logs", icon: "≡" },
    ],
  },
  {
    section: "Intelligence",
    items: [
      { href: "/dashboard/ai-intel", label: "AI Threat Engine", icon: "⬢" },
      { href: "/dashboard/kill-chain", label: "Kill Chain", icon: "⛓" },
      { href: "/dashboard/zero-trust", label: "Zero Trust", icon: "⊛" },
      { href: "/adversary", label: "Adversary Sim", icon: "◆" },
      { href: "/dashboard/quantum", label: "Quantum Risk", icon: "∞" },
      { href: "/dashboard/behavior", label: "Behavior AI", icon: "∿" },
    ],
  },
];

export default function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="hidden lg:flex flex-col w-56 shrink-0 border-r border-[var(--border-dim)] bg-[var(--surface-1)] min-h-full py-6 px-3 gap-6">
      {sideLinks.map(({ section, items }) => (
        <div key={section}>
          <p className="px-3 mb-2 font-mono text-[10px] tracking-[0.2em] uppercase text-[var(--cyber-green)]/50">
            {section}
          </p>
          <ul className="flex flex-col gap-0.5">
            {items.map(({ href, label, icon }) => {
              const active = pathname === href || pathname.startsWith(href + "/");
              return (
                <li key={href}>
                  <Link
                    href={href}
                    className={`flex items-center gap-3 px-3 py-2 rounded font-mono text-xs tracking-wide transition-all ${
                      active
                        ? "bg-[var(--cyber-green)]/10 text-[var(--cyber-green)] border-l-2 border-[var(--cyber-green)]"
                        : "text-[var(--foreground)]/60 hover:text-[var(--cyber-green)] hover:bg-[var(--surface-3)]"
                    }`}
                  >
                    <span className="w-4 text-center opacity-80">{icon}</span>
                    {label}
                  </Link>
                </li>
              );
            })}
          </ul>
        </div>
      ))}

      {/* Status panel */}
      <div className="mt-auto border border-[var(--border-dim)] rounded p-3 bg-[var(--surface-2)]">
        <p className="font-mono text-[10px] text-[var(--cyber-green)]/50 uppercase tracking-widest mb-2">Agent Status</p>
        <div className="flex flex-col gap-1.5">
          {[
            { label: "Threat Level", value: "LOW", color: "var(--cyber-green)" },
            { label: "Active Sims", value: "2", color: "var(--cyber-blue)" },
            { label: "Alerts", value: "0", color: "var(--cyber-amber)" },
          ].map(({ label, value, color }) => (
            <div key={label} className="flex justify-between items-center">
              <span className="font-mono text-[10px] text-[var(--foreground)]/40">{label}</span>
              <span className="font-mono text-[10px] font-bold" style={{ color }}>{value}</span>
            </div>
          ))}
        </div>
      </div>
    </aside>
  );
}
