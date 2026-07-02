import { fetchRankingCategoria, fetchRankingEstadisticas } from '@/features/algoritmo/actions/fetch-ranking';
import { RankingCategoryView } from '@/features/algoritmo/components/ranking-category-view';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

const CATEGORIA_LABELS: Record<string, string> = {
  MENOS_60K: 'Menos de 60 kg',
  MENOS_66K: 'Menos de 66 kg',
  MENOS_73K: 'Menos de 73 kg',
  MENOS_81K: 'Menos de 81 kg',
  MENOS_90K: 'Menos de 90 kg',
  MENOS_100K: 'Menos de 100 kg',
  MAS_100K: 'Mas de 100 kg',
};

export default async function RankingCTPage() {
  // Cargar con categoria por defecto
  const categoriaInicial = 'MENOS_60K';
  const [rankingData, estadisticas] = await Promise.all([
    fetchRankingCategoria(categoriaInicial),
    fetchRankingEstadisticas(),
  ]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Ranking de Atletas</h1>
        <p className="text-muted-foreground">
          Clasificacion de atletas por categoria de peso basada en el algoritmo
        </p>
      </div>

      {estadisticas && (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Total atletas
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold">{estadisticas.totalGeneral}</p>
            </CardContent>
          </Card>
          {estadisticas.estadisticas.slice(0, 3).map((est) => (
            <Card key={est.categoria}>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  {CATEGORIA_LABELS[est.categoria] || est.categoria}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-2xl font-bold">{est.totalAtletas}</p>
                <div className="flex gap-2 mt-1">
                  <Badge variant="default">{est.aptos} aptos</Badge>
                  <Badge variant="secondary">{est.reservas} reservas</Badge>
                  <Badge variant="destructive">{est.noAptos} no aptos</Badge>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <RankingCategoryView
        categoriaInicial={categoriaInicial}
        dataInicial={rankingData}
        atletaDetalleBaseHref="/comite-tecnico/ranking"
      />
    </div>
  );
}
