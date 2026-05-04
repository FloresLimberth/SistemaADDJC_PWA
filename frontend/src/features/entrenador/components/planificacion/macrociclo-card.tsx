import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import type { Macrociclo } from '@/features/comite-tecnico/types/planificacion.types';
import { Calendar, Target, ArrowRight } from 'lucide-react';
import { formatDateLocale } from '@/lib/date-utils';
import { ENTRENADOR_ROUTES } from '@/lib/routes';

interface MacrocicloCardProps {
  macrociclo: Macrociclo;
}

// Mapeo de estados a variantes de badge
const estadoVariants: Record<string, 'default' | 'secondary' | 'destructive' | 'outline'> = {
  PLANIFICADO: 'outline',
  EN_CURSO: 'default',
  COMPLETADO: 'secondary',
  CANCELADO: 'destructive',
};

// Card de macrociclo para ENTRENADOR (solo lectura)
export function MacrocicloCard({ macrociclo }: MacrocicloCardProps) {
  const fechaInicio = formatDateLocale(macrociclo.fechaInicio);
  const fechaFin = formatDateLocale(macrociclo.fechaFin);

  return (
    <Card>
      <CardHeader className="flex flex-row items-start justify-between pb-2">
        <div>
          <CardTitle className="text-lg">{macrociclo.nombre}</CardTitle>
          <p className="text-sm text-muted-foreground">
            {macrociclo.temporada} - {macrociclo.equipo}
          </p>
        </div>
        <Badge variant={estadoVariants[macrociclo.estado] || 'outline'}>
          {macrociclo.estado.replace(/_/g, ' ')}
        </Badge>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Calendar className="h-4 w-4" />
          <span>{fechaInicio} - {fechaFin}</span>
        </div>

        <div className="text-sm">
          <div className="flex items-center gap-2 text-muted-foreground mb-1">
            <Target className="h-4 w-4" />
            <span className="font-medium">Objetivo principal:</span>
          </div>
          <p className="text-xs text-muted-foreground line-clamp-2 pl-6">
            {macrociclo.objetivo1}
          </p>
        </div>

        <div className="flex justify-end pt-2">
          <Button variant="ghost" size="sm" asChild>
            <Link href={ENTRENADOR_ROUTES.planificacion.macrociclos.detalle(macrociclo.id)}>
              Ver detalle
              <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
