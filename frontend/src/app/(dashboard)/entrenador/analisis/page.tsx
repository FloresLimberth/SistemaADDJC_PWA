import { fetchMisAtletas } from '@/features/entrenador/actions/fetch-mis-atletas';
import { AnalisisAtletaCard } from '@/features/algoritmo/components/analisis-atleta-card';
import { DescargarPDFGrupalBtn } from '@/features/algoritmo/components/descargar-pdf-grupal-btn';
import { SelectorPeriodoAnalisis } from '@/features/algoritmo/components/selector-periodo-analisis';
import { parsearPeriodo } from '@/features/algoritmo/lib/periodo-analisis';
import { ENTRENADOR_ROUTES } from '@/lib/routes';

interface AnalisisEntrenadorPageProps {
  searchParams: Promise<{ dias?: string }>;
}

export default async function AnalisisEntrenadorPage({
  searchParams,
}: AnalisisEntrenadorPageProps) {
  const { dias: diasRaw } = await searchParams;
  const dias = parsearPeriodo(diasRaw);
  const atletasResult = await fetchMisAtletas({ limit: 50 });
  const atletas = atletasResult?.data || [];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-3xl font-bold">Analisis de Rendimiento</h1>
          <p className="text-muted-foreground">
            Seleccione un atleta para ver su analisis de rendimiento por ejercicio
          </p>
        </div>
        <div className="flex items-center gap-2">
          <SelectorPeriodoAnalisis />
          {atletas.length > 0 && (
            <DescargarPDFGrupalBtn
              dias={dias}
              atletas={atletas.map((a) => ({
                id: a.id,
                nombreCompleto: a.usuario.nombreCompleto,
                categoriaPeso: a.categoriaPeso,
              }))}
            />
          )}
        </div>
      </div>

      {atletas.length === 0 ? (
        <p className="text-center text-muted-foreground py-8">
          No tienes atletas asignados.
        </p>
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {atletas.map((atleta) => (
            <AnalisisAtletaCard
              key={atleta.id}
              atleta={atleta}
              href={ENTRENADOR_ROUTES.analisis.detalle(atleta.id)}
            />
          ))}
        </div>
      )}
    </div>
  );
}
