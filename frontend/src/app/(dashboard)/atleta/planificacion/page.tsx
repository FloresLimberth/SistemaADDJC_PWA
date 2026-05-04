import { fetchPlanificacion } from '@/features/entrenamientos/actions/fetch-planificacion';
import { MicrociclosGrid } from '@/features/entrenamientos/components/microciclos-grid';
import { redirect } from 'next/navigation';
import { AUTH_ROUTES } from '@/lib/routes';

// Pagina de planificacion del atleta
export default async function PlanificacionPage() {
  // Obtener microciclos del backend
  const data = await fetchPlanificacion();

  // Si no hay datos, redirigir al login
  if (!data) {
    redirect(AUTH_ROUTES.login);
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Mi Planificacion</h1>
        <p className="text-muted-foreground mt-1">
          Microciclos y sesiones asignadas a tu entrenamiento
        </p>
      </div>

      {/* Stats */}
      {data.total > 0 && (
        <div className="flex items-center justify-between">
          <p className="text-sm text-muted-foreground">
            Mostrando {data.microciclos.length} de {data.total} microciclos
          </p>
        </div>
      )}

      {/* Lista de microciclos */}
      <MicrociclosGrid microciclos={data.microciclos} />
    </div>
  );
}
