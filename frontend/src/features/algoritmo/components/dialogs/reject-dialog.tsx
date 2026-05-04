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

interface RejectDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: (motivo?: string, accionAlternativa?: string) => void;
}

export function RejectDialog({
  open,
  onOpenChange,
  onConfirm,
}: RejectDialogProps) {
  const [motivo, setMotivo] = useState('');
  const [accionAlternativa, setAccionAlternativa] = useState('');
  const [submitting, setSubmitting] = useState(false);

  async function handleConfirm() {
    setSubmitting(true);
    await onConfirm(motivo || undefined, accionAlternativa || undefined);
    setSubmitting(false);
    setMotivo('');
    setAccionAlternativa('');
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Rechazar recomendacion</DialogTitle>
          <DialogDescription>
            Al rechazar, las sesiones generadas por esta recomendacion seran
            eliminadas. El feedback ayuda a mejorar el algoritmo.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          <div>
            <Label htmlFor="motivo">Motivo del rechazo (opcional)</Label>
            <Textarea
              id="motivo"
              value={motivo}
              onChange={(e) => setMotivo(e.target.value)}
              placeholder="Explicar por que se rechaza..."
              maxLength={1000}
            />
            <p className="text-xs text-muted-foreground mt-1">
              {motivo.length}/1000 caracteres
            </p>
          </div>
          <div>
            <Label htmlFor="accionAlternativa">Accion alternativa (opcional)</Label>
            <Textarea
              id="accionAlternativa"
              value={accionAlternativa}
              onChange={(e) => setAccionAlternativa(e.target.value)}
              placeholder="Que se deberia hacer en su lugar..."
              maxLength={500}
            />
            <p className="text-xs text-muted-foreground mt-1">
              {accionAlternativa.length}/500 caracteres
            </p>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancelar
          </Button>
          <Button variant="destructive" onClick={handleConfirm} disabled={submitting}>
            {submitting ? 'Rechazando...' : 'Rechazar'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
