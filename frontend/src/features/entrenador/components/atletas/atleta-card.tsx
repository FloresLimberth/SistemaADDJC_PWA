import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { AtletaResumen } from '../../types/entrenador.types';
import { User, AlertTriangle, Calendar, ArrowRight } from 'lucide-react';

interface AtletaCardProps {
  atleta: AtletaResumen;
}

// Card individual para mostrar un atleta en la lista
export function AtletaCard({ atleta }: AtletaCardProps) {
  const tieneDoencias = atleta.dolenciasActivasCount && atleta.dolenciasActivasCount > 0;

  return (
    <Card className={tieneDoencias ? 'border-orange-200' : ''}>
      <CardHeader className="flex flex-row items-start justify-between pb-2">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-full bg-muted">
            <User className="h-5 w-5" />
          </div>
          <div>
            <CardTitle className="text-lg">{atleta.usuario.nombreCompleto}</CardTitle>
            <p className="text-sm text-muted-foreground">
              {atleta.categoriaPeso?.replace(/_/g, ' ') || 'Sin categoria'}
            </p>
          </div>
        </div>
        {tieneDoencias && (
          <Badge variant="destructive" className="flex items-center gap-1">
            <AlertTriangle className="h-3 w-3" />
            {atleta.dolenciasActivasCount} dolencia{atleta.dolenciasActivasCount !== 1 ? 's' : ''}
          </Badge>
        )}
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="flex items-center gap-4 text-sm">
          {atleta.ultimoTest ? (
            <div className="flex items-center gap-1 text-muted-foreground">
              <Calendar className="h-4 w-4" />
              <span>
                Ultimo test:{' '}
                {new Date(atleta.ultimoTest.fechaTest).toLocaleDateString('es-ES', {
                  day: '2-digit',
                  month: 'short',
                  year: 'numeric',
                })}
              </span>
            </div>
          ) : (
            <span className="text-sm text-muted-foreground">Sin tests registrados</span>
          )}
        </div>

        <div className="flex justify-end">
          <Button variant="ghost" size="sm" asChild>
            <Link href={`/entrenador/mis-atletas/${atleta.id}`}>
              Ver detalle
              <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
