import Link from 'next/link';
import { notFound } from 'next/navigation';
import { fetchRegistroPostEntrenamiento } from '@/features/comite-tecnico/actions';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  ArrowLeft,
  Activity,
  User,
  Calendar,
  Clock,
  AlertTriangle,
  Moon,
  Heart,
  Dumbbell,
} from 'lucide-react';

interface RegistroDetallePageProps {
  params: Promise<{ id: string }>;
}

export default async function RegistroDetallePage({ params }: RegistroDetallePageProps) {
  const { id } = await params;
  const registro = await fetchRegistroPostEntrenamiento(id);

  if (!registro) {
    notFound();
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="sm" asChild>
          <Link href="/comite-tecnico/post-entrenamiento">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Volver
          </Link>
        </Button>
        <div className="flex-1">
          <h1 className="text-2xl font-bold">Registro Post-Entrenamiento</h1>
          <p className="text-muted-foreground">
            {new Date(registro.fechaRegistro).toLocaleDateString('es-ES', {
              weekday: 'long',
              day: '2-digit',
              month: 'long',
              year: 'numeric',
            })}
          </p>
        </div>
        <Badge variant={registro.asistio ? 'default' : 'destructive'} className="text-sm">
          {registro.asistio ? 'Asistio' : 'No asistio'}
        </Badge>
      </div>

      {/* Info del atleta y sesion */}
      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base flex items-center gap-2">
              <User className="h-4 w-4" />
              Atleta
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-lg font-medium">
              {registro.atleta?.nombreCompleto || 'Sin nombre'}
            </p>
            {registro.entrenador && (
              <p className="text-sm text-muted-foreground mt-1">
                Registrado por: {registro.entrenador.nombreCompleto}
              </p>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              Sesion
            </CardTitle>
          </CardHeader>
          <CardContent>
            {registro.sesion ? (
              <>
                <p className="text-lg font-medium">
                  Sesion {registro.sesion.numeroSesion}
                </p>
                <p className="text-sm text-muted-foreground">
                  {registro.sesion.tipoSesion}
                  {registro.sesion.microciclo && (
                    <span> - Microciclo {registro.sesion.microciclo.codigoMicrociclo}</span>
                  )}
                </p>
              </>
            ) : (
              <p className="text-muted-foreground">Sin sesion asignada</p>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Metricas de entrenamiento */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="h-5 w-5" />
            Metricas de Entrenamiento
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            <div className="text-center p-4 bg-muted/50 rounded-lg">
              <Dumbbell className="h-6 w-6 mx-auto mb-2 text-blue-500" />
              <p className="text-2xl font-bold">{registro.rpe}/10</p>
              <p className="text-sm text-muted-foreground">RPE</p>
              <Badge
                variant={
                  registro.rpe >= 9
                    ? 'destructive'
                    : registro.rpe >= 7
                      ? 'secondary'
                      : 'outline'
                }
                className="mt-1"
              >
                {registro.rpe >= 9 ? 'Muy alto' : registro.rpe >= 7 ? 'Alto' : 'Normal'}
              </Badge>
            </div>

            <div className="text-center p-4 bg-muted/50 rounded-lg">
              <Activity className="h-6 w-6 mx-auto mb-2 text-green-500" />
              <p className="text-2xl font-bold">{registro.ejerciciosCompletados}%</p>
              <p className="text-sm text-muted-foreground">Ejercicios completados</p>
            </div>

            <div className="text-center p-4 bg-muted/50 rounded-lg">
              <Activity className="h-6 w-6 mx-auto mb-2 text-purple-500" />
              <p className="text-2xl font-bold">{registro.intensidadAlcanzada}%</p>
              <p className="text-sm text-muted-foreground">Intensidad alcanzada</p>
            </div>

            {registro.duracionReal && (
              <div className="text-center p-4 bg-muted/50 rounded-lg">
                <Clock className="h-6 w-6 mx-auto mb-2 text-orange-500" />
                <p className="text-2xl font-bold">{registro.duracionReal} min</p>
                <p className="text-sm text-muted-foreground">Duracion real</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Estado del atleta */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Heart className="h-5 w-5" />
            Estado del Atleta
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
            <div className="text-center p-4 bg-muted/50 rounded-lg">
              <Moon className="h-6 w-6 mx-auto mb-2 text-indigo-500" />
              <p className="text-2xl font-bold">{registro.calidadSueno}/10</p>
              <p className="text-sm text-muted-foreground">Calidad de sueno</p>
            </div>

            {registro.horasSueno && (
              <div className="text-center p-4 bg-muted/50 rounded-lg">
                <Clock className="h-6 w-6 mx-auto mb-2 text-indigo-400" />
                <p className="text-2xl font-bold">{registro.horasSueno}h</p>
                <p className="text-sm text-muted-foreground">Horas de sueno</p>
              </div>
            )}

            <div className="text-center p-4 bg-muted/50 rounded-lg">
              <Heart className="h-6 w-6 mx-auto mb-2 text-pink-500" />
              <p className="text-2xl font-bold">{registro.estadoAnimico}/10</p>
              <p className="text-sm text-muted-foreground">Estado animico</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Motivo de inasistencia */}
      {!registro.asistio && registro.motivoInasistencia && (
        <Card className="border-destructive/50">
          <CardHeader>
            <CardTitle className="text-destructive">Motivo de Inasistencia</CardTitle>
          </CardHeader>
          <CardContent>
            <p>{registro.motivoInasistencia}</p>
          </CardContent>
        </Card>
      )}

      {/* Dolencias */}
      {registro.dolencias && registro.dolencias.length > 0 && (
        <Card className="border-orange-500/50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-orange-600">
              <AlertTriangle className="h-5 w-5" />
              Dolencias Reportadas ({registro.dolencias.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-3 md:grid-cols-2">
              {registro.dolencias.map((dolencia) => (
                <div
                  key={dolencia.id}
                  className="p-3 border rounded-lg bg-orange-50 dark:bg-orange-950/20"
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-medium">{dolencia.zona}</span>
                    <div className="flex items-center gap-2">
                      <Badge variant="outline">{dolencia.tipoLesion}</Badge>
                      <Badge
                        variant={
                          dolencia.nivel >= 8
                            ? 'destructive'
                            : dolencia.nivel >= 5
                              ? 'secondary'
                              : 'outline'
                        }
                      >
                        Nivel {dolencia.nivel}/10
                      </Badge>
                    </div>
                  </div>
                  {dolencia.descripcion && (
                    <p className="text-sm text-muted-foreground">{dolencia.descripcion}</p>
                  )}
                  {dolencia.recuperado && (
                    <Badge variant="default" className="mt-2">
                      Recuperado
                    </Badge>
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Observaciones */}
      {registro.observaciones && (
        <Card>
          <CardHeader>
            <CardTitle>Observaciones</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="whitespace-pre-wrap">{registro.observaciones}</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
