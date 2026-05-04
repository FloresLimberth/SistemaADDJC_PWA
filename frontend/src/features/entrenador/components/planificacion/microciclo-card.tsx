import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import type { MicrocicloType } from '@/features/comite-tecnico/types/planificacion.types';
import { Calendar, Target, ArrowRight, Activity, Gauge } from 'lucide-react';
import { formatDateLocale } from '@/lib/date-utils';
import { ENTRENADOR_ROUTES } from '@/lib/routes';

interface MicrocicloCardProps {
  microciclo: MicrocicloType;
}

// Mapeo de tipos de microciclo a variantes de badge
const tipoVariants: Record<string, 'default' | 'secondary' | 'destructive' | 'outline'> = {
  CARGA: 'default',
  DESCARGA: 'secondary',
  CHOQUE: 'destructive',
  RECUPERACION: 'outline',
  COMPETITIVO: 'default',
};

// Calcula el estado temporal del microciclo basado en las fechas
type EstadoTemporal = 'VENCIDO' | 'EN_CURSO' | 'FUTURO';

function calcularEstadoTemporal(fechaInicio: Date, fechaFin: Date): EstadoTemporal {
  const hoy = new Date();
  hoy.setHours(0, 0, 0, 0);

  const inicio = new Date(fechaInicio);
  inicio.setHours(0, 0, 0, 0);

  const fin = new Date(fechaFin);
  fin.setHours(0, 0, 0, 0);

  if (fin < hoy) {
    return 'VENCIDO';
  } else if (inicio > hoy) {
    return 'FUTURO';
  }
  return 'EN_CURSO';
}

// Configuracion de badges para estado temporal
const estadoConfig: Record<EstadoTemporal, { label: string; className: string }> = {
  VENCIDO: { label: 'Vencido', className: 'bg-red-100 text-red-800 border-red-200' },
  EN_CURSO: { label: 'En curso', className: 'bg-green-100 text-green-800 border-green-200' },
  FUTURO: { label: 'Futuro', className: 'bg-blue-100 text-blue-800 border-blue-200' },
};

// Card de microciclo para ENTRENADOR (solo lectura)
export function MicrocicloCard({ microciclo }: MicrocicloCardProps) {
  const fechaInicioStr = formatDateLocale(microciclo.fechaInicio);
  const fechaFinStr = formatDateLocale(microciclo.fechaFin);
  const estadoTemporal = calcularEstadoTemporal(microciclo.fechaInicio, microciclo.fechaFin);
  const estadoBadge = estadoConfig[estadoTemporal];

  return (
    <Card>
      <CardHeader className="flex flex-row items-start justify-between pb-2">
        <CardTitle className="text-lg">
          Microciclo {microciclo.codigoMicrociclo}
        </CardTitle>
        <div className="flex gap-2">
          <Badge variant="outline" className={estadoBadge.className}>
            {estadoBadge.label}
          </Badge>
          <Badge variant={tipoVariants[microciclo.tipoMicrociclo] || 'outline'}>
            {microciclo.tipoMicrociclo}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Calendar className="h-4 w-4" />
          <span>{fechaInicioStr} - {fechaFinStr}</span>
        </div>

        <div className="grid grid-cols-2 gap-2 text-sm">
          <div className="flex items-center gap-2 text-muted-foreground">
            <Activity className="h-4 w-4" />
            <span>Vol: {microciclo.volumenTotal}</span>
          </div>
          <div className="flex items-center gap-2 text-muted-foreground">
            <Gauge className="h-4 w-4" />
            <span>Int: {microciclo.intensidadPromedio}%</span>
          </div>
        </div>

        {microciclo.mesociclo && (
          <div className="text-sm text-muted-foreground">
            <span className="font-medium">Mesociclo:</span> {microciclo.mesociclo.nombre}
            {microciclo.mesociclo.etapa && (
              <span className="ml-1">({microciclo.mesociclo.etapa.replace(/_/g, ' ')})</span>
            )}
          </div>
        )}

        <div className="text-sm">
          <div className="flex items-center gap-2 text-muted-foreground mb-1">
            <Target className="h-4 w-4" />
            <span className="font-medium">Objetivo semanal:</span>
          </div>
          <p className="text-xs text-muted-foreground line-clamp-2 pl-6">
            {microciclo.objetivoSemanal}
          </p>
        </div>

        {microciclo.sesiones && microciclo.sesiones.length > 0 && (
          <div className="text-sm text-muted-foreground">
            <span className="font-medium">{microciclo.sesiones.length} sesiones</span>
          </div>
        )}

        <div className="flex justify-end pt-2">
          <Button variant="ghost" size="sm" asChild>
            <Link href={ENTRENADOR_ROUTES.planificacion.microciclos.detalle(microciclo.id)}>
              Ver detalle
              <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
