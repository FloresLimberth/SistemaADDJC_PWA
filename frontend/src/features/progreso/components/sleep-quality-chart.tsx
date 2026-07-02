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
import type { SleepDataPoint } from '../types/progreso.types';

interface SleepQualityChartProps {
  data: SleepDataPoint[];
}

// Tooltip personalizado
function CustomTooltip({ active, payload }: any) {
  if (!active || !payload || !payload.length) {
    return null;
  }

  const data = payload[0].payload as SleepDataPoint;

  return (
    <div className="bg-white p-3 border border-gray-200 rounded-lg shadow-lg">
      <p className="font-semibold text-gray-900 mb-2">{data.fecha}</p>
      <div className="space-y-1">
        <p className="text-purple-600 font-medium">
          Calidad: {data.calidadSueno}/10
        </p>
        <p className="text-cyan-600 font-medium">
          Horas: {data.horasSueno.toFixed(1)}h
        </p>
      </div>
    </div>
  );
}

// Componente de gráfico de calidad de sueño
// Muestra calidad de sueño (1-10) y horas de sueño en el mismo gráfico con doble eje Y
export const SleepQualityChart = memo(({ data }: SleepQualityChartProps) => {
  if (!data || data.length === 0) {
    return (
      <div className="flex items-center justify-center h-80 bg-gray-50 rounded-lg border border-gray-200">
        <div className="text-center">
          <p className="text-gray-500 font-medium">No hay datos de sueño disponibles</p>
          <p className="text-gray-400 text-sm mt-1">
            Completa registros post-entrenamiento para ver tu recuperación
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
          margin={{ top: 20, right: 50, left: 20, bottom: 20 }}
        >
          <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />

          <XAxis
            dataKey="fecha"
            stroke="#6b7280"
            style={{ fontSize: '12px' }}
          />

          {/* Eje Y izquierdo: Calidad (1-10) */}
          <YAxis
            yAxisId="left"
            domain={[0, 10]}
            stroke="#8b5cf6"
            style={{ fontSize: '12px' }}
            label={{
              value: 'Calidad (1-10)',
              angle: -90,
              position: 'insideLeft',
              style: { fontSize: '12px', fill: '#8b5cf6' }
            }}
          />

          {/* Eje Y derecho: Horas (0-12) */}
          <YAxis
            yAxisId="right"
            orientation="right"
            domain={[0, 12]}
            stroke="#06b6d4"
            style={{ fontSize: '12px' }}
            label={{
              value: 'Horas',
              angle: 90,
              position: 'insideRight',
              style: { fontSize: '12px', fill: '#06b6d4' }
            }}
          />

          <Tooltip content={<CustomTooltip />} />

          <Legend
            wrapperStyle={{ fontSize: '12px' }}
            iconType="line"
          />

          {/* Línea de calidad de sueño (eje izquierdo) */}
          <Line
            yAxisId="left"
            type="monotone"
            dataKey="calidadSueno"
            stroke="#8b5cf6"
            strokeWidth={2}
            dot={{ r: 4, fill: '#8b5cf6' }}
            activeDot={{ r: 6 }}
            name="Calidad"
          />

          {/* Línea de horas de sueño (eje derecho) */}
          <Line
            yAxisId="right"
            type="monotone"
            dataKey="horasSueno"
            stroke="#06b6d4"
            strokeWidth={2}
            dot={{ r: 4, fill: '#06b6d4' }}
            activeDot={{ r: 6 }}
            name="Horas"
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
});

SleepQualityChart.displayName = 'SleepQualityChart';
