import { SignUp } from "@clerk/nextjs";

export default function SignUpPage() {
  return (
    <div className="flex flex-1 items-center justify-center py-16 px-4 bg-[var(--surface-1)]">
      <div className="absolute inset-0 cyber-grid opacity-20 pointer-events-none" />

      <div className="relative z-10 flex flex-col items-center gap-6">
        <div className="flex flex-col items-center gap-1 text-center">
          <p className="font-mono text-[10px] uppercase tracking-[0.3em] text-[var(--cyber-green)]/60">
            ◈ Enlist
          </p>
          <h1 className="font-mono text-2xl font-black text-[var(--foreground)]">
            Create Agent Profile
          </h1>
          <p className="font-mono text-xs text-[var(--foreground)]/30 max-w-xs">
            Register to join the CyberSpace Sim training environment.
          </p>
        </div>

        <SignUp
          appearance={{
            variables: {
              colorPrimary: "#00ff88",
              colorBackground: "#0d1f30",
              colorInputBackground: "#112840",
              colorInputText: "#e2e8f0",
              colorText: "#e2e8f0",
              colorTextSecondary: "#94a3b8",
              borderRadius: "0.375rem",
              fontFamily: "var(--font-geist-mono), monospace",
            },
            elements: {
              card: "border border-[#1a3a55] shadow-2xl",
              headerTitle: "text-[#00ff88] font-mono font-bold",
              headerSubtitle: "text-slate-400 font-mono",
              formButtonPrimary:
                "bg-[#00ff88] text-black font-mono font-bold hover:bg-[#00cc6a] transition-colors",
              formFieldInput:
                "font-mono bg-[#112840] border-[#1a3a55] text-slate-200 focus:border-[#00ff88]",
              footerActionLink: "text-[#00b4ff] hover:text-[#00ff88]",
              dividerLine: "bg-[#1a3a55]",
              dividerText: "text-slate-500 font-mono text-xs",
            },
          }}
        />
      </div>
    </div>
  );
}
