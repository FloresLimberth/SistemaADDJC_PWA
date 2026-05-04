import { redirect, notFound } from 'next/navigation';
import Link from 'next/link';
import { getCurrentUserAction } from '@/app/actions/auth.actions';
import { fetchSesion } from '@/features/comite-tecnico/actions';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, Calendar, Clock, Activity, Edit, FileText } from 'lucide-react';
import { AUTH_ROUTES, ENTRENADOR_ROUTES } from '@/lib/routes';
import { formatDateFull } from '@/lib/date-utils';
import { DeleteSesionButton } from './delete-button';

// Mapeo de tipos de sesion a colores
const TIPO_SESION_COLORS: Record<string, string> = {
  ENTRENAMIENTO: 'bg-blue-100 text-blue-800',
  TEST: 'bg-purple-100 text-purple-800',
  RECUPERACION: 'bg-green-100 text-green-800',
  DESCANSO: 'bg-gray-100 text-gray-800',
  COMPETENCIA: 'bg-orange-100 text-orange-800',
};

const TIPO_SESION_LABELS: Record<string, string> = {
  ENTRENAMIENTO: 'Entrenamiento',
  TEST: 'Test Fisico',
  RECUPERACION: 'Recuperacion',
  DESCANSO: 'Descanso',
  COMPETENCIA: 'Competencia',
};

const DIA_LABELS: Record<string, string> = {
  LUNES: 'Lunes',
  MARTES: 'Martes',
  MIERCOLES: 'Miercoles',
  JUEVES: 'Jueves',
  VIERNES: 'Viernes',
  SABADO: 'Sabado',
  DOMINGO: 'Domingo',
};

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function SesionDetallePage({ params }: PageProps) {
  const { id } = await params;

  // Verificar autenticacion
  const authResult = await getCurrentUserAction();

  if (!authResult.success || !authResult.user) {
    redirect(AUTH_ROUTES.login);
  }

  // Cargar sesion
  const sesion = await fetchSesion(id);

  if (!sesion) {
    notFound();
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="sm" asChild>
            <Link href={ENTRENADOR_ROUTES.sesiones.list}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Volver
            </Link>
          </Button>
          <div>
            <h1 className="text-2xl font-bold">Detalle de Sesion</h1>
            <p className="text-muted-foreground">
              Sesion #{sesion.numeroSesion} - {DIA_LABELS[sesion.diaSemana] || sesion.diaSemana}
            </p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button asChild>
            <Link href={ENTRENADOR_ROUTES.sesiones.editar(id)}>
              <Edit className="h-4 w-4 mr-2" />
              Editar
            </Link>
          </Button>
          <DeleteSesionButton
            sesionId={id}
            redirectUrl={ENTRENADOR_ROUTES.sesiones.list}
          />
        </div>
      </div>

      {/* Informacion General */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Informacion General
          </CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          <div>
            <p className="text-sm text-muted-foreground">Fecha</p>
            <p className="font-medium">{formatDateFull(sesion.fecha)}</p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Tipo de Sesion</p>
            <Badge className={TIPO_SESION_COLORS[sesion.tipoSesion] || 'bg-gray-100'}>
              {TIPO_SESION_LABELS[sesion.tipoSesion] || sesion.tipoSesion}
            </Badge>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Turno</p>
            <p className="font-medium">{sesion.turno}</p>
          </div>
          {sesion.microciclo && (
            <div>
              <p className="text-sm text-muted-foreground">Microciclo</p>
              <p className="font-medium">#{sesion.microciclo.codigoMicrociclo}</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Planificacion de Carga */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Activity className="h-5 w-5" />
            Planificacion de Carga
          </CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          <div className="flex items-center gap-3">
            <Clock className="h-5 w-5 text-muted-foreground" />
            <div>
              <p className="text-sm text-muted-foreground">Duracion Planificada</p>
              <p className="font-medium">{sesion.duracionPlanificada} minutos</p>
            </div>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Volumen Planificado</p>
            <p className="font-medium">{sesion.volumenPlanificado}</p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Intensidad Planificada</p>
            <p className="font-medium">{sesion.intensidadPlanificada}%</p>
          </div>
        </CardContent>
      </Card>

      {/* Datos Reales (si existen) */}
      {(sesion.volumenReal || sesion.intensidadReal) && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Datos Reales</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-4 md:grid-cols-2">
            {sesion.volumenReal && (
              <div>
                <p className="text-sm text-muted-foreground">Volumen Real</p>
                <p className="font-medium">{sesion.volumenReal}</p>
              </div>
            )}
            {sesion.intensidadReal && (
              <div>
                <p className="text-sm text-muted-foreground">Intensidad Real</p>
                <p className="font-medium">{sesion.intensidadReal}%</p>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Contenidos */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Contenidos
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <p className="text-sm font-medium text-muted-foreground">Contenido Fisico</p>
            <p className="mt-1">{sesion.contenidoFisico}</p>
          </div>
          <div>
            <p className="text-sm font-medium text-muted-foreground">Contenido Tecnico</p>
            <p className="mt-1">{sesion.contenidoTecnico}</p>
          </div>
          <div>
            <p className="text-sm font-medium text-muted-foreground">Contenido Tactico</p>
            <p className="mt-1">{sesion.contenidoTactico}</p>
          </div>
        </CardContent>
      </Card>

      {/* Estructura de la Sesion */}
      {(sesion.calentamiento || sesion.partePrincipal || sesion.vueltaCalma) && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Estructura de la Sesion</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-4 md:grid-cols-3">
            {sesion.calentamiento && (
              <div>
                <p className="text-sm font-medium text-muted-foreground">Calentamiento</p>
                <p className="mt-1 text-sm">{sesion.calentamiento}</p>
              </div>
            )}
            {sesion.partePrincipal && (
              <div>
                <p className="text-sm font-medium text-muted-foreground">Parte Principal</p>
                <p className="mt-1 text-sm">{sesion.partePrincipal}</p>
              </div>
            )}
            {sesion.vueltaCalma && (
              <div>
                <p className="text-sm font-medium text-muted-foreground">Vuelta a la Calma</p>
                <p className="mt-1 text-sm">{sesion.vueltaCalma}</p>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Observaciones y Material */}
      {(sesion.observaciones || sesion.materialNecesario) && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Informacion Adicional</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-4 md:grid-cols-2">
            {sesion.observaciones && (
              <div>
                <p className="text-sm font-medium text-muted-foreground">Observaciones</p>
                <p className="mt-1">{sesion.observaciones}</p>
              </div>
            )}
            {sesion.materialNecesario && (
              <div>
                <p className="text-sm font-medium text-muted-foreground">Material Necesario</p>
                <p className="mt-1">{sesion.materialNecesario}</p>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
