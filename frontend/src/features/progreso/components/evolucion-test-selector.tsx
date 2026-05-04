'use client';

import { useState, useEffect, useTransition } from 'react';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Loader2, TrendingUp, TrendingDown, Minus } from 'lucide-react';
import {
  fetchAtletaEvolucion,
  TIPOS_TEST,
  type AtletaEvolucion,
} from '@/features/comite-tecnico/actions';
import { EvolucionChart } from '@/app/(dashboard)/comite-tecnico/estadisticas/evolucion-chart';

interface EvolucionTestSelectorProps {
  atletaId: string;
}

export function EvolucionTestSelector({ atletaId }: EvolucionTestSelectorProps) {
  const [selectedTipoTest, setSelectedTipoTest] = useState<string>('pressBanca');
  const [evolucion, setEvolucion] = useState<AtletaEvolucion | null>(null);
  const [isPending, startTransition] = useTransition();

  useEffect(() => {
    startTransition(async () => {
      const data = await fetchAtletaEvolucion(atletaId, selectedTipoTest);
      setEvolucion(data);
    });
  }, [atletaId, selectedTipoTest]);

  const tipoTestInfo = TIPOS_TEST.find((t) => t.value === selectedTipoTest);

  // Valores del backend: 'MEJORANDO' | 'ESTANCADO' | 'EMPEORANDO'
  const renderTendencia = (tendencia: string | undefined) => {
    if (!tendencia) return null;
    switch (tendencia) {
      case 'MEJORANDO':
        return (
          <Badge variant="default" className="bg-green-500">
            <TrendingUp className="h-3 w-3 mr-1" />
            Mejorando
          </Badge>
        );
      case 'EMPEORANDO':
        return (
          <Badge variant="destructive">
            <TrendingDown className="h-3 w-3 mr-1" />
            Empeorando
          </Badge>
        );
      default:
        return (
          <Badge variant="outline">
            <Minus className="h-3 w-3 mr-1" />
            Estancado
          </Badge>
        );
    }
  };

  return (
    <div className="space-y-4">
      {/* Selector de tipo de test */}
      <div className="flex items-end gap-4">
        <div className="space-y-2 flex-1 max-w-xs">
          <Label htmlFor="tipoTest">Tipo de Test</Label>
          <Select value={selectedTipoTest} onValueChange={setSelectedTipoTest}>
            <SelectTrigger id="tipoTest">
              <SelectValue placeholder="Selecciona un test" />
            </SelectTrigger>
            <SelectContent>
              {TIPOS_TEST.map((tipo) => (
                <SelectItem key={tipo.value} value={tipo.value}>
                  {tipo.label} ({tipo.unidad})
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Indicadores de tendencia y progreso */}
        {!isPending && evolucion && (
          <div className="flex items-center gap-3">
            {renderTendencia(evolucion.tendencia)}
            {evolucion.mejora && (
              <span className="text-sm text-muted-foreground">
                {evolucion.mejora.porcentaje >= 0 ? '+' : ''}
                {evolucion.mejora.porcentaje.toFixed(1)}%
              </span>
            )}
          </div>
        )}
      </div>

      {/* Estado de carga */}
      {isPending && (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
          <span className="ml-2 text-sm text-muted-foreground">Cargando datos...</span>
        </div>
      )}

      {/* Grafico de evolucion */}
      {!isPending && evolucion && evolucion.tests && evolucion.tests.length > 0 ? (
        <EvolucionChart
          data={evolucion.tests}
          unidad={tipoTestInfo?.unidad || ''}
          nombreTest={tipoTestInfo?.label || ''}
        />
      ) : !isPending ? (
        <div className="flex items-center justify-center h-80 bg-gray-50 rounded-lg border border-gray-200">
          <div className="text-center">
            <p className="text-gray-500 font-medium">Sin datos de {tipoTestInfo?.label}</p>
            <p className="text-gray-400 text-sm mt-1">
              No hay registros de este test para mostrar la evolucion
            </p>
          </div>
        </div>
      ) : null}
    </div>
  );
}
