'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Trash2, AlertTriangle } from 'lucide-react';
import { deleteEntrenador } from '@/features/comite-tecnico/actions/entrenador.actions';
import { COMITE_TECNICO_ROUTES } from '@/lib/routes';

interface DeleteEntrenadorButtonProps {
  entrenadorId: string;
  atletasCount: number;
}

export function DeleteEntrenadorButton({
  entrenadorId,
  atletasCount,
}: DeleteEntrenadorButtonProps) {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const [isPending, startTransition] = useTransition();

  const handleDelete = () => {
    startTransition(async () => {
      try {
        const result = await deleteEntrenador(entrenadorId);

        if (result.success) {
          toast.success('Entrenador eliminado', {
            description: result.message,
          });
          router.push(COMITE_TECNICO_ROUTES.entrenadores.list);
        } else {
          toast.error('Error al eliminar', {
            description: result.error,
          });
        }
      } catch {
        toast.error('Error', {
          description: 'No se pudo eliminar el entrenador',
        });
      } finally {
        setIsOpen(false);
      }
    });
  };

  // Deshabilitar si tiene atletas asignados
  const hasAtletas = atletasCount > 0;

  return (
    <>
      <Button
        variant="destructive"
        onClick={() => setIsOpen(true)}
        disabled={hasAtletas}
      >
        <Trash2 className="h-4 w-4 mr-2" />
        Eliminar
      </Button>

      <AlertDialog open={isOpen} onOpenChange={setIsOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-destructive" />
              Confirmar eliminacion
            </AlertDialogTitle>
            <AlertDialogDescription>
              {hasAtletas ? (
                <span>
                  No se puede eliminar este entrenador porque tiene{' '}
                  <strong>
                    {atletasCount} atleta{atletasCount !== 1 ? 's' : ''}{' '}
                    asignado{atletasCount !== 1 ? 's' : ''}
                  </strong>
                  .
                  <br />
                  <br />
                  Por favor, reasigna los atletas a otro entrenador antes de
                  eliminarlo.
                </span>
              ) : (
                <span>
                  Esta accion no se puede deshacer. El entrenador sera eliminado
                  permanentemente del sistema junto con su usuario asociado.
                  <br />
                  <br />
                  ¿Estas seguro de que deseas continuar?
                </span>
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isPending}>Cancelar</AlertDialogCancel>
            {!hasAtletas && (
              <AlertDialogAction
                onClick={handleDelete}
                disabled={isPending}
                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              >
                {isPending ? 'Eliminando...' : 'Eliminar Entrenador'}
              </AlertDialogAction>
            )}
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
