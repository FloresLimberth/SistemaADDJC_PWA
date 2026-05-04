import { fetchEntrenadores } from '@/features/comite-tecnico/actions';
import { CreateAtletaForm } from '@/features/comite-tecnico/components/forms';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';

export default async function NuevoAtletaPage() {
  // Obtener lista de entrenadores para el selector
  const entrenadoresResult = await fetchEntrenadores({ limit: 100 });

  // Mapear entrenadores al formato esperado por el form
  const entrenadores = (entrenadoresResult?.data || []).map((ent) => ({
    id: ent.id,
    nombreCompleto: ent.usuario.nombreCompleto,
  }));

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="sm" asChild>
          <Link href="/comite-tecnico/atletas">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Volver
          </Link>
        </Button>
        <div>
          <h1 className="text-3xl font-bold">Nuevo Atleta</h1>
          <p className="text-muted-foreground">Registra un nuevo atleta en el sistema</p>
        </div>
      </div>

      <CreateAtletaForm entrenadores={entrenadores} />
    </div>
  );
}
