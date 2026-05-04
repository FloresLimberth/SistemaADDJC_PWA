'use client';

import { memo } from 'react';
import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
} from 'recharts';
import { COLORES_GRAFICO } from '@/components/charts/config/colores';
import { EstadoVacioGrafico } from '@/components/charts/estado-vacio-grafico';
import type { EstadisticasRecomendaciones } from '../actions/fetch-recomendaciones-stats';

interface Props {
  data: EstadisticasRecomendaciones;
}

// Configuracion de segmentos del donut
const SEGMENTOS = [
  { key: 'pendientes', label: 'Pendientes', color: COLORES_GRAFICO.ambar },
  { key: 'enProceso', label: 'En proceso', color: COLORES_GRAFICO.azul },
  { key: 'cumplidas', label: 'Cumplidas', color: COLORES_GRAFICO.verde },
  { key: 'rechazadas', label: 'Rechazadas', color: COLORES_GRAFICO.rojo },
  { key: 'modificadas', label: 'Modificadas', color: COLORES_GRAFICO.violeta },
] as const;

// Tooltip personalizado
function CustomTooltip({ active, payload }: any) {
  if (!active || !payload || !payload.length) return null;

  const { name, value } = payload[0];
  return (
    <div className="bg-white p-3 border border-gray-200 rounded-lg shadow-lg">
      <p className="font-semibold text-gray-900">{name}</p>
      <p className="text-sm text-gray-600">{value} recomendaciones</p>
    </div>
  );
}

export const RecomendacionesDonutChart = memo(function RecomendacionesDonutChart({ data }: Props) {
  if (!data || !data.resumen) {
    return (
      <EstadoVacioGrafico
        titulo="Sin recomendaciones"
        descripcion="No hay recomendaciones registradas en el sistema."
      />
    );
  }

  const { resumen } = data;

  // Construir datos del pie chart
  const chartData = SEGMENTOS
    .map((seg) => ({
      name: seg.label,
      value: resumen[seg.key] as number,
      color: seg.color,
    }))
    .filter((d) => d.value > 0);

  if (chartData.length === 0) {
    return (
      <EstadoVacioGrafico
        titulo="Sin recomendaciones"
        descripcion="Todas las categorias tienen valor 0."
      />
    );
  }

  return (
    <div className="w-full">
      <ResponsiveContainer width="100%" height={320}>
        <PieChart>
          <Pie
            data={chartData}
            cx="50%"
            cy="50%"
            innerRadius={60}
            outerRadius={100}
            paddingAngle={3}
            dataKey="value"
            nameKey="name"
          >
            {chartData.map((entry, index) => (
              <Cell key={index} fill={entry.color} />
            ))}
          </Pie>
          <Tooltip content={<CustomTooltip />} />
          <Legend
            wrapperStyle={{ fontSize: '12px' }}
            iconType="circle"
            iconSize={10}
          />
        </PieChart>
      </ResponsiveContainer>

      {/* Total central como texto */}
      <div className="text-center -mt-4">
        <span className="text-2xl font-bold">{resumen.total}</span>
        <span className="text-sm text-muted-foreground ml-1">total</span>
      </div>
    </div>
  );
});
