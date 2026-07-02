import { redirect } from 'next/navigation';
import { getCurrentUserAction } from '@/app/actions/auth.actions';
import { fetchMacrociclos, fetchMesociclos, fetchMicrociclos } from '@/features/comite-tecnico/actions';
import { CalendarioPlanificacion } from '@/features/planificacion/components/calendario-planificacion';
import { AUTH_ROUTES } from '@/lib/routes';

export default async function EntrenadorPlanificacionPage() {
  const authResult = await getCurrentUserAction();

  if (!authResult.success || !authResult.user) {
    redirect(AUTH_ROUTES.login);
  }

  // Cargar todos los datos necesarios para el calendario
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
          Planificacion deportiva de tus atletas asignados
        </p>
      </div>

      <CalendarioPlanificacion
        macrociclos={macroResult?.data || []}
        mesociclos={mesoResult?.data || []}
        microciclos={microResult?.data || []}
        basePlanificacion="/entrenador/planificacion"
        baseSesiones="/entrenador/sesiones"
        puedeEditar={false}
      />
    </div>
  );
}
