'use client';

import { Badge } from '@/components/ui/badge';
import { Bell } from 'lucide-react';

interface DashboardHeaderProps {
  userName: string;
  unreadCount: number;
}

// Componente para el header del dashboard con badge de notificaciones
export function DashboardHeader({ userName, unreadCount }: DashboardHeaderProps) {
  return (
    <div className="flex items-center justify-between">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
        <p className="text-muted-foreground mt-1">Bienvenido, {userName}</p>
      </div>

      {/* Badge de notificaciones si hay no leidas */}
      {unreadCount > 0 && (
        <div className="flex items-center gap-2">
          <Bell className="h-5 w-5 text-muted-foreground" />
          <Badge variant="destructive">{unreadCount} nueva{unreadCount !== 1 ? 's' : ''}</Badge>
        </div>
      )}
    </div>
  );
}
