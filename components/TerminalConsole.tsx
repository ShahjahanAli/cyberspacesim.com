"use client";

import { useEffect, useRef, useState } from "react";

const BOOT_SEQUENCE = [
  "CyberSpaceSim v2.4.1 — Tactical Security Simulation Platform",
  "Initializing secure shell environment...",
  "Loading threat intelligence modules........... [OK]",
  "Establishing encrypted tunnel..................... [OK]",
  "Mounting scenario filesystem......................... [OK]",
  "Agent ready. Type 'help' for available commands.",
  "",
];

const COMMANDS: Record<string, string[]> = {
  help: [
    "Available commands:",
    "  scan       — Run network vulnerability scan",
    "  exploit    — Launch exploitation module",
    "  defend     — Activate defensive measures",
    "  status     — Show current simulation status",
    "  clear      — Clear terminal output",
    "  exit       — Exit current scenario",
  ],
  scan: [
    "Initiating network scan on 192.168.1.0/24...",
    "Host 192.168.1.1   — OPEN  [ssh:22, http:80]",
    "Host 192.168.1.42  — OPEN  [ftp:21, smb:445] ⚠ VULNERABLE",
    "Host 192.168.1.100 — OPEN  [rdp:3389]        ⚠ EXPOSED",
    "Scan complete. 3 hosts found. 2 vulnerabilities detected.",
  ],
  exploit: [
    "Selecting exploit module: EternalBlue (MS17-010)...",
    "Target: 192.168.1.42:445",
    "Sending payload........................",
    "Shell established! Access granted.",
    "Session ID: 0x4F2A — privilege level: ADMIN",
  ],
  defend: [
    "Activating IDS/IPS rules...",
    "Blocking inbound SMBv1 traffic............... [DONE]",
    "Patching MS17-010 vulnerability.............. [DONE]",
    "Enabling endpoint monitoring................. [DONE]",
    "Defence posture updated. Threat level: LOW.",
  ],
  status: [
    "=== Simulation Status ===",
    "Scenario   : Corporate Breach Drill #3",
    "Elapsed    : 00:14:22",
    "Score      : 840 / 1000",
    "Objectives : 3 / 5 complete",
    "Threat Lvl : MEDIUM",
  ],
  exit: ["Terminating session...", "Scenario progress saved.", "Goodbye, Agent."],
};

interface Line {
  text: string;
  type: "output" | "input" | "error";
}

export default function TerminalConsole() {
  const [lines, setLines] = useState<Line[]>([]);
  const [input, setInput] = useState("");
  const [history, setHistory] = useState<string[]>([]);
  const [histIdx, setHistIdx] = useState(-1);
  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    let i = 0;
    const timer = setInterval(() => {
      if (i < BOOT_SEQUENCE.length) {
        setLines((prev) => [
          ...prev,
          { text: BOOT_SEQUENCE[i], type: "output" },
        ]);
        i++;
      } else {
        clearInterval(timer);
      }
    }, 120);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [lines]);

  function runCommand(cmd: string) {
    const trimmed = cmd.trim().toLowerCase();
    setLines((prev) => [...prev, { text: `agent@sim:~$ ${cmd}`, type: "input" }]);
    setHistory((h) => [cmd, ...h]);
    setHistIdx(-1);

    if (trimmed === "clear") {
      setLines([]);
      return;
    }

    const response = COMMANDS[trimmed];
    if (response) {
      setLines((prev) => [
        ...prev,
        ...response.map((t) => ({ text: t, type: "output" as const })),
      ]);
    } else if (trimmed !== "") {
      setLines((prev) => [
        ...prev,
        { text: `Command not found: ${cmd}. Type 'help' for options.`, type: "error" },
      ]);
    }
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Enter") {
      runCommand(input);
      setInput("");
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      const next = Math.min(histIdx + 1, history.length - 1);
      setHistIdx(next);
      setInput(history[next] ?? "");
    } else if (e.key === "ArrowDown") {
      e.preventDefault();
      const next = Math.max(histIdx - 1, -1);
      setHistIdx(next);
      setInput(next === -1 ? "" : history[next]);
    }
  }

  return (
    <div
      className="flex flex-col h-full bg-[var(--surface-1)] rounded border border-[var(--border-dim)] overflow-hidden font-mono text-sm"
      onClick={() => inputRef.current?.focus()}
    >
      {/* Title bar */}
      <div className="flex items-center justify-between px-4 py-2 bg-[var(--surface-2)] border-b border-[var(--border-dim)] select-none">
        <div className="flex items-center gap-2">
          <span className="h-2.5 w-2.5 rounded-full bg-[var(--cyber-red)]" />
          <span className="h-2.5 w-2.5 rounded-full bg-[var(--cyber-amber)]" />
          <span className="h-2.5 w-2.5 rounded-full bg-[var(--cyber-green)]" />
        </div>
        <span className="text-[10px] tracking-widest uppercase text-[var(--cyber-green)]/50">
          secure terminal — sim-shell
        </span>
        <span className="text-[10px] text-[var(--cyber-green)]/30">enc:AES-256</span>
      </div>

      {/* Output */}
      <div className="flex-1 overflow-y-auto p-4 space-y-0.5">
        {lines.map((line, i) => (
          <div
            key={i}
            className={
              line.type === "input"
                ? "text-[var(--cyber-green)]"
                : line.type === "error"
                ? "text-[var(--cyber-red)]"
                : "text-[var(--foreground)]/70"
            }
          >
            {line.text || <br />}
          </div>
        ))}
        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <div className="flex items-center gap-2 border-t border-[var(--border-dim)] px-4 py-2 bg-[var(--surface-2)]">
        <span className="text-[var(--cyber-green)] select-none">agent@sim:~$</span>
        <input
          ref={inputRef}
          className="flex-1 bg-transparent outline-none text-[var(--cyber-green)] placeholder:text-[var(--cyber-green)]/20 caret-[var(--cyber-green)]"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="type a command..."
          autoComplete="off"
          spellCheck={false}
        />
        <span className="terminal-cursor" />
      </div>
    </div>
  );
}
