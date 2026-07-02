import { fetchRankingCategoria } from '@/features/algoritmo/actions/fetch-ranking';
import { RankingCategoryView } from '@/features/algoritmo/components/ranking-category-view';

export default async function RankingEntrenadorPage() {
  // Cargar con categoria por defecto
  const categoriaInicial = 'MENOS_60K';
  const rankingData = await fetchRankingCategoria(categoriaInicial);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Ranking</h1>
        <p className="text-muted-foreground">
          Ranking de tus atletas por categoria de peso
        </p>
      </div>

      <RankingCategoryView
        categoriaInicial={categoriaInicial}
        dataInicial={rankingData}
      />
    </div>
  );
}
