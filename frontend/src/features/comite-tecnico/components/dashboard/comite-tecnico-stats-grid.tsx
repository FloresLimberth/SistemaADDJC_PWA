import { DashboardStatsCard } from '@/features/atleta/components/dashboard-stats-card';
import type { ComiteTecnicoDashboardStats } from '../../types/dashboard.types';
import {
  Users,
  UserCog,
  Calendar,
  Layers,
  ClipboardList,
  AlertTriangle,
  Bell,
} from 'lucide-react';

interface ComiteTecnicoStatsGridProps {
  stats: ComiteTecnicoDashboardStats;
}

// Grid de estadisticas para el dashboard del COMITE_TECNICO
// Muestra 7 metricas clave: atletas, entrenadores, macrociclos, microciclos, tests, dolencias, recomendaciones
export function ComiteTecnicoStatsGrid({ stats }: ComiteTecnicoStatsGridProps) {
  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      <DashboardStatsCard
        title="Total Atletas"
        value={stats.totalAtletas}
        description="En el sistema"
        icon={Users}
        iconColor="text-blue-500"
      />

      <DashboardStatsCard
        title="Entrenadores"
        value={stats.totalEntrenadores}
        description="Activos"
        icon={UserCog}
        iconColor="text-indigo-500"
      />

      <DashboardStatsCard
        title="Macrociclos"
        value={stats.macrociclosActivos}
        description="Activos"
        icon={Calendar}
        iconColor="text-green-500"
      />

      <DashboardStatsCard
        title="Microciclos"
        value={stats.microciclosEnCurso}
        description="En curso"
        icon={Layers}
        iconColor="text-cyan-500"
      />

      <DashboardStatsCard
        title="Tests Fisicos"
        value={stats.testsEsteMes}
        description="Este mes"
        icon={ClipboardList}
        iconColor="text-emerald-500"
      />

      <DashboardStatsCard
        title="Dolencias Activas"
        value={stats.dolenciasActivas}
        description={stats.dolenciasActivas > 0 ? 'Requieren seguimiento' : 'Sin dolencias activas'}
        icon={AlertTriangle}
        iconColor={stats.dolenciasActivas > 0 ? 'text-orange-500' : 'text-muted-foreground'}
      />

      <DashboardStatsCard
        title="Recomendaciones"
        value={stats.recomendacionesPendientes}
        description={stats.recomendacionesPendientes > 0 ? 'Pendientes de revision' : 'Sin pendientes'}
        icon={Bell}
        iconColor={stats.recomendacionesPendientes > 0 ? 'text-amber-500' : 'text-muted-foreground'}
      />
    </div>
  );
}
