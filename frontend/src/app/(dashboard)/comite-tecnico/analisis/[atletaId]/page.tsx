import { fetchAnalisisRendimiento } from '@/features/algoritmo/actions/fetch-analisis';
import { AnalisisDashboard } from '@/features/algoritmo/components/analisis-dashboard';
import { DescargarPDFAnalisisBtn } from '@/features/algoritmo/components/descargar-pdf-analisis-btn';
import { SelectorPeriodoAnalisis } from '@/features/algoritmo/components/selector-periodo-analisis';
import { parsearPeriodo } from '@/features/algoritmo/lib/periodo-analisis';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { COMITE_TECNICO_ROUTES } from '@/lib/routes';

interface AnalisisAtletaCTPageProps {
  params: Promise<{ atletaId: string }>;
  searchParams: Promise<{ dias?: string }>;
}

export default async function AnalisisAtletaCTPage({
  params,
  searchParams,
}: AnalisisAtletaCTPageProps) {
  const { atletaId } = await params;
  const { dias: diasRaw } = await searchParams;
  const dias = parsearPeriodo(diasRaw);
  const analisis = await fetchAnalisisRendimiento(atletaId, dias);

  if (!analisis) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" asChild>
            <Link href={COMITE_TECNICO_ROUTES.analisis.list}>
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
      <div className="flex items-center gap-4 flex-wrap">
        <Button variant="ghost" size="icon" asChild>
          <Link href={COMITE_TECNICO_ROUTES.analisis.list}>
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
        <div className="flex-1 min-w-[200px]">
          <h1 className="text-3xl font-bold">
            Analisis de {analisis.nombreAtleta}
          </h1>
          <p className="text-muted-foreground">
            Analisis completo de rendimiento por ejercicio
          </p>
        </div>
        <SelectorPeriodoAnalisis />
        <DescargarPDFAnalisisBtn analisis={analisis} />
      </div>

      <AnalisisDashboard analisis={analisis} />
    </div>
  );
}
