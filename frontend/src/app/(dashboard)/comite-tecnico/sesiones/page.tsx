import { redirect } from 'next/navigation';
import Link from 'next/link';
import { getCurrentUserAction } from '@/app/actions/auth.actions';
import { fetchSesiones, fetchMicrociclosParaSelector } from '@/features/comite-tecnico/actions';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import { AUTH_ROUTES, COMITE_TECNICO_ROUTES } from '@/lib/routes';
import { SesionesFilters } from '@/features/comite-tecnico/components/sesiones-filters';
import { SesionesPagination } from '@/features/comite-tecnico/components/sesiones-pagination';
import { SesionesTable } from '@/features/comite-tecnico/components/sesiones';

interface PageProps {
  searchParams: Promise<{
    microcicloId?: string;
    fecha?: string;
    tipoSesion?: string;
    page?: string;
  }>;
}

export default async function SesionesComiteTecnicoPage({ searchParams }: PageProps) {
  // Verificar autenticacion
  const authResult = await getCurrentUserAction();

  if (!authResult.success || !authResult.user) {
    redirect(AUTH_ROUTES.login);
  }

  // Leer filtros de la URL
  const params = await searchParams;
  const microcicloId = params.microcicloId || undefined;
  const fecha = params.fecha || undefined;
  const tipoSesion = params.tipoSesion || undefined;
  const page = params.page ? parseInt(params.page, 10) : 1;
  const limit = 10;

  // Cargar sesiones y microciclos en paralelo
  const [sesionesResult, microciclos] = await Promise.all([
    fetchSesiones({ microcicloId, fecha, page, limit }),
    fetchMicrociclosParaSelector(),
  ]);

  const sesiones = sesionesResult?.data || [];
  const total = sesionesResult?.meta.total || 0;
  const totalPages = sesionesResult?.meta.totalPages || 1;

  // Filtro client-side por tipoSesion (el backend no soporta este filtro en findAll)
  const sesionesFiltradas = tipoSesion
    ? sesiones.filter((s) => s.tipoSesion === tipoSesion)
    : sesiones;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Sesiones</h1>
          <p className="text-muted-foreground">
            {total} sesion{total !== 1 ? 'es' : ''} disponible{total !== 1 ? 's' : ''}
          </p>
        </div>
        <Button asChild>
          <Link href={COMITE_TECNICO_ROUTES.sesiones.nuevo}>
            <Plus className="h-4 w-4 mr-2" />
            Nueva Sesion
          </Link>
        </Button>
      </div>

      {/* Filtros */}
      <SesionesFilters microciclos={microciclos || []} />

      <SesionesTable
        sesiones={sesionesFiltradas}
        basePath={COMITE_TECNICO_ROUTES.sesiones.list}
      />

      {/* Paginacion */}
      <SesionesPagination
        currentPage={page}
        totalPages={totalPages}
        total={total}
      />
    </div>
  );
}
