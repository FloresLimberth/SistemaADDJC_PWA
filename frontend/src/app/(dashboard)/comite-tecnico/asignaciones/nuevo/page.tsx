import { fetchAtletas, fetchMicrociclos } from '@/features/comite-tecnico/actions';
import { CreateAsignacionForm } from '@/features/comite-tecnico/components';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { COMITE_TECNICO_ROUTES } from '@/lib/routes';

export default async function NuevaAsignacionPage() {
  // Obtener atletas y microciclos para los selectores
  const [atletasResult, microciclosResult] = await Promise.all([
    fetchAtletas({ limit: 100 }),
    fetchMicrociclos({ limit: 100 }),
  ]);

  // Transformar datos para el formulario
  const atletas = (atletasResult?.data || []).map((a) => ({
    id: a.id,
    nombreCompleto: a.usuario.nombreCompleto,
  }));

  const microciclos = (microciclosResult?.data || []).map((m) => ({
    id: m.id,
    codigoMicrociclo: m.codigoMicrociclo,
    fechaInicio: m.fechaInicio,
    fechaFin: m.fechaFin,
  }));

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="sm" asChild>
          <Link href={COMITE_TECNICO_ROUTES.asignaciones.list}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Volver
          </Link>
        </Button>
        <div>
          <h1 className="text-3xl font-bold">Nueva Asignacion</h1>
          <p className="text-muted-foreground">Asigna un atleta a un microciclo de entrenamiento</p>
        </div>
      </div>

      <CreateAsignacionForm atletas={atletas} microciclos={microciclos} />
    </div>
  );
}
