'use client';

import { memo, useMemo } from 'react';
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
import { formatearFechaCorta, formatearFechaTooltip, formatearPorcentaje } from '@/components/charts/config/formateadores';
import { EstadoVacioGrafico } from '@/components/charts/estado-vacio-grafico';
import type { CargaPlanVsRealDataPoint } from '../actions/fetch-carga-plan-vs-real';

interface Props {
  data: CargaPlanVsRealDataPoint[];
}

// Tooltip personalizado mostrando plan vs real y cumplimiento
function CustomTooltip({ active, payload }: any) {
  if (!active || !payload || !payload.length) return null;

  const item = payload[0].payload;

  return (
    <div className="bg-white p-3 border border-gray-200 rounded-lg shadow-lg">
      <p className="font-semibold text-gray-900 mb-1">
        {formatearFechaTooltip(item.timestamp)}
      </p>
      <p className="text-xs text-gray-500 mb-2">
        Sesion {item.numeroSesion} - {item.tipoSesion}
      </p>
      <div className="space-y-1 text-sm">
        <p style={{ color: COLORES_GRAFICO.anterior }}>
          Planificada: <span className="font-medium">{item.intensidadPlanificada ?? 'N/A'}%</span>
        </p>
        <p style={{ color: COLORES_GRAFICO.actual }}>
          Alcanzada: <span className="font-medium">{item.intensidadAlcanzada}%</span>
        </p>
        {item.cumplimiento !== null && (
          <p className={item.cumplimiento >= 90 ? 'text-green-600' : item.cumplimiento >= 70 ? 'text-amber-600' : 'text-red-600'}>
            Cumplimiento: <span className="font-medium">{item.cumplimiento}%</span>
          </p>
        )}
      </div>
    </div>
  );
}

export const IntensidadPlanVsRealChart = memo(function IntensidadPlanVsRealChart({ data }: Props) {
  if (!data || data.length === 0) {
    return (
      <EstadoVacioGrafico
        titulo="Sin datos de intensidad"
        descripcion="No hay sesiones con datos de intensidad planificada y registros reales."
      />
    );
  }

  // Transformar fechas y preparar datos
  const chartData = useMemo(() =>
    data.map((item) => ({
      ...item,
      timestamp: new Date(item.fecha).getTime(),
    })),
  [data]);

  return (
    <div className="w-full">
      <ResponsiveContainer width="100%" height={350}>
        <ComposedChart
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
            domain={[0, 100]}
            tickFormatter={formatearPorcentaje}
            stroke={COLORES_GRAFICO.ejeTexto}
            style={{ fontSize: '11px' }}
          />

          <Tooltip content={<CustomTooltip />} />
          <Legend wrapperStyle={{ fontSize: '12px' }} />

          {/* Barras de intensidad planificada (fondo, mas claro) */}
          <Bar
            dataKey="intensidadPlanificada"
            fill={COLORES_GRAFICO.anterior}
            opacity={0.6}
            name="Planificada"
            maxBarSize={30}
            radius={[2, 2, 0, 0]}
          />

          {/* Linea de intensidad alcanzada (primer plano, solida) */}
          <Line
            type="monotone"
            dataKey="intensidadAlcanzada"
            stroke={COLORES_GRAFICO.actual}
            strokeWidth={2.5}
            dot={{ r: 4, fill: COLORES_GRAFICO.actual }}
            activeDot={{ r: 6 }}
            name="Alcanzada"
          />
        </ComposedChart>
      </ResponsiveContainer>
    </div>
  );
});
