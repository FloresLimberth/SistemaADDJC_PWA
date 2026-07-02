import { redirect } from 'next/navigation';
import Link from 'next/link';
import { getCurrentUserAction } from '@/app/actions/auth.actions';
import { fetchRegistrosEntrenador } from '@/features/entrenador/actions/fetch-registros';
import { fetchAtletasParaSelector } from '@/features/entrenador/actions/fetch-mis-atletas';
import { RegistrosFilters } from '@/features/entrenador/components/registros-filters';
import { RegistrosPagination } from '@/features/entrenador/components/registros-pagination';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Activity, Plus, Eye, Calendar, AlertTriangle } from 'lucide-react';
import { AUTH_ROUTES } from '@/lib/routes';

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
  // Verificar autenticacion
  const authResult = await getCurrentUserAction();

  if (!authResult.success || !authResult.user) {
    redirect(AUTH_ROUTES.login);
  }

  // Leer filtros de la URL
  const params = await searchParams;
  const atletaId = params.atletaId || undefined;
  const fechaDesde = params.fechaDesde || undefined;
  const fechaHasta = params.fechaHasta || undefined;
  const asistio = params.asistio || undefined;
  const rpeMin = params.rpeMin ? parseInt(params.rpeMin, 10) : undefined;
  const page = Math.max(1, parseInt(params.page || '1', 10) || 1);
  const limit = 20;

  // Cargar datos en paralelo
  const [registrosResult, atletas] = await Promise.all([
    fetchRegistrosEntrenador({ atletaId, fechaDesde, fechaHasta, asistio, rpeMin, page, limit }),
    fetchAtletasParaSelector(),
  ]);

  const registros = registrosResult?.data || [];
  const meta = registrosResult?.meta || { total: 0, page: 1, limit: 20, totalPages: 1 };
  const total = meta.total || 0;
  const totalPages = meta.totalPages || 1;

  const hasActiveFilters = !!atletaId || !!fechaDesde || !!fechaHasta || !!asistio || rpeMin !== undefined;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Post-Entrenamiento</h1>
          <p className="text-muted-foreground">
            {total} registro{total !== 1 ? 's' : ''} de sesiones
          </p>
        </div>
        <Button asChild>
          <Link href="/entrenador/post-entrenamiento/nuevo">
            <Plus className="h-4 w-4 mr-2" />
            Nuevo Registro
          </Link>
        </Button>
      </div>

      <RegistrosFilters atletas={atletas || []} />

      {registros.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <Activity className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-medium">
              {hasActiveFilters ? 'No hay registros con estos filtros' : 'No hay registros'}
            </h3>
            <p className="text-muted-foreground mt-1 mb-4">
              {hasActiveFilters
                ? 'Intenta cambiar los filtros para ver mas resultados.'
                : 'Registra los datos post-entrenamiento de tus atletas.'}
            </p>
            {!hasActiveFilters && (
              <Button asChild>
                <Link href="/entrenador/post-entrenamiento/nuevo">
                  <Plus className="h-4 w-4 mr-2" />
                  Nuevo Registro
                </Link>
              </Button>
            )}
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
                        <Link href={`/entrenador/post-entrenamiento/${registro.id}`}>
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

      <RegistrosPagination
        currentPage={page}
        totalPages={totalPages}
        total={total}
      />
    </div>
  );
}
