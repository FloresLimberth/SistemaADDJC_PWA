'use client';

import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Pencil } from 'lucide-react';
import { UsuarioForm } from './usuario-form';
import type { Usuario } from '@/types/user';

interface EditarUsuarioDialogProps {
  usuario: Usuario;
}

export function EditarUsuarioDialog({ usuario }: EditarUsuarioDialogProps) {
  const [open, setOpen] = useState(false);

  const handleSuccess = () => {
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="ghost" size="sm" className="w-full justify-start">
          <Pencil className="mr-2 h-4 w-4" />
          <span>Editar</span>
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Editar Usuario</DialogTitle>
          <DialogDescription>
            Modifica los datos del usuario {usuario.nombreCompleto}
          </DialogDescription>
        </DialogHeader>
        <UsuarioForm usuario={usuario} onSuccess={handleSuccess} />
      </DialogContent>
    </Dialog>
  );
}
