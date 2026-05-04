'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { CheckCircle, XCircle, Edit } from 'lucide-react';
import { ApproveDialog } from './dialogs/approve-dialog';
import { RejectDialog } from './dialogs/reject-dialog';
import { ModifyDialog } from './dialogs/modify-dialog';
import {
  revisarRecomendacion,
  aprobarRecomendacion,
  rechazarRecomendacion,
  modificarRecomendacion,
} from '../actions/recomendacion.actions';
import type { ModificarRecomendacionData } from '../actions/recomendacion.actions';
import { toast } from 'sonner';

interface RecomendacionActionsProps {
  recomendacionId: string;
  estado: string;
}

// Botones de accion para recomendaciones (solo COMITE_TECNICO)
// Muestra los botones segun el estado actual de la recomendacion
export function RecomendacionActions({
  recomendacionId,
  estado,
}: RecomendacionActionsProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [approveOpen, setApproveOpen] = useState(false);
  const [rejectOpen, setRejectOpen] = useState(false);
  const [modifyOpen, setModifyOpen] = useState(false);

  // Iniciar revision si esta PENDIENTE
  async function handleIniciarRevision() {
    const result = await revisarRecomendacion(recomendacionId);
    if (result.success) {
      toast.success('Revision iniciada');
      startTransition(() => router.refresh());
    } else {
      toast.error(result.error);
    }
  }

  // Aprobar
  async function handleAprobar(comentario?: string) {
    const result = await aprobarRecomendacion(recomendacionId, comentario);
    if (result.success) {
      toast.success('Recomendacion aprobada');
      setApproveOpen(false);
      startTransition(() => router.refresh());
    } else {
      toast.error(result.error);
    }
  }

  // Rechazar
  async function handleRechazar(motivo?: string, accionAlternativa?: string) {
    const result = await rechazarRecomendacion(
      recomendacionId,
      motivo,
      accionAlternativa
    );
    if (result.success) {
      toast.success('Recomendacion rechazada');
      setRejectOpen(false);
      startTransition(() => router.refresh());
    } else {
      toast.error(result.error);
    }
  }

  // Modificar
  async function handleModificar(data: ModificarRecomendacionData) {
    const result = await modificarRecomendacion(recomendacionId, data);
    if (result.success) {
      toast.success('Recomendacion modificada y aprobada');
      setModifyOpen(false);
      startTransition(() => router.refresh());
    } else {
      toast.error(result.error);
    }
  }

  // Si ya esta en un estado final, no mostrar acciones
  if (['CUMPLIDA', 'RECHAZADA', 'MODIFICADA'].includes(estado)) {
    return null;
  }

  return (
    <div className="flex gap-3 flex-wrap">
      {estado === 'PENDIENTE' && (
        <Button onClick={handleIniciarRevision} disabled={isPending}>
          Iniciar revision
        </Button>
      )}

      {estado === 'EN_PROCESO' && (
        <>
          <Button onClick={() => setApproveOpen(true)} disabled={isPending}>
            <CheckCircle className="h-4 w-4 mr-2" />
            Aprobar
          </Button>
          <Button
            variant="destructive"
            onClick={() => setRejectOpen(true)}
            disabled={isPending}
          >
            <XCircle className="h-4 w-4 mr-2" />
            Rechazar
          </Button>
          <Button
            variant="outline"
            onClick={() => setModifyOpen(true)}
            disabled={isPending}
          >
            <Edit className="h-4 w-4 mr-2" />
            Modificar
          </Button>
        </>
      )}

      <ApproveDialog
        open={approveOpen}
        onOpenChange={setApproveOpen}
        onConfirm={handleAprobar}
      />
      <RejectDialog
        open={rejectOpen}
        onOpenChange={setRejectOpen}
        onConfirm={handleRechazar}
      />
      <ModifyDialog
        open={modifyOpen}
        onOpenChange={setModifyOpen}
        onConfirm={handleModificar}
      />
    </div>
  );
}
