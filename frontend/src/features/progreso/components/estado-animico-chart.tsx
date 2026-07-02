'use client';

import { memo } from 'react';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from 'recharts';
import { COLORES_GRAFICO } from '@/components/charts/config/colores';
import type { EstadoAnimicoDataPoint } from '../types/progreso.types';

interface EstadoAnimicoChartProps {
  data: EstadoAnimicoDataPoint[];
}

// Tooltip personalizado
function CustomTooltip({ active, payload }: any) {
  if (!active || !payload || !payload.length) return null;

  const data = payload[0].payload as EstadoAnimicoDataPoint;

  return (
    <div className="bg-white p-3 border border-gray-200 rounded-lg shadow-lg">
      <p className="font-semibold text-gray-900 mb-1">{data.fecha}</p>
      <p style={{ color: COLORES_GRAFICO.animo }} className="text-sm">
        Estado animico: <span className="font-medium">{data.estadoAnimico}/10</span>
      </p>
    </div>
  );
}

export const EstadoAnimicoChart = memo(({ data }: EstadoAnimicoChartProps) => {
  if (!data || data.length === 0) {
    return (
      <div className="flex items-center justify-center h-80 bg-gray-50 rounded-lg border border-gray-200">
        <div className="text-center">
          <p className="text-gray-500 font-medium">No hay datos de estado animico</p>
          <p className="text-gray-400 text-sm mt-1">
            Los datos se generan a partir de tus registros post-entrenamiento
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full">
      <ResponsiveContainer width="100%" height={320}>
        <LineChart
          data={data}
          margin={{ top: 10, right: 30, left: 10, bottom: 10 }}
        >
          <CartesianGrid strokeDasharray="3 3" stroke={COLORES_GRAFICO.grid} />

          <XAxis
            dataKey="timestamp"
            type="number"
            domain={['dataMin', 'dataMax']}
            tickFormatter={(timestamp) => {
              const date = new Date(timestamp);
              return date.toLocaleDateString('es-ES', { day: '2-digit', month: 'short' });
            }}
            stroke={COLORES_GRAFICO.ejeTexto}
            style={{ fontSize: '11px' }}
          />

          <YAxis
            domain={[0, 10]}
            ticks={[0, 2, 4, 6, 8, 10]}
            stroke={COLORES_GRAFICO.ejeTexto}
            style={{ fontSize: '11px' }}
          />

          <Tooltip content={<CustomTooltip />} />
          <Legend wrapperStyle={{ fontSize: '12px' }} iconType="line" />

          <Line
            type="monotone"
            dataKey="estadoAnimico"
            stroke={COLORES_GRAFICO.animo}
            strokeWidth={2}
            dot={{ r: 3, fill: COLORES_GRAFICO.animo }}
            activeDot={{ r: 5 }}
            name="Estado Animico"
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
});

EstadoAnimicoChart.displayName = 'EstadoAnimicoChart';
