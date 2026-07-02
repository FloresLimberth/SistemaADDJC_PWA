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
import type { ModificarRecomendacionData } from '../../actions/recomendacion.actions';

interface ModifyDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: (data: ModificarRecomendacionData) => void;
}

export function ModifyDialog({
  open,
  onOpenChange,
  onConfirm,
}: ModifyDialogProps) {
  const [justificacion, setJustificacion] = useState('');
  const [comentarioAdicional, setComentarioAdicional] = useState('');
  const [submitting, setSubmitting] = useState(false);

  async function handleConfirm() {
    if (!justificacion.trim()) {
      return;
    }

    setSubmitting(true);

    const data: ModificarRecomendacionData = {
      modificaciones: {},
      justificacion: justificacion.trim(),
    };

    if (comentarioAdicional.trim()) {
      data.comentarioAdicional = comentarioAdicional.trim();
    }

    await onConfirm(data);
    setSubmitting(false);
    setJustificacion('');
    setComentarioAdicional('');
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Modificar recomendacion</DialogTitle>
          <DialogDescription>
            Justifica las modificaciones antes de aprobar la recomendacion.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          <div>
            <Label htmlFor="justificacion">Justificacion *</Label>
            <Textarea
              id="justificacion"
              value={justificacion}
              onChange={(e) => setJustificacion(e.target.value)}
              placeholder="Explicar las modificaciones realizadas..."
              maxLength={1000}
              required
            />
            <p className="text-xs text-muted-foreground mt-1">
              {justificacion.length}/1000 caracteres
            </p>
          </div>

          <div>
            <Label htmlFor="comentarioAdicional">
              Comentario adicional (opcional)
            </Label>
            <Textarea
              id="comentarioAdicional"
              value={comentarioAdicional}
              onChange={(e) => setComentarioAdicional(e.target.value)}
              placeholder="Comentario adicional..."
              maxLength={500}
            />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancelar
          </Button>
          <Button
            onClick={handleConfirm}
            disabled={submitting || !justificacion.trim()}
          >
            {submitting ? 'Modificando...' : 'Modificar y aprobar'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
