import { Skeleton } from '@/components/ui/skeleton';

// Loading state para la pagina de dolencias
export default function DolenciasLoading() {
  return (
    <div className="space-y-6">
      {/* Header Skeleton */}
      <div>
        <Skeleton className="h-9 w-48" />
        <Skeleton className="h-5 w-80 mt-2" />
      </div>

      {/* Seccion Activas Skeleton */}
      <div>
        <Skeleton className="h-7 w-32 mb-4" />
        <div className="space-y-4">
          {Array.from({ length: 2 }).map((_, i) => (
            <div key={i} className="border rounded-lg p-4 bg-white">
              <div className="flex justify-between items-start mb-3">
                <div>
                  <Skeleton className="h-6 w-40" />
                  <Skeleton className="h-4 w-24 mt-1" />
                </div>
                <Skeleton className="h-8 w-16" />
              </div>
              <Skeleton className="h-4 w-full mb-3" />
              <div className="flex gap-4 border-t pt-3">
                <Skeleton className="h-4 w-32" />
                <Skeleton className="h-4 w-40" />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Seccion Historial Skeleton */}
      <div>
        <Skeleton className="h-7 w-32 mb-4" />
        <div className="space-y-4">
          {Array.from({ length: 2 }).map((_, i) => (
            <div key={i} className="border rounded-lg p-4 bg-white">
              <div className="flex justify-between items-start mb-3">
                <div>
                  <Skeleton className="h-6 w-40" />
                  <Skeleton className="h-4 w-24 mt-1" />
                </div>
                <Skeleton className="h-8 w-16" />
              </div>
              <Skeleton className="h-4 w-full mb-3" />
              <div className="flex gap-4 border-t pt-3">
                <Skeleton className="h-4 w-32" />
                <Skeleton className="h-4 w-40" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
