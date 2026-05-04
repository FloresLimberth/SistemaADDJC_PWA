'use client';

import { memo } from 'react';
import {
  ResponsiveContainer,
  ComposedChart,
  Bar,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from 'recharts';
import { COLORES_GRAFICO } from '@/components/charts/config/colores';
import { EstadoVacioGrafico } from '@/components/charts/estado-vacio-grafico';
import type { AsistenciaGrupalDataPoint } from '../actions/fetch-asistencia-grupal';

interface Props {
  data: AsistenciaGrupalDataPoint[];
}

// Tooltip personalizado
function CustomTooltip({ active, payload }: any) {
  if (!active || !payload || !payload.length) return null;

  const data = payload[0].payload as AsistenciaGrupalDataPoint;

  return (
    <div className="bg-white p-3 border border-gray-200 rounded-lg shadow-lg">
      <p className="font-semibold text-gray-900 mb-2">{data.semanaLabel}</p>
      <div className="space-y-1 text-sm">
        <p style={{ color: COLORES_GRAFICO.verde }}>
          Asistieron: <span className="font-medium">{data.asistieron}</span>
        </p>
        <p style={{ color: COLORES_GRAFICO.rojo }}>
          Faltaron: <span className="font-medium">{data.faltaron}</span>
        </p>
        <p className="text-gray-700 font-medium pt-1 border-t border-gray-100">
          Asistencia: {data.porcentajeAsistencia}%
        </p>
      </div>
    </div>
  );
}

export const AsistenciaGrupalChart = memo(({ data }: Props) => {
  if (!data || data.length === 0) {
    return (
      <EstadoVacioGrafico
        titulo="Sin datos de asistencia"
        descripcion="Se generan a partir de los registros post-entrenamiento"
      />
    );
  }

  return (
    <ResponsiveContainer width="100%" height={320}>
      <ComposedChart
        data={data}
        margin={{ top: 10, right: 30, left: 10, bottom: 10 }}
      >
        <CartesianGrid strokeDasharray="3 3" stroke={COLORES_GRAFICO.grid} />

        <XAxis
          dataKey="semanaLabel"
          stroke={COLORES_GRAFICO.ejeTexto}
          style={{ fontSize: '10px' }}
          interval={0}
          angle={-15}
          textAnchor="end"
          height={50}
        />

        <YAxis
          yAxisId="count"
          orientation="left"
          stroke={COLORES_GRAFICO.ejeTexto}
          style={{ fontSize: '11px' }}
          label={{ value: 'Registros', angle: -90, position: 'insideLeft', style: { fontSize: '10px' } }}
        />

        <YAxis
          yAxisId="percent"
          orientation="right"
          domain={[0, 100]}
          stroke={COLORES_GRAFICO.ejeTexto}
          style={{ fontSize: '11px' }}
          tickFormatter={(v) => `${v}%`}
        />

        <Tooltip content={<CustomTooltip />} />
        <Legend wrapperStyle={{ fontSize: '12px' }} />

        <Bar
          yAxisId="count"
          dataKey="asistieron"
          fill={COLORES_GRAFICO.verde}
          name="Asistieron"
          radius={[4, 4, 0, 0]}
          stackId="stack"
        />

        <Bar
          yAxisId="count"
          dataKey="faltaron"
          fill={COLORES_GRAFICO.rojo}
          name="Faltaron"
          radius={[4, 4, 0, 0]}
          stackId="stack"
          opacity={0.6}
        />

        <Line
          yAxisId="percent"
          type="monotone"
          dataKey="porcentajeAsistencia"
          stroke={COLORES_GRAFICO.azul}
          strokeWidth={2}
          dot={{ r: 4, fill: COLORES_GRAFICO.azul }}
          name="% Asistencia"
        />
      </ComposedChart>
    </ResponsiveContainer>
  );
});

AsistenciaGrupalChart.displayName = 'AsistenciaGrupalChart';
