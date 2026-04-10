function Pulse({ className }: { className: string }) {
  return <div className={`animate-pulse rounded bg-[var(--surface-3)] ${className}`} />;
}

export default function DashboardLoading() {
  return (
    <div className="flex flex-1 min-h-0">
      {/* Sidebar skeleton */}
      <aside className="hidden lg:flex flex-col w-56 shrink-0 border-r border-[var(--border-dim)] bg-[var(--surface-1)] py-6 px-3 gap-4">
        <Pulse className="h-3 w-24 mb-2" />
        {Array.from({ length: 3 }).map((_, i) => (
          <Pulse key={i} className="h-7 w-full" />
        ))}
        <Pulse className="h-3 w-20 mt-4 mb-2" />
        {Array.from({ length: 3 }).map((_, i) => (
          <Pulse key={i} className="h-7 w-full" />
        ))}
        <div className="mt-auto border border-[var(--border-dim)] rounded p-3 flex flex-col gap-2">
          <Pulse className="h-2 w-20" />
          <Pulse className="h-3 w-full" />
          <Pulse className="h-3 w-full" />
          <Pulse className="h-3 w-full" />
        </div>
      </aside>

      {/* Content skeleton */}
      <div className="flex flex-col flex-1 px-6 py-6 gap-6">
        {/* Header */}
        <div className="flex justify-between items-start">
          <div className="flex flex-col gap-2">
            <Pulse className="h-2 w-28" />
            <Pulse className="h-7 w-40" />
          </div>
          <Pulse className="h-8 w-36" />
        </div>

        {/* Stat cards */}
        <div className="grid grid-cols-2 xl:grid-cols-4 gap-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="border border-[var(--border-dim)] rounded p-4 flex flex-col gap-2">
              <Pulse className="h-2 w-16" />
              <Pulse className="h-8 w-24" />
              <Pulse className="h-2 w-20" />
            </div>
          ))}
        </div>

        {/* Main grid */}
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 flex-1">
          <div className="xl:col-span-2 flex flex-col gap-4">
            <Pulse className="h-80 w-full" />
            <Pulse className="h-40 w-full" />
          </div>
          <div className="flex flex-col gap-4">
            <Pulse className="h-64 w-full" />
            <Pulse className="h-52 w-full" />
          </div>
        </div>
      </div>
    </div>
  );
}
