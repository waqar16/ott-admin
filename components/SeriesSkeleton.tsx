export default function SeriesSkeleton() {
  return (
    <div className="space-y-4 animate-pulse">
      {[1, 2, 3].map((i) => (
        <div key={i} className="bg-gray-800 h-16 rounded-lg"></div>
      ))}
    </div>
  );
}
