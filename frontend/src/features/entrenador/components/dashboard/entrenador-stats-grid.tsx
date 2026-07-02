import { DashboardStatsCard } from '@/features/atleta/components/dashboard-stats-card';
import { EntrenadorDashboardStats } from '../../types/entrenador.types';
import { Users, ClipboardList, Activity, AlertTriangle } from 'lucide-react';

interface EntrenadorStatsGridProps {
  stats: EntrenadorDashboardStats;
}

// Grid de estadisticas para el dashboard del entrenador
// Reutiliza el componente DashboardStatsCard de atleta
export function EntrenadorStatsGrid({ stats }: EntrenadorStatsGridProps) {
  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      <DashboardStatsCard
        title="Mis Atletas"
        value={stats.totalAtletas}
        description="Atletas asignados"
        icon={Users}
        iconColor="text-blue-500"
      />

      <DashboardStatsCard
        title="Tests Fisicos"
        value={stats.testsEsteMes}
        description="Este mes"
        icon={ClipboardList}
        iconColor="text-green-500"
      />

      <DashboardStatsCard
        title="Post-Entrenamiento"
        value={stats.registrosHoy}
        description="Registros hoy"
        icon={Activity}
        iconColor="text-purple-500"
      />

      <DashboardStatsCard
        title="Dolencias Activas"
        value={stats.dolenciasActivas}
        description={stats.dolenciasActivas > 0 ? 'Requieren atencion' : 'Sin dolencias activas'}
        icon={AlertTriangle}
        iconColor={stats.dolenciasActivas > 0 ? 'text-orange-500' : 'text-muted-foreground'}
      />
    </div>
  );
}
