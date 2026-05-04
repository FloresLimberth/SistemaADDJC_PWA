import { fetchMiAnalisis } from '@/features/algoritmo/actions/fetch-analisis';
import { AnalisisDashboard } from '@/features/algoritmo/components/analisis-dashboard';

export default async function AnalisisATLPage() {
  const analisis = await fetchMiAnalisis();

  if (!analisis) {
    return (
      <div className="space-y-6">
        <h1 className="text-3xl font-bold">Mi Analisis</h1>
        <p className="text-muted-foreground">
          No hay datos de analisis disponibles aun. Asegurate de tener registros
          de entrenamiento para generar el analisis.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Mi Analisis de Rendimiento</h1>
        <p className="text-muted-foreground">
          Tu analisis de rendimiento basado en el algoritmo
        </p>
      </div>

      <AnalisisDashboard analisis={analisis} />
    </div>
  );
}
