import { fetchAtletas } from '@/features/comite-tecnico/actions';
import { fetchRankingOverview } from '@/features/estadisticas/actions/fetch-ranking-overview';
import { fetchRecomendacionesStats } from '@/features/estadisticas/actions/fetch-recomendaciones-stats';
import { fetchBienestarGrupal } from '@/features/estadisticas/actions/fetch-bienestar-grupal';
import { fetchAsistenciaGrupal } from '@/features/estadisticas/actions/fetch-asistencia-grupal';
import { EstadisticasView } from './estadisticas-view';

export default async function EstadisticasPage() {
  // Fetch en paralelo: atletas + ranking + recomendaciones + bienestar grupal + asistencia
  const [atletasResult, rankingOverview, recomendacionesStats, bienestarGrupal, asistenciaGrupal] = await Promise.all([
    fetchAtletas({ limit: 100 }),
    fetchRankingOverview(),
    fetchRecomendacionesStats(),
    fetchBienestarGrupal(60),
    fetchAsistenciaGrupal(8),
  ]);

  const atletas = (atletasResult?.data || []).map((a) => ({
    id: a.id,
    nombreCompleto: a.usuario.nombreCompleto,
    club: a.club,
    categoria: a.categoria,
  }));

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Estadisticas de Atletas</h1>
        <p className="text-muted-foreground">
          Analiza la evolucion y rendimiento de los atletas
        </p>
      </div>

      <EstadisticasView
        atletas={atletas}
        rankingOverview={rankingOverview}
        recomendacionesStats={recomendacionesStats}
        bienestarGrupal={bienestarGrupal}
        asistenciaGrupal={asistenciaGrupal}
      />
    </div>
  );
}
