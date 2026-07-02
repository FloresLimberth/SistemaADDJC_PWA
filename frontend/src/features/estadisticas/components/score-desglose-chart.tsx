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
import type { ResultadoScore } from '@/features/algoritmo/types/algoritmo.types';

interface Props {
  score: ResultadoScore;
}

// Configuracion de cada barra del desglose
const COMPONENTES_SCORE = [
  { key: 'scoreFuerza', label: 'Fuerza', color: COLORES_GRAFICO.rojo },
  { key: 'scoreResistencia', label: 'Resistencia', color: COLORES_GRAFICO.azul },
  { key: 'scoreEstado', label: 'Estado', color: COLORES_GRAFICO.violeta },
  { key: 'scorePeso', label: 'Peso', color: COLORES_GRAFICO.verde },
] as const;

// Tooltip personalizado
function CustomTooltip({ active, payload }: any) {
  if (!active || !payload || !payload.length) return null;

  const item = payload[0].payload;
  return (
    <div className="bg-white p-3 border border-gray-200 rounded-lg shadow-lg">
      <p className="font-semibold text-gray-900">{item.label}</p>
      <p className="text-sm text-gray-600">
        Score: <span className="font-medium">{item.valor.toFixed(1)}</span> / 100
      </p>
    </div>
  );
}

export const ScoreDesgloseChart = memo(function ScoreDesgloseChart({ score }: Props) {
  if (!score) {
    return (
      <EstadoVacioGrafico
        titulo="Sin score disponible"
        descripcion="No se ha calculado el score para este atleta."
      />
    );
  }

  // Construir datos para el chart
  const chartData = COMPONENTES_SCORE.map((comp) => ({
    label: comp.label,
    valor: score[comp.key],
    color: comp.color,
  }));

  return (
    <div className="w-full">
      <ResponsiveContainer width="100%" height={320}>
        <BarChart
          data={chartData}
          margin={{ top: 10, right: 20, left: 10, bottom: 5 }}
        >
          <CartesianGrid strokeDasharray="3 3" stroke={COLORES_GRAFICO.grid} />
          <XAxis
            dataKey="label"
            stroke={COLORES_GRAFICO.ejeTexto}
            style={{ fontSize: '12px' }}
          />
          <YAxis
            domain={[0, 100]}
            stroke={COLORES_GRAFICO.ejeTexto}
            style={{ fontSize: '12px' }}
          />
          <Tooltip content={<CustomTooltip />} />
          <Bar dataKey="valor" radius={[4, 4, 0, 0]} maxBarSize={60}>
            {chartData.map((entry, index) => (
              <Cell key={index} fill={entry.color} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>

      {/* Score total destacado */}
      <div className="text-center mt-2">
        <span className="text-sm text-muted-foreground">Score Total: </span>
        <span className="text-xl font-bold">{score.scoreTotal.toFixed(1)}</span>
        <span className="text-sm text-muted-foreground"> / 100</span>
      </div>
    </div>
  );
});
