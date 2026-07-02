import { Activity, Calendar, Heart, TrendingUp } from 'lucide-react';
import { DashboardStatsCard } from './dashboard-stats-card';
import type { DashboardStats } from '../actions/fetch-dashboard-data';

interface DashboardStatsGridProps {
  stats: DashboardStats;
}

// Componente para mostrar el grid de 4 tarjetas de estadisticas
export function DashboardStatsGrid({ stats }: DashboardStatsGridProps) {
  // Formatear proxima sesion para mostrar
  const proximaSesionDisplay = stats.proximaSesion
    ? stats.proximaSesion.diaSemana
    : 'Sin planificar';

  const proximaSesionSubtitle = stats.proximaSesion
    ? stats.proximaSesion.tipoSesion
    : 'No hay sesiones programadas';

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      {/* Tarjeta 1: Tests Recientes */}
      <DashboardStatsCard
        title="Tests Realizados"
        value={stats.testsRecientes}
        description="Ultimos 30 dias"
        icon={Activity}
        iconColor="text-primary"
      />

      {/* Tarjeta 2: VO2max Actual */}
      <DashboardStatsCard
        title="VO2max Actual"
        value={stats.vo2maxActual !== null ? `${stats.vo2maxActual} ml/kg/min` : 'Sin datos'}
        description="Nivel de resistencia aerobica"
        icon={TrendingUp}
        iconColor="text-success"
      />

      {/* Tarjeta 3: Proxima Sesion */}
      <DashboardStatsCard
        title="Proxima Sesion"
        value={proximaSesionDisplay}
        description={proximaSesionSubtitle}
        icon={Calendar}
        iconColor="text-accent"
      />

      {/* Tarjeta 4: Dolencias Activas */}
      <DashboardStatsCard
        title="Dolencias Activas"
        value={stats.dolenciasActivas}
        description="Requieren atencion"
        icon={Heart}
        iconColor={stats.dolenciasActivas > 0 ? 'text-danger' : 'text-success'}
      />
    </div>
  );
}
