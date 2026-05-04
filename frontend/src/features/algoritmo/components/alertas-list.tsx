'use client';

import { useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { AlertaCard } from './alerta-card';
import { marcarAlertaLeida, marcarTodasAlertasLeidas } from '../actions/notificacion.actions';
import { toast } from 'sonner';
import type { AlertaDestinatario } from '../types/algoritmo.types';

interface AlertasListProps {
  alertas: AlertaDestinatario[];
  total?: number;
}

// Lista de alertas con acciones
export function AlertasList({ alertas, total }: AlertasListProps) {
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  function handleMarcarLeida(alertaDestinatarioId: string) {
    startTransition(async () => {
      const result = await marcarAlertaLeida(alertaDestinatarioId);
      if (result.success) {
        toast.success('Alerta marcada como leida');
        router.refresh();
      } else {
        toast.error(result.error || 'Error al marcar alerta');
      }
    });
  }

  function handleMarcarTodasLeidas() {
    startTransition(async () => {
      const result = await marcarTodasAlertasLeidas();
      if (result.success) {
        toast.success('Todas las alertas marcadas como leidas');
        router.refresh();
      } else {
        toast.error(result.error || 'Error al marcar alertas');
      }
    });
  }

  if (alertas.length === 0) {
    return (
      <p className="text-center text-muted-foreground py-8">
        No hay alertas registradas.
      </p>
    );
  }

  const noLeidas = alertas.filter((a) => !a.leida).length;

  return (
    <div className="space-y-4">
      {noLeidas > 0 && (
        <div className="flex items-center justify-between">
          <p className="text-sm text-muted-foreground">
            {noLeidas} alerta{noLeidas !== 1 ? 's' : ''} sin leer
            {total !== undefined && ` de ${total} total`}
          </p>
          <Button
            variant="outline"
            size="sm"
            onClick={handleMarcarTodasLeidas}
            disabled={isPending}
          >
            Marcar todas como leidas
          </Button>
        </div>
      )}

      <div className="space-y-3">
        {alertas.map((alerta) => (
          <AlertaCard
            key={alerta.alertaDestinatarioId}
            alerta={alerta}
            onMarcarLeida={handleMarcarLeida}
            isPending={isPending}
          />
        ))}
      </div>
    </div>
  );
}
