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
import type { VO2maxDataPoint } from '../types/progreso.types';

interface VO2maxEvolutionChartProps {
  data: VO2maxDataPoint[];
}

// Tooltip personalizado para mejor UX
// Siguiendo mejores prácticas de progressive disclosure
function CustomTooltip({ active, payload }: any) {
  if (!active || !payload || !payload.length) {
    return null;
  }

  const data = payload[0].payload as VO2maxDataPoint;

  return (
    <div className="bg-white p-3 border border-gray-200 rounded-lg shadow-lg">
      <p className="font-semibold text-gray-900 mb-2">{data.fecha}</p>
      <div className="space-y-1">
        <p className="text-blue-600 font-medium">
          VO2max: {data.vo2max.toFixed(2)} ml/kg/min
        </p>
        <p className="text-gray-600 text-sm">
          Palier: {data.palier.toFixed(1)}
        </p>
        {data.clasificacion && (
          <p className="text-sm text-gray-500">
            Clasificacion: {data.clasificacion}
          </p>
        )}
      </div>
    </div>
  );
}

// Componente de gráfico de evolución de VO2max
// Implementación basada en mejores prácticas investigadas:
// - ResponsiveContainer para responsividad
// - XAxis type="number" para series temporales continuas
// - Tooltip personalizado para progressive disclosure
// - ReferenceLine para objetivo visual
// - Memo para optimización de performance
export const VO2maxEvolutionChart = memo(({ data }: VO2maxEvolutionChartProps) => {
  const objetivo = 60; // Objetivo VO2max estándar para hombres

  // Si no hay datos, mostrar mensaje
  if (!data || data.length === 0) {
    return (
      <div className="flex items-center justify-center h-96 bg-gray-50 rounded-lg border border-gray-200">
        <div className="text-center">
          <p className="text-gray-500 font-medium">No hay datos de VO2max disponibles</p>
          <p className="text-gray-400 text-sm mt-1">
            Completa un test de Navette para ver tu evolución
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full">
      <ResponsiveContainer width="100%" height={400}>
        <LineChart
          data={data}
          margin={{ top: 20, right: 30, left: 20, bottom: 20 }}
        >
          <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />

          {/* Eje X: Timestamps numéricos para series temporales continuas */}
          <XAxis
            dataKey="timestamp"
            type="number"
            domain={['dataMin', 'dataMax']}
            tickFormatter={(timestamp) => {
              const date = new Date(timestamp);
              return date.toLocaleDateString('es-ES', {
                month: 'short',
                year: '2-digit'
              });
            }}
            stroke="#6b7280"
            style={{ fontSize: '12px' }}
          />

          {/* Eje Y: VO2max con rango razonable */}
          <YAxis
            domain={[30, 70]}
            stroke="#6b7280"
            style={{ fontSize: '12px' }}
            label={{
              value: 'VO2max (ml/kg/min)',
              angle: -90,
              position: 'insideLeft',
              style: { fontSize: '12px', fill: '#6b7280' }
            }}
          />

          {/* Tooltip personalizado */}
          <Tooltip content={<CustomTooltip />} />

          {/* Leyenda */}
          <Legend
            wrapperStyle={{ fontSize: '12px' }}
            iconType="line"
          />

          {/* Línea de referencia para objetivo */}
          <ReferenceLine
            y={objetivo}
            stroke="#ef4444"
            strokeDasharray="3 3"
            label={{
              value: 'Objetivo',
              position: 'right',
              fill: '#ef4444',
              fontSize: 12
            }}
          />

          {/* Línea de evolución VO2max */}
          <Line
            type="monotone"
            dataKey="vo2max"
            stroke="#3b82f6"
            strokeWidth={2}
            dot={{ r: 4, fill: '#3b82f6' }}
            activeDot={{ r: 6 }}
            name="VO2max"
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
});

VO2maxEvolutionChart.displayName = 'VO2maxEvolutionChart';
