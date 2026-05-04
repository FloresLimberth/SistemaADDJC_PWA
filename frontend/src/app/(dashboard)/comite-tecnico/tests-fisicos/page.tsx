import Link from 'next/link';
import {
  fetchTestsFisicos,
  fetchAtletasParaSelector,
  fetchMicrociclosParaSelector,
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
import { ClipboardList, Eye } from 'lucide-react';
import { formatDateMedium } from '@/lib/date-utils';
import { ComiteTestsFilter } from '@/features/comite-tecnico/components/comite-tests-filter';
import { ComitePagination } from '@/features/comite-tecnico/components/comite-pagination';

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
  const params = await searchParams;
  const atletaId = params.atletaId || undefined;
  const microcicloId = params.microcicloId || undefined;
  const fechaDesde = params.fechaDesde || undefined;
  const fechaHasta = params.fechaHasta || undefined;
  const asistio = params.asistio || undefined;
  const page = params.page ? parseInt(params.page, 10) : 1;
  const limit = 20;

  // Cargar tests, atletas y microciclos en paralelo
  const [result, atletas, microciclos] = await Promise.all([
    fetchTestsFisicos({ atletaId, microcicloId, fechaDesde, fechaHasta, asistio, page, limit }),
    fetchAtletasParaSelector(),
    fetchMicrociclosParaSelector(),
  ]);

  const tests = result?.data || [];
  const total = result?.meta?.total || 0;
  const totalPages = result?.meta?.totalPages || 1;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Tests Fisicos</h1>
          <p className="text-muted-foreground">
            {total} test{total !== 1 ? 's' : ''} registrado{total !== 1 ? 's' : ''}
          </p>
        </div>
      </div>

      <ComiteTestsFilter
        atletas={atletas || []}
        microciclos={(microciclos || []).map((m) => ({ id: m.id, label: m.label }))}
      />

      {tests.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <ClipboardList className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-medium">No hay tests registrados</h3>
            <p className="text-muted-foreground mt-1">
              Los tests apareceran aqui cuando los entrenadores los registren.
            </p>
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
                          <Link href={`/comite-tecnico/tests-fisicos/${test.id}`}>
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

      <ComitePagination
        currentPage={page}
        totalPages={totalPages}
        total={total}
        itemLabel="tests"
      />
    </div>
  );
}
