'use client';

import { useState, useTransition } from 'react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { CheckCircle } from 'lucide-react';
import { marcarRecuperado } from '../actions/marcar-recuperado';
import { toast } from 'sonner';

interface MarcarRecuperadoButtonProps {
  dolenciaId: number;
  zona: string;
  nombreAtleta: string;
}

export function MarcarRecuperadoButton({
  dolenciaId,
  zona,
  nombreAtleta,
}: MarcarRecuperadoButtonProps) {
  const [open, setOpen] = useState(false);
  const [isPending, startTransition] = useTransition();
  const [notasRecuperacion, setNotasRecuperacion] = useState('');

  const handleMarcarRecuperado = () => {
    startTransition(async () => {
      try {
        const result = await marcarRecuperado(
          dolenciaId,
          notasRecuperacion.trim() || undefined
        );

        if (result.success) {
          toast.success('Dolencia marcada como recuperada', {
            description: `${zona} de ${nombreAtleta} ha sido marcada como recuperada`,
          });
          setOpen(false);
          setNotasRecuperacion('');
        } else {
          toast.error('Error al marcar como recuperada', {
            description: result.error || 'Intenta de nuevo',
          });
        }
      } catch (error) {
        toast.error('Error inesperado', {
          description: 'No pudimos procesar la solicitud',
        });
        console.error(error);
      }
    });
  };

  return (
    <AlertDialog open={open} onOpenChange={setOpen}>
      <AlertDialogTrigger asChild>
        <Button variant="outline" size="sm" className="text-green-600 hover:text-green-600 hover:bg-green-50">
          <CheckCircle className="mr-2 h-4 w-4" />
          Marcar Recuperado
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Marcar como Recuperada</AlertDialogTitle>
          <AlertDialogDescription>
            Vas a marcar la dolencia <span className="font-semibold">{zona}</span> de{' '}
            <span className="font-semibold">{nombreAtleta}</span> como recuperada.
          </AlertDialogDescription>
        </AlertDialogHeader>

        <div className="space-y-2 py-2">
          <Label htmlFor="notasRecuperacion">Notas de Recuperacion (opcional)</Label>
          <textarea
            id="notasRecuperacion"
            value={notasRecuperacion}
            onChange={(e) => setNotasRecuperacion(e.target.value)}
            maxLength={500}
            rows={3}
            placeholder="Observaciones sobre la recuperacion..."
            className="flex min-h-[80px] w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
            disabled={isPending}
          />
          <p className="text-xs text-muted-foreground text-right">
            {notasRecuperacion.length}/500
          </p>
        </div>

        <AlertDialogFooter>
          <AlertDialogCancel disabled={isPending}>Cancelar</AlertDialogCancel>
          <AlertDialogAction
            onClick={(e) => {
              e.preventDefault();
              handleMarcarRecuperado();
            }}
            disabled={isPending}
            className="bg-green-600 hover:bg-green-700 focus:ring-green-600"
          >
            {isPending ? 'Procesando...' : 'Confirmar'}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
