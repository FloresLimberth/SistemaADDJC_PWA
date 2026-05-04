import { fetchRecomendacion } from '@/features/algoritmo/actions/fetch-recomendaciones';
import { RecomendacionDetail } from '@/features/algoritmo/components/recomendacion-detail';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';

interface RecomendacionDetailEntrenadorPageProps {
  params: Promise<{ id: string }>;
}

export default async function RecomendacionDetailEntrenadorPage({
  params,
}: RecomendacionDetailEntrenadorPageProps) {
  const { id } = await params;
  const recomendacion = await fetchRecomendacion(id);

  if (!recomendacion) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" asChild>
            <Link href="/entrenador/recomendaciones">
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
          <Link href="/entrenador/recomendaciones">
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
        <div>
          <h1 className="text-3xl font-bold">Detalle de Recomendacion</h1>
          <p className="text-muted-foreground">
            Informacion de la recomendacion del algoritmo
          </p>
        </div>
      </div>

      {/* Sin acciones - solo lectura para entrenador */}
      <RecomendacionDetail recomendacion={recomendacion} />
    </div>
  );
}
