import {
  fetchRecomendaciones,
  fetchRecomendacionesEstadisticas,
} from '@/features/algoritmo/actions/fetch-recomendaciones';
import { fetchAtletas } from '@/features/comite-tecnico/actions/fetch-atletas';
import { RecomendacionesFiltro } from '@/features/algoritmo/components/recomendaciones-filtro';
import { RecomendacionesList } from '@/features/algoritmo/components/recomendaciones-list';
import { RecomendacionesPagination } from '@/features/algoritmo/components/recomendaciones-pagination';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface PageProps {
  searchParams: Promise<{
    estado?: string;
    atletaId?: string;
    page?: string;
  }>;
}

export default async function RecomendacionesCTPage({ searchParams }: PageProps) {
  const params = await searchParams;
  const estado = params.estado || undefined;
  const atletaId = params.atletaId || undefined;
  const page = params.page ? parseInt(params.page, 10) : 1;
  const limit = 10;

  const [recomendacionesResult, estadisticas, atletasResult] = await Promise.all([
    fetchRecomendaciones({ estado, atletaId, page, limit }),
    fetchRecomendacionesEstadisticas(),
    fetchAtletas({ limit: 100 }),
  ]);

  const recomendaciones = recomendacionesResult?.data || [];
  const total = recomendacionesResult?.meta.total || 0;
  const totalPages = recomendacionesResult?.meta.totalPages || 1;

  // Formatear atletas para el filtro
  const atletas = (atletasResult?.data || []).map((atleta) => ({
    id: atleta.id,
    nombreCompleto: atleta.usuario.nombreCompleto,
  }));

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Recomendaciones</h1>
        <p className="text-muted-foreground">
          {total} recomendacion{total !== 1 ? 'es' : ''} - Revisa y gestiona las recomendaciones generadas por el algoritmo
        </p>
      </div>

      {estadisticas && (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Pendientes
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold">
                {estadisticas.resumen.pendientes}
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                En proceso
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold">
                {estadisticas.resumen.enProceso}
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Aprobadas
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold">
                {estadisticas.resumen.cumplidas}
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Rechazadas
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold">
                {estadisticas.resumen.rechazadas}
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Tasa aprobacion
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold">
                {estadisticas.tasaAprobacion}%
              </p>
            </CardContent>
          </Card>
        </div>
      )}

      <RecomendacionesFiltro atletas={atletas} />

      <RecomendacionesList
        recomendaciones={recomendaciones}
        detalleBaseHref="/comite-tecnico/recomendaciones"
      />

      <RecomendacionesPagination
        currentPage={page}
        totalPages={totalPages}
        total={total}
      />
    </div>
  );
}
