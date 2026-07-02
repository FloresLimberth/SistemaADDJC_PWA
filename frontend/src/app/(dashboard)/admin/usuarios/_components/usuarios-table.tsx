'use client';

import { DataTable } from '@/components/ui/data-table';
import { columns } from './usuarios-columns';
import type { Usuario } from '@/types/user';

interface UsuariosTableProps {
  usuarios: Usuario[];
}

export function UsuariosTable({ usuarios }: UsuariosTableProps) {
  return <DataTable columns={columns} data={usuarios} />;
}
