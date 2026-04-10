import Link from "next/link";
import Sidebar from "@/components/Sidebar";

type Difficulty = "Beginner" | "Intermediate" | "Advanced" | "Expert";
type Category = "Red Team" | "Blue Team" | "Forensics" | "Cryptography" | "Social Engineering";

interface Scenario {
  id: string;
  title: string;
  description: string;
  difficulty: Difficulty;
  category: Category;
  duration: string;
  xp: number;
  tags: string[];
  locked: boolean;
}

const scenarios: Scenario[] = [
  {
    id: "1",
    title: "Corporate Breach Drill",
    description: "Infiltrate a simulated corporate network, pivot through services, and exfiltrate target data without triggering IDS alerts.",
    difficulty: "Beginner",
    category: "Red Team",
    duration: "30–45 min",
    xp: 200,
    tags: ["SMB", "Pivot", "Recon"],
    locked: false,
  },
  {
    id: "2",
    title: "Ransomware Containment",
    description: "A ransomware strain is spreading through the network. Identify patient zero, isolate affected hosts, and restore operations.",
    difficulty: "Intermediate",
    category: "Blue Team",
    duration: "45–60 min",
    xp: 400,
    tags: ["Incident Response", "Malware", "SIEM"],
    locked: false,
  },
  {
    id: "3",
    title: "APT Intrusion Hunt",
    description: "Threat intelligence indicates an Advanced Persistent Threat actor has established a beachhead. Hunt them down and eject them.",
    difficulty: "Advanced",
    category: "Blue Team",
    duration: "60–90 min",
    xp: 700,
    tags: ["Threat Hunting", "Lateral Movement", "MITRE ATT&CK"],
    locked: false,
  },
  {
    id: "4",
    title: "Zero-Day Exploitation",
    description: "Weaponise a freshly disclosed vulnerability against a patched-but-misconfigured target. Race the patch cycle.",
    difficulty: "Expert",
    category: "Red Team",
    duration: "90–120 min",
    xp: 1200,
    tags: ["CVE", "Exploit Dev", "RCE"],
    locked: true,
  },
  {
    id: "5",
    title: "Phishing Campaign Sim",
    description: "Craft a realistic phishing campaign targeting three departments. Measure click rates and credential harvesting.",
    difficulty: "Beginner",
    category: "Social Engineering",
    duration: "20–30 min",
    xp: 150,
    tags: ["Phishing", "OSINT", "Human Factor"],
    locked: false,
  },
  {
    id: "6",
    title: "Digital Forensics Lab",
    description: "Analyse disk images, memory dumps, and packet captures from a compromised host to reconstruct the attack chain.",
    difficulty: "Intermediate",
    category: "Forensics",
    duration: "60–75 min",
    xp: 500,
    tags: ["Disk Image", "Volatility", "Wireshark"],
    locked: false,
  },
  {
    id: "7",
    title: "Cryptographic Weaknesses",
    description: "Identify and exploit common cryptographic misconfigurations: weak ciphers, padding oracles, JWT forgery.",
    difficulty: "Advanced",
    category: "Cryptography",
    duration: "45–60 min",
    xp: 600,
    tags: ["TLS", "JWT", "Padding Oracle"],
    locked: true,
  },
  {
    id: "8",
    title: "Insider Threat Detection",
    description: "A privileged user is leaking data. Use UEBA analytics and log correlation to identify and contain the threat.",
    difficulty: "Intermediate",
    category: "Blue Team",
    duration: "40–55 min",
    xp: 350,
    tags: ["UEBA", "DLP", "Log Analysis"],
    locked: false,
  },
];

const difficultyConfig: Record<Difficulty, { color: string; bg: string; border: string }> = {
  Beginner: {
    color: "text-[var(--cyber-green)]",
    bg: "bg-[var(--cyber-green)]/10",
    border: "border-[var(--cyber-green)]/30",
  },
  Intermediate: {
    color: "text-[var(--cyber-blue)]",
    bg: "bg-[var(--cyber-blue)]/10",
    border: "border-[var(--cyber-blue)]/30",
  },
  Advanced: {
    color: "text-[var(--cyber-amber)]",
    bg: "bg-[var(--cyber-amber)]/10",
    border: "border-[var(--cyber-amber)]/30",
  },
  Expert: {
    color: "text-[var(--cyber-red)]",
    bg: "bg-[var(--cyber-red)]/10",
    border: "border-[var(--cyber-red)]/30",
  },
};

