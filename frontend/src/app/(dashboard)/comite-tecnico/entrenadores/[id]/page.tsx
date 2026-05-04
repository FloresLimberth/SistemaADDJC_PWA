import { fetchEntrenador } from '@/features/comite-tecnico/actions';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Edit, MapPin, Calendar, Users } from 'lucide-react';
import Link from 'next/link';
import { COMITE_TECNICO_ROUTES } from '@/lib/routes';
import { notFound } from 'next/navigation';
import { DeleteEntrenadorButton } from './delete-button';

interface EntrenadorDetallePageProps {
  params: Promise<{ id: string }>;
}

export default async function EntrenadorDetallePage({
  params,
}: EntrenadorDetallePageProps) {
  const { id } = await params;
  const entrenador = await fetchEntrenador(id);

  if (!entrenador) {
    notFound();
  }

  const atletasCount = entrenador.atletasAsignadosCount || 0;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" asChild>
            <Link href={COMITE_TECNICO_ROUTES.entrenadores.list}>
              <ArrowLeft className="h-4 w-4" />
            </Link>
          </Button>
          <div>
            <h1 className="text-3xl font-bold">
              {entrenador.usuario.nombreCompleto}
            </h1>
            <p className="text-muted-foreground">Entrenador</p>
          </div>
        </div>

        <div className="flex gap-2">
          <Button asChild>
            <Link href={COMITE_TECNICO_ROUTES.entrenadores.editar(id)}>
              <Edit className="h-4 w-4 mr-2" />
              Editar
            </Link>
          </Button>
          <DeleteEntrenadorButton
            entrenadorId={id}
            atletasCount={atletasCount}
          />
        </div>
      </div>

      {/* Estado */}
      <div>
        <Badge variant={entrenador.usuario.estado ? 'default' : 'secondary'}>
          {entrenador.usuario.estado ? 'Activo' : 'Inactivo'}
        </Badge>
      </div>

      {/* Informacion del Usuario */}
      <Card>
        <CardHeader>
          <CardTitle>Informacion del Usuario</CardTitle>
          <CardDescription>Datos de acceso al sistema</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4 md:grid-cols-2">
          <div>
            <p className="text-sm font-medium text-muted-foreground">Email</p>
            <p className="text-base">{entrenador.usuario.email}</p>
          </div>
          <div>
            <p className="text-sm font-medium text-muted-foreground">
              ID de Usuario
            </p>
            <p className="text-base font-mono text-sm">
              {entrenador.usuario.id}
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Informacion del Entrenador */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MapPin className="h-5 w-5" />
            Informacion del Entrenador
          </CardTitle>
          <CardDescription>Datos profesionales</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4 md:grid-cols-2">
          <div>
            <p className="text-sm font-medium text-muted-foreground">
              Municipio
            </p>
            <p className="text-base">{entrenador.municipio}</p>
          </div>
          <div>
            <p className="text-sm font-medium text-muted-foreground">
              Especialidad
            </p>
            <p className="text-base">
              {entrenador.especialidad || 'No especificada'}
            </p>
          </div>
          <div>
            <p className="text-sm font-medium text-muted-foreground flex items-center gap-1">
              <Users className="h-4 w-4" />
              Atletas Asignados
            </p>
            <p className="text-base">
              {atletasCount} atleta{atletasCount !== 1 ? 's' : ''}
            </p>
          </div>
          <div>
            <p className="text-sm font-medium text-muted-foreground flex items-center gap-1">
              <Calendar className="h-4 w-4" />
              Fecha de Registro
            </p>
            <p className="text-base">
              {new Date(entrenador.createdAt).toLocaleDateString('es-ES', {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
              })}
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
