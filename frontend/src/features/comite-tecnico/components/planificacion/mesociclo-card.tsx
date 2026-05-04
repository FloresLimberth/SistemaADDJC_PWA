import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import type { Mesociclo } from '../../types/planificacion.types';
import { Calendar, ArrowRight } from 'lucide-react';
import { formatDateLocale } from '@/lib/date-utils';
import { COMITE_TECNICO_ROUTES } from '@/lib/routes';

interface MesocicloCardProps {
  mesociclo: Mesociclo;
}

// Mapeo de etapas a variantes de badge
const etapaVariants: Record<string, 'default' | 'secondary' | 'destructive' | 'outline'> = {
  PREPARACION_GENERAL: 'outline',
  PREPARACION_ESPECIFICA: 'secondary',
  COMPETITIVA: 'default',
  TRANSICION: 'destructive',
};

// Card de mesociclo para COMITE_TECNICO
export function MesocicloCard({ mesociclo }: MesocicloCardProps) {
  const fechaInicio = formatDateLocale(mesociclo.fechaInicio);
  const fechaFin = formatDateLocale(mesociclo.fechaFin);

  return (
    <Card>
      <CardHeader className="flex flex-row items-start justify-between pb-2">
        <div>
          <CardTitle className="text-lg">{mesociclo.nombre}</CardTitle>
          <p className="text-sm text-muted-foreground">
            Codigo: {mesociclo.codigoMesociclo}
          </p>
        </div>
        <Badge variant={etapaVariants[mesociclo.etapa] || 'outline'}>
          {mesociclo.etapa.replace(/_/g, ' ')}
        </Badge>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Calendar className="h-4 w-4" />
          <span>{fechaInicio} - {fechaFin}</span>
        </div>

        {mesociclo.macrociclo && (
          <div className="text-sm text-muted-foreground">
            <span className="font-medium">Macrociclo:</span> {mesociclo.macrociclo.nombre}
          </div>
        )}

        <div className="text-sm">
          <p className="text-muted-foreground mb-1">Objetivos:</p>
          <ul className="list-disc list-inside text-xs space-y-0.5">
            <li className="truncate">Fisico: {mesociclo.objetivoFisico}</li>
            <li className="truncate">Tecnico: {mesociclo.objetivoTecnico}</li>
          </ul>
        </div>

        <div className="flex justify-end pt-2">
          <Button variant="ghost" size="sm" asChild>
            <Link href={COMITE_TECNICO_ROUTES.planificacion.mesociclos.detalle(mesociclo.id)}>
              Ver detalle
              <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
