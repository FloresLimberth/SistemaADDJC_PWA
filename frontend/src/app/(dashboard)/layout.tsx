import { redirect } from 'next/navigation';
import { SidebarProvider } from '@/components/ui/sidebar';
import { AppSidebar } from '@/components/layout/AppSidebar';
import { Header } from '@/components/layout/Header';
import { getCurrentUserAction } from '@/app/actions/auth.actions';
import { fetchCentroNotificacionesTotal } from '@/features/algoritmo/actions/fetch-notificaciones';
import { AUTH_ROUTES } from '@/lib/routes';

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Obtener usuario actual
  const result = await getCurrentUserAction();

  if (!result.success || !result.user) {
    redirect(AUTH_ROUTES.login);
  }

  const { user } = result;

  // Obtener contadores para badges (solo COMITE_TECNICO y ENTRENADOR)
  let badgeCounts: Record<string, number> = {};
  if (user.rol === 'COMITE_TECNICO' || user.rol === 'ENTRENADOR') {
    const centroTotal = await fetchCentroNotificacionesTotal();
    if (centroTotal && centroTotal.total > 0) {
      badgeCounts.centroNotificaciones = centroTotal.total;
    }
  }

  return (
    <SidebarProvider>
      <div className="flex min-h-screen w-full">
        <AppSidebar user={user} badgeCounts={badgeCounts} />

        <div className="flex flex-1 flex-col">
          <Header user={user} />

          <main className="flex-1 overflow-y-auto bg-muted/40 p-6">
            {children}
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
}
