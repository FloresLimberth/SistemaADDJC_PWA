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
  ReferenceLine,
  Legend,
} from 'recharts';
import type { RPEWeeklyDataPoint } from '../types/progreso.types';

interface RPEWeeklyChartProps {
  data: RPEWeeklyDataPoint[];
}

// Tooltip personalizado
function CustomTooltip({ active, payload }: any) {
  if (!active || !payload || !payload.length) {
    return null;
  }

  const data = payload[0].payload as RPEWeeklyDataPoint;

  return (
    <div className="bg-white p-3 border border-gray-200 rounded-lg shadow-lg">
      <p className="font-semibold text-gray-900 mb-2">{data.semana}</p>
      <div className="space-y-1">
        <p className="text-red-600 font-medium">
          RPE Promedio: {data.rpePromedio.toFixed(1)}
        </p>
        <p className="text-gray-600 text-sm">
          Sesiones: {data.sesiones}
        </p>
        <p className="text-gray-500 text-xs">
          {data.fechaInicio.toLocaleDateString('es-ES')} - {data.fechaFin.toLocaleDateString('es-ES')}
        </p>
      </div>
    </div>
  );
}

// Componente de gráfico RPE semanal
// Muestra el RPE promedio por semana con umbral de fatiga
export const RPEWeeklyChart = memo(({ data }: RPEWeeklyChartProps) => {
  const umbralFatiga = 8; // RPE > 8 indica fatiga según investigación

  if (!data || data.length === 0) {
    return (
      <div className="flex items-center justify-center h-80 bg-gray-50 rounded-lg border border-gray-200">
        <div className="text-center">
          <p className="text-gray-500 font-medium">No hay datos de RPE disponibles</p>
          <p className="text-gray-400 text-sm mt-1">
            Completa registros post-entrenamiento para ver tu carga de trabajo
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
          margin={{ top: 20, right: 30, left: 20, bottom: 20 }}
        >
          <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />

          <XAxis
            dataKey="semana"
            stroke="#6b7280"
            style={{ fontSize: '12px' }}
          />

          <YAxis
            domain={[0, 10]}
            stroke="#6b7280"
            style={{ fontSize: '12px' }}
            label={{
              value: 'RPE (1-10)',
              angle: -90,
              position: 'insideLeft',
              style: { fontSize: '12px', fill: '#6b7280' }
            }}
          />

          <Tooltip content={<CustomTooltip />} />

          <Legend
            wrapperStyle={{ fontSize: '12px' }}
            iconType="line"
          />

          {/* Línea de umbral de fatiga */}
          <ReferenceLine
            y={umbralFatiga}
            stroke="#f97316"
            strokeDasharray="3 3"
            label={{
              value: 'Umbral Fatiga',
              position: 'right',
              fill: '#f97316',
              fontSize: 12
            }}
          />

          {/* Línea de RPE promedio */}
          <Line
            type="monotone"
            dataKey="rpePromedio"
            stroke="#ef4444"
            strokeWidth={2}
            dot={{ r: 4, fill: '#ef4444' }}
            activeDot={{ r: 6 }}
            name="RPE Promedio"
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
});

RPEWeeklyChart.displayName = 'RPEWeeklyChart';
