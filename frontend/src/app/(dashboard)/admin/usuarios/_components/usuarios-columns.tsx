'use client';

import { ColumnDef } from '@tanstack/react-table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { MoreHorizontal } from 'lucide-react';
import type { Usuario } from '@/types/user';
import { EditarUsuarioDialog } from './editar-usuario-dialog';
import { DeleteUsuarioButton } from './delete-usuario-button';

// Colores para badges de rol (según investigación Fase 4)
const rolColors: Record<string, string> = {
  ADMINISTRADOR: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200',
  COMITE_TECNICO: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
  ENTRENADOR: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
  ATLETA: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200',
};

// Colores para badges de estado
const estadoColors = {
  true: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
  false: 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200',
};

export const columns: ColumnDef<Usuario>[] = [
  {
    accessorKey: 'ci',
    header: 'CI',
    cell: ({ row }) => <div className="font-medium">{row.getValue('ci')}</div>,
  },
  {
    accessorKey: 'nombreCompleto',
    header: 'Nombre Completo',
    cell: ({ row }) => <div>{row.getValue('nombreCompleto')}</div>,
  },
  {
    accessorKey: 'email',
    header: 'Email',
    cell: ({ row }) => <div className="lowercase">{row.getValue('email')}</div>,
  },
  {
    accessorKey: 'rol',
    header: 'Rol',
    cell: ({ row }) => {
      const rol = row.getValue('rol') as string;
      const displayRol = rol.replace('_', ' ');
      return (
        <Badge className={rolColors[rol] || ''} variant="outline">
          {displayRol}
        </Badge>
      );
    },
  },
  {
    accessorKey: 'estado',
    header: 'Estado',
    cell: ({ row }) => {
      const estado = row.getValue('estado') as boolean;
      return (
        <Badge className={estadoColors[estado.toString() as 'true' | 'false']} variant="outline">
          {estado ? 'Activo' : 'Inactivo'}
        </Badge>
      );
    },
  },
  {
    accessorKey: 'fechaRegistro',
    header: 'Fecha Registro',
    cell: ({ row }) => {
      const fecha = row.getValue('fechaRegistro') as Date;
      return <div>{new Date(fecha).toLocaleDateString('es-BO')}</div>;
    },
  },
  {
    id: 'acciones',
    header: 'Acciones',
    cell: ({ row }) => {
      const usuario = row.original;

      return (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="h-8 w-8 p-0">
              <span className="sr-only">Abrir menu</span>
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <EditarUsuarioDialog usuario={usuario} />
            <DropdownMenuSeparator />
            <DeleteUsuarioButton usuario={usuario} />
          </DropdownMenuContent>
        </DropdownMenu>
      );
    },
  },
];
