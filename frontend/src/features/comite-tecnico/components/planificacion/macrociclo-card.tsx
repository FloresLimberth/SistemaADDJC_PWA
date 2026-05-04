import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import type { Macrociclo } from '../../types/planificacion.types';
import { Calendar, Target, ArrowRight } from 'lucide-react';
import { formatDateLocale } from '@/lib/date-utils';
import { COMITE_TECNICO_ROUTES } from '@/lib/routes';

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

// Card de macrociclo para COMITE_TECNICO
export function MacrocicloCard({ macrociclo }: MacrocicloCardProps) {
  const fechaInicio = formatDateLocale(macrociclo.fechaInicio);
  const fechaFin = formatDateLocale(macrociclo.fechaFin);

  return (
    <Card>
      <CardHeader className="flex flex-row items-start justify-between pb-2">
        <div>
          <CardTitle className="text-lg">{macrociclo.nombre}</CardTitle>
          <p className="text-sm text-muted-foreground">{macrociclo.temporada}</p>
        </div>
        <Badge variant={estadoVariants[macrociclo.estado] || 'outline'}>
          {macrociclo.estado.replace(/_/g, ' ')}
        </Badge>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Target className="h-4 w-4" />
          <span>{macrociclo.categoriaObjetivo}</span>
        </div>

        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Calendar className="h-4 w-4" />
          <span>{fechaInicio} - {fechaFin}</span>
        </div>

        <div className="text-sm">
          <p className="text-muted-foreground mb-1">Objetivos:</p>
          <ul className="list-disc list-inside text-xs space-y-0.5">
            <li className="truncate">{macrociclo.objetivo1}</li>
            <li className="truncate">{macrociclo.objetivo2}</li>
          </ul>
        </div>

        <div className="flex justify-end pt-2">
          <Button variant="ghost" size="sm" asChild>
            <Link href={COMITE_TECNICO_ROUTES.planificacion.macrociclos.detalle(macrociclo.id)}>
              Ver detalle
              <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
