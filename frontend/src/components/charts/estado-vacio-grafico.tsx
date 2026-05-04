'use client';

import { type LucideIcon, BarChart3 } from 'lucide-react';
import { CardContent } from '@/components/ui/card';

interface EstadoVacioGraficoProps {
  titulo?: string;
  descripcion?: string;
  icono?: LucideIcon;
}

export function EstadoVacioGrafico({
  titulo = 'Sin datos disponibles',
  descripcion = 'No hay datos suficientes para generar este grafico.',
  icono: Icono = BarChart3,
}: EstadoVacioGraficoProps) {
  return (
    <CardContent className="flex flex-col items-center justify-center py-12 text-center">
      <Icono className="h-12 w-12 text-muted-foreground mb-4" />
      <h3 className="text-lg font-semibold text-foreground mb-1">{titulo}</h3>
      <p className="text-sm text-muted-foreground max-w-xs">{descripcion}</p>
    </CardContent>
  );
}
