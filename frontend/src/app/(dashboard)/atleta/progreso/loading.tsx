// Loading skeleton para la página de progreso
export default function ProgresoLoading() {
  return (
    <div className="space-y-6">
      {/* Header skeleton */}
      <div>
        <div className="h-9 w-48 bg-gray-200 rounded animate-pulse"></div>
        <div className="h-5 w-96 bg-gray-100 rounded animate-pulse mt-2"></div>
      </div>

      {/* Stats grid skeleton */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="bg-white rounded-lg border border-gray-200 p-5 shadow-sm">
            <div className="h-10 w-10 bg-gray-100 rounded-lg mb-3 animate-pulse"></div>
            <div className="h-4 w-24 bg-gray-100 rounded animate-pulse mb-2"></div>
            <div className="h-8 w-32 bg-gray-200 rounded animate-pulse"></div>
            <div className="h-3 w-28 bg-gray-100 rounded animate-pulse mt-2"></div>
          </div>
        ))}
      </div>

      {/* Main chart skeleton */}
      <div className="bg-white rounded-lg border border-gray-200 p-6 shadow-sm">
        <div className="h-6 w-48 bg-gray-200 rounded animate-pulse mb-2"></div>
        <div className="h-4 w-72 bg-gray-100 rounded animate-pulse mb-4"></div>
        <div className="h-96 bg-gray-50 rounded animate-pulse"></div>
      </div>

      {/* Two column charts skeleton */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {[...Array(2)].map((_, i) => (
          <div key={i} className="bg-white rounded-lg border border-gray-200 p-6 shadow-sm">
            <div className="h-6 w-40 bg-gray-200 rounded animate-pulse mb-2"></div>
            <div className="h-4 w-64 bg-gray-100 rounded animate-pulse mb-4"></div>
            <div className="h-80 bg-gray-50 rounded animate-pulse"></div>
          </div>
        ))}
      </div>

      {/* Bottom chart skeleton */}
      <div className="bg-white rounded-lg border border-gray-200 p-6 shadow-sm">
        <div className="h-6 w-56 bg-gray-200 rounded animate-pulse mb-2"></div>
        <div className="h-4 w-80 bg-gray-100 rounded animate-pulse mb-4"></div>
        <div className="h-80 bg-gray-50 rounded animate-pulse"></div>
      </div>
    </div>
  );
}
