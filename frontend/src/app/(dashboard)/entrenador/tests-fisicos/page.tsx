import { redirect } from 'next/navigation';
import Link from 'next/link';
import { getCurrentUserAction } from '@/app/actions/auth.actions';
import { fetchTestsFisicosEntrenador } from '@/features/entrenador/actions/fetch-tests-fisicos';
import { fetchAtletasParaSelector } from '@/features/entrenador/actions/fetch-mis-atletas';
import { fetchMicrociclosParaSelector } from '@/features/comite-tecnico/actions/fetch-planificacion';
import { TestsFilters } from '@/features/entrenador/components/tests-filters';
import { TestsPagination } from '@/features/entrenador/components/tests-pagination';
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
import { ClipboardList, Plus, Eye } from 'lucide-react';
import { AUTH_ROUTES } from '@/lib/routes';
import { formatDateMedium } from '@/lib/date-utils';

interface PageProps {
  searchParams: Promise<{
    atletaId?: string;
    microcicloId?: string;
    fechaDesde?: string;
    fechaHasta?: string;
    asistio?: string;
    page?: string;
  }>;
}

export default async function TestsFisicosPage({ searchParams }: PageProps) {
  // Verificar autenticacion
  const authResult = await getCurrentUserAction();

  if (!authResult.success || !authResult.user) {
    redirect(AUTH_ROUTES.login);
  }

  // Leer filtros de la URL
  const params = await searchParams;
  const atletaId = params.atletaId || undefined;
  const microcicloId = params.microcicloId || undefined;
  const fechaDesde = params.fechaDesde || undefined;
  const fechaHasta = params.fechaHasta || undefined;
  const asistio = params.asistio || undefined;
  const page = Math.max(1, parseInt(params.page || '1', 10) || 1);
  const limit = 20;

  // Cargar datos en paralelo
  const [testsResult, atletas, microciclos] = await Promise.all([
    fetchTestsFisicosEntrenador({ atletaId, microcicloId, fechaDesde, fechaHasta, asistio, page, limit }),
    fetchAtletasParaSelector(),
    fetchMicrociclosParaSelector(),
  ]);

  const tests = testsResult?.data || [];
  const meta = testsResult?.meta || { total: 0, page: 1, limit: 20, totalPages: 1 };
  const total = meta.total || 0;
  const totalPages = meta.totalPages || 1;

  const hasActiveFilters = !!atletaId || !!microcicloId || !!fechaDesde || !!fechaHasta || !!asistio;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Tests Fisicos</h1>
          <p className="text-muted-foreground">
            {total} test{total !== 1 ? 's' : ''} registrado{total !== 1 ? 's' : ''}
          </p>
        </div>
        <Button asChild>
          <Link href="/entrenador/tests-fisicos/nuevo">
            <Plus className="h-4 w-4 mr-2" />
            Nuevo Test
          </Link>
        </Button>
      </div>

      <TestsFilters
        atletas={atletas || []}
        microciclos={(microciclos || []).map((m) => ({ id: m.id, label: m.label }))}
      />

      {tests.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <ClipboardList className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-medium">
              {hasActiveFilters ? 'No hay tests con estos filtros' : 'No hay tests registrados'}
            </h3>
            <p className="text-muted-foreground mt-1 mb-4">
              {hasActiveFilters
                ? 'Intenta cambiar los filtros para ver mas resultados.'
                : 'Registra el primer test fisico de tus atletas.'}
            </p>
            {!hasActiveFilters && (
              <Button asChild>
                <Link href="/entrenador/tests-fisicos/nuevo">
                  <Plus className="h-4 w-4 mr-2" />
                  Nuevo Test
                </Link>
              </Button>
            )}
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardContent className="pt-6">
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Atleta</TableHead>
                    <TableHead>Fecha</TableHead>
                    <TableHead>Press Banca</TableHead>
                    <TableHead>Sentadilla</TableHead>
                    <TableHead>Navette</TableHead>
                    <TableHead>VO2max</TableHead>
                    <TableHead className="text-right">Acciones</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {tests.map((test) => (
                    <TableRow key={test.id}>
                      <TableCell className="font-medium">
                        {test.atleta?.nombreCompleto || 'N/A'}
                      </TableCell>
                      <TableCell>{formatDateMedium(test.fechaTest)}</TableCell>
                      <TableCell>{test.pressBanca || '-'}</TableCell>
                      <TableCell>{test.sentadilla || '-'}</TableCell>
                      <TableCell>{test.navettePalier || '-'}</TableCell>
                      <TableCell>
                        {test.navetteVO2max ? (
                          <Badge variant="outline">{test.navetteVO2max}</Badge>
                        ) : (
                          '-'
                        )}
                      </TableCell>
                      <TableCell className="text-right">
                        <Button variant="ghost" size="sm" asChild>
                          <Link href={`/entrenador/tests-fisicos/${test.id}`}>
                            <Eye className="h-4 w-4 mr-1" />
                            Ver
                          </Link>
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      )}

      <TestsPagination
        currentPage={page}
        totalPages={totalPages}
        total={total}
      />
    </div>
  );
}
