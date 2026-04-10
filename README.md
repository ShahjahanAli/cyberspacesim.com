# CyberSpaceSim

**Tactical Cyber Security Simulation Web Application**

A dark-themed, interactive cyber security training platform built with Next.js 16, React 19, and TailwindCSS v4. Train as both attacker and defender across realistic breach scenarios — all in a fully sandboxed environment.

---

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | Next.js 16 (App Router) |
| UI | React 19 |
| Styling | TailwindCSS v4 |
| Language | TypeScript 5 |
| Font | Geist Sans / Geist Mono |

---

## Features

- **Scenario Library** — 8 scenarios across Red Team, Blue Team, Forensics, Cryptography, and Social Engineering
- **Interactive Terminal** — Sandboxed shell with commands: `scan`, `exploit`, `defend`, `status`, `help`, `clear`; command history via arrow keys
- **Live Threat Map** — Animated SVG network topology with clickable nodes, attack vector overlays, and status indicators
- **Event Log** — Real-time streaming log with severity filtering (CRIT / ERROR / WARN / INFO / DEBUG) and pause/resume
- **Alert Feed** — Live alert panel with severity badges
- **Dashboard** — Mission control with stat cards, objectives tracker, mini threat map, and event log
- **Leaderboard** — Global XP rankings with podium view and streak tracking
- **Custom 404** — Themed terminal-style not-found page
- **Loading Skeletons** — Animated skeletons for dashboard and scenario pages

---

## Project Structure

```
app/
├── page.tsx                    # Landing page (hero, features, stats, CTA)
├── layout.tsx                  # Root layout with Navbar
├── globals.css                 # Cyber dark theme, animations, glow utilities
├── not-found.tsx               # Custom 404
├── dashboard/
│   ├── page.tsx                # Mission control dashboard
│   ├── loading.tsx             # Dashboard loading skeleton
│   ├── terminal/page.tsx       # Full-screen terminal view
│   ├── threat-map/page.tsx     # Full threat map + attack path diagram
│   └── logs/page.tsx           # Full event log viewer
├── scenarios/
│   ├── page.tsx                # Scenario library browser
│   ├── loading.tsx             # Scenarios loading skeleton
│   └── [id]/page.tsx           # Active simulation view
└── leaderboard/
    └── page.tsx                # Global leaderboard

components/
├── Navbar.tsx                  # Sticky top navigation (mobile-responsive)
├── Sidebar.tsx                 # Left sidebar with nav links + agent status
├── TerminalConsole.tsx         # Interactive terminal with boot sequence
├── ThreatMap.tsx               # Animated SVG network map (compact + full mode)
├── EventLog.tsx                # Live streaming event log with filters
├── AlertFeed.tsx               # Severity-tiered alert feed
└── StatCard.tsx                # Reusable metric card with accent colours
```

---

## Getting Started

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### Other commands

```bash
npm run build   # Production build
npm run start   # Start production server
npm run lint    # Run ESLint
```

---

## Routes

| Route | Description |
|---|---|
| `/` | Landing page |
| `/dashboard` | Mission control |
| `/dashboard/terminal` | Secure terminal |
| `/dashboard/threat-map` | Live network threat map |
| `/dashboard/logs` | Event log viewer |
| `/scenarios` | Scenario library |
| `/scenarios/[id]` | Active simulation |
| `/leaderboard` | Global XP leaderboard |

---

> **For educational use only. All simulations are sandboxed.**