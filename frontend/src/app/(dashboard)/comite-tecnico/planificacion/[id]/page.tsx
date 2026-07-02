import { notFound } from 'next/navigation';
import Link from 'next/link';
import { fetchMacrociclo, fetchMesociclos } from '@/features/comite-tecnico/actions';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  ArrowLeft,
  Calendar,
  Target,
  Layers,
  Edit,
  User,
} from 'lucide-react';
import { DeleteMacrocicloButton } from './delete-button';
import { formatDateLocale, formatDateShort } from '@/lib/date-utils';

// Mapeo de estados a variantes de badge
const estadoVariants: Record<string, 'default' | 'secondary' | 'destructive' | 'outline'> = {
  PLANIFICADO: 'outline',
  EN_CURSO: 'default',
  COMPLETADO: 'secondary',
  CANCELADO: 'destructive',
};

interface MacrocicloDetallePageProps {
  params: Promise<{ id: string }>;
}

export default async function MacrocicloDetallePage({ params }: MacrocicloDetallePageProps) {
  const { id } = await params;

  // Obtener macrociclo y sus mesociclos
  const [macrociclo, mesociclosResult] = await Promise.all([
    fetchMacrociclo(id),
    fetchMesociclos({ macrocicloId: id, limit: 50 }),
  ]);

  if (!macrociclo) {
    notFound();
  }

  const mesociclos = mesociclosResult?.data || [];

  // Formatear fechas
  const fechaInicio = formatDateLocale(macrociclo.fechaInicio, {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
  });
  const fechaFin = formatDateLocale(macrociclo.fechaFin, {
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
              <h1 className="text-3xl font-bold">{macrociclo.nombre}</h1>
              <Badge variant={estadoVariants[macrociclo.estado] || 'outline'}>
                {macrociclo.estado.replace(/_/g, ' ')}
              </Badge>
            </div>
            <p className="text-muted-foreground">{macrociclo.temporada} - {macrociclo.equipo}</p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button asChild>
            <Link href={`/comite-tecnico/planificacion/${id}/editar`}>
              <Edit className="mr-2 h-4 w-4" />
              Editar
            </Link>
          </Button>
          <DeleteMacrocicloButton
            macrocicloId={id}
            macrocicloNombre={macrociclo.nombre}
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
                <p className="text-sm text-muted-foreground">Categoria Objetivo</p>
                <p className="font-medium">{macrociclo.categoriaObjetivo}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Equipo</p>
                <p className="font-medium">{macrociclo.equipo}</p>
              </div>
            </div>

            <div>
              <p className="text-sm text-muted-foreground">Periodo</p>
              <p className="font-medium">{fechaInicio} - {fechaFin}</p>
            </div>

            {macrociclo.creador && (
              <div className="pt-2 border-t">
                <p className="text-sm text-muted-foreground flex items-center gap-1">
                  <User className="h-4 w-4" />
                  Creado por
                </p>
                <p className="font-medium">{macrociclo.creador.nombreCompleto}</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Objetivos */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Target className="h-5 w-5" />
              Objetivos del Macrociclo
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <p className="text-sm text-muted-foreground">Objetivo 1</p>
              <p className="font-medium">{macrociclo.objetivo1}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Objetivo 2</p>
              <p className="font-medium">{macrociclo.objetivo2}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Objetivo 3</p>
              <p className="font-medium">{macrociclo.objetivo3}</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Mesociclos */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Layers className="h-5 w-5" />
              Mesociclos ({mesociclos.length})
            </CardTitle>
            <CardDescription>
              Etapas de entrenamiento dentro de este macrociclo
            </CardDescription>
          </div>
          <Button asChild size="sm">
            <Link href={`/comite-tecnico/planificacion/mesociclos/nuevo?macrocicloId=${id}`}>
              <Layers className="mr-2 h-4 w-4" />
              Nuevo Mesociclo
            </Link>
          </Button>
        </CardHeader>
        <CardContent>
          {mesociclos.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <Layers className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>No hay mesociclos creados para este macrociclo</p>
            </div>
          ) : (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {mesociclos.map((mesociclo) => {
                const mesoInicio = formatDateShort(mesociclo.fechaInicio);
                const mesoFin = formatDateShort(mesociclo.fechaFin);

                return (
                  <Link
                    key={mesociclo.id}
                    href={`/comite-tecnico/planificacion/mesociclos/${mesociclo.id}`}
                    className="block"
                  >
                    <Card className="border-l-4 border-l-primary hover:shadow-md transition-shadow cursor-pointer">
                      <CardContent className="pt-4">
                        <div className="flex items-start justify-between mb-2">
                          <div>
                            <p className="font-medium">{mesociclo.nombre}</p>
                            <p className="text-sm text-muted-foreground">
                              Codigo: {mesociclo.codigoMesociclo}
                            </p>
                          </div>
                          <Badge variant="outline">{mesociclo.etapa.replace(/_/g, ' ')}</Badge>
                        </div>
                        <p className="text-sm text-muted-foreground">
                          {mesoInicio} - {mesoFin}
                        </p>
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
