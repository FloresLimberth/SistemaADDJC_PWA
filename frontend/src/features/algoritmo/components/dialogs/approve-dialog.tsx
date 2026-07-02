'use client';

import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';

interface ApproveDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: (comentario?: string) => void;
}

export function ApproveDialog({
  open,
  onOpenChange,
  onConfirm,
}: ApproveDialogProps) {
  const [comentario, setComentario] = useState('');
  const [submitting, setSubmitting] = useState(false);

  async function handleConfirm() {
    setSubmitting(true);
    await onConfirm(comentario || undefined);
    setSubmitting(false);
    setComentario('');
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Aprobar recomendacion</DialogTitle>
          <DialogDescription>
            Al aprobar, se aplicaran los cambios sugeridos por el algoritmo.
            Las sesiones generadas seran marcadas como aprobadas.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          <div>
            <Label htmlFor="comentario">Comentario (opcional)</Label>
            <Textarea
              id="comentario"
              value={comentario}
              onChange={(e) => setComentario(e.target.value)}
              placeholder="Agregar un comentario..."
              maxLength={500}
            />
            <p className="text-xs text-muted-foreground mt-1">
              {comentario.length}/500 caracteres
            </p>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancelar
          </Button>
          <Button onClick={handleConfirm} disabled={submitting}>
            {submitting ? 'Aprobando...' : 'Aprobar'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
