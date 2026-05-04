import { notFound } from 'next/navigation';
import Link from 'next/link';
import { fetchMicrociclo } from '@/features/comite-tecnico/actions';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  ArrowLeft,
  Calendar,
  Target,
  Activity,
  Gauge,
  Edit,
  Clock,
} from 'lucide-react';
import { DeleteMicrocicloButton } from './delete-button';
import { formatDateLocale, formatDateShort } from '@/lib/date-utils';

// Mapeo de tipos de microciclo a variantes de badge
const tipoVariants: Record<string, 'default' | 'secondary' | 'destructive' | 'outline'> = {
  CARGA: 'default',
  DESCARGA: 'secondary',
  CHOQUE: 'destructive',
  RECUPERACION: 'outline',
  COMPETITIVO: 'default',
};

// Mapeo de dias de semana
const diasSemana: Record<string, string> = {
  LUNES: 'Lunes',
  MARTES: 'Martes',
  MIERCOLES: 'Miercoles',
  JUEVES: 'Jueves',
  VIERNES: 'Viernes',
  SABADO: 'Sabado',
  DOMINGO: 'Domingo',
};

interface MicrocicloDetallePageProps {
  params: Promise<{ id: string }>;
}

export default async function MicrocicloDetallePage({ params }: MicrocicloDetallePageProps) {
  const { id } = await params;

  const microciclo = await fetchMicrociclo(id);

  if (!microciclo) {
    notFound();
  }

  // Formatear fechas
  const fechaInicio = formatDateLocale(microciclo.fechaInicio, {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
  });
  const fechaFin = formatDateLocale(microciclo.fechaFin, {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
  });

  return (
    <div className="space-y-6">
      {/* Header con navegacion */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="sm" asChild>
            <Link href="/comite-tecnico/planificacion">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Volver
            </Link>
          </Button>
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-3xl font-bold">
                Microciclo #{microciclo.codigoMicrociclo}
              </h1>
              <Badge variant={tipoVariants[microciclo.tipoMicrociclo] || 'outline'}>
                {microciclo.tipoMicrociclo}
              </Badge>
            </div>
            <p className="text-muted-foreground">
              {microciclo.mesociclo?.nombre || 'Sin mesociclo asignado'}
            </p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button asChild>
            <Link href={`/comite-tecnico/planificacion/microciclos/${id}/editar`}>
              <Edit className="mr-2 h-4 w-4" />
              Editar
            </Link>
          </Button>
          <DeleteMicrocicloButton
            microcicloId={id}
            microcicloNumero={microciclo.codigoMicrociclo}
          />
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Informacion General */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              Informacion General
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-muted-foreground">Tipo</p>
                <p className="font-medium">{microciclo.tipoMicrociclo}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Numero Global</p>
                <p className="font-medium">#{microciclo.codigoMicrociclo}</p>
              </div>
            </div>

            <div>
              <p className="text-sm text-muted-foreground">Periodo</p>
              <p className="font-medium">{fechaInicio} - {fechaFin}</p>
            </div>

            {microciclo.mesociclo && (
              <div>
                <p className="text-sm text-muted-foreground">Mesociclo</p>
                <p className="font-medium">
                  {microciclo.mesociclo.nombre} ({microciclo.mesociclo.etapa.replace(/_/g, ' ')})
                </p>
              </div>
            )}

            <div>
              <p className="text-sm text-muted-foreground">Creado por</p>
              <p className="font-medium">{microciclo.creadoPor.replace(/_/g, ' ')}</p>
            </div>
          </CardContent>
        </Card>

        {/* Carga de Entrenamiento */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Activity className="h-5 w-5" />
              Carga de Entrenamiento
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="text-center p-4 bg-muted rounded-lg">
                <Activity className="h-6 w-6 mx-auto mb-2 text-muted-foreground" />
                <p className="text-2xl font-bold">{microciclo.volumenTotal}</p>
                <p className="text-xs text-muted-foreground">Volumen Total</p>
              </div>
              <div className="text-center p-4 bg-muted rounded-lg">
                <Gauge className="h-6 w-6 mx-auto mb-2 text-muted-foreground" />
                <p className="text-2xl font-bold">{microciclo.intensidadPromedio}%</p>
                <p className="text-xs text-muted-foreground">Intensidad Promedio</p>
              </div>
            </div>

            {(microciclo.mediaVolumen || microciclo.mediaIntensidad) && (
              <div className="grid grid-cols-2 gap-4 pt-2 border-t">
                {microciclo.mediaVolumen && (
                  <div>
                    <p className="text-sm text-muted-foreground">Media Volumen</p>
                    <p className="font-medium">{microciclo.mediaVolumen}</p>
                  </div>
                )}
                {microciclo.mediaIntensidad && (
                  <div>
                    <p className="text-sm text-muted-foreground">Media Intensidad</p>
                    <p className="font-medium">{microciclo.mediaIntensidad}%</p>
                  </div>
                )}
              </div>
            )}

            {(microciclo.sentidoVolumen || microciclo.sentidoIntensidad) && (
              <div className="grid grid-cols-2 gap-4 pt-2 border-t">
                {microciclo.sentidoVolumen && (
                  <div>
                    <p className="text-sm text-muted-foreground">Sentido Volumen</p>
                    <p className="font-medium">{microciclo.sentidoVolumen}</p>
                  </div>
                )}
                {microciclo.sentidoIntensidad && (
                  <div>
                    <p className="text-sm text-muted-foreground">Sentido Intensidad</p>
                    <p className="font-medium">{microciclo.sentidoIntensidad}</p>
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Objetivo Semanal */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="h-5 w-5" />
            Objetivo Semanal
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p>{microciclo.objetivoSemanal}</p>
          {microciclo.observaciones && (
            <div className="pt-4 border-t">
              <p className="text-sm text-muted-foreground mb-2">Observaciones:</p>
              <p className="text-sm">{microciclo.observaciones}</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Sesiones */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5" />
            Sesiones ({microciclo.sesiones?.length || 0})
          </CardTitle>
          <CardDescription>
            Sesiones de entrenamiento de esta semana
          </CardDescription>
        </CardHeader>
        <CardContent>
          {!microciclo.sesiones || microciclo.sesiones.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <Clock className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>No hay sesiones registradas para este microciclo</p>
            </div>
          ) : (
            <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-4">
              {microciclo.sesiones.map((sesion) => {
                const fechaSesion = formatDateShort(sesion.fecha);

                return (
                  <Card key={sesion.id} className="border-l-4 border-l-primary">
                    <CardContent className="pt-4">
                      <div className="flex items-start justify-between mb-2">
                        <div>
                          <p className="font-medium">
                            {diasSemana[sesion.diaSemana] || sesion.diaSemana}
                          </p>
                          <p className="text-sm text-muted-foreground">{fechaSesion}</p>
                        </div>
                        <Badge variant="outline" className="text-xs">
                          {sesion.tipoSesion}
                        </Badge>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
