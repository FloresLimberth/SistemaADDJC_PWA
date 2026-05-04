import { HydrationBoundary, QueryClient, dehydrate } from '@tanstack/react-query';
import { fetchDashboardData } from '@/features/atleta/actions/fetch-dashboard-data';
import { DashboardContent } from './dashboard-content';
import { redirect } from 'next/navigation';
import { AUTH_ROUTES } from '@/lib/routes';

// Pagina del dashboard del atleta con prefetch de datos
export default async function AtletaDashboardPage() {
  // Crear QueryClient para prefetch
  const queryClient = new QueryClient();

  // Prefetch de los datos del dashboard en el servidor
  // Esto permite que los datos esten disponibles inmediatamente en el cliente
  const data = await queryClient.fetchQuery({
    queryKey: ['atleta-dashboard'],
    queryFn: fetchDashboardData,
  });

  // Si no hay datos, redirigir al login
  if (!data) {
    redirect(AUTH_ROUTES.login);
  }

  // Deshidratar el estado del QueryClient para pasarlo al cliente
  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <DashboardContent />
    </HydrationBoundary>
  );
}
