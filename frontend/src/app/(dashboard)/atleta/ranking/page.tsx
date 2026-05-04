import { fetchMiRanking, fetchMejoresCategoria } from '@/features/algoritmo/actions/fetch-ranking';
import { RankingAthleteCard } from '@/features/algoritmo/components/ranking-athlete-card';
import { RankingTable } from '@/features/algoritmo/components/ranking-table';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export default async function RankingAtletaPage() {
  const miRanking = await fetchMiRanking();

  // Si tenemos el ranking, obtener top 5 de su categoria
  const topCategoria = miRanking?.atleta.categoriaPeso
    ? await fetchMejoresCategoria(miRanking.atleta.categoriaPeso, 5)
    : null;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Mi Ranking</h1>
        <p className="text-muted-foreground">
          Tu posicion en el ranking de tu categoria
        </p>
      </div>

      {miRanking ? (
        <>
          <RankingAthleteCard ranking={miRanking} />

          {topCategoria?.mejores && topCategoria.mejores.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Top 5 de tu categoria</CardTitle>
              </CardHeader>
              <CardContent>
                <RankingTable ranking={topCategoria.mejores} />
              </CardContent>
            </Card>
          )}
        </>
      ) : (
        <div className="text-center py-12 text-muted-foreground">
          No se encontraron datos de ranking. Asegurate de tener tests fisicos
          registrados para generar tu posicion en el ranking.
        </div>
      )}
    </div>
  );
}
