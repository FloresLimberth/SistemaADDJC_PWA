'use client';

import { memo } from 'react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from 'recharts';
import { COLORES_GRAFICO } from '@/components/charts/config/colores';
import { EstadoVacioGrafico } from '@/components/charts/estado-vacio-grafico';
import type { EstadisticaCategoria } from '../actions/fetch-ranking-overview';

interface Props {
  data: EstadisticaCategoria[];
}

// Formatear nombre de categoria: "MENOS_60K" -> "<60K"
function formatCategoria(cat: string): string {
  return cat
    .replace('MENOS_', '<')
    .replace('MAS_', '>')
    .replace('K', ' kg');
}

// Tooltip personalizado
function CustomTooltip({ active, payload, label }: any) {
  if (!active || !payload || !payload.length) return null;

  return (
    <div className="bg-white p-3 border border-gray-200 rounded-lg shadow-lg">
      <p className="font-semibold text-gray-900 mb-1">{label}</p>
      {payload.map((item: any) => (
        <p key={item.name} className="text-sm" style={{ color: item.fill }}>
          {item.name}: {item.value}
        </p>
      ))}
    </div>
  );
}

export const AptitudCategoriaChart = memo(function AptitudCategoriaChart({ data }: Props) {
  if (!data || data.length === 0) {
    return (
      <EstadoVacioGrafico
        titulo="Sin datos por categoria"
        descripcion="No hay estadisticas de aptitud por categoria de peso."
      />
    );
  }

  // Preparar datos con nombres formateados
  const chartData = data.map((cat) => ({
    ...cat,
    categoriaLabel: formatCategoria(cat.categoria),
  }));

  return (
    <div className="w-full">
      <ResponsiveContainer width="100%" height={320}>
        <BarChart
          data={chartData}
          margin={{ top: 10, right: 20, left: 10, bottom: 5 }}
        >
          <CartesianGrid strokeDasharray="3 3" stroke={COLORES_GRAFICO.grid} />
          <XAxis
            dataKey="categoriaLabel"
            stroke={COLORES_GRAFICO.ejeTexto}
            style={{ fontSize: '11px' }}
          />
          <YAxis
            stroke={COLORES_GRAFICO.ejeTexto}
            style={{ fontSize: '12px' }}
            allowDecimals={false}
          />
          <Tooltip content={<CustomTooltip />} />
          <Legend wrapperStyle={{ fontSize: '12px' }} iconType="rect" iconSize={12} />
          <Bar
            dataKey="aptos"
            name="Aptos"
            stackId="aptitud"
            fill={COLORES_GRAFICO.verde}
            radius={[0, 0, 0, 0]}
          />
          <Bar
            dataKey="reservas"
            name="Reservas"
            stackId="aptitud"
            fill={COLORES_GRAFICO.ambar}
            radius={[0, 0, 0, 0]}
          />
          <Bar
            dataKey="noAptos"
            name="No aptos"
            stackId="aptitud"
            fill={COLORES_GRAFICO.rojo}
            radius={[4, 4, 0, 0]}
          />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
});
