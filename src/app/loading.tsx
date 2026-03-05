export default function Loading() {
  return (
    <div className="flex items-center justify-center py-20">
      <div className="text-center">
        <div className="w-10 h-10 border-2 border-accent border-t-transparent rounded-full animate-spin mx-auto mb-4" />
        <p className="text-sm text-muted">Loading...</p>
      </div>
    </div>
  );
}
