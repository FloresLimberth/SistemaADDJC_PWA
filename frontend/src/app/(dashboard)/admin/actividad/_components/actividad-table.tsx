'use client';

import { DataTable } from '@/components/ui/data-table';
import { columns } from './actividad-columns';
import type { Actividad } from '@/lib/actividad-schema';

interface ActividadTableProps {
  actividades: Actividad[];
}

export function ActividadTable({ actividades }: ActividadTableProps) {
  return <DataTable columns={columns} data={actividades} />;
}
