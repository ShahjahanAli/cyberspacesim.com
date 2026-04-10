function Pulse({ className }: { className: string }) {
  return <div className={`animate-pulse rounded bg-[var(--surface-3)] ${className}`} />;
}

export default function ScenariosLoading() {
  return (
    <div className="flex flex-1 min-h-0">
      <aside className="hidden lg:flex flex-col w-56 shrink-0 border-r border-[var(--border-dim)] bg-[var(--surface-1)] py-6 px-3 gap-3">
        {Array.from({ length: 8 }).map((_, i) => (
          <Pulse key={i} className="h-7 w-full" />
        ))}
      </aside>
      <div className="flex flex-col flex-1 px-6 py-6 gap-6">
        <div className="flex flex-col gap-2">
          <Pulse className="h-2 w-24" />
          <Pulse className="h-7 w-48" />
        </div>
        {/* Filter bar */}
        <div className="flex gap-2">
          {Array.from({ length: 6 }).map((_, i) => (
            <Pulse key={i} className="h-7 w-20" />
          ))}
        </div>
        {/* Cards grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="border border-[var(--border-dim)] rounded bg-[var(--surface-2)] p-5 flex flex-col gap-3">
              <div className="flex justify-between">
                <Pulse className="h-3 w-20" />
                <Pulse className="h-4 w-16" />
              </div>
              <Pulse className="h-5 w-40" />
              <Pulse className="h-16 w-full" />
              <div className="flex gap-1">
                <Pulse className="h-4 w-12" />
                <Pulse className="h-4 w-14" />
                <Pulse className="h-4 w-10" />
              </div>
              <div className="flex justify-between mt-2">
                <Pulse className="h-4 w-24" />
                <Pulse className="h-6 w-16" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
