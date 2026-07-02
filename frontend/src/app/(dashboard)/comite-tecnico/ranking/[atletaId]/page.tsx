import { fetchRankingAtleta } from '@/features/algoritmo/actions/fetch-ranking';
import { RankingAthleteCard } from '@/features/algoritmo/components/ranking-athlete-card';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';

interface RankingAtletaDetailPageProps {
  params: Promise<{ atletaId: string }>;
}

export default async function RankingAtletaDetailPage({
  params,
}: RankingAtletaDetailPageProps) {
  const { atletaId } = await params;
  const ranking = await fetchRankingAtleta(atletaId);

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" asChild>
          <Link href="/comite-tecnico/ranking">
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
        <div>
          <h1 className="text-3xl font-bold">Detalle de Ranking</h1>
          <p className="text-muted-foreground">
            Posicion y metricas del atleta en el ranking
          </p>
        </div>
      </div>

      {ranking ? (
        <RankingAthleteCard ranking={ranking} />
      ) : (
        <div className="text-center py-12 text-muted-foreground">
          No se encontraron datos de ranking para este atleta.
          Es posible que no tenga tests fisicos registrados o que no este en una
          categoria de peso activa.
        </div>
      )}

      {ranking && (
        <div className="flex gap-4">
          <Button variant="outline" asChild>
            <Link href={`/comite-tecnico/analisis/${atletaId}`}>
              Ver analisis de rendimiento
            </Link>
          </Button>
          <Button variant="outline" asChild>
            <Link href={`/comite-tecnico/atletas/${atletaId}`}>
              Ver perfil del atleta
            </Link>
          </Button>
        </div>
      )}
    </div>
  );
}
