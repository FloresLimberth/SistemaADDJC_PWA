import { fetchMesociclos, fetchAtletas } from '@/features/comite-tecnico/actions';
import { CreateMicrocicloForm } from '@/features/comite-tecnico/components';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';

interface NuevoMicrocicloPageProps {
  searchParams: Promise<{ mesocicloId?: string; atletaId?: string }>;
}

export default async function NuevoMicrocicloPage({ searchParams }: NuevoMicrocicloPageProps) {
  const params = await searchParams;

  // Obtener mesociclos y atletas en paralelo
  const [mesociclosResult, atletasResult] = await Promise.all([
    fetchMesociclos({ limit: 100 }),
    fetchAtletas({ limit: 100 }),
  ]);

  // Transformar datos para el formulario (solo id, nombre, etapa)
  const mesociclos = (mesociclosResult?.data || []).map((m) => ({
    id: m.id,
    nombre: m.nombre,
    etapa: m.etapa,
  }));

  // Transformar atletas para el selector (id + nombreCompleto)
  const atletas = (atletasResult?.data || []).map((a) => ({
    id: a.id,
    nombreCompleto: a.usuario.nombreCompleto,
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
          <h1 className="text-3xl font-bold">Nuevo Microciclo</h1>
          <p className="text-muted-foreground">Crea una nueva semana de entrenamiento</p>
        </div>
      </div>

      <CreateMicrocicloForm
        mesociclos={mesociclos}
        atletas={atletas}
        preselectedMesocicloId={params.mesocicloId}
        preselectedAtletaId={params.atletaId}
      />
    </div>
  );
}
