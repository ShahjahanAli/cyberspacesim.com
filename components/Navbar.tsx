"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { Show, SignInButton, UserButton } from "@clerk/nextjs";

const navLinks = [
  { href: "/", label: "Home" },
  { href: "/dashboard", label: "Dashboard" },
  { href: "/scenarios", label: "Scenarios" },
  { href: "/leaderboard", label: "Leaderboard" },
];

export default function Navbar() {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 border-b border-[var(--border-dim)] bg-[var(--surface-1)]/90 backdrop-blur-md">
      <nav className="mx-auto flex max-w-7xl items-center justify-between px-6 py-3">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2 group">
          <span className="relative flex h-8 w-8 items-center justify-center rounded border border-[var(--cyber-green)] bg-[var(--surface-2)]">
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.5"
              className="h-4 w-4 text-[var(--cyber-green)] group-hover:text-glow-green transition-all"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M12 2.25c-5.385 0-9.75 4.365-9.75 9.75s4.365 9.75 9.75 9.75 9.75-4.365 9.75-9.75S17.385 2.25 12 2.25z"
              />
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M9 12.75l2.25 2.25L15 10.5"
              />
            </svg>
            <span className="absolute inset-0 rounded animate-ping opacity-20 bg-[var(--cyber-green)]" />
          </span>
          <span className="font-mono text-sm font-bold tracking-widest text-[var(--cyber-green)] text-glow-green uppercase">
            CyberSpace<span className="text-[var(--cyber-blue)]">Sim</span>
          </span>
        </Link>

        {/* Desktop links */}
        <ul className="hidden md:flex items-center gap-1">
          {navLinks.map(({ href, label }) => {
            const active = pathname === href;
            return (
              <li key={href}>
                <Link
                  href={href}
                  className={`px-4 py-1.5 rounded font-mono text-xs tracking-wider uppercase transition-all ${
                    active
                      ? "bg-[var(--cyber-green)] text-black font-bold"
                      : "text-[var(--foreground)] hover:text-[var(--cyber-green)] hover:bg-[var(--surface-3)]"
                  }`}
                >
                  {label}
                </Link>
              </li>
            );
          })}
        </ul>

        {/* Actions */}
        <div className="hidden md:flex items-center gap-3">
          <span className="flex items-center gap-1.5 font-mono text-xs text-[var(--cyber-green)]">
            <span className="h-2 w-2 rounded-full bg-[var(--cyber-green)] animate-pulse" />
            SYS: ONLINE
          </span>

          <Show when="signed-out">
            <SignInButton mode="redirect">
              <button className="px-4 py-1.5 rounded border border-[var(--cyber-green)] font-mono text-xs tracking-wider uppercase text-[var(--cyber-green)] hover:bg-[var(--cyber-green)] hover:text-black transition-all">
                Sign In
              </button>
            </SignInButton>
          </Show>

          <Show when="signed-in">
            <Link
              href="/dashboard"
              className="px-4 py-1.5 rounded border border-[var(--cyber-green)] font-mono text-xs tracking-wider uppercase text-[var(--cyber-green)] hover:bg-[var(--cyber-green)] hover:text-black transition-all"
            >
              Launch Sim
            </Link>
            <UserButton
              appearance={{
                variables: {
                  colorPrimary: "#00ff88",
                  colorBackground: "#0d1f30",
                  colorText: "#e2e8f0",
                  fontFamily: "var(--font-geist-mono), monospace",
                },
                elements: {
                  avatarBox: "ring-1 ring-[var(--cyber-green)] rounded-full",
                  userButtonPopoverCard: "border border-[#1a3a55] bg-[#0d1f30]",
                  userButtonPopoverActionButton: "text-slate-300 hover:text-[#00ff88] font-mono text-xs",
                  userButtonPopoverFooter: "hidden",
                },
              }}
            />
          </Show>
        </div>

        {/* Mobile toggle */}
        <button
          className="md:hidden text-[var(--cyber-green)] p-1"
          onClick={() => setMobileOpen((v) => !v)}
          aria-label="Toggle menu"
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-6 w-6">
            {mobileOpen ? (
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            ) : (
              <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
            )}
          </svg>
        </button>
      </nav>

      {/* Mobile menu */}
      {mobileOpen && (
        <div className="md:hidden border-t border-[var(--border-dim)] bg-[var(--surface-1)] px-6 py-4 flex flex-col gap-2">
          {navLinks.map(({ href, label }) => (
            <Link
              key={href}
              href={href}
              onClick={() => setMobileOpen(false)}
              className={`px-3 py-2 rounded font-mono text-xs tracking-wider uppercase transition-all ${
                pathname === href
                  ? "bg-[var(--cyber-green)] text-black font-bold"
                  : "text-[var(--foreground)] hover:text-[var(--cyber-green)]"
              }`}
            >
              {label}
            </Link>
          ))}
          <div className="pt-2 border-t border-[var(--border-dim)] flex items-center gap-3">
            <Show when="signed-out">
              <SignInButton mode="redirect">
                <button className="w-full px-3 py-2 rounded border border-[var(--cyber-green)] font-mono text-xs tracking-wider uppercase text-[var(--cyber-green)] hover:bg-[var(--cyber-green)] hover:text-black transition-all">
                  Sign In
                </button>
              </SignInButton>
            </Show>
            <Show when="signed-in">
              <UserButton />
            </Show>
          </div>
        </div>
      )}
    </header>
  );
}
