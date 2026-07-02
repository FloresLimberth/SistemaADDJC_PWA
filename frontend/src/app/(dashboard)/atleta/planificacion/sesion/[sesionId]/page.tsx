import { fetchSesionDetalle } from '@/features/entrenamientos/actions/fetch-sesion-detalle';
import { SesionDetalleCard } from '@/features/entrenamientos/components/sesion-detalle-card';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { AUTH_ROUTES } from '@/lib/routes';

// Pagina de detalle de sesion
export default async function SesionDetallePage({
  params,
}: {
  params: Promise<{ sesionId: string }>;
}) {
  const { sesionId } = await params;

  // Obtener sesion del backend
  const sesion = await fetchSesionDetalle(sesionId);

  // Si no hay sesion, redirigir al login
  if (!sesion) {
    redirect(AUTH_ROUTES.login);
  }

  return (
    <div className="space-y-6">
      {/* Boton volver */}
      <div>
        <Link href="/atleta/planificacion">
          <Button variant="outline" size="sm">
            Volver a Planificacion
          </Button>
        </Link>
      </div>

      {/* Detalle de la sesion */}
      <SesionDetalleCard sesion={sesion} />
    </div>
  );
}
