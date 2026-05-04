import { fetchDolencias } from '@/features/comite-tecnico/actions';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { AlertTriangle } from 'lucide-react';

export default async function DolenciasPage() {
  const result = await fetchDolencias({ limit: 50 });

  const dolencias = result?.data || [];
  const total = result?.meta?.total || 0;

  // Separar activas de recuperadas
  const activas = dolencias.filter((d) => !d.recuperado);
  const recuperadas = dolencias.filter((d) => d.recuperado);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Dolencias</h1>
          <p className="text-muted-foreground">
            {activas.length} activa{activas.length !== 1 ? 's' : ''}, {recuperadas.length} recuperada{recuperadas.length !== 1 ? 's' : ''}
          </p>
        </div>
      </div>

      {/* Dolencias Activas */}
      <Card className={activas.length > 0 ? 'border-orange-200' : ''}>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertTriangle className={`h-5 w-5 ${activas.length > 0 ? 'text-orange-500' : ''}`} />
            Dolencias Activas
          </CardTitle>
          <CardDescription>
            Dolencias que requieren seguimiento
          </CardDescription>
        </CardHeader>
        <CardContent>
          {activas.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-8 text-center">
              <p className="text-muted-foreground">No hay dolencias activas</p>
            </div>
          ) : (
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Atleta</TableHead>
                    <TableHead>Zona</TableHead>
                    <TableHead>Nivel</TableHead>
                    <TableHead>Tipo</TableHead>
                    <TableHead>Fecha Registro</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {activas.map((dolencia) => (
                    <TableRow key={dolencia.id}>
                      <TableCell className="font-medium">
                        {dolencia.registroPostEntrenamiento?.atleta?.nombreCompleto || 'N/A'}
                      </TableCell>
                      <TableCell>{dolencia.zona}</TableCell>
                      <TableCell>
                        <Badge variant={dolencia.nivel >= 7 ? 'destructive' : dolencia.nivel >= 4 ? 'default' : 'secondary'}>
                          {dolencia.nivel}/10
                        </Badge>
                      </TableCell>
                      <TableCell>{dolencia.tipoLesion?.replace(/_/g, ' ') || '-'}</TableCell>
                      <TableCell>
                        {dolencia.registroPostEntrenamiento?.fechaRegistro
                          ? new Date(dolencia.registroPostEntrenamiento.fechaRegistro).toLocaleDateString('es-ES', {
                              day: '2-digit',
                              month: 'short',
                            })
                          : '-'}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Dolencias Recuperadas */}
      {recuperadas.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Dolencias Recuperadas</CardTitle>
            <CardDescription>
              Historial de dolencias resueltas
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Atleta</TableHead>
                    <TableHead>Zona</TableHead>
                    <TableHead>Nivel</TableHead>
                    <TableHead>Fecha Recuperacion</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {recuperadas.slice(0, 10).map((dolencia) => (
                    <TableRow key={dolencia.id} className="text-muted-foreground">
                      <TableCell>
                        {dolencia.registroPostEntrenamiento?.atleta?.nombreCompleto || 'N/A'}
                      </TableCell>
                      <TableCell>{dolencia.zona}</TableCell>
                      <TableCell>{dolencia.nivel}/10</TableCell>
                      <TableCell>
                        {dolencia.fechaRecuperacion
                          ? new Date(dolencia.fechaRecuperacion).toLocaleDateString('es-ES', {
                              day: '2-digit',
                              month: 'short',
                            })
                          : '-'}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
