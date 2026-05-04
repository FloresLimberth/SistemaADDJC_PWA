'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
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
import { Trash2, Loader2, AlertTriangle } from 'lucide-react';
import {
  deleteMicrociclo,
  fetchMicrocicloDeleteInfo,
  type MicrocicloDeleteInfo,
} from '@/features/comite-tecnico/actions';
import { COMITE_TECNICO_ROUTES } from '@/lib/routes';

interface DeleteMicrocicloButtonProps {
  microcicloId: string;
  microcicloNumero: string;
}

export function DeleteMicrocicloButton({ microcicloId, microcicloNumero }: DeleteMicrocicloButtonProps) {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteInfo, setDeleteInfo] = useState<MicrocicloDeleteInfo | null>(null);
  const [confirmText, setConfirmText] = useState('');

  const CONFIRM_WORD = 'ELIMINAR';
  const canDelete = confirmText === CONFIRM_WORD;

  // Cargar info de eliminacion cuando se abre el dialog
  useEffect(() => {
    if (isOpen && !deleteInfo) {
      setIsLoading(true);
      fetchMicrocicloDeleteInfo(microcicloId)
        .then((info) => {
          setDeleteInfo(info);
        })
        .finally(() => {
          setIsLoading(false);
        });
    }
  }, [isOpen, microcicloId, deleteInfo]);

  // Limpiar estado cuando se cierra
  const handleOpenChange = (open: boolean) => {
    setIsOpen(open);
    if (!open) {
      setConfirmText('');
    }
  };

  const handleDelete = async () => {
    if (!canDelete) return;

    setIsDeleting(true);
    try {
      const result = await deleteMicrociclo(microcicloId);

      if (result.success) {
        toast.success('Microciclo eliminado', {
          description: result.message,
        });
        router.push(COMITE_TECNICO_ROUTES.planificacion.macrociclos.list);
      } else {
        toast.error('Error', {
          description: result.error || 'No se pudo eliminar el microciclo',
        });
      }
    } catch {
      toast.error('Error', {
        description: 'Ocurrio un error al eliminar el microciclo',
      });
    } finally {
      setIsDeleting(false);
      setIsOpen(false);
    }
  };

  const hasRelatedData = deleteInfo && deleteInfo.sesiones > 0;

  return (
    <AlertDialog open={isOpen} onOpenChange={handleOpenChange}>
      <AlertDialogTrigger asChild>
        <Button variant="destructive">
          <Trash2 className="h-4 w-4 mr-2" />
          Eliminar
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent className="max-w-md">
        <AlertDialogHeader>
          <AlertDialogTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-destructive" />
            Eliminar Microciclo
          </AlertDialogTitle>
          <AlertDialogDescription asChild>
            <div className="space-y-4">
              <p>
                Estas a punto de eliminar permanentemente el <strong>Microciclo #{microcicloNumero}</strong>.
              </p>

              {isLoading ? (
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Cargando informacion...
                </div>
              ) : hasRelatedData ? (
                <div className="bg-destructive/10 border border-destructive/20 rounded-md p-3 space-y-2">
                  <p className="font-medium text-destructive">
                    Se eliminaran los siguientes registros:
                  </p>
                  <ul className="list-disc list-inside text-sm space-y-1">
                    <li>{deleteInfo.sesiones} sesion(es)</li>
                  </ul>
                </div>
              ) : (
                <p className="text-sm text-muted-foreground">
                  Este microciclo no tiene sesiones asociadas.
                </p>
              )}

              <div className="space-y-2 pt-2">
                <Label htmlFor="confirm-delete" className="text-sm font-medium">
                  Escribe <span className="font-bold text-destructive">{CONFIRM_WORD}</span> para confirmar:
                </Label>
                <Input
                  id="confirm-delete"
                  value={confirmText}
                  onChange={(e) => setConfirmText(e.target.value)}
                  placeholder={CONFIRM_WORD}
                  className="font-mono"
                  disabled={isDeleting}
                />
              </div>

              <p className="text-sm font-medium text-destructive">
                Esta accion NO se puede deshacer.
              </p>
            </div>
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={isDeleting}>Cancelar</AlertDialogCancel>
          <AlertDialogAction
            onClick={handleDelete}
            disabled={!canDelete || isDeleting}
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
