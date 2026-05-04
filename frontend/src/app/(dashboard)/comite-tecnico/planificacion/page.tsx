import { fetchMacrociclos, fetchMesociclos, fetchMicrociclos } from '@/features/comite-tecnico/actions';
import { CalendarioPlanificacion } from '@/features/planificacion/components/calendario-planificacion';

export default async function PlanificacionPage() {
  const [macroResult, mesoResult, microResult] = await Promise.all([
    fetchMacrociclos({ limit: 50 }),
    fetchMesociclos({ limit: 100 }),
    fetchMicrociclos({ limit: 100 }),
  ]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Calendario de Planificacion</h1>
        <p className="text-muted-foreground">
          Gestion de la planificacion deportiva
        </p>
      </div>

      <CalendarioPlanificacion
        macrociclos={macroResult?.data || []}
        mesociclos={mesoResult?.data || []}
        microciclos={microResult?.data || []}
        basePlanificacion="/comite-tecnico/planificacion"
        baseSesiones="/comite-tecnico/sesiones"
        puedeEditar={true}
      />
    </div>
  );
}
