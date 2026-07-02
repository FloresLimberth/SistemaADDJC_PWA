import { notFound, redirect } from 'next/navigation';
import Link from 'next/link';
import { getCurrentUserAction } from '@/app/actions/auth.actions';
import { fetchMesociclo, fetchMicrociclos } from '@/features/comite-tecnico/actions';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  ArrowLeft,
  Calendar,
  Target,
  Layers,
} from 'lucide-react';
import { formatDateLocale, formatDateShort } from '@/lib/date-utils';
import { AUTH_ROUTES, ENTRENADOR_ROUTES } from '@/lib/routes';

// Mapeo de etapas a variantes de badge
const etapaVariants: Record<string, 'default' | 'secondary' | 'destructive' | 'outline'> = {
  PREPARACION_GENERAL: 'outline',
  PREPARACION_ESPECIFICA: 'secondary',
  COMPETITIVA: 'default',
  TRANSICION: 'destructive',
};

interface MesocicloDetallePageProps {
  params: Promise<{ id: string }>;
}

export default async function EntrenadorMesocicloDetallePage({ params }: MesocicloDetallePageProps) {
  const { id } = await params;

  // Verificar autenticacion
  const authResult = await getCurrentUserAction();

  if (!authResult.success || !authResult.user) {
    redirect(AUTH_ROUTES.login);
  }

  // Obtener mesociclo y sus microciclos
  const [mesociclo, microciclosResult] = await Promise.all([
    fetchMesociclo(id),
    fetchMicrociclos({ mesocicloId: id, limit: 50 }),
  ]);

  if (!mesociclo) {
    notFound();
  }

  const microciclos = microciclosResult?.data || [];

  // Formatear fechas
  const fechaInicio = formatDateLocale(mesociclo.fechaInicio, {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
  });
  const fechaFin = formatDateLocale(mesociclo.fechaFin, {
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
            <Link href={ENTRENADOR_ROUTES.planificacion.macrociclos.list}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Volver
            </Link>
          </Button>
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-3xl font-bold">{mesociclo.nombre}</h1>
              <Badge variant={etapaVariants[mesociclo.etapa] || 'outline'}>
                {mesociclo.etapa.replace(/_/g, ' ')}
              </Badge>
            </div>
            <p className="text-muted-foreground">
              Codigo: {mesociclo.codigoMesociclo}
              {mesociclo.macrociclo && ` - ${mesociclo.macrociclo.nombre}`}
            </p>
          </div>
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
                <p className="text-sm text-muted-foreground">Etapa</p>
                <p className="font-medium">{mesociclo.etapa.replace(/_/g, ' ')}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Codigo</p>
                <p className="font-medium">{mesociclo.codigoMesociclo}</p>
              </div>
            </div>

            <div>
              <p className="text-sm text-muted-foreground">Periodo</p>
              <p className="font-medium">{fechaInicio} - {fechaFin}</p>
            </div>

            {mesociclo.macrociclo && (
              <div>
                <p className="text-sm text-muted-foreground">Macrociclo</p>
                <p className="font-medium">
                  {mesociclo.macrociclo.nombre} ({mesociclo.macrociclo.temporada})
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Objetivos */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Target className="h-5 w-5" />
              Objetivos del Mesociclo
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <p className="text-sm text-muted-foreground">Objetivo Fisico</p>
              <p className="font-medium">{mesociclo.objetivoFisico}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Objetivo Tecnico</p>
              <p className="font-medium">{mesociclo.objetivoTecnico}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Objetivo Tactico</p>
              <p className="font-medium">{mesociclo.objetivoTactico}</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Microciclos */}
      <Card>
        <CardHeader>
          <div>
            <CardTitle className="flex items-center gap-2">
              <Layers className="h-5 w-5" />
              Microciclos ({microciclos.length})
            </CardTitle>
            <CardDescription>
              Semanas de entrenamiento dentro de este mesociclo
            </CardDescription>
          </div>
        </CardHeader>
        <CardContent>
          {microciclos.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <Layers className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>No hay microciclos creados para este mesociclo</p>
            </div>
          ) : (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {microciclos.map((microciclo) => {
                const microInicio = formatDateShort(microciclo.fechaInicio);
                const microFin = formatDateShort(microciclo.fechaFin);

                return (
                  <Link
                    key={microciclo.id}
                    href={ENTRENADOR_ROUTES.planificacion.microciclos.detalle(microciclo.id)}
                    className="block"
                  >
                    <Card className="border-l-4 border-l-primary hover:shadow-md transition-shadow cursor-pointer">
                      <CardContent className="pt-4">
                        <div className="flex items-start justify-between mb-2">
                          <div>
                            <p className="font-medium">Microciclo #{microciclo.codigoMicrociclo}</p>
                            <p className="text-sm text-muted-foreground">
                              {microInicio} - {microFin}
                            </p>
                          </div>
                          <Badge variant="outline">{microciclo.tipoMicrociclo.replace(/_/g, ' ')}</Badge>
                        </div>
                        <p className="text-sm text-muted-foreground mt-2 line-clamp-2">
                          {microciclo.objetivoSemanal}
                        </p>
                        <div className="flex justify-between mt-3 text-sm">
                          <span>Vol: {microciclo.volumenTotal}</span>
                          <span>Int: {microciclo.intensidadPromedio}%</span>
                        </div>
                      </CardContent>
                    </Card>
                  </Link>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
