import { fetchNotificaciones } from '@/features/algoritmo/actions/fetch-notificaciones';
import { NotificationsList } from '@/features/algoritmo/components/notifications-list';
import { NotificacionesFilters } from '@/features/algoritmo/components/notificaciones-filters';
import { NotificacionesPagination } from '@/features/algoritmo/components/notificaciones-pagination';

interface PageProps {
  searchParams: Promise<{
    soloNoLeidas?: string;
    page?: string;
  }>;
}

export default async function NotificacionesEntrenadorPage({ searchParams }: PageProps) {
  const params = await searchParams;
  const soloNoLeidas = params.soloNoLeidas === 'true' ? true : undefined;
  const page = params.page ? parseInt(params.page, 10) : 1;
  const limit = 10;

  const data = await fetchNotificaciones({ soloNoLeidas, page, limit });

  const notificaciones = data?.data || [];
  const total = data?.meta.total || 0;
  const totalPages = data?.meta.totalPages || 1;
  const noLeidas = data?.meta.noLeidas || 0;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Notificaciones</h1>
          <p className="text-muted-foreground">
            {total} notificacion{total !== 1 ? 'es' : ''} - Notificaciones y alertas de tus atletas
          </p>
        </div>
      </div>

      <NotificacionesFilters />

      <NotificationsList
        notificaciones={notificaciones}
        noLeidas={noLeidas}
        recomendacionHref="/entrenador/recomendaciones"
      />

      <NotificacionesPagination
        currentPage={page}
        totalPages={totalPages}
        total={total}
      />
    </div>
  );
}
