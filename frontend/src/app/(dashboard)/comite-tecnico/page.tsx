import { getCurrentUserAction } from '@/app/actions/auth.actions';
import { fetchDashboardStats } from '@/features/comite-tecnico/actions';
import { ComiteTecnicoStatsGrid, AccionesRapidasCT } from '@/features/comite-tecnico/components';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';

export default async function ComiteTecnicoDashboard() {
  const result = await getCurrentUserAction();

  if (!result.success || !result.user) {
    return null;
  }

  const { user } = result;

  // Obtener estadisticas del dashboard
  const stats = await fetchDashboardStats();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Dashboard</h1>
        <p className="text-muted-foreground">Bienvenido, {user.nombreCompleto}</p>
      </div>

      {/* Grid de estadisticas */}
      {stats ? (
        <ComiteTecnicoStatsGrid stats={stats} />
      ) : (
        <DashboardStatsSkeleton />
      )}

      {/* Acciones rapidas */}
      <AccionesRapidasCT />
    </div>
  );
}

// Skeleton para las estadisticas mientras cargan
function DashboardStatsSkeleton() {
  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      {Array.from({ length: 7 }).map((_, i) => (
        <Card key={i}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-4 w-4" />
          </CardHeader>
          <CardContent>
            <Skeleton className="h-8 w-16 mb-1" />
            <Skeleton className="h-3 w-20" />
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
