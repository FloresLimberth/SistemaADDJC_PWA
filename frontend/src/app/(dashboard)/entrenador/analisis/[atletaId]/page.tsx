import { fetchAnalisisRendimiento } from '@/features/algoritmo/actions/fetch-analisis';
import { AnalisisDashboard } from '@/features/algoritmo/components/analisis-dashboard';
import { DescargarPDFAnalisisBtn } from '@/features/algoritmo/components/descargar-pdf-analisis-btn';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { ENTRENADOR_ROUTES } from '@/lib/routes';

interface AnalisisAtletaENTPageProps {
  params: Promise<{ atletaId: string }>;
}

export default async function AnalisisAtletaENTPage({
  params,
}: AnalisisAtletaENTPageProps) {
  const { atletaId } = await params;
  const analisis = await fetchAnalisisRendimiento(atletaId);

  if (!analisis) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" asChild>
            <Link href={ENTRENADOR_ROUTES.analisis.list}>
              <ArrowLeft className="h-4 w-4" />
            </Link>
          </Button>
          <h1 className="text-3xl font-bold">
            No se encontraron datos de analisis
          </h1>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" asChild>
          <Link href="/entrenador">
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
        <div className="flex-1">
          <h1 className="text-3xl font-bold">
            Analisis de {analisis.nombreAtleta}
          </h1>
          <p className="text-muted-foreground">
            Analisis de rendimiento por ejercicio
          </p>
        </div>
        <DescargarPDFAnalisisBtn analisis={analisis} />
      </div>

      <AnalisisDashboard analisis={analisis} />
    </div>
  );
}
