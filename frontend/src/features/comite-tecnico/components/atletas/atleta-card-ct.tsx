import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import type { AtletaResumen } from '../../types';
import { User, AlertTriangle, Calendar, ArrowRight, UserCog } from 'lucide-react';

interface AtletaCardCTProps {
  atleta: AtletaResumen;
}

// Card de atleta para COMITE_TECNICO
// Muestra info adicional: entrenador asignado
export function AtletaCardCT({ atleta }: AtletaCardCTProps) {
  const tieneDolencias = atleta.dolenciasActivasCount && atleta.dolenciasActivasCount > 0;

  return (
    <Card className={tieneDolencias ? 'border-orange-200' : ''}>
      <CardHeader className="flex flex-row items-start justify-between pb-2">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-full bg-muted">
            <User className="h-5 w-5" />
          </div>
          <div>
            <CardTitle className="text-lg">{atleta.usuario.nombreCompleto}</CardTitle>
            <p className="text-sm text-muted-foreground">{atleta.club}</p>
          </div>
        </div>
        {tieneDolencias && (
          <Badge variant="destructive" className="flex items-center gap-1">
            <AlertTriangle className="h-3 w-3" />
            {atleta.dolenciasActivasCount}
          </Badge>
        )}
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="grid grid-cols-2 gap-2 text-sm">
          <div>
            <span className="text-muted-foreground">Categoria:</span>{' '}
            <span className="font-medium">{atleta.categoria}</span>
          </div>
          <div>
            <span className="text-muted-foreground">Peso:</span>{' '}
            <span className="font-medium">{atleta.categoriaPeso?.replace(/_/g, ' ') || 'Sin categoria'}</span>
          </div>
        </div>

        {atleta.entrenadorAsignado ? (
          <div className="flex items-center gap-1 text-sm text-muted-foreground">
            <UserCog className="h-4 w-4" />
            <span>Entrenador: {atleta.entrenadorAsignado.nombreCompleto}</span>
          </div>
        ) : (
          <div className="flex items-center gap-1 text-sm text-orange-500">
            <UserCog className="h-4 w-4" />
            <span>Sin entrenador asignado</span>
          </div>
        )}

        {atleta.ultimoTest && (
          <div className="flex items-center gap-1 text-sm text-muted-foreground">
            <Calendar className="h-4 w-4" />
            <span>
              Ultimo test:{' '}
              {new Date(atleta.ultimoTest.fechaTest).toLocaleDateString('es-ES', {
                day: '2-digit',
                month: 'short',
              })}
            </span>
          </div>
        )}

        <div className="flex justify-end pt-2">
          <Button variant="ghost" size="sm" asChild>
            <Link href={`/comite-tecnico/atletas/${atleta.id}`}>
              Ver detalle
              <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
