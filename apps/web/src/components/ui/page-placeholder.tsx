export function PagePlaceholder() {
  return (
    <div
      aria-busy="true"
      aria-label="Loading"
      className="mx-auto w-full max-w-4xl animate-pulse py-6 md:py-10"
    >
      <div className="h-8 w-48 rounded-control bg-hover" />
      <div className="mt-6 h-28 rounded-panel bg-hover" />
    </div>
  );
}
