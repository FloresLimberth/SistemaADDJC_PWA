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
import { Trash2 } from 'lucide-react';
import { eliminarUsuarioAction } from '../_actions/eliminar-usuario';
import { toast } from 'sonner';
import type { Usuario } from '@/types/user';

interface DeleteUsuarioButtonProps {
  usuario: Usuario;
}

export function DeleteUsuarioButton({ usuario }: DeleteUsuarioButtonProps) {
  const [open, setOpen] = useState(false);
  const [isPending, startTransition] = useTransition();

  const handleDelete = () => {
    startTransition(async () => {
      try {
        const result = await eliminarUsuarioAction(usuario.id);

        if (result.success) {
          toast.success('Usuario eliminado correctamente', {
            description: `${usuario.nombreCompleto} ha sido eliminado del sistema`,
          });
          setOpen(false);
        } else {
          toast.error('Error al eliminar usuario', {
            description: result.error || 'Intenta de nuevo',
          });
        }
      } catch (error) {
        toast.error('Error inesperado', {
          description: 'No pudimos eliminar el usuario',
        });
        console.error(error);
      }
    });
  };

  return (
    <AlertDialog open={open} onOpenChange={setOpen}>
      <AlertDialogTrigger asChild>
        <Button
          variant="ghost"
          size="sm"
          className="w-full justify-start text-red-600 hover:text-red-600 hover:bg-red-50"
        >
          <Trash2 className="mr-2 h-4 w-4" />
          <span>Eliminar</span>
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Eliminar usuario</AlertDialogTitle>
          <AlertDialogDescription>
            ¿Estás seguro de que deseas eliminar al usuario{' '}
            <span className="font-semibold">{usuario.nombreCompleto}</span>?
            <br />
            <br />
            Esta acción <span className="font-semibold">no se puede deshacer</span>. El usuario será
            eliminado permanentemente del sistema.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={isPending}>Cancelar</AlertDialogCancel>
          <AlertDialogAction
            onClick={(e) => {
              e.preventDefault();
              handleDelete();
            }}
            disabled={isPending}
            className="bg-red-600 hover:bg-red-700 focus:ring-red-600"
          >
            {isPending ? 'Eliminando...' : 'Eliminar'}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
