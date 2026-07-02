import { redirect } from 'next/navigation';
import { fetchDolencias } from '@/features/dolencias/actions/fetch-dolencias';
import { DolenciasList } from '@/features/dolencias/components/dolencias-list';
import { AUTH_ROUTES } from '@/lib/routes';

// Pagina de dolencias del atleta
export default async function DolenciasPage() {
  // Obtener todas las dolencias del atleta (activas e historial)
  const data = await fetchDolencias({ limit: 100 });

  // Si no hay datos (usuario no autenticado), redirigir al login
  if (!data) {
    redirect(AUTH_ROUTES.login);
  }

  // Separar dolencias activas de las recuperadas
  const dolenciasActivas = data.dolencias.filter((d) => !d.recuperado);
  const dolenciasRecuperadas = data.dolencias.filter((d) => d.recuperado);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Mis Dolencias</h1>
        <p className="text-muted-foreground mt-1">
          Historial de lesiones y molestias registradas
        </p>
      </div>

      {/* Seccion: Dolencias Activas */}
      <div>
        <h2 className="text-xl font-semibold mb-4">
          Activas ({dolenciasActivas.length})
        </h2>
        {dolenciasActivas.length > 0 ? (
          <DolenciasList dolencias={dolenciasActivas} />
        ) : (
          <p className="text-muted-foreground py-4">
            No tienes dolencias activas. Excelente estado fisico.
          </p>
        )}
      </div>

      {/* Seccion: Historial (Recuperadas) */}
      <div>
        <h2 className="text-xl font-semibold mb-4">
          Historial ({dolenciasRecuperadas.length})
        </h2>
        {dolenciasRecuperadas.length > 0 ? (
          <DolenciasList dolencias={dolenciasRecuperadas} showRecuperacion />
        ) : (
          <p className="text-muted-foreground py-4">
            No hay dolencias en el historial.
          </p>
        )}
      </div>
    </div>
  );
}
