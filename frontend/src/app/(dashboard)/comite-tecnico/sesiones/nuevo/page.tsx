import { redirect } from 'next/navigation';
import Link from 'next/link';
import { getCurrentUserAction } from '@/app/actions/auth.actions';
import { fetchMicrociclosParaSelector } from '@/features/comite-tecnico/actions';
import { CreateSesionForm } from '@/features/comite-tecnico/components/forms/create-sesion-form';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import { AUTH_ROUTES, COMITE_TECNICO_ROUTES } from '@/lib/routes';
import { fetchEjerciciosPorTipo } from '@/features/algoritmo/actions/fetch-catalogo';

export default async function NuevaSesionComiteTecnicoPage() {
  // Verificar autenticacion
  const authResult = await getCurrentUserAction();

  if (!authResult.success || !authResult.user) {
    redirect(AUTH_ROUTES.login);
  }

  // Cargar microciclos y catalogo de ejercicios en paralelo
  const [microciclos, catalogoPorTipo] = await Promise.all([
    fetchMicrociclosParaSelector(),
    fetchEjerciciosPorTipo(),
  ]);

  if (!microciclos) {
    redirect(COMITE_TECNICO_ROUTES.dashboard);
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="sm" asChild>
          <Link href={COMITE_TECNICO_ROUTES.sesiones.list}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Volver
          </Link>
        </Button>
        <div>
          <h1 className="text-2xl font-bold">Nueva Sesion</h1>
          <p className="text-muted-foreground">
            Crea una nueva sesion de entrenamiento
          </p>
        </div>
      </div>

      <CreateSesionForm
        microciclos={microciclos}
        redirectUrl={COMITE_TECNICO_ROUTES.sesiones.list}
        catalogoPorTipo={catalogoPorTipo}
      />
    </div>
  );
}
