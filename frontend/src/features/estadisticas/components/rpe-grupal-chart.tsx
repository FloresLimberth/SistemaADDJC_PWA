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
  ReferenceLine,
} from 'recharts';
import { COLORES_GRAFICO } from '@/components/charts/config/colores';
import { EstadoVacioGrafico } from '@/components/charts/estado-vacio-grafico';
import type { BienestarGrupalDataPoint } from '../actions/fetch-bienestar-grupal';

interface Props {
  data: BienestarGrupalDataPoint[];
}

// Tooltip personalizado con las metricas grupales
function CustomTooltip({ active, payload }: any) {
  if (!active || !payload || !payload.length) return null;

  const data = payload[0].payload as BienestarGrupalDataPoint;
  const fecha = new Date(data.fecha).toLocaleDateString('es-ES', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });

  return (
    <div className="bg-white p-3 border border-gray-200 rounded-lg shadow-lg">
      <p className="font-semibold text-gray-900 mb-2">{fecha}</p>
      <div className="space-y-1 text-sm">
        <p style={{ color: COLORES_GRAFICO.rpe }}>
          RPE Promedio: <span className="font-medium">{data.rpePromedio}</span>
        </p>
        <p style={{ color: COLORES_GRAFICO.rojo }}>
          RPE Max: <span className="font-medium">{data.rpeMax}</span>
        </p>
        <p style={{ color: COLORES_GRAFICO.cyan }}>
          RPE Min: <span className="font-medium">{data.rpeMin}</span>
        </p>
        <p className="text-gray-500 pt-1 border-t border-gray-100">
          {data.atletasConRegistro} atleta{data.atletasConRegistro !== 1 ? 's' : ''} con registro
        </p>
      </div>
    </div>
  );
}

export const RPEGrupalChart = memo(({ data }: Props) => {
  if (!data || data.length === 0) {
    return (
      <EstadoVacioGrafico
        titulo="Sin datos de RPE grupal"
        descripcion="Se generan a partir de los registros post-entrenamiento de todos los atletas"
      />
    );
  }

  // Agregar timestamp para el eje X
  const chartData = data.map((d) => ({
    ...d,
    timestamp: new Date(d.fecha).getTime(),
  }));

  return (
    <ResponsiveContainer width="100%" height={320}>
      <LineChart
        data={chartData}
        margin={{ top: 10, right: 30, left: 10, bottom: 10 }}
      >
        <CartesianGrid strokeDasharray="3 3" stroke={COLORES_GRAFICO.grid} />

        <XAxis
          dataKey="timestamp"
          type="number"
          domain={['dataMin', 'dataMax']}
          tickFormatter={(ts) =>
            new Date(ts).toLocaleDateString('es-ES', { day: '2-digit', month: 'short' })
          }
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

        {/* Linea de umbral de fatiga en RPE = 8 */}
        <ReferenceLine
          y={8}
          stroke={COLORES_GRAFICO.umbralAlto}
          strokeDasharray="6 3"
          label={{ value: 'Umbral fatiga', position: 'right', fontSize: 10, fill: COLORES_GRAFICO.umbralAlto }}
        />

        <Line
          type="monotone"
          dataKey="rpePromedio"
          stroke={COLORES_GRAFICO.rpe}
          strokeWidth={2.5}
          dot={{ r: 4, fill: COLORES_GRAFICO.rpe }}
          activeDot={{ r: 6 }}
          name="RPE Promedio"
        />

        <Line
          type="monotone"
          dataKey="rpeMax"
          stroke={COLORES_GRAFICO.rojo}
          strokeWidth={1.5}
          strokeDasharray="4 2"
          dot={{ r: 2 }}
          name="RPE Max"
        />

        <Line
          type="monotone"
          dataKey="rpeMin"
          stroke={COLORES_GRAFICO.cyan}
          strokeWidth={1.5}
          strokeDasharray="4 2"
          dot={{ r: 2 }}
          name="RPE Min"
        />
      </LineChart>
    </ResponsiveContainer>
  );
});

RPEGrupalChart.displayName = 'RPEGrupalChart';
