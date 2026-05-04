import { redirect } from 'next/navigation';
import Link from 'next/link';
import { getCurrentUserAction } from '@/app/actions/auth.actions';
import { fetchAtletasParaSelector } from '@/features/entrenador/actions/fetch-mis-atletas';
import { CreateTestForm } from '@/features/entrenador/components/forms/create-test-form';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import { AUTH_ROUTES, ENTRENADOR_ROUTES } from '@/lib/routes';

export default async function NuevoTestPage() {
  // Verificar autenticacion
  const authResult = await getCurrentUserAction();

  if (!authResult.success || !authResult.user) {
    redirect(AUTH_ROUTES.login);
  }

  // Cargar atletas para el selector
  const atletas = await fetchAtletasParaSelector();

  if (!atletas) {
    redirect(ENTRENADOR_ROUTES.dashboard);
  }

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="sm" asChild>
          <Link href="/entrenador/tests-fisicos">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Volver
          </Link>
        </Button>
        <div>
          <h1 className="text-2xl font-bold">Nuevo Test Fisico</h1>
          <p className="text-muted-foreground">
            Registra los resultados de un test fisico
          </p>
        </div>
      </div>

      <CreateTestForm atletas={atletas} />
    </div>
  );
}
