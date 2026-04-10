import BehaviorAnomalyChart from "@/components/BehaviorAnomalyChart";
import Sidebar from "@/components/Sidebar";

export const metadata = {
  title: "Behavior AI — CyberSpace Sim",
};

export default function BehaviorPage() {
  return (
    <div className="flex h-[calc(100vh-56px)]">
      <Sidebar />
      <div className="flex-1 overflow-y-auto">
        <div className="px-6 py-6 max-w-7xl mx-auto flex flex-col gap-6">
          {/* Header */}
          <div className="flex flex-col gap-1">
            <div className="flex items-center gap-3">
              <span className="font-mono text-2xl">∿</span>
              <h1 className="font-mono text-xl font-bold text-[var(--foreground)]">Behavior AI — UEBA</h1>
            </div>
            <p className="font-mono text-sm text-[var(--foreground)]/40">
              User & Entity Behavior Analytics · ML anomaly detection · Insider threat detection
            </p>
          </div>

          {/* UEBA info bar */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {[
              { label: "Entities Monitored", value: "2,841", color: "var(--cyber-green)" },
              { label: "Anomalies (24h)",     value: "47",    color: "var(--cyber-amber)" },
              { label: "Critical Alerts",     value: "3",     color: "var(--cyber-red)" },
              { label: "Model Accuracy",      value: "97.4%", color: "var(--cyber-purple)" },
            ].map(({ label, value, color }) => (
              <div key={label} className="border border-[var(--border-dim)] rounded px-4 py-3 bg-[var(--surface-2)] flex flex-col gap-1" style={{ borderColor: color + "25" }}>
                <p className="font-mono text-[8px] uppercase tracking-widest" style={{ color: color + "70" }}>{label}</p>
                <p className="font-mono text-xl font-bold" style={{ color }}>{value}</p>
              </div>
            ))}
          </div>

          <BehaviorAnomalyChart />

          <div className="border border-[var(--border-dim)] rounded px-5 py-3 bg-[var(--surface-2)] font-mono text-[9px] text-[var(--foreground)]/25 leading-relaxed">
            <strong className="text-[var(--foreground)]/40">Model:</strong> Isolation Forest + LSTM autoencoder trained on 180-day rolling baseline per entity.
            Anomaly scoring uses z-score normalisation against peer group. Alerts trigger at 2.5σ deviation.
            Data ingested from: EDR telemetry, authentication logs, DLP, network flow, email metadata.
          </div>
        </div>
      </div>
    </div>
  );
}
