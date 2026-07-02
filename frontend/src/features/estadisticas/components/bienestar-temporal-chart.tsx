'use client';

import { memo, useMemo } from 'react';
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
import { formatearFechaCorta, formatearFechaTooltip } from '@/components/charts/config/formateadores';
import { EstadoVacioGrafico } from '@/components/charts/estado-vacio-grafico';
import type { BienestarDataPoint } from '../actions/fetch-bienestar-atleta';

interface Props {
  data: BienestarDataPoint[];
}

// Tooltip personalizado con las 3 metricas
function CustomTooltip({ active, payload }: any) {
  if (!active || !payload || !payload.length) return null;

  const item = payload[0].payload;

  return (
    <div className="bg-white p-3 border border-gray-200 rounded-lg shadow-lg">
      <p className="font-semibold text-gray-900 mb-2">
        {formatearFechaTooltip(item.timestamp)}
      </p>
      <div className="space-y-1 text-sm">
        <p style={{ color: COLORES_GRAFICO.rpe }}>
          RPE: <span className="font-medium">{item.rpe}/10</span>
        </p>
        <p style={{ color: COLORES_GRAFICO.sueno }}>
          Calidad sueno: <span className="font-medium">{item.calidadSueno}/10</span>
        </p>
        <p style={{ color: COLORES_GRAFICO.animo }}>
          Estado animico: <span className="font-medium">{item.estadoAnimico}/10</span>
        </p>
        {item.dolenciasCount > 0 && (
          <p className="text-red-500">
            Dolencias: <span className="font-medium">{item.dolenciasCount}</span>
          </p>
        )}
      </div>
    </div>
  );
}

export const BienestarTemporalChart = memo(function BienestarTemporalChart({ data }: Props) {
  if (!data || data.length === 0) {
    return (
      <EstadoVacioGrafico
        titulo="Sin datos de bienestar"
        descripcion="No hay registros post-entrenamiento para generar el grafico de bienestar."
      />
    );
  }

  // Transformar fechas a timestamps para eje X continuo
  const chartData = useMemo(() =>
    data.map((item) => ({
      ...item,
      timestamp: new Date(item.fecha).getTime(),
    })),
  [data]);

  return (
    <div className="w-full">
      <ResponsiveContainer width="100%" height={350}>
        <LineChart
          data={chartData}
          margin={{ top: 10, right: 30, left: 10, bottom: 10 }}
        >
          <CartesianGrid strokeDasharray="3 3" stroke={COLORES_GRAFICO.grid} />

          <XAxis
            dataKey="timestamp"
            type="number"
            domain={['dataMin', 'dataMax']}
            tickFormatter={formatearFechaCorta}
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

          {/* Umbral de fatiga (RPE >= 8) */}
          <ReferenceLine
            y={8}
            stroke={COLORES_GRAFICO.umbralAlto}
            strokeDasharray="5 5"
            label={{ value: 'Umbral fatiga', position: 'right', fontSize: 10, fill: COLORES_GRAFICO.umbralAlto }}
          />

          {/* Linea de RPE */}
          <Line
            type="monotone"
            dataKey="rpe"
            stroke={COLORES_GRAFICO.rpe}
            strokeWidth={2}
            dot={{ r: 3, fill: COLORES_GRAFICO.rpe }}
            activeDot={{ r: 5 }}
            name="RPE"
          />

          {/* Linea de calidad de sueno */}
          <Line
            type="monotone"
            dataKey="calidadSueno"
            stroke={COLORES_GRAFICO.sueno}
            strokeWidth={2}
            dot={{ r: 3, fill: COLORES_GRAFICO.sueno }}
            activeDot={{ r: 5 }}
            name="Calidad Sueno"
          />

          {/* Linea de estado animico */}
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
