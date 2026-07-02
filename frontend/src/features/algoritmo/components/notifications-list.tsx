'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Bell, CheckCheck } from 'lucide-react';
import { NotificationCard } from './notification-card';
import { marcarNotificacionLeida, marcarTodasNotificacionesLeidas, eliminarNotificacion } from '../actions/notificacion.actions';
import { toast } from 'sonner';
import type { NotificacionAlgoritmo } from '../types/algoritmo.types';

interface NotificationsListProps {
  notificaciones: NotificacionAlgoritmo[];
  noLeidas: number;
  recomendacionHref?: string;
}

export function NotificationsList({
  notificaciones,
  noLeidas,
  recomendacionHref,
}: NotificationsListProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  async function handleMarcarLeida(id: string) {
    const result = await marcarNotificacionLeida(id);
    if (result.success) {
      startTransition(() => router.refresh());
    } else {
      toast.error(result.error);
    }
  }

  async function handleMarcarTodasLeidas() {
    const result = await marcarTodasNotificacionesLeidas();
    if (result.success) {
      toast.success('Todas las notificaciones marcadas como leidas');
      startTransition(() => router.refresh());
    } else {
      toast.error(result.error);
    }
  }

  async function handleEliminar(id: string) {
    const result = await eliminarNotificacion(id);
    if (result.success) {
      startTransition(() => router.refresh());
    } else {
      toast.error(result.error);
    }
  }

  if (notificaciones.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <Bell className="h-12 w-12 text-muted-foreground mb-4" />
        <h3 className="text-lg font-medium">Sin notificaciones</h3>
        <p className="text-muted-foreground mt-1">
          No tienes notificaciones en este momento.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {noLeidas > 0 && (
        <div className="flex items-center justify-between">
          <p className="text-sm text-muted-foreground">
            {noLeidas} sin leer
          </p>
          <Button
            variant="outline"
            size="sm"
            onClick={handleMarcarTodasLeidas}
            disabled={isPending}
          >
            <CheckCheck className="h-4 w-4 mr-2" />
            Marcar todas como leidas
          </Button>
        </div>
      )}
      <div className="space-y-3">
        {notificaciones.map((notificacion) => (
          <NotificationCard
            key={notificacion.id}
            notificacion={notificacion}
            onMarcarLeida={handleMarcarLeida}
            onEliminar={handleEliminar}
            recomendacionHref={recomendacionHref}
            disabled={isPending}
          />
        ))}
      </div>
    </div>
  );
}
