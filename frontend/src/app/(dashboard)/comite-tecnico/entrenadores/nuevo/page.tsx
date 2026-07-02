import { CreateEntrenadorForm } from '@/features/comite-tecnico/components/forms';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { COMITE_TECNICO_ROUTES } from '@/lib/routes';

export default async function NuevoEntrenadorPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="sm" asChild>
          <Link href={COMITE_TECNICO_ROUTES.entrenadores.list}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Volver
          </Link>
        </Button>
        <div>
          <h1 className="text-3xl font-bold">Nuevo Entrenador</h1>
          <p className="text-muted-foreground">
            Registra un nuevo entrenador en el sistema
          </p>
        </div>
      </div>

      <CreateEntrenadorForm />
    </div>
  );
}
