import { fetchAsignaciones } from '@/features/comite-tecnico/actions';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Link as LinkIcon, Plus } from 'lucide-react';
import Link from 'next/link';
import { COMITE_TECNICO_ROUTES } from '@/lib/routes';

export default async function AsignacionesPage() {
  const result = await fetchAsignaciones({ limit: 50 });

  const asignaciones = result?.data || [];
  const total = result?.meta?.total || 0;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Asignaciones</h1>
          <p className="text-muted-foreground">
            {total} asignacion{total !== 1 ? 'es' : ''} en total
          </p>
        </div>
        <Button asChild>
          <Link href={COMITE_TECNICO_ROUTES.asignaciones.nuevo}>
            <Plus className="mr-2 h-4 w-4" />
            Nueva Asignacion
          </Link>
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <LinkIcon className="h-5 w-5" />
            Asignaciones Atleta-Microciclo
          </CardTitle>
          <CardDescription>
            Relacion entre atletas y su planificacion de microciclos
          </CardDescription>
        </CardHeader>
        <CardContent>
          {asignaciones.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <LinkIcon className="h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="text-lg font-medium">No hay asignaciones</h3>
              <p className="text-muted-foreground mt-1 mb-4">
                Crea asignaciones para vincular atletas con microciclos.
              </p>
              <Button asChild>
                <Link href={COMITE_TECNICO_ROUTES.asignaciones.nuevo}>
                  <Plus className="mr-2 h-4 w-4" />
                  Nueva Asignacion
                </Link>
              </Button>
            </div>
          ) : (
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Atleta</TableHead>
                    <TableHead>Microciclo</TableHead>
                    <TableHead>Periodo</TableHead>
                    <TableHead>Fecha Asignacion</TableHead>
                    <TableHead className="text-right">Acciones</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {asignaciones.map((asignacion) => (
                    <TableRow key={asignacion.id}>
                      <TableCell className="font-medium">
                        {asignacion.atleta?.nombreCompleto || 'N/A'}
                      </TableCell>
                      <TableCell>
                        Microciclo {asignacion.microciclo?.codigoMicrociclo || 'N/A'}
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {asignacion.microciclo?.fechaInicio && asignacion.microciclo?.fechaFin
                          ? `${new Date(asignacion.microciclo.fechaInicio).toLocaleDateString('es-ES', {
                              day: '2-digit',
                              month: 'short',
                            })} - ${new Date(asignacion.microciclo.fechaFin).toLocaleDateString('es-ES', {
                              day: '2-digit',
                              month: 'short',
                            })}`
                          : '-'}
                      </TableCell>
                      <TableCell>
                        {new Date(asignacion.fechaAsignacion).toLocaleDateString('es-ES', {
                          day: '2-digit',
                          month: 'short',
                          year: 'numeric',
                        })}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button variant="outline" size="sm" asChild>
                            <Link href={COMITE_TECNICO_ROUTES.asignaciones.detalle(asignacion.id)}>
                              Ver detalle
                            </Link>
                          </Button>
                          <Button variant="outline" size="sm" asChild>
                            <Link href={COMITE_TECNICO_ROUTES.asignaciones.editar(asignacion.id)}>
                              Editar
                            </Link>
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
