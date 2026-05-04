import {
  fetchRecomendacion,
  fetchRecomendacionHistorial,
} from '@/features/algoritmo/actions/fetch-recomendaciones';
import { RecomendacionDetail } from '@/features/algoritmo/components/recomendacion-detail';
import { RecomendacionActions } from '@/features/algoritmo/components/recomendacion-actions';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';

interface RecomendacionDetailPageProps {
  params: Promise<{ id: string }>;
}

export default async function RecomendacionDetailPage({
  params,
}: RecomendacionDetailPageProps) {
  const { id } = await params;

  const [recomendacion, historial] = await Promise.all([
    fetchRecomendacion(id),
    fetchRecomendacionHistorial(id),
  ]);

  if (!recomendacion) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" asChild>
            <Link href="/comite-tecnico/recomendaciones">
              <ArrowLeft className="h-4 w-4" />
            </Link>
          </Button>
          <h1 className="text-3xl font-bold">Recomendacion no encontrada</h1>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" asChild>
          <Link href="/comite-tecnico/recomendaciones">
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
        <div>
          <h1 className="text-3xl font-bold">Detalle de Recomendacion</h1>
          <p className="text-muted-foreground">
            Revisar y gestionar la recomendacion del algoritmo
          </p>
        </div>
      </div>

      <RecomendacionActions
        recomendacionId={recomendacion.id}
        estado={recomendacion.estado}
      />

      <RecomendacionDetail
        recomendacion={recomendacion}
        historial={historial || undefined}
      />
    </div>
  );
}
