// Shown while a server-rendered /app screen streams in. Structure mirrors the
// real screens (title block, KPI row, table) so the layout does not jump.
export default function AppLoading() {
  return (
    <div role="status" aria-busy="true" aria-live="polite">
      <span className="sr-only">Loading…</span>
      <div aria-hidden className="animate-pulse motion-reduce:animate-none">
        <div className="h-8 w-48 bg-haze" />
        <div className="mt-3 h-4 w-80 max-w-full bg-haze" />
        <div className="mt-8 grid grid-cols-1 gap-3 sm:grid-cols-2 sm:gap-4 xl:grid-cols-4">
          {[0, 1, 2, 3].map((i) => (
            <div key={i} className="h-32 border border-fog bg-surface" />
          ))}
        </div>
        <div className="mt-8 border border-fog bg-surface">
          <div className="h-10 border-b border-fog bg-haze" />
          {[0, 1, 2, 3, 4].map((i) => (
            <div key={i} className="h-11 border-b border-fog/70 last:border-b-0" />
          ))}
        </div>
      </div>
    </div>
  );
}
