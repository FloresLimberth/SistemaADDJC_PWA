import { redirect, notFound } from 'next/navigation';
import Link from 'next/link';
import { getCurrentUserAction } from '@/app/actions/auth.actions';
import { fetchSesion, fetchMicrociclosParaSelector } from '@/features/comite-tecnico/actions';
import { EditSesionForm } from '@/features/comite-tecnico/components/forms/edit-sesion-form';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import { AUTH_ROUTES, ENTRENADOR_ROUTES } from '@/lib/routes';
import { fetchEjerciciosPorTipo } from '@/features/algoritmo/actions/fetch-catalogo';
import { fetchEjerciciosSesion } from '@/features/entrenador/actions/fetch-ejercicios-sesion';

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function EditarSesionEntrenadorPage({ params }: PageProps) {
  const { id } = await params;

  // Verificar autenticacion
  const authResult = await getCurrentUserAction();

  if (!authResult.success || !authResult.user) {
    redirect(AUTH_ROUTES.login);
  }

  // Cargar sesion, microciclos, catalogo y ejercicios existentes en paralelo
  const [sesion, microciclos, catalogoPorTipo, ejerciciosExistentes] = await Promise.all([
    fetchSesion(id),
    fetchMicrociclosParaSelector(),
    fetchEjerciciosPorTipo(),
    fetchEjerciciosSesion(id),
  ]);

  if (!sesion) {
    notFound();
  }

  if (!microciclos) {
    redirect(ENTRENADOR_ROUTES.sesiones.list);
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="sm" asChild>
          <Link href={ENTRENADOR_ROUTES.sesiones.detalle(id)}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Volver
          </Link>
        </Button>
        <div>
          <h1 className="text-2xl font-bold">Editar Sesion</h1>
          <p className="text-muted-foreground">
            Modifica los datos de la sesion #{sesion.numeroSesion}
          </p>
        </div>
      </div>

      <EditSesionForm
        sesion={sesion}
        microciclos={microciclos}
        redirectUrl={ENTRENADOR_ROUTES.sesiones.list}
        catalogoPorTipo={catalogoPorTipo}
        ejerciciosExistentes={ejerciciosExistentes}
      />
    </div>
  );
}
