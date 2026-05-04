'use client';

import { memo } from 'react';
import { Activity, TrendingUp, Moon, Target } from 'lucide-react';
import type { ProgresoStats } from '../types/progreso.types';

interface ProgresoStatsGridProps {
  stats: ProgresoStats;
}

interface StatCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: React.ReactNode;
  color: string;
}

// Componente de tarjeta individual de estadística
function StatCard({ title, value, subtitle, icon, color }: StatCardProps) {
  return (
    <div className="bg-white rounded-lg border border-gray-200 p-5 shadow-sm hover:shadow-md transition-shadow">
      <div className="flex items-center justify-between mb-3">
        <div className={`p-2 rounded-lg ${color}`}>
          {icon}
        </div>
      </div>
      <div>
        <p className="text-sm text-gray-600 font-medium mb-1">{title}</p>
        <p className="text-2xl font-bold text-gray-900">{value}</p>
        {subtitle && (
          <p className="text-xs text-gray-500 mt-1">{subtitle}</p>
        )}
      </div>
    </div>
  );
}

// Componente de grid de estadísticas de progreso
// Muestra KPIs principales en tarjetas siguiendo mejores prácticas:
// - No más de 5-6 métricas en vista inicial
// - Jerarquía visual clara
// - Información más importante primero
export const ProgresoStatsGrid = memo(({ stats }: ProgresoStatsGridProps) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {/* KPI 1: VO2max Actual */}
      <StatCard
        title="VO2max Actual"
        value={stats.vo2maxActual !== null ? `${stats.vo2maxActual.toFixed(1)} ml/kg/min` : '-'}
        subtitle={stats.vo2maxClasificacion || undefined}
        icon={<Target className="w-5 h-5 text-blue-600" />}
        color="bg-blue-50"
      />

      {/* KPI 2: RPE Promedio */}
      <StatCard
        title="RPE Promedio"
        value={stats.rpePromedio !== null ? stats.rpePromedio.toFixed(1) : '-'}
        subtitle={
          stats.rpePromedio !== null
            ? stats.rpePromedio > 8
              ? 'Carga alta - Riesgo fatiga'
              : stats.rpePromedio > 6
              ? 'Carga moderada'
              : 'Carga baja'
            : undefined
        }
        icon={<TrendingUp className="w-5 h-5 text-red-600" />}
        color="bg-red-50"
      />

      {/* KPI 3: Tests Realizados */}
      <StatCard
        title="Tests Físicos"
        value={stats.testsRealizados}
        subtitle={`${stats.testsRealizados} test${stats.testsRealizados !== 1 ? 's' : ''} completado${stats.testsRealizados !== 1 ? 's' : ''}`}
        icon={<Activity className="w-5 h-5 text-green-600" />}
        color="bg-green-50"
      />

      {/* KPI 4: Calidad Sueño Promedio */}
      <StatCard
        title="Calidad Sueño"
        value={stats.calidadSuenoPromedio !== null ? `${stats.calidadSuenoPromedio.toFixed(1)}/10` : '-'}
        subtitle={
          stats.horasSuenoPromedio !== null
            ? `${stats.horasSuenoPromedio.toFixed(1)}h promedio`
            : undefined
        }
        icon={<Moon className="w-5 h-5 text-purple-600" />}
        color="bg-purple-50"
      />
    </div>
  );
});

ProgresoStatsGrid.displayName = 'ProgresoStatsGrid';
