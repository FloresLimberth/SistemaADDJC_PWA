import { redirect } from 'next/navigation';
import Link from 'next/link';
import { getCurrentUserAction } from '@/app/actions/auth.actions';
import { fetchDolenciasEntrenador } from '@/features/entrenador/actions/fetch-dolencias-entrenador';
import { MarcarRecuperadoButton } from '@/features/entrenador/components/marcar-recuperado-button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { AlertTriangle, Calendar, User, CheckCircle } from 'lucide-react';
import { AUTH_ROUTES } from '@/lib/routes';

export default async function DolenciasPage() {
  // Verificar autenticacion
  const authResult = await getCurrentUserAction();

  if (!authResult.success || !authResult.user) {
    redirect(AUTH_ROUTES.login);
  }

  // Cargar dolencias
  const dolenciasResult = await fetchDolenciasEntrenador({ limit: 100 });
  const dolencias = dolenciasResult?.data || [];

  const activas = dolencias.filter((d) => !d.recuperado);
  const recuperadas = dolencias.filter((d) => d.recuperado);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Dolencias</h1>
        <p className="text-muted-foreground">
          {activas.length} activa{activas.length !== 1 ? 's' : ''} | {recuperadas.length} recuperada{recuperadas.length !== 1 ? 's' : ''}
        </p>
      </div>

      {dolencias.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <CheckCircle className="h-12 w-12 text-green-500 mx-auto mb-4" />
            <h3 className="text-lg font-medium">Sin dolencias</h3>
            <p className="text-muted-foreground mt-1">
              Tus atletas no tienen dolencias registradas.
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-8">
          {activas.length > 0 && (
            <div>
              <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
                <AlertTriangle className="h-5 w-5 text-orange-500" />
                Dolencias Activas ({activas.length})
              </h2>
              <div className="grid gap-4 md:grid-cols-2">
                {activas.map((dolencia) => (
                  <Card key={dolencia.id} className="border-orange-200">
                    <CardHeader className="pb-2">
                      <CardTitle className="text-base flex items-center justify-between">
                        <span className="flex items-center gap-2">
                          <User className="h-4 w-4" />
                          {dolencia.registroPostEntrenamiento?.atleta?.nombreCompleto || 'Atleta'}
                        </span>
                        <Badge variant="destructive">Nivel {dolencia.nivel}/10</Badge>
                      </CardTitle>
                      <CardDescription className="flex items-center gap-2">
                        <Calendar className="h-3 w-3" />
                        {new Date(dolencia.createdAt).toLocaleDateString('es-ES')}
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2">
                        <div>
                          <p className="text-sm text-muted-foreground">Zona afectada</p>
                          <p className="font-medium">{dolencia.zona}</p>
                        </div>
                        {dolencia.tipoLesion && (
                          <div>
                            <p className="text-sm text-muted-foreground">Tipo</p>
                            <p className="font-medium">{dolencia.tipoLesion.replace('_', ' ')}</p>
                          </div>
                        )}
                        {dolencia.descripcion && (
                          <div>
                            <p className="text-sm text-muted-foreground">Descripcion</p>
                            <p className="text-sm">{dolencia.descripcion}</p>
                          </div>
                        )}
                      </div>
                      <div className="mt-4 flex justify-end gap-2">
                        <Button variant="outline" size="sm" asChild>
                          <Link
                            href={`/entrenador/mis-atletas/${dolencia.registroPostEntrenamiento?.atleta?.id || ''}`}
                          >
                            Ver atleta
                          </Link>
                        </Button>
                        <MarcarRecuperadoButton
                          dolenciaId={Number(dolencia.id)}
                          zona={dolencia.zona}
                          nombreAtleta={dolencia.registroPostEntrenamiento?.atleta?.nombreCompleto || 'Atleta'}
                        />
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          )}

          {recuperadas.length > 0 && (
            <div>
              <h2 className="text-xl font-semibold mb-4 flex items-center gap-2 text-muted-foreground">
                <CheckCircle className="h-5 w-5 text-green-500" />
                Dolencias Recuperadas ({recuperadas.length})
              </h2>
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {recuperadas.slice(0, 6).map((dolencia) => (
                  <Card key={dolencia.id} className="opacity-70">
                    <CardContent className="py-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-medium">
                            {dolencia.registroPostEntrenamiento?.atleta?.nombreCompleto || 'Atleta'}
                          </p>
                          <p className="text-sm text-muted-foreground">
                            {dolencia.zona} - Nivel {dolencia.nivel}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            Recuperada el{' '}
                            {dolencia.fechaRecuperacion
                              ? new Date(dolencia.fechaRecuperacion).toLocaleDateString('es-ES')
                              : 'N/A'}
                          </p>
                        </div>
                        <Badge variant="outline" className="text-green-600">
                          Recuperada
                        </Badge>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
              {recuperadas.length > 6 && (
                <p className="text-center text-sm text-muted-foreground mt-4">
                  y {recuperadas.length - 6} mas...
                </p>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
