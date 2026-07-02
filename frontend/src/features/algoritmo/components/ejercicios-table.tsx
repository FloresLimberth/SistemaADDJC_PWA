'use client';

import { useState, useTransition } from 'react';
import { ChevronRight, ChevronLeft } from 'lucide-react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { fetchCatalogoEjercicios } from '../actions/fetch-catalogo';
import type { CatalogoEjercicio, CatalogoEjerciciosResponse } from '../types/algoritmo.types';

// Items por pagina por defecto
const DEFAULT_LIMIT = 20;

// Labels legibles para cada tipo
const TIPO_LABELS: Record<string, string> = {
  FISICO: 'Fisico',
  TECNICO_TACHI: 'Tachi-waza',
  TECNICO_NE: 'Ne-waza',
  RESISTENCIA: 'Resistencia',
  VELOCIDAD: 'Velocidad',
};

// Colores de badge por tipo (basado en los 5 valores del enum TipoEjercicio)
const TIPO_COLORS: Record<string, string> = {
  FISICO: 'bg-blue-100 text-blue-800',
  TECNICO_TACHI: 'bg-green-100 text-green-800',
  TECNICO_NE: 'bg-purple-100 text-purple-800',
  RESISTENCIA: 'bg-orange-100 text-orange-800',
  VELOCIDAD: 'bg-red-100 text-red-800',
};

const TIPOS = [
  { value: 'ALL', label: 'Todos los tipos' },
  { value: 'FISICO', label: 'Fisico' },
  { value: 'TECNICO_TACHI', label: 'Tecnico Tachi-waza' },
  { value: 'TECNICO_NE', label: 'Tecnico Ne-waza' },
  { value: 'RESISTENCIA', label: 'Resistencia' },
  { value: 'VELOCIDAD', label: 'Velocidad' },
];

const DIFICULTADES = [
  { value: 'ALL', label: 'Todas las dificultades' },
  { value: '1', label: 'Facil' },
  { value: '2', label: 'Intermedio' },
  { value: '3', label: 'Avanzado' },
];

// Formatea el subtipo quitando guiones bajos
function formatSubtipo(subtipo: string | null): string {
  if (!subtipo) return '-';
  return subtipo.replace(/_/g, ' ');
}

// Colores para estrellas de dificultad (estilos inline para evitar problemas de especificidad CSS)
const STAR_COLORS = {
  filled: '#f59e0b', // amber-500 - mas visible que yellow-400
  empty: '#d1d5db',  // gray-300
};

// Renderiza estrellas para la dificultad (1-3)
function DificultadEstrellas({ nivel }: { nivel: number | null }) {
  if (nivel === null || nivel === undefined) {
    return <span className="text-muted-foreground">-</span>;
  }

  const maxEstrellas = 3;
  const estrellas = Math.min(Math.max(nivel, 1), maxEstrellas);

  return (
    <div className="flex gap-0.5" title={`Dificultad: ${estrellas} de ${maxEstrellas}`}>
      {Array.from({ length: maxEstrellas }).map((_, i) => (
        <span
          key={i}
          className="text-base"
          style={{ color: i < estrellas ? STAR_COLORS.filled : STAR_COLORS.empty }}
        >
          &#9733;
        </span>
      ))}
    </div>
  );
}

interface EjerciciosTableProps {
  dataInicial: CatalogoEjerciciosResponse;
}

