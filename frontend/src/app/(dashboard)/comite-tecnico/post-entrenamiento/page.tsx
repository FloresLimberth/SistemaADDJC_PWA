import Link from 'next/link';
import {
  fetchRegistrosPostEntrenamiento,
  fetchAtletasParaSelector,
} from '@/features/comite-tecnico/actions';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Activity, Eye, Calendar, AlertTriangle } from 'lucide-react';
import { ComiteAtletaFilter } from '@/features/comite-tecnico/components/comite-atleta-filter';
import { ComitePagination } from '@/features/comite-tecnico/components/comite-pagination';

interface PageProps {
  searchParams: Promise<{
    atletaId?: string;
    fechaDesde?: string;
    fechaHasta?: string;
    asistio?: string;
    rpeMin?: string;
    page?: string;
  }>;
}

export default async function PostEntrenamientoPage({ searchParams }: PageProps) {
  const params = await searchParams;
  const atletaId = params.atletaId || undefined;
  const fechaDesde = params.fechaDesde || undefined;
  const fechaHasta = params.fechaHasta || undefined;
  const asistio = params.asistio || undefined;
  const rpeMin = params.rpeMin ? parseInt(params.rpeMin, 10) : undefined;
  const page = params.page ? parseInt(params.page, 10) : 1;
  const limit = 20;

  // Cargar registros y atletas en paralelo
  const [result, atletas] = await Promise.all([
    fetchRegistrosPostEntrenamiento({ atletaId, fechaDesde, fechaHasta, asistio, rpeMin, page, limit }),
    fetchAtletasParaSelector(),
  ]);

  const registros = result?.data || [];
  const total = result?.meta.total || 0;
  const totalPages = result?.meta.totalPages || 1;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Post-Entrenamiento</h1>
          <p className="text-muted-foreground">
            {total} registro{total !== 1 ? 's' : ''} de sesiones de entrenamiento
          </p>
        </div>
      </div>

      <ComiteAtletaFilter atletas={atletas || []} />

      {registros.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <Activity className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-medium">No hay registros</h3>
            <p className="text-muted-foreground mt-1">
              Los entrenadores registran los datos post-entrenamiento de sus atletas.
            </p>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardContent className="pt-6">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Fecha</TableHead>
                  <TableHead>Atleta</TableHead>
                  <TableHead>Sesion</TableHead>
                  <TableHead className="text-center">Asistencia</TableHead>
                  <TableHead className="text-center">RPE</TableHead>
                  <TableHead className="text-center">Ejercicios</TableHead>
                  <TableHead className="text-center">Sueno</TableHead>
                  <TableHead className="text-center">Dolencias</TableHead>
                  <TableHead className="text-right">Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {registros.map((registro) => (
                  <TableRow key={registro.id}>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Calendar className="h-4 w-4 text-muted-foreground" />
                        {new Date(registro.fechaRegistro).toLocaleDateString('es-ES', {
                          day: '2-digit',
                          month: 'short',
                          year: 'numeric',
                        })}
                      </div>
                    </TableCell>
                    <TableCell className="font-medium">
                      {registro.atleta?.nombreCompleto || 'Sin nombre'}
                    </TableCell>
                    <TableCell>
                      {registro.sesion ? (
                        <span className="text-sm">
                          Sesion {registro.sesion.numeroSesion}
                          {registro.sesion.microciclo && (
                            <span className="text-muted-foreground ml-1">
                              (Mic. {registro.sesion.microciclo.codigoMicrociclo})
                            </span>
                          )}
                        </span>
                      ) : (
                        '-'
                      )}
                    </TableCell>
                    <TableCell className="text-center">
                      <Badge variant={registro.asistio ? 'default' : 'destructive'}>
                        {registro.asistio ? 'Si' : 'No'}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-center">
                      <Badge
                        variant={
                          registro.rpe >= 9
                            ? 'destructive'
                            : registro.rpe >= 7
                              ? 'secondary'
                              : 'outline'
                        }
                      >
                        {registro.rpe}/10
                      </Badge>
                    </TableCell>
                    <TableCell className="text-center">
                      {registro.ejerciciosCompletados}%
                    </TableCell>
                    <TableCell className="text-center">
                      {registro.calidadSueno}/10
                    </TableCell>
                    <TableCell className="text-center">
                      {registro.dolencias && registro.dolencias.length > 0 ? (
                        <div className="flex items-center justify-center gap-1">
                          <AlertTriangle className="h-4 w-4 text-orange-500" />
                          <span className="text-orange-600 font-medium">
                            {registro.dolencias.length}
                          </span>
                        </div>
                      ) : (
                        <span className="text-muted-foreground">-</span>
                      )}
                    </TableCell>
                    <TableCell className="text-right">
                      <Button variant="ghost" size="sm" asChild>
                        <Link href={`/comite-tecnico/post-entrenamiento/${registro.id}`}>
                          <Eye className="h-4 w-4 mr-1" />
                          Ver
                        </Link>
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}

      <ComitePagination
        currentPage={page}
        totalPages={totalPages}
        total={total}
        itemLabel="registros"
      />
    </div>
  );
}
