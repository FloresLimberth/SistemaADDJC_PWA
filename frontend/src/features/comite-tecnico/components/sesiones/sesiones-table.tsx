'use client';

// Tabla compacta de sesiones con filas expandibles
// Desktop: tabla con 10 columnas, ~48px por fila
// Mobile: cards compactas con menu de acciones

import { useState } from 'react';
import Link from 'next/link';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  ChevronRight,
  ChevronDown,
  Eye,
  Pencil,
  MoreVertical,
  CalendarClock,
  Plus,
} from 'lucide-react';
import { formatDateShort } from '@/lib/date-utils';
import type { SesionCompleta } from '@/features/comite-tecnico/actions';
import { TIPO_SESION_COLORS, TIPO_SESION_LABELS, DIA_LABELS } from './sesion-constants';
import { IntensidadBar } from './intensidad-bar';
import { SesionExpandedRow } from './sesion-expanded-row';

// basePath es serializable (string), a diferencia de funciones que
// no pueden cruzar la frontera Server -> Client Component
interface SesionesTableProps {
  sesiones: SesionCompleta[];
  basePath: string;
}

export function SesionesTable({ sesiones, basePath }: SesionesTableProps) {
  const [expandedRows, setExpandedRows] = useState<Set<string>>(new Set());

  const toggleRow = (id: string) => {
    setExpandedRows((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  // Empty state
  if (sesiones.length === 0) {
    return (
      <Card>
        <CardContent className="py-12 text-center">
          <CalendarClock className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-medium">No hay sesiones registradas</h3>
          <p className="text-muted-foreground mt-1 mb-4">
            Crea la primera sesion de entrenamiento.
          </p>
          <Button asChild>
            <Link href={`${basePath}/nuevo`}>
              <Plus className="h-4 w-4 mr-2" />
              Nueva Sesion
            </Link>
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      {/* Desktop: Tabla */}
      <div className="hidden md:block">
        <Card>
          <div className="max-h-[calc(100vh-320px)] overflow-auto">
            <Table>
              <TableHeader className="sticky top-0 z-10 bg-background">
                <TableRow>
                  <TableHead className="w-8" />
                  <TableHead className="w-24">Fecha</TableHead>
                  <TableHead className="w-10 text-center">#</TableHead>
                  <TableHead>Tipo</TableHead>
                  <TableHead className="w-12">Dia</TableHead>
                  <TableHead className="w-20 text-right">Duracion</TableHead>
                  <TableHead className="w-36">Intensidad</TableHead>
                  <TableHead className="w-20 text-right">Volumen</TableHead>
                  <TableHead>Microciclo</TableHead>
                  <TableHead className="w-24 text-right pr-4">Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {sesiones.map((sesion) => {
                  const isExpanded = expandedRows.has(sesion.id);
                  return (
                    <DesktopRow
                      key={sesion.id}
                      sesion={sesion}
                      isExpanded={isExpanded}
                      onToggle={() => toggleRow(sesion.id)}
                      basePath={basePath}
                    />
                  );
                })}
              </TableBody>
            </Table>
          </div>
        </Card>
      </div>

      {/* Mobile: Cards compactas */}
      <div className="md:hidden space-y-1">
        {sesiones.map((sesion) => {
          const isExpanded = expandedRows.has(sesion.id);
          return (
            <MobileCard
              key={sesion.id}
              sesion={sesion}
              isExpanded={isExpanded}
              onToggle={() => toggleRow(sesion.id)}
              basePath={basePath}
            />
          );
        })}
      </div>
    </>
  );
}

// Fila de desktop con expand/collapse
function DesktopRow({
  sesion,
  isExpanded,
  onToggle,
  basePath,
}: {
  sesion: SesionCompleta;
  isExpanded: boolean;
  onToggle: () => void;
  basePath: string;
}) {
  return (
    <>
      <TableRow
        className="cursor-pointer"
        onClick={onToggle}
      >
        <TableCell className="w-8 text-center">
          {isExpanded ? (
            <ChevronDown className="h-4 w-4 text-muted-foreground" />
          ) : (
            <ChevronRight className="h-4 w-4 text-muted-foreground" />
          )}
        </TableCell>
        <TableCell className="w-24 font-medium">
          {formatDateShort(sesion.fecha)}
        </TableCell>
        <TableCell className="w-10 text-center tabular-nums">
          {sesion.numeroSesion}
        </TableCell>
        <TableCell>
          <Badge className={TIPO_SESION_COLORS[sesion.tipoSesion] || 'bg-gray-100'}>
            {TIPO_SESION_LABELS[sesion.tipoSesion] || sesion.tipoSesion}
          </Badge>
        </TableCell>
        <TableCell className="w-12 text-muted-foreground">
          {DIA_LABELS[sesion.diaSemana] || sesion.diaSemana}
        </TableCell>
        <TableCell className="w-20 text-right tabular-nums">
          {sesion.duracionPlanificada} min
        </TableCell>
        <TableCell className="w-36">
          <IntensidadBar valor={sesion.intensidadPlanificada} />
        </TableCell>
        <TableCell className="w-20 text-right tabular-nums">
          {sesion.volumenPlanificado ?? '--'}
        </TableCell>
        <TableCell className="text-muted-foreground text-xs">
          {sesion.microciclo ? `#${sesion.microciclo.codigoMicrociclo}` : '--'}
        </TableCell>
        <TableCell className="w-24">
          <div className="flex justify-end gap-1">
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7 text-muted-foreground hover:text-foreground"
              asChild
              onClick={(e: React.MouseEvent) => e.stopPropagation()}
            >
              <Link href={`${basePath}/${sesion.id}`}>
                <Eye className="h-4 w-4" />
              </Link>
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7 text-muted-foreground hover:text-foreground"
              asChild
              onClick={(e: React.MouseEvent) => e.stopPropagation()}
            >
              <Link href={`${basePath}/${sesion.id}/editar`}>
                <Pencil className="h-4 w-4" />
              </Link>
            </Button>
          </div>
        </TableCell>
      </TableRow>

      {/* Fila expandida */}
      {isExpanded && (
        <TableRow className="hover:bg-transparent">
          <TableCell colSpan={10} className="p-0">
            <SesionExpandedRow sesion={sesion} />
          </TableCell>
        </TableRow>
      )}
    </>
  );
}

// Card compacta para mobile
function MobileCard({
  sesion,
  isExpanded,
  onToggle,
  basePath,
}: {
  sesion: SesionCompleta;
  isExpanded: boolean;
  onToggle: () => void;
  basePath: string;
}) {
  return (
    <Card>
      <div
        className="flex items-center gap-2 px-3 py-2.5 cursor-pointer"
        onClick={onToggle}
      >
        {isExpanded ? (
          <ChevronDown className="h-4 w-4 shrink-0 text-muted-foreground" />
        ) : (
          <ChevronRight className="h-4 w-4 shrink-0 text-muted-foreground" />
        )}

        <span className="text-sm font-medium w-16 shrink-0">
          {formatDateShort(sesion.fecha)}
        </span>

        <span className="text-sm text-muted-foreground shrink-0">
          #{sesion.numeroSesion}
        </span>

        <Badge
          className={`text-[10px] px-1.5 py-0 ${TIPO_SESION_COLORS[sesion.tipoSesion] || 'bg-gray-100'}`}
        >
          {TIPO_SESION_LABELS[sesion.tipoSesion] || sesion.tipoSesion}
        </Badge>

        <span className="text-xs text-muted-foreground ml-auto shrink-0">
          {sesion.duracionPlanificada} min
        </span>

        {/* Menu de acciones mobile */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7 shrink-0"
              onClick={(e) => e.stopPropagation()}
            >
              <MoreVertical className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem asChild>
              <Link href={`${basePath}/${sesion.id}`}>
                <Eye className="h-4 w-4 mr-2" />
                Ver detalle
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
              <Link href={`${basePath}/${sesion.id}/editar`}>
                <Pencil className="h-4 w-4 mr-2" />
                Editar
              </Link>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* Contenido expandido */}
      {isExpanded && <SesionExpandedRow sesion={sesion} />}
    </Card>
  );
}
