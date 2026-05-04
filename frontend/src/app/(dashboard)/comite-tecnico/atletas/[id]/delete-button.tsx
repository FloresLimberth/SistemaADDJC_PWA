'use client';

import { useState } from 'react';
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
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { Trash2, Loader2 } from 'lucide-react';
import { deleteAtleta } from '@/features/comite-tecnico/actions';

interface DeleteAtletaButtonProps {
  atletaId: string;
  atletaNombre: string;
  redirectUrl: string;
}

export function DeleteAtletaButton({ atletaId, atletaNombre, redirectUrl }: DeleteAtletaButtonProps) {
  const router = useRouter();
  const [isDeleting, setIsDeleting] = useState(false);
  const [isOpen, setIsOpen] = useState(false);

  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      const result = await deleteAtleta(atletaId);

      if (result.success) {
        toast.success('Atleta eliminado', {
          description: result.message,
        });
        router.push(redirectUrl);
      } else {
        toast.error('Error', {
          description: result.error || 'No se pudo eliminar el atleta',
        });
      }
    } catch (error) {
      toast.error('Error', {
        description: 'Ocurrio un error al eliminar el atleta',
      });
    } finally {
      setIsDeleting(false);
      setIsOpen(false);
    }
  };

  return (
    <AlertDialog open={isOpen} onOpenChange={setIsOpen}>
      <AlertDialogTrigger asChild>
        <Button variant="destructive">
          <Trash2 className="h-4 w-4 mr-2" />
          Eliminar
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Eliminar Atleta Permanentemente</AlertDialogTitle>
          <AlertDialogDescription className="space-y-2">
            <span className="block">
              Esta accion eliminara permanentemente al atleta <strong>{atletaNombre}</strong> y todos sus datos asociados:
            </span>
            <ul className="list-disc list-inside text-sm">
              <li>Cuenta de usuario</li>
              <li>Tests fisicos registrados</li>
              <li>Registros post-entrenamiento</li>
              <li>Asignaciones a microciclos</li>
              <li>Recomendaciones y alertas</li>
            </ul>
            <span className="block font-medium text-destructive">
              Esta accion NO se puede deshacer.
            </span>
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={isDeleting}>Cancelar</AlertDialogCancel>
          <AlertDialogAction
            onClick={handleDelete}
            disabled={isDeleting}
            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
          >
            {isDeleting ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Eliminando...
              </>
            ) : (
              <>
                <Trash2 className="h-4 w-4 mr-2" />
                Eliminar Permanentemente
              </>
            )}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
