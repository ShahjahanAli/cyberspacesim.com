import AIThreatEngine from "@/components/AIThreatEngine";
import Sidebar from "@/components/Sidebar";

export const metadata = {
  title: "AI Threat Engine — CyberSpace Sim",
};

export default function AIIntelPage() {
  return (
    <div className="flex h-[calc(100vh-56px)]">
      <Sidebar />
      <div className="flex-1 overflow-y-auto">
        <div className="px-6 py-6 max-w-7xl mx-auto flex flex-col gap-6">
          {/* Header */}
          <div className="flex flex-col gap-1">
            <div className="flex items-center gap-3">
              <span className="font-mono text-2xl">⬢</span>
              <h1 className="font-mono text-xl font-bold text-[var(--foreground)]">AI Threat Engine</h1>
            </div>
            <p className="font-mono text-sm text-[var(--foreground)]/40">
              ML-powered threat scoring · Automated attribution · SOAR playbook generation
            </p>
          </div>

          {/* Live status bar */}
          <div className="flex items-center gap-6 border border-[var(--cyber-purple)]/30 rounded px-4 py-2.5 bg-[var(--cyber-purple)]/5 font-mono text-xs">
            <span className="flex items-center gap-1.5 text-[var(--cyber-purple)]">
              <span className="inline-block h-1.5 w-1.5 rounded-full bg-[var(--cyber-purple)] animate-pulse" />
              AI ENGINE ONLINE
            </span>
            <span className="text-[var(--foreground)]/30">Model: CyberSentinel v3.2 (Transformer + GNN)</span>
            <span className="text-[var(--foreground)]/30">Training corpus: 4.2M malware samples · 890K IOCs</span>
            <span className="ml-auto text-[var(--foreground)]/30">Inference time: 12ms</span>
          </div>

          <AIThreatEngine />
        </div>
      </div>
    </div>
  );
}