const categoryColor: Record<Category, string> = {
  "Red Team": "text-[var(--cyber-red)]",
  "Blue Team": "text-[var(--cyber-blue)]",
  "Forensics": "text-[var(--cyber-purple)]",
  "Cryptography": "text-[var(--cyber-amber)]",
  "Social Engineering": "text-[var(--cyber-green)]",
};

export default function ScenariosPage() {
  return (
    <div className="flex flex-1 min-h-0">
      <Sidebar />

      <div className="flex flex-col flex-1 overflow-auto px-6 py-6 gap-6">
        {/* Header */}
        <div>
          <p className="font-mono text-[10px] tracking-[0.2em] uppercase text-[var(--cyber-green)]/50 mb-1">
            Operations
          </p>
          <h1 className="text-2xl font-bold text-[var(--foreground)]">Scenario Library</h1>
          <p className="text-sm text-[var(--foreground)]/40 mt-1 font-mono">
            {scenarios.filter((s) => !s.locked).length} scenarios available · {scenarios.filter((s) => s.locked).length} locked
          </p>
        </div>

        {/* Filter bar (static for now) */}
        <div className="flex flex-wrap gap-2">
          {(["All", "Red Team", "Blue Team", "Forensics", "Cryptography", "Social Engineering"] as const).map(
            (cat) => (
              <button
                key={cat}
                className={`px-3 py-1 rounded border font-mono text-xs tracking-wider uppercase transition-all ${
                  cat === "All"
                    ? "border-[var(--cyber-green)] bg-[var(--cyber-green)]/10 text-[var(--cyber-green)]"
                    : "border-[var(--border-dim)] text-[var(--foreground)]/40 hover:border-[var(--cyber-green)]/50 hover:text-[var(--cyber-green)]"
                }`}
              >
                {cat}
              </button>
            )
          )}
        </div>

        {/* Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
          {scenarios.map((s) => {
            const diff = difficultyConfig[s.difficulty];
            return (
              <div
                key={s.id}
                className={`relative flex flex-col border rounded bg-[var(--surface-2)] transition-all ${
                  s.locked
                    ? "border-[var(--border-dim)] opacity-50"
                    : "border-[var(--border-dim)] hover:border-[var(--cyber-green)]/40"
                }`}
              >
                {/* Lock overlay */}
                {s.locked && (
                  <div className="absolute inset-0 flex items-center justify-center rounded bg-[var(--surface-1)]/60 z-10">
                    <div className="flex flex-col items-center gap-1">
                      <span className="text-2xl">🔒</span>
                      <span className="font-mono text-[10px] text-[var(--foreground)]/40 uppercase tracking-widest">Locked</span>
                    </div>
                  </div>
                )}

                <div className="p-5 flex flex-col gap-3 flex-1">
                  {/* Category + difficulty */}
                  <div className="flex items-center justify-between gap-2">
                    <span className={`font-mono text-[10px] tracking-wider uppercase font-bold ${categoryColor[s.category]}`}>
                      {s.category}
                    </span>
                    <span className={`font-mono text-[9px] font-bold px-2 py-0.5 rounded border ${diff.color} ${diff.bg} ${diff.border}`}>
                      {s.difficulty}
                    </span>
                  </div>

                  <h2 className="font-bold text-[var(--foreground)] text-base">{s.title}</h2>
                  <p className="text-xs text-[var(--foreground)]/50 leading-relaxed flex-1">{s.description}</p>

                  {/* Tags */}
                  <div className="flex flex-wrap gap-1.5">
                    {s.tags.map((tag) => (
                      <span
                        key={tag}
                        className="font-mono text-[9px] px-1.5 py-0.5 rounded border border-[var(--border-dim)] text-[var(--foreground)]/30"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Footer */}
                <div className="border-t border-[var(--border-dim)] px-5 py-3 flex items-center justify-between gap-3 bg-[var(--surface-1)]">
                  <div className="flex items-center gap-4">
                    <span className="font-mono text-[10px] text-[var(--foreground)]/30">⏱ {s.duration}</span>
                    <span className="font-mono text-[10px] text-[var(--cyber-green)]">+{s.xp} XP</span>
                  </div>
                  <Link
                    href={s.locked ? "#" : `/scenarios/${s.id}`}
                    className={`px-3 py-1 rounded border font-mono text-[10px] tracking-wider uppercase transition-all ${
                      s.locked
                        ? "border-[var(--border-dim)] text-[var(--foreground)]/20 cursor-not-allowed"
                        : "border-[var(--cyber-green)] text-[var(--cyber-green)] hover:bg-[var(--cyber-green)] hover:text-black"
                    }`}
                  >
                    {s.locked ? "Locked" : "Launch"}
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
