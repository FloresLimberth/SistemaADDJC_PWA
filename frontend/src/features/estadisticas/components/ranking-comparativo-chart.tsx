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
  Cell,
} from 'recharts';
import { COLORES_GRAFICO } from '@/components/charts/config/colores';
import { EstadoVacioGrafico } from '@/components/charts/estado-vacio-grafico';
import type { RankingAtletaResumen } from '../actions/fetch-ranking-overview';

interface Props {
  data: RankingAtletaResumen[];
}

// Color segun aptitud
const COLOR_APTITUD: Record<string, string> = {
  COMPETIR: COLORES_GRAFICO.verde,
  RESERVA: COLORES_GRAFICO.ambar,
  NO_APTO: COLORES_GRAFICO.rojo,
};

// Etiquetas legibles para aptitud
const ETIQUETA_APTITUD: Record<string, string> = {
  COMPETIR: 'Apto para competir',
  RESERVA: 'Reserva',
  NO_APTO: 'No apto',
};

// Tooltip personalizado
function CustomTooltip({ active, payload }: any) {
  if (!active || !payload || !payload.length) return null;

  const item = payload[0].payload as RankingAtletaResumen;
  return (
    <div className="bg-white p-3 border border-gray-200 rounded-lg shadow-lg">
      <p className="font-semibold text-gray-900">{item.nombreCompleto}</p>
      <p className="text-sm text-gray-500">{item.categoriaPeso.replace(/_/g, ' ')}</p>
      <p className="text-sm mt-1">
        Puntuacion: <span className="font-medium">{item.puntuacion.toFixed(1)}</span>
      </p>
      <p className="text-sm" style={{ color: COLOR_APTITUD[item.aptoPara] }}>
        {ETIQUETA_APTITUD[item.aptoPara]}
      </p>
    </div>
  );
}

export const RankingComparativoChart = memo(function RankingComparativoChart({ data }: Props) {
  if (!data || data.length === 0) {
    return (
      <EstadoVacioGrafico
        titulo="Sin datos de ranking"
        descripcion="No hay atletas evaluados en el ranking actual."
      />
    );
  }

  // Preparar datos: nombre corto para el eje Y
  const chartData = data.map((atleta) => ({
    ...atleta,
    nombreCorto: atleta.nombreCompleto.split(' ').slice(0, 2).join(' '),
  }));

  return (
    <div className="w-full">
      <ResponsiveContainer width="100%" height={Math.max(200, chartData.length * 45)}>
        <BarChart
          data={chartData}
          layout="vertical"
          margin={{ top: 5, right: 30, left: 10, bottom: 5 }}
        >
          <CartesianGrid strokeDasharray="3 3" stroke={COLORES_GRAFICO.grid} horizontal={false} />
          <XAxis
            type="number"
            domain={[0, 100]}
            stroke={COLORES_GRAFICO.ejeTexto}
            style={{ fontSize: '12px' }}
          />
          <YAxis
            type="category"
            dataKey="nombreCorto"
            width={120}
            stroke={COLORES_GRAFICO.ejeTexto}
            style={{ fontSize: '11px' }}
          />
          <Tooltip content={<CustomTooltip />} />
          <Bar dataKey="puntuacion" radius={[0, 4, 4, 0]} maxBarSize={30}>
            {chartData.map((entry, index) => (
              <Cell key={index} fill={COLOR_APTITUD[entry.aptoPara] || COLORES_GRAFICO.azul} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>

      {/* Leyenda manual */}
      <div className="flex justify-center gap-4 mt-3 text-xs text-muted-foreground">
        {Object.entries(COLOR_APTITUD).map(([key, color]) => (
          <div key={key} className="flex items-center gap-1.5">
            <div className="w-3 h-3 rounded-sm" style={{ backgroundColor: color }} />
            <span>{ETIQUETA_APTITUD[key]}</span>
          </div>
        ))}
      </div>
    </div>
  );
});
