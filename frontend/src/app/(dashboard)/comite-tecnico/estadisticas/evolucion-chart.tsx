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

interface TestDataPoint {
  id: string;
  fechaTest: string;
  valor: number;
}

interface EvolucionChartProps {
  data: TestDataPoint[];
  unidad: string;
  nombreTest: string;
}

// Tooltip personalizado siguiendo mejores practicas
// Fuente: Best Practices for Athlete Performance Dashboards
function CustomTooltip({ active, payload, unidad }: any) {
  if (!active || !payload || !payload.length) {
    return null;
  }

  const data = payload[0].payload as TestDataPoint & { fechaFormateada: string };

  return (
    <div className="bg-white p-3 border border-gray-200 rounded-lg shadow-lg">
      <p className="font-semibold text-gray-900 mb-2">{data.fechaFormateada}</p>
      <p className="text-blue-600 font-medium">
        Valor: {data.valor} {unidad}
      </p>
    </div>
  );
}

// Componente de grafico de evolucion
// Implementado siguiendo mejores practicas de visualizacion deportiva:
// - ResponsiveContainer para adaptabilidad
// - LineChart para mostrar tendencias temporales
// - Tooltip personalizado para detalles
// - Colores consistentes con el sistema de diseno
// Fuente: https://harvardsciencereview.org/2025/08/08/visualizing-sports-metrics
export const EvolucionChart = memo(({ data, unidad, nombreTest }: EvolucionChartProps) => {
  // Transformar datos para el grafico
  const chartData = data.map((item) => ({
    ...item,
    timestamp: new Date(item.fechaTest).getTime(),
    fechaFormateada: new Date(item.fechaTest).toLocaleDateString('es-ES', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    }),
  }));

  // Calcular dominio Y con margen
  const valores = data.map((d) => d.valor);
  const minValor = Math.min(...valores);
  const maxValor = Math.max(...valores);
  const margen = (maxValor - minValor) * 0.1 || 5;

  return (
    <div className="w-full">
      <ResponsiveContainer width="100%" height={400}>
        <LineChart
          data={chartData}
          margin={{ top: 20, right: 30, left: 20, bottom: 20 }}
        >
          <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />

          {/* Eje X: Timestamps para series temporales continuas */}
          <XAxis
            dataKey="timestamp"
            type="number"
            domain={['dataMin', 'dataMax']}
            tickFormatter={(timestamp) => {
              const date = new Date(timestamp);
              return date.toLocaleDateString('es-ES', {
                day: '2-digit',
                month: 'short',
              });
            }}
            stroke="#6b7280"
            style={{ fontSize: '12px' }}
          />

          {/* Eje Y con dominio dinamico */}
          <YAxis
            domain={[Math.floor(minValor - margen), Math.ceil(maxValor + margen)]}
            stroke="#6b7280"
            style={{ fontSize: '12px' }}
            label={{
              value: `${nombreTest} (${unidad})`,
              angle: -90,
              position: 'insideLeft',
              style: { fontSize: '12px', fill: '#6b7280' },
            }}
          />

          {/* Tooltip personalizado */}
          <Tooltip content={<CustomTooltip unidad={unidad} />} />

          {/* Leyenda */}
          <Legend wrapperStyle={{ fontSize: '12px' }} iconType="line" />

          {/* Linea de evolucion */}
          <Line
            type="monotone"
            dataKey="valor"
            stroke="#3b82f6"
            strokeWidth={2}
            dot={{ r: 5, fill: '#3b82f6' }}
            activeDot={{ r: 7 }}
            name={nombreTest}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
});

EvolucionChart.displayName = 'EvolucionChart';
