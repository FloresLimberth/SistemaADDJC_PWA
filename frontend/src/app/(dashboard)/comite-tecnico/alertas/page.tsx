import { fetchMisAlertas, fetchAlertasNoLeidasCount } from '@/features/algoritmo/actions/fetch-notificaciones';
import { AlertasList } from '@/features/algoritmo/components/alertas-list';
import { AlertasFilters } from '@/features/algoritmo/components/alertas-filters';
import { AlertasPagination } from '@/features/algoritmo/components/alertas-pagination';
import { Badge } from '@/components/ui/badge';

interface PageProps {
  searchParams: Promise<{
    soloNoLeidas?: string;
    page?: string;
  }>;
}

export default async function AlertasCTPage({ searchParams }: PageProps) {
  const params = await searchParams;
  const soloNoLeidas = params.soloNoLeidas === 'true' ? true : undefined;
  const page = params.page ? parseInt(params.page, 10) : 1;
  const limit = 10;

  const [alertasData, noLeidas] = await Promise.all([
    fetchMisAlertas({ soloNoLeidas, page, limit }),
    fetchAlertasNoLeidasCount(),
  ]);

  const alertas = alertasData?.data ?? [];
  const total = alertasData?.meta.total || 0;
  const totalPages = alertasData?.meta.totalPages || 1;

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold">Alertas del Sistema</h1>
          <p className="text-muted-foreground">
            {total} alerta{total !== 1 ? 's' : ''} - Alertas generadas por el algoritmo de rendimiento
          </p>
        </div>
        {noLeidas > 0 && (
          <Badge variant="destructive">{noLeidas} sin leer</Badge>
        )}
      </div>

      <AlertasFilters />

      <AlertasList
        alertas={alertas}
        total={total}
      />

      <AlertasPagination
        currentPage={page}
        totalPages={totalPages}
        total={total}
      />
    </div>
  );
}
