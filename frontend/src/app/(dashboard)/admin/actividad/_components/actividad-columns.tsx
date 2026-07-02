'use client';

import { ColumnDef } from '@tanstack/react-table';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, XCircle } from 'lucide-react';
import type { Actividad } from '@/lib/actividad-schema';
import { formatearAccion } from '@/lib/actividad-schema';
import { formatDistanceToNow } from 'date-fns';
import { es } from 'date-fns/locale';

// Colores para badges de accion
const accionColors: Record<string, string> = {
  LOGIN: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
  LOGOUT: 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200',
  CREAR_USUARIO: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
  EDITAR_USUARIO: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200',
  DESACTIVAR_USUARIO: 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200',
  ELIMINAR_USUARIO: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200',
};

export const columns: ColumnDef<Actividad>[] = [
  {
    accessorKey: 'createdAt',
    header: 'Fecha',
    cell: ({ row }) => {
      const fecha = row.getValue('createdAt') as Date;
      const fechaDate = new Date(fecha);
      return (
        <div className="flex flex-col">
          <span className="font-medium">
            {fechaDate.toLocaleDateString('es-BO')}
          </span>
          <span className="text-xs text-muted-foreground">
            {formatDistanceToNow(fechaDate, { addSuffix: true, locale: es })}
          </span>
        </div>
      );
    },
  },
  {
    accessorKey: 'usuario',
    header: 'Usuario',
    cell: ({ row }) => {
      const usuario = row.original.usuario;
      if (!usuario) {
        return <span className="text-muted-foreground">Sistema</span>;
      }
      return (
        <div className="flex flex-col">
          <span className="font-medium">{usuario.nombreCompleto}</span>
          <span className="text-xs text-muted-foreground">{usuario.email}</span>
        </div>
      );
    },
  },
  {
    accessorKey: 'accion',
    header: 'Accion',
    cell: ({ row }) => {
      const accion = row.getValue('accion') as string;
      const colorClass = accionColors[accion] || 'bg-gray-100 text-gray-800';
      return (
        <Badge className={colorClass} variant="outline">
          {formatearAccion(accion)}
        </Badge>
      );
    },
  },
  {
    accessorKey: 'recurso',
    header: 'Recurso',
    cell: ({ row }) => {
      const recurso = row.original.recurso;
      const recursoId = row.original.recursoId;
      if (!recurso) {
        return <span className="text-muted-foreground">-</span>;
      }
      return (
        <div className="flex flex-col">
          <span>{recurso}</span>
          {recursoId && (
            <span className="text-xs text-muted-foreground">ID: {recursoId}</span>
          )}
        </div>
      );
    },
  },
  {
    accessorKey: 'ip',
    header: 'IP',
    cell: ({ row }) => (
      <span className="font-mono text-xs">{row.getValue('ip')}</span>
    ),
  },
  {
    accessorKey: 'exito',
    header: 'Estado',
    cell: ({ row }) => {
      const exito = row.getValue('exito') as boolean;
      return exito ? (
        <div className="flex items-center gap-1 text-green-600">
          <CheckCircle className="h-4 w-4" />
          <span className="text-sm">Exitoso</span>
        </div>
      ) : (
        <div className="flex items-center gap-1 text-red-600">
          <XCircle className="h-4 w-4" />
          <span className="text-sm">Fallido</span>
        </div>
      );
    },
  },
];
