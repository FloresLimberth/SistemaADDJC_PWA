import { redirect } from 'next/navigation';
import { getCurrentUserAction } from '@/app/actions/auth.actions';
import { fetchEntrenadorDashboard } from '@/features/entrenador/actions/fetch-dashboard-stats';
import { fetchMisAtletas } from '@/features/entrenador/actions/fetch-mis-atletas';
import { EntrenadorStatsGrid } from '@/features/entrenador/components/dashboard/entrenador-stats-grid';
import { AtletasResumenCard } from '@/features/entrenador/components/dashboard/atletas-resumen-card';
import { AccionesRapidas } from '@/features/entrenador/components/dashboard/acciones-rapidas';
import { AUTH_ROUTES } from '@/lib/routes';

export default async function EntrenadorDashboardPage() {
  // Verificar autenticacion
  const authResult = await getCurrentUserAction();

  if (!authResult.success || !authResult.user) {
    redirect(AUTH_ROUTES.login);
  }

  const { user } = authResult;

  // Cargar datos en paralelo
  const [stats, atletasResult] = await Promise.all([
    fetchEntrenadorDashboard(),
    fetchMisAtletas({ limit: 10 }),
  ]);

  // Si no hay stats, usar valores por defecto
  const dashboardStats = stats || {
    totalAtletas: 0,
    testsEsteMes: 0,
    registrosHoy: 0,
    dolenciasActivas: 0,
  };

  const atletas = atletasResult?.data || [];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Dashboard Entrenador</h1>
        <p className="text-muted-foreground">
          Bienvenido, {user.nombreCompleto}
        </p>
      </div>

      <EntrenadorStatsGrid stats={dashboardStats} />

      <div className="grid gap-6 md:grid-cols-2">
        <AtletasResumenCard atletas={atletas} maxMostrar={5} />
        <AccionesRapidas />
      </div>
    </div>
  );
}
