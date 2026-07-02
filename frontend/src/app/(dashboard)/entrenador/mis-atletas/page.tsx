import { redirect } from 'next/navigation';
import { getCurrentUserAction } from '@/app/actions/auth.actions';
import { fetchMisAtletas } from '@/features/entrenador/actions/fetch-mis-atletas';
import { AtletasList } from '@/features/entrenador/components/atletas/atletas-list';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Users } from 'lucide-react';
import { AUTH_ROUTES } from '@/lib/routes';

export default async function MisAtletasPage() {
  // Verificar autenticacion
  const authResult = await getCurrentUserAction();

  if (!authResult.success || !authResult.user) {
    redirect(AUTH_ROUTES.login);
  }

  // Cargar atletas
  const atletasResult = await fetchMisAtletas({ limit: 50 });
  const atletas = atletasResult?.data || [];
  const total = atletasResult?.meta.total || 0;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Mis Atletas</h1>
          <p className="text-muted-foreground">
            {total} atleta{total !== 1 ? 's' : ''} asignado{total !== 1 ? 's' : ''}
          </p>
        </div>
      </div>

      {atletas.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              Resumen
            </CardTitle>
            <CardDescription>
              Vista general de tus atletas
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-3">
              <div className="text-center p-4 bg-muted rounded-lg">
                <p className="text-2xl font-bold">{total}</p>
                <p className="text-sm text-muted-foreground">Total atletas</p>
              </div>
              <div className="text-center p-4 bg-muted rounded-lg">
                <p className="text-2xl font-bold">
                  {atletas.filter((a) => a.dolenciasActivasCount && a.dolenciasActivasCount > 0).length}
                </p>
                <p className="text-sm text-muted-foreground">Con dolencias</p>
              </div>
              <div className="text-center p-4 bg-muted rounded-lg">
                <p className="text-2xl font-bold">
                  {atletas.filter((a) => a.ultimoTest).length}
                </p>
                <p className="text-sm text-muted-foreground">Con tests</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      <AtletasList atletas={atletas} />
    </div>
  );
}
