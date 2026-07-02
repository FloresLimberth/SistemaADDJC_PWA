'use client';

import { useQuery } from '@tanstack/react-query';
import { fetchDashboardData } from '@/features/atleta/actions/fetch-dashboard-data';
import { DashboardHeader } from '@/features/atleta/components/dashboard-header';
import { DashboardStatsGrid } from '@/features/atleta/components/dashboard-stats-grid';
import { NotificacionesRecentesList } from '@/features/atleta/components/notificaciones-recientes-list';
import { DashboardSkeleton } from '@/features/atleta/components/dashboard-skeleton';
import { getCurrentUserAction } from '@/app/actions/auth.actions';
import { useEffect, useState } from 'react';

// Componente cliente que consume los datos del dashboard
export function DashboardContent() {
  // Estado para el nombre del usuario
  const [userName, setUserName] = useState('');

  // Obtener el usuario actual
  useEffect(() => {
    getCurrentUserAction().then((result) => {
      if (result.success && result.user) {
        setUserName(result.user.nombreCompleto);
      }
    });
  }, []);

  // Obtener los datos del dashboard desde el cache de TanStack Query
  // Los datos ya fueron prefetched en el servidor
  const { data, isLoading, error } = useQuery({
    queryKey: ['atleta-dashboard'],
    queryFn: fetchDashboardData,
    // Los datos ya estan en el cache del servidor, asi que no se refetch inmediatamente
    staleTime: 60 * 1000, // 1 minuto
    refetchOnWindowFocus: false,
  });

  // Si esta cargando, mostrar skeleton
  if (isLoading || !data) {
    return <DashboardSkeleton />;
  }

  // Si hay error, mostrar mensaje de error
  if (error) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center space-y-4">
          <p className="text-lg font-medium text-destructive">Error al cargar el dashboard</p>
          <p className="text-sm text-muted-foreground">
            Por favor, intenta recargar la pagina
          </p>
        </div>
      </div>
    );
  }

  // Renderizar el dashboard con los datos
  return (
    <div className="space-y-6">
      {/* Header con nombre del usuario */}
      <DashboardHeader userName={userName} unreadCount={data.notificacionesNoLeidas} />

      {/* Grid de 4 tarjetas de estadisticas */}
      <DashboardStatsGrid stats={data.stats} />

      {/* Lista de notificaciones recientes (modulo no implementado) */}
      <NotificacionesRecentesList notificaciones={data.notificaciones} />
    </div>
  );
}
