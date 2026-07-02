import { redirect, notFound } from 'next/navigation';
import Link from 'next/link';
import { getCurrentUserAction } from '@/app/actions/auth.actions';
import { fetchAsignacion } from '@/features/comite-tecnico/actions';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Link as LinkIcon, User, Calendar, Edit, FileText } from 'lucide-react';
import { AUTH_ROUTES, COMITE_TECNICO_ROUTES } from '@/lib/routes';
import { formatDateFull } from '@/lib/date-utils';
import { DeleteAsignacionButton } from './delete-button';

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function AsignacionDetallePage({ params }: PageProps) {
  const { id } = await params;

  // Verificar autenticacion
  const authResult = await getCurrentUserAction();

  if (!authResult.success || !authResult.user) {
    redirect(AUTH_ROUTES.login);
  }

  // Cargar asignacion
  const asignacion = await fetchAsignacion(id);

  if (!asignacion) {
    notFound();
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="sm" asChild>
            <Link href={COMITE_TECNICO_ROUTES.asignaciones.list}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Volver
            </Link>
          </Button>
          <div>
            <h1 className="text-2xl font-bold">Detalle de Asignacion</h1>
            <p className="text-muted-foreground">
              Asignacion #{asignacion.id}
            </p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button asChild>
            <Link href={COMITE_TECNICO_ROUTES.asignaciones.editar(id)}>
              <Edit className="h-4 w-4 mr-2" />
              Editar
            </Link>
          </Button>
          <DeleteAsignacionButton
            asignacionId={id}
            redirectUrl={COMITE_TECNICO_ROUTES.asignaciones.list}
          />
        </div>
      </div>

      {/* Informacion del Atleta */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <User className="h-5 w-5" />
            Atleta Asignado
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <p className="text-sm text-muted-foreground">Nombre del Atleta</p>
              <p className="font-medium text-lg">
                {asignacion.atleta?.nombreCompleto || 'N/A'}
              </p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">ID del Atleta</p>
              <p className="font-medium">{asignacion.atletaId}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Informacion del Microciclo */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Microciclo Asignado
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-3">
            <div>
              <p className="text-sm text-muted-foreground">Numero de Microciclo</p>
              <p className="font-medium text-lg">
                #{asignacion.microciclo?.codigoMicrociclo || 'N/A'}
              </p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Fecha Inicio</p>
              <p className="font-medium">
                {asignacion.microciclo?.fechaInicio
                  ? formatDateFull(asignacion.microciclo.fechaInicio)
                  : 'N/A'}
              </p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Fecha Fin</p>
              <p className="font-medium">
                {asignacion.microciclo?.fechaFin
                  ? formatDateFull(asignacion.microciclo.fechaFin)
                  : 'N/A'}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Informacion de la Asignacion */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <LinkIcon className="h-5 w-5" />
            Datos de la Asignacion
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <p className="text-sm text-muted-foreground">Fecha de Asignacion</p>
              <p className="font-medium">{formatDateFull(asignacion.fechaAsignacion)}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Asignado por</p>
              <p className="font-medium">
                {asignacion.asignador?.nombreCompleto || 'N/A'}
              </p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Creado</p>
              <p className="font-medium">{formatDateFull(asignacion.createdAt)}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Ultima Actualizacion</p>
              <p className="font-medium">{formatDateFull(asignacion.updatedAt)}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Observaciones */}
      {asignacion.observaciones && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Observaciones
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p>{asignacion.observaciones}</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
