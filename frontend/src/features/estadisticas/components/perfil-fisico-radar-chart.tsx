'use client';

import { memo } from 'react';
import {
  ResponsiveContainer,
  RadarChart,
  Radar,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Tooltip,
} from 'recharts';
import { COLORES_GRAFICO } from '@/components/charts/config/colores';
import { EstadoVacioGrafico } from '@/components/charts/estado-vacio-grafico';
import type { RadarTestDataPoint } from '../types/estadisticas.types';

interface Props {
  data: RadarTestDataPoint[];
}

// Tooltip personalizado para radar
function CustomTooltip({ active, payload }: any) {
  if (!active || !payload || !payload.length) return null;

  const item = payload[0].payload as RadarTestDataPoint;
  return (
    <div className="bg-white p-3 border border-gray-200 rounded-lg shadow-lg">
      <p className="font-semibold text-gray-900">{item.metrica}</p>
      <p className="text-sm text-gray-600">
        Normalizado: <span className="font-medium">{item.valor}/100</span>
      </p>
      <p className="text-sm text-gray-500">
        Real: {item.valorReal} {item.unidad}
      </p>
    </div>
  );
}

export const PerfilFisicoRadarChart = memo(function PerfilFisicoRadarChart({ data }: Props) {
  if (!data || data.length === 0) {
    return (
      <EstadoVacioGrafico
        titulo="Sin perfil fisico"
        descripcion="No hay datos de tests fisicos para generar el perfil radar."
      />
    );
  }

  return (
    <div className="w-full">
      <ResponsiveContainer width="100%" height={320}>
        <RadarChart cx="50%" cy="50%" outerRadius="75%" data={data}>
          <PolarGrid stroke={COLORES_GRAFICO.grid} />
          <PolarAngleAxis
            dataKey="metrica"
            style={{ fontSize: '11px', fill: COLORES_GRAFICO.ejeTexto }}
          />
          <PolarRadiusAxis
            domain={[0, 100]}
            tick={{ fontSize: 10, fill: COLORES_GRAFICO.ejeTexto }}
            tickCount={5}
          />
          <Tooltip content={<CustomTooltip />} />
          <Radar
            name="Perfil Fisico"
            dataKey="valor"
            stroke={COLORES_GRAFICO.azul}
            fill={COLORES_GRAFICO.azul}
            fillOpacity={0.25}
            strokeWidth={2}
          />
        </RadarChart>
      </ResponsiveContainer>
    </div>
  );
});
