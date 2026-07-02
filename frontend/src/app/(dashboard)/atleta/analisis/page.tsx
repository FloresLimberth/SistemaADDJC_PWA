import { fetchMiAnalisis } from '@/features/algoritmo/actions/fetch-analisis';
import { AnalisisDashboard } from '@/features/algoritmo/components/analisis-dashboard';
import { SelectorPeriodoAnalisis } from '@/features/algoritmo/components/selector-periodo-analisis';
import { parsearPeriodo } from '@/features/algoritmo/lib/periodo-analisis';

interface AnalisisATLPageProps {
  searchParams: Promise<{ dias?: string }>;
}

export default async function AnalisisATLPage({
  searchParams,
}: AnalisisATLPageProps) {
  const { dias: diasRaw } = await searchParams;
  const dias = parsearPeriodo(diasRaw);
  const analisis = await fetchMiAnalisis(dias);

  if (!analisis) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between flex-wrap gap-4">
          <h1 className="text-3xl font-bold">Mi Analisis</h1>
          <SelectorPeriodoAnalisis />
        </div>
        <p className="text-muted-foreground">
          No hay datos de análisis disponibles para este período. Prueba con un
          rango más amplio o asegúrate de tener registros de entrenamiento.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-3xl font-bold">Mi Analisis de Rendimiento</h1>
          <p className="text-muted-foreground">
            Tu analisis de rendimiento basado en el algoritmo
          </p>
        </div>
        <SelectorPeriodoAnalisis />
      </div>

      <AnalisisDashboard analisis={analisis} />
    </div>
  );
}
