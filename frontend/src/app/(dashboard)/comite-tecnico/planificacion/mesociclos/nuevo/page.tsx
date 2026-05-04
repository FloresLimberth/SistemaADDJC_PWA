import { fetchMacrociclos } from '@/features/comite-tecnico/actions';
import { CreateMesocicloForm } from '@/features/comite-tecnico/components';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';

interface NuevoMesocicloPageProps {
  searchParams: Promise<{ macrocicloId?: string }>;
}

export default async function NuevoMesocicloPage({ searchParams }: NuevoMesocicloPageProps) {
  const params = await searchParams;

  // Obtener macrociclos para el selector
  const result = await fetchMacrociclos({ limit: 100 });

  // Transformar datos para el formulario (solo id, nombre, temporada)
  const macrociclos = (result?.data || []).map((m) => ({
    id: m.id,
    nombre: m.nombre,
    temporada: m.temporada,
  }));

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="sm" asChild>
          <Link href="/comite-tecnico/planificacion">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Volver
          </Link>
        </Button>
        <div>
          <h1 className="text-3xl font-bold">Nuevo Mesociclo</h1>
          <p className="text-muted-foreground">Crea una nueva etapa de entrenamiento</p>
        </div>
      </div>

      <CreateMesocicloForm
        macrociclos={macrociclos}
        preselectedMacrocicloId={params.macrocicloId}
      />
    </div>
  );
}
