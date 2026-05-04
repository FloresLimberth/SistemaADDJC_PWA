'use client';

import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Check, Trash2, ExternalLink } from 'lucide-react';
import type { NotificacionAlgoritmo } from '../types/algoritmo.types';

interface NotificationCardProps {
  notificacion: NotificacionAlgoritmo;
  onMarcarLeida?: (id: string) => void;
  onEliminar?: (id: string) => void;
  recomendacionHref?: string;
  disabled?: boolean;
}

// Mapeo de prioridad a variante de badge
function getPrioridadVariant(prioridad: string) {
  switch (prioridad) {
    case 'CRITICA':
      return 'destructive';
    case 'ALTA':
      return 'destructive';
    case 'MEDIA':
      return 'secondary';
    default:
      return 'outline';
  }
}

// Mapeo de tipo a texto legible
function getTipoLabel(tipo: string): string {
  const labels: Record<string, string> = {
    RECOMENDACION_ALGORITMO: 'Recomendacion',
    ALERTA_FATIGA: 'Alerta de fatiga',
    ALERTA_LESION: 'Alerta de lesion',
    PLANIFICACION_APROBADA: 'Planificacion aprobada',
    PLANIFICACION_MODIFICADA: 'Planificacion modificada',
    SESION_PROXIMA: 'Sesion proxima',
    TEST_PENDIENTE: 'Test pendiente',
    OTRO: 'Otro',
  };
  return labels[tipo] || tipo;
}

export function NotificationCard({
  notificacion,
  onMarcarLeida,
  onEliminar,
  recomendacionHref,
  disabled,
}: NotificationCardProps) {
  const fecha = new Date(notificacion.createdAt);

  return (
    <Card className={notificacion.leida ? 'opacity-70' : ''}>
      <CardContent className="p-4">
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1 flex-wrap">
              <Badge variant={getPrioridadVariant(notificacion.prioridad)}>
                {notificacion.prioridad}
              </Badge>
              <Badge variant="outline">{getTipoLabel(notificacion.tipo)}</Badge>
              {!notificacion.leida && (
                <span className="h-2 w-2 rounded-full bg-blue-500" />
              )}
            </div>
            <h4 className="font-medium text-sm">{notificacion.titulo}</h4>
            <p className="text-sm text-muted-foreground mt-1">
              {notificacion.mensaje}
            </p>
            <p className="text-xs text-muted-foreground mt-2">
              {fecha.toLocaleDateString('es-BO')} {fecha.toLocaleTimeString('es-BO', { hour: '2-digit', minute: '2-digit' })}
            </p>
          </div>
          <div className="flex gap-1 shrink-0">
            {!notificacion.leida && onMarcarLeida && (
              <Button
                variant="ghost"
                size="icon"
                onClick={() => onMarcarLeida(notificacion.id)}
                title="Marcar como leida"
                disabled={disabled}
              >
                <Check className="h-4 w-4" />
              </Button>
            )}
            {notificacion.recomendacionId && recomendacionHref && (
              <Button variant="ghost" size="icon" asChild title="Ver recomendacion">
                <a href={`${recomendacionHref}/${notificacion.recomendacionId}`}>
                  <ExternalLink className="h-4 w-4" />
                </a>
              </Button>
            )}
            {onEliminar && (
              <Button
                variant="ghost"
                size="icon"
                onClick={() => onEliminar(notificacion.id)}
                title="Eliminar"
                disabled={disabled}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
