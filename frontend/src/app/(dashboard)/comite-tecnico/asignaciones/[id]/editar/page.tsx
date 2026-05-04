import { redirect, notFound } from 'next/navigation';
import Link from 'next/link';
import { getCurrentUserAction } from '@/app/actions/auth.actions';
import { fetchAsignacion } from '@/features/comite-tecnico/actions';
import { EditAsignacionForm } from '@/features/comite-tecnico/components/forms';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import { AUTH_ROUTES, COMITE_TECNICO_ROUTES } from '@/lib/routes';

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function EditarAsignacionPage({ params }: PageProps) {
  const { id } = await params;

  // Verificar autenticacion
  const authResult = await getCurrentUserAction();

  if (!authResult.success || !authResult.user) {
    redirect(AUTH_ROUTES.login);
  }

  // Cargar asignacion
  const asignacion = await fetchAsignacion(id);

  if (!asignacion) {
    notFound();
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="sm" asChild>
          <Link href={COMITE_TECNICO_ROUTES.asignaciones.detalle(id)}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Volver
          </Link>
        </Button>
        <div>
          <h1 className="text-2xl font-bold">Editar Asignacion</h1>
          <p className="text-muted-foreground">
            Modifica las observaciones de la asignacion #{asignacion.id}
          </p>
        </div>
      </div>

      <EditAsignacionForm
        asignacion={asignacion}
        redirectUrl={COMITE_TECNICO_ROUTES.asignaciones.detalle(id)}
      />
    </div>
  );
}
