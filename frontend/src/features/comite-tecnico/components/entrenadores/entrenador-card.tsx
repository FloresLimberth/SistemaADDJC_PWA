import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import type { EntrenadorResumen } from '../../types/planificacion.types';
import { UserCog, MapPin, Users, Mail, ArrowRight } from 'lucide-react';
import { COMITE_TECNICO_ROUTES } from '@/lib/routes';

interface EntrenadorCardProps {
  entrenador: EntrenadorResumen;
}

// Card de entrenador para COMITE_TECNICO
export function EntrenadorCard({ entrenador }: EntrenadorCardProps) {
  const atletasCount = entrenador.atletasAsignadosCount || 0;

  return (
    <Card>
      <CardHeader className="flex flex-row items-start justify-between pb-2">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-full bg-muted">
            <UserCog className="h-5 w-5" />
          </div>
          <div>
            <CardTitle className="text-lg">
              {entrenador.usuario.nombreCompleto}
            </CardTitle>
            <p className="text-sm text-muted-foreground">
              {entrenador.especialidad || 'Sin especialidad'}
            </p>
          </div>
        </div>
        <Badge variant={entrenador.usuario.estado ? 'default' : 'secondary'}>
          {entrenador.usuario.estado ? 'Activo' : 'Inactivo'}
        </Badge>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="space-y-2 text-sm">
          <div className="flex items-center gap-2 text-muted-foreground">
            <Mail className="h-4 w-4" />
            <span>{entrenador.usuario.email}</span>
          </div>
          <div className="flex items-center gap-2 text-muted-foreground">
            <MapPin className="h-4 w-4" />
            <span>{entrenador.municipio}</span>
          </div>
          <div className="flex items-center gap-2">
            <Users className="h-4 w-4 text-muted-foreground" />
            <span
              className={
                atletasCount > 0 ? 'font-medium' : 'text-muted-foreground'
              }
            >
              {atletasCount} atleta{atletasCount !== 1 ? 's' : ''} asignado
              {atletasCount !== 1 ? 's' : ''}
            </span>
          </div>
        </div>

        <div className="flex justify-end pt-2">
          <Button variant="ghost" size="sm" asChild>
            <Link
              href={COMITE_TECNICO_ROUTES.entrenadores.detalle(entrenador.id)}
            >
              Ver detalle
              <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
