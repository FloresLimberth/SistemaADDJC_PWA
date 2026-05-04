'use client';

import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { RecomendacionBadge, PrioridadBadge } from './recomendacion-badge';
import Link from 'next/link';
import type { Recomendacion } from '../types/algoritmo.types';

interface RecomendacionesListProps {
  recomendaciones: Recomendacion[];
  detalleBaseHref: string;
}

// Nombres legibles para tipo de recomendacion
const TIPO_LABELS: Record<string, string> = {
  INICIAL: 'Inicial',
  AJUSTE_POST_TEST: 'Ajuste post-test',
  ALERTA_FATIGA: 'Alerta de fatiga',
  AJUSTE_LESION: 'Ajuste por lesion',
  ALERTA_DESVIACION_CARGA: 'Desviacion de carga',
  PERSONALIZACION_TACTICA: 'Personalizacion tactica',
  NUTRICIONAL: 'Nutricional',
  AJUSTE_PLANIFICACION: 'Ajuste de planificacion',
};

export function RecomendacionesList({
  recomendaciones,
  detalleBaseHref,
}: RecomendacionesListProps) {
  if (recomendaciones.length === 0) {
    return (
      <div className="text-center py-12 text-muted-foreground">
        No hay recomendaciones para mostrar.
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {recomendaciones.map((rec) => (
        <Card key={rec.id}>
          <CardContent className="p-4">
            <div className="flex items-start justify-between gap-3">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1 flex-wrap">
                  <RecomendacionBadge estado={rec.estado} />
                  <PrioridadBadge prioridad={rec.prioridad} />
                  <span className="text-xs text-muted-foreground">
                    {TIPO_LABELS[rec.tipo] || rec.tipo}
                  </span>
                </div>
                <h4 className="font-medium text-sm">{rec.titulo}</h4>
                <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
                  {rec.mensaje}
                </p>
                {rec.atleta && (
                  <p className="text-xs text-muted-foreground mt-1">
                    Atleta: {rec.atleta.nombreCompleto}
                  </p>
                )}
                {rec.microcicloAfectado && (
                  <p className="text-xs text-muted-foreground">
                    Microciclo: {rec.microcicloAfectado.codigoMicrociclo}
                  </p>
                )}
                <p className="text-xs text-muted-foreground mt-1">
                  {new Date(rec.createdAt).toLocaleDateString('es-BO')}
                </p>
              </div>
              <Button variant="outline" size="sm" asChild>
                <Link href={`${detalleBaseHref}/${rec.id}`}>Ver detalle</Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
