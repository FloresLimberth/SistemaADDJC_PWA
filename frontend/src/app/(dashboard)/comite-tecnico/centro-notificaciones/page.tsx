import {
  fetchRecomendaciones,
  fetchRecomendacionesEstadisticas,
} from '@/features/algoritmo/actions/fetch-recomendaciones';
import {
  fetchMisAlertas,
  fetchAlertasNoLeidasCount,
  fetchNotificaciones,
  fetchNotificacionesNoLeidasCount,
} from '@/features/algoritmo/actions/fetch-notificaciones';
import { fetchAtletas } from '@/features/comite-tecnico/actions/fetch-atletas';
import { CentroNotificacionesTabs } from '@/features/algoritmo/components/centro-notificaciones-tabs';
import { RecomendacionesFiltro } from '@/features/algoritmo/components/recomendaciones-filtro';
import { RecomendacionesList } from '@/features/algoritmo/components/recomendaciones-list';
import { RecomendacionesPagination } from '@/features/algoritmo/components/recomendaciones-pagination';
import { AlertasList } from '@/features/algoritmo/components/alertas-list';
import { AlertasFilters } from '@/features/algoritmo/components/alertas-filters';
import { AlertasPagination } from '@/features/algoritmo/components/alertas-pagination';
import { NotificationsList } from '@/features/algoritmo/components/notifications-list';
import { NotificacionesFilters } from '@/features/algoritmo/components/notificaciones-filters';
import { NotificacionesPagination } from '@/features/algoritmo/components/notificaciones-pagination';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

type TabValue = 'recomendaciones' | 'alertas' | 'informativas';

interface PageProps {
  searchParams: Promise<{
    tab?: string;
    estado?: string;
    atletaId?: string;
    soloNoLeidas?: string;
    page?: string;
  }>;
}

export default async function CentroNotificacionesCTPage({ searchParams }: PageProps) {
  const params = await searchParams;
  const tab = (params.tab as TabValue) || 'recomendaciones';
  const page = params.page ? parseInt(params.page, 10) : 1;
  const limit = 10;

  // Obtener contadores para los tabs
  const [estadisticasRec, alertasNoLeidas, notificacionesNoLeidas] = await Promise.all([
    fetchRecomendacionesEstadisticas(),
    fetchAlertasNoLeidasCount(),
    fetchNotificacionesNoLeidasCount(),
  ]);

  const contadores = {
    recomendaciones: estadisticasRec?.resumen.pendientes || 0,
    alertas: alertasNoLeidas,
    informativas: notificacionesNoLeidas,
  };

  // Obtener atletas para el filtro (solo si es tab recomendaciones)
  let atletas: { id: string; nombreCompleto: string }[] = [];
  if (tab === 'recomendaciones') {
    const atletasResult = await fetchAtletas({ limit: 100 });
    atletas = (atletasResult?.data || []).map((a) => ({
      id: a.id,
      nombreCompleto: a.usuario.nombreCompleto,
    }));
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Recomendaciones</h1>
        <p className="text-muted-foreground">
          Gestiona recomendaciones, alertas y notificaciones en un solo lugar
        </p>
      </div>

      {/* Estadisticas resumidas */}
      {tab === 'recomendaciones' && estadisticasRec && (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Pendientes
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold">{estadisticasRec.resumen.pendientes}</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                En proceso
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold">{estadisticasRec.resumen.enProceso}</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Aprobadas
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold">{estadisticasRec.resumen.cumplidas}</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Rechazadas
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold">{estadisticasRec.resumen.rechazadas}</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Tasa aprobacion
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold">{estadisticasRec.tasaAprobacion}%</p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Tabs */}
      <CentroNotificacionesTabs contadores={contadores} />

      {/* Contenido segun tab */}
      {tab === 'recomendaciones' && (
        <TabRecomendaciones
          params={params}
          page={page}
          limit={limit}
          atletas={atletas}
        />
      )}

      {tab === 'alertas' && (
        <TabAlertas params={params} page={page} limit={limit} />
      )}

      {tab === 'informativas' && (
        <TabInformativas params={params} page={page} limit={limit} />
      )}
    </div>
  );
}

// Componente para el tab de Recomendaciones
async function TabRecomendaciones({
  params,
  page,
  limit,
  atletas,
}: {
  params: { estado?: string; atletaId?: string };
  page: number;
  limit: number;
  atletas: { id: string; nombreCompleto: string }[];
}) {
  const estado = params.estado || undefined;
  const atletaId = params.atletaId || undefined;

  const data = await fetchRecomendaciones({ estado, atletaId, page, limit });
  const recomendaciones = data?.data || [];
  const total = data?.meta.total || 0;
  const totalPages = data?.meta.totalPages || 1;

  return (
    <>
      <RecomendacionesFiltro atletas={atletas} />
      <p className="text-sm text-muted-foreground">
        {total} recomendacion{total !== 1 ? 'es' : ''}
      </p>
      <RecomendacionesList
        recomendaciones={recomendaciones}
        detalleBaseHref="/comite-tecnico/recomendaciones"
      />
      <RecomendacionesPagination
        currentPage={page}
        totalPages={totalPages}
        total={total}
      />
    </>
  );
}

// Componente para el tab de Alertas
async function TabAlertas({
  params,
  page,
  limit,
}: {
  params: { soloNoLeidas?: string };
  page: number;
  limit: number;
}) {
  const soloNoLeidas = params.soloNoLeidas === 'true' ? true : undefined;

  const data = await fetchMisAlertas({ soloNoLeidas, page, limit });
  const alertas = data?.data ?? [];
  const total = data?.meta.total || 0;
  const totalPages = data?.meta.totalPages || 1;

  return (
    <>
      <AlertasFilters />
      <p className="text-sm text-muted-foreground">
        {total} alerta{total !== 1 ? 's' : ''}
      </p>
      <AlertasList alertas={alertas} total={total} />
      <AlertasPagination currentPage={page} totalPages={totalPages} total={total} />
    </>
  );
}

// Componente para el tab de Informativas (notificaciones que no son alertas)
async function TabInformativas({
  params,
  page,
  limit,
}: {
  params: { soloNoLeidas?: string };
  page: number;
  limit: number;
}) {
  const soloNoLeidas = params.soloNoLeidas === 'true' ? true : undefined;

  const data = await fetchNotificaciones({ soloNoLeidas, page, limit });
  const notificaciones = data?.data || [];
  const total = data?.meta.total || 0;
  const totalPages = data?.meta.totalPages || 1;
  const noLeidas = data?.meta.noLeidas || 0;

  // Filtrar notificaciones que no sean de tipo alerta (evitar duplicados)
  // Los tipos ALERTA_FATIGA y ALERTA_LESION ya se muestran en el tab de alertas
  const notificacionesFiltradas = notificaciones.filter(
    (n) => n.tipo !== 'ALERTA_FATIGA' && n.tipo !== 'ALERTA_LESION'
  );

  return (
    <>
      <NotificacionesFilters />
      <p className="text-sm text-muted-foreground">
        {notificacionesFiltradas.length} notificacion{notificacionesFiltradas.length !== 1 ? 'es' : ''} informativas
      </p>
      <NotificationsList
        notificaciones={notificacionesFiltradas}
        noLeidas={noLeidas}
        recomendacionHref="/comite-tecnico/recomendaciones"
      />
      <NotificacionesPagination currentPage={page} totalPages={totalPages} total={total} />
    </>
  );
}
