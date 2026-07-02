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
  Cell,
} from 'recharts';
import type { TestsComparisonDataPoint } from '../types/progreso.types';

interface TestsComparisonChartProps {
  data: TestsComparisonDataPoint[];
}

// Tooltip personalizado
function CustomTooltip({ active, payload }: any) {
  if (!active || !payload || !payload.length) {
    return null;
  }

  const data = payload[0].payload as TestsComparisonDataPoint;

  return (
    <div className="bg-white p-3 border border-gray-200 rounded-lg shadow-lg">
      <p className="font-semibold text-gray-900 mb-2">{data.nombre}</p>
      <div className="space-y-1">
        <p className="text-blue-600 font-medium">
          Actual: {data.actual} {data.unidad}
        </p>
        <p className="text-green-600 font-medium">
          Mejor Marca: {data.mejor} {data.unidad}
        </p>
        {data.mejor > data.actual && (
          <p className="text-gray-500 text-sm">
            Diferencia: -{(data.mejor - data.actual).toFixed(1)} {data.unidad}
          </p>
        )}
        {data.actual >= data.mejor && data.actual > 0 && (
          <p className="text-green-600 text-sm font-medium">
            Nuevo récord personal
          </p>
        )}
      </div>
    </div>
  );
}

// Componente de gráfico de comparación de tests físicos
// Muestra barras horizontales comparando test actual vs mejor marca personal
export const TestsComparisonChart = memo(({ data }: TestsComparisonChartProps) => {
  if (!data || data.length === 0) {
    return (
      <div className="flex items-center justify-center h-80 bg-gray-50 rounded-lg border border-gray-200">
        <div className="text-center">
          <p className="text-gray-500 font-medium">No hay datos de tests disponibles</p>
          <p className="text-gray-400 text-sm mt-1">
            Completa tests físicos para ver tu comparación
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full">
      <ResponsiveContainer width="100%" height={300}>
        <BarChart
          data={data}
          layout="vertical"
          margin={{ top: 20, right: 30, left: 10, bottom: 20 }}
        >
          <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />

          {/* Eje X numerico (valores) */}
          <XAxis
            type="number"
            stroke="#6b7280"
            style={{ fontSize: '12px' }}
          />

          {/* Eje Y categorico (nombres de tests) */}
          <YAxis
            dataKey="nombre"
            type="category"
            width={100}
            stroke="#6b7280"
            style={{ fontSize: '11px' }}
          />

          <Tooltip content={<CustomTooltip />} />

          <Legend
            wrapperStyle={{ fontSize: '12px' }}
            iconType="rect"
          />

          {/* Barra de valor actual */}
          <Bar
            dataKey="actual"
            fill="#3b82f6"
            name="Actual"
            radius={[0, 4, 4, 0]}
          />

          {/* Barra de mejor marca */}
          <Bar
            dataKey="mejor"
            fill="#10b981"
            name="Mejor Marca"
            radius={[0, 4, 4, 0]}
          />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
});

TestsComparisonChart.displayName = 'TestsComparisonChart';
