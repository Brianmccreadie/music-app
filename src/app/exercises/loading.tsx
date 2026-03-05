export default function ExercisesLoading() {
  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <div className="h-8 w-48 bg-border rounded-lg animate-pulse mb-6" />
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="bg-white rounded-2xl border border-border p-6">
            <div className="h-5 w-3/4 bg-border rounded animate-pulse mb-3" />
            <div className="h-4 w-1/2 bg-border rounded animate-pulse mb-2" />
            <div className="h-3 w-full bg-border rounded animate-pulse" />
          </div>
        ))}
      </div>
    </div>
  );
}
