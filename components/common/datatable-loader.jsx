export function DatatableLoader({ isLoading }) {
  if (!isLoading) return null;

  return (
    <div className="absolute inset-0 z-20 flex items-center justify-center rounded-md bg-white/70">
      <div className="h-10 w-10 animate-spin rounded-full border-4 border-black border-t-transparent" />
    </div>
  );
}