// Tabla de ejercicios del catalogo con filtros, paginacion y filas expandibles
export function EjerciciosTable({ dataInicial }: EjerciciosTableProps) {
  const [data, setData] = useState<CatalogoEjerciciosResponse>(dataInicial);
  const [tipoFiltro, setTipoFiltro] = useState<string>('ALL');
  const [dificultadFiltro, setDificultadFiltro] = useState<string>('ALL');
  const [searchInput, setSearchInput] = useState('');
  const [currentPage, setCurrentPage] = useState(dataInicial.meta.page);
  const [isPending, startTransition] = useTransition();
  const [expandedRows, setExpandedRows] = useState<Set<string>>(new Set());

  // Funcion para cargar ejercicios con los parametros actuales
  function loadEjercicios(page: number, tipo?: string, dificultad?: string, search?: string) {
    startTransition(async () => {
      const result = await fetchCatalogoEjercicios({
        tipo: tipo === 'ALL' ? undefined : tipo,
        dificultad: dificultad === 'ALL' ? undefined : parseInt(dificultad || '0', 10) || undefined,
        search: search || undefined,
        page,
        limit: DEFAULT_LIMIT,
      });
      if (result) {
        setData(result);
        setCurrentPage(result.meta.page);
      }
    });
  }

  function handleTipoChange(value: string) {
    setTipoFiltro(value);
    setExpandedRows(new Set());
    loadEjercicios(1, value, dificultadFiltro, searchInput);
  }

  function handleDificultadChange(value: string) {
    setDificultadFiltro(value);
    setExpandedRows(new Set());
    loadEjercicios(1, tipoFiltro, value, searchInput);
  }

  function handleSearch() {
    setExpandedRows(new Set());
    loadEjercicios(1, tipoFiltro, dificultadFiltro, searchInput);
  }

  function handlePageChange(page: number) {
    if (page < 1 || page > data.meta.totalPages) return;
    setExpandedRows(new Set());
    loadEjercicios(page, tipoFiltro, dificultadFiltro, searchInput);
  }

  function toggleRow(id: string) {
    setExpandedRows((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  }

  // Generar numeros de pagina para mostrar
  function getPageNumbers(): (number | 'ellipsis')[] {
    const { page, totalPages } = data.meta;
    const pages: (number | 'ellipsis')[] = [];

    if (totalPages <= 7) {
      // Mostrar todas las paginas si son 7 o menos
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      // Siempre mostrar primera pagina
      pages.push(1);

      if (page > 3) {
        pages.push('ellipsis');
      }

      // Mostrar paginas alrededor de la actual
      const start = Math.max(2, page - 1);
      const end = Math.min(totalPages - 1, page + 1);

      for (let i = start; i <= end; i++) {
        pages.push(i);
      }

      if (page < totalPages - 2) {
        pages.push('ellipsis');
      }

      // Siempre mostrar ultima pagina
      pages.push(totalPages);
    }

    return pages;
  }

  return (
    <div className="space-y-4">
      {/* Filtros */}
      <div className="flex items-center gap-4">
        <Select value={tipoFiltro} onValueChange={handleTipoChange}>
          <SelectTrigger className="w-[220px]">
            <SelectValue placeholder="Tipo de ejercicio" />
          </SelectTrigger>
          <SelectContent>
            {TIPOS.map((tipo) => (
              <SelectItem key={tipo.value} value={tipo.value}>
                {tipo.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select value={dificultadFiltro} onValueChange={handleDificultadChange}>
          <SelectTrigger className="w-[200px]">
            <SelectValue placeholder="Dificultad" />
          </SelectTrigger>
          <SelectContent>
            {DIFICULTADES.map((dif) => (
              <SelectItem key={dif.value} value={dif.value}>
                {dif.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <div className="flex items-center gap-2 flex-1">
          <Input
            placeholder="Buscar por nombre..."
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
          />
          <Button
            variant="outline"
            onClick={handleSearch}
            disabled={isPending}
          >
            Buscar
          </Button>
        </div>
      </div>

      {/* Info */}
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">
          {data.meta.total} ejercicio{data.meta.total !== 1 ? 's' : ''} encontrado{data.meta.total !== 1 ? 's' : ''}
          {data.meta.totalPages > 1 && (
            <span className="ml-1">
              - Pagina {data.meta.page} de {data.meta.totalPages}
            </span>
          )}
          {expandedRows.size > 0 && (
            <span className="ml-2">
              ({expandedRows.size} expandido{expandedRows.size !== 1 ? 's' : ''})
            </span>
          )}
        </p>
      </div>

      {/* Tabla */}
      {data.data.length === 0 ? (
        <p className="text-center text-muted-foreground py-8">
          No se encontraron ejercicios con los filtros seleccionados.
        </p>
      ) : (
        <div className="border rounded-lg">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[280px]">Nombre</TableHead>
                <TableHead>Tipo</TableHead>
                <TableHead>Subtipo</TableHead>
                <TableHead>Categoria</TableHead>
                <TableHead className="w-[100px]">Duracion</TableHead>
                <TableHead className="w-[100px]">Dificultad</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {data.data.map((ej) => (
                <EjercicioRow
                  key={ej.id}
                  ejercicio={ej}
                  isExpanded={expandedRows.has(ej.id)}
                  onToggle={() => toggleRow(ej.id)}
                />
              ))}
            </TableBody>
          </Table>
        </div>
      )}

      {/* Controles de paginacion */}
      {data.meta.totalPages > 1 && (
        <div className="flex items-center justify-center gap-1 pt-4">
          {/* Boton anterior */}
          <Button
            variant="outline"
            size="sm"
            onClick={() => handlePageChange(currentPage - 1)}
            disabled={currentPage <= 1 || isPending}
            className="h-8 px-2"
          >
            <ChevronLeft className="h-4 w-4" />
            <span className="sr-only">Anterior</span>
          </Button>

          {/* Numeros de pagina */}
          {getPageNumbers().map((pageNum, idx) =>
            pageNum === 'ellipsis' ? (
              <span
                key={`ellipsis-${idx}`}
                className="px-2 text-muted-foreground"
              >
                ...
              </span>
            ) : (
              <Button
                key={pageNum}
                variant={pageNum === currentPage ? 'default' : 'outline'}
                size="sm"
                onClick={() => handlePageChange(pageNum)}
                disabled={isPending}
                className="h-8 w-8 p-0"
              >
                {pageNum}
              </Button>
            )
          )}

          {/* Boton siguiente */}
          <Button
            variant="outline"
            size="sm"
            onClick={() => handlePageChange(currentPage + 1)}
            disabled={currentPage >= data.meta.totalPages || isPending}
            className="h-8 px-2"
          >
            <ChevronRight className="h-4 w-4" />
            <span className="sr-only">Siguiente</span>
          </Button>
        </div>
      )}
    </div>
  );
}

// Componente para cada fila de ejercicio (principal + expandible)
interface EjercicioRowProps {
  ejercicio: CatalogoEjercicio;
  isExpanded: boolean;
  onToggle: () => void;
}

function EjercicioRow({ ejercicio, isExpanded, onToggle }: EjercicioRowProps) {
  const tipoColor = TIPO_COLORS[ejercicio.tipo] || 'bg-gray-100 text-gray-800';
  const tipoLabel = TIPO_LABELS[ejercicio.tipo] || ejercicio.tipo;
  const hasDescripcion = !!ejercicio.descripcion;

  return (
    <>
      {/* Fila principal */}
      <TableRow
        className={cn(
          'cursor-pointer hover:bg-muted/50 transition-colors',
          isExpanded && 'bg-muted/30'
        )}
        onClick={onToggle}
      >
        <TableCell>
          <div className="flex items-center gap-2">
            <ChevronRight
              className={cn(
                'h-4 w-4 text-muted-foreground transition-transform',
                isExpanded && 'rotate-90'
              )}
            />
            <span className="font-medium">{ejercicio.nombre}</span>
          </div>
        </TableCell>
        <TableCell>
          <span className={cn('px-2 py-1 rounded-full text-xs font-medium', tipoColor)}>
            {tipoLabel}
          </span>
        </TableCell>
        <TableCell className="text-muted-foreground">
          {formatSubtipo(ejercicio.subtipo)}
        </TableCell>
        <TableCell className="text-muted-foreground">
          {ejercicio.categoria || '-'}
        </TableCell>
        <TableCell className="text-muted-foreground">
          {ejercicio.duracionMinutos ? `${ejercicio.duracionMinutos} min` : '-'}
        </TableCell>
        <TableCell>
          <DificultadEstrellas nivel={ejercicio.nivelDificultad} />
        </TableCell>
      </TableRow>

      {/* Fila expandible con descripcion */}
      {isExpanded && (
        <TableRow className="bg-muted/20 hover:bg-muted/20">
          <TableCell colSpan={6} className="py-4">
            <div className="pl-6 text-sm">
              {hasDescripcion ? (
                <>
                  <p className="font-medium text-foreground mb-1">Descripcion:</p>
                  <p className="text-muted-foreground">{ejercicio.descripcion}</p>
                </>
              ) : (
                <p className="text-muted-foreground italic">
                  Sin descripcion disponible.
                </p>
              )}
            </div>
          </TableCell>
        </TableRow>
      )}
    </>
  );
}
