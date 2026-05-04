import { redirect } from 'next/navigation';
import { getCurrentUserAction } from '@/app/actions/auth.actions';
import { fetchAtletaDetalle } from '@/features/entrenador/actions/fetch-atleta-detalle';
import { AtletaDetalleTabs } from '@/features/entrenador/components/atletas/atleta-detalle-tabs';
import { AUTH_ROUTES, ENTRENADOR_ROUTES } from '@/lib/routes';

interface AtletaDetallePageProps {
  params: Promise<{
    atletaId: string;
  }>;
}

export default async function AtletaDetallePage({ params }: AtletaDetallePageProps) {
  const { atletaId } = await params;

  // Verificar autenticacion
  const authResult = await getCurrentUserAction();

  if (!authResult.success || !authResult.user) {
    redirect(AUTH_ROUTES.login);
  }

  // Cargar datos del atleta
  const detalle = await fetchAtletaDetalle(atletaId);

  if (!detalle) {
    redirect(ENTRENADOR_ROUTES.misAtletas.list);
  }

  return (
    <AtletaDetalleTabs
      atletaId={atletaId}
      atletaNombre={detalle.atleta.usuario?.nombreCompleto || 'Atleta'}
      tests={detalle.tests}
      registros={detalle.registros}
      dolencias={detalle.dolencias}
      planificacion={detalle.planificacion}
    />
  );
}
