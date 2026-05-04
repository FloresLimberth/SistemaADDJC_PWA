import { fetchEntrenador } from '@/features/comite-tecnico/actions';
import { EditEntrenadorForm } from '@/features/comite-tecnico/components/forms';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { COMITE_TECNICO_ROUTES } from '@/lib/routes';
import { notFound } from 'next/navigation';

interface EditarEntrenadorPageProps {
  params: Promise<{ id: string }>;
}

export default async function EditarEntrenadorPage({
  params,
}: EditarEntrenadorPageProps) {
  const { id } = await params;
  const entrenador = await fetchEntrenador(id);

  if (!entrenador) {
    notFound();
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="sm" asChild>
          <Link href={COMITE_TECNICO_ROUTES.entrenadores.detalle(id)}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Volver
          </Link>
        </Button>
        <div>
          <h1 className="text-3xl font-bold">Editar Entrenador</h1>
          <p className="text-muted-foreground">
            Modificando: {entrenador.usuario.nombreCompleto}
          </p>
        </div>
      </div>

      <EditEntrenadorForm entrenador={entrenador} />
    </div>
  );
}
