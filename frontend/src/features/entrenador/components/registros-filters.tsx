'use client';

import { useRouter, useSearchParams, usePathname } from 'next/navigation';
import { useCallback } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { X } from 'lucide-react';

interface AtletaOption {
  id: string;
  nombreCompleto: string;
}

interface RegistrosFiltersProps {
  atletas: AtletaOption[];
}

export function RegistrosFilters({ atletas }: RegistrosFiltersProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const pathname = usePathname();

  // Leer filtros actuales de la URL
  const currentAtletaId = searchParams.get('atletaId') || '';
  const currentFechaDesde = searchParams.get('fechaDesde') || '';
  const currentFechaHasta = searchParams.get('fechaHasta') || '';
  const currentAsistio = searchParams.get('asistio') || '';
  const currentRpeMin = searchParams.get('rpeMin') || '';

  // Actualizar un parametro en la URL manteniendo los demas
  const updateSearchParam = useCallback(
    (key: string, value: string) => {
      const params = new URLSearchParams(searchParams.toString());

      if (value) {
        params.set(key, value);
      } else {
        params.delete(key);
      }

      // Al cambiar un filtro, volver a pagina 1
      params.delete('page');

      router.push(`${pathname}?${params.toString()}`);
    },
    [searchParams, pathname, router]
  );

  // Limpiar todos los filtros
  const clearFilters = useCallback(() => {
    router.push(pathname);
  }, [pathname, router]);

  const hasActiveFilters =
    !!currentAtletaId ||
    !!currentFechaDesde ||
    !!currentFechaHasta ||
    !!currentAsistio ||
    !!currentRpeMin;

  return (
    <Card>
      <CardContent className="pt-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {/* Filtro por atleta */}
          <div className="space-y-2">
            <Label htmlFor="atletaId">Atleta</Label>
            <Select
              value={currentAtletaId}
              onValueChange={(value) =>
                updateSearchParam('atletaId', value === 'TODOS' ? '' : value)
              }
            >
              <SelectTrigger id="atletaId">
                <SelectValue placeholder="Todos los atletas" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="TODOS">Todos los atletas</SelectItem>
                {atletas.map((atleta) => (
                  <SelectItem key={atleta.id} value={atleta.id}>
                    {atleta.nombreCompleto}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Filtro por fecha desde */}
          <div className="space-y-2">
            <Label htmlFor="fechaDesde">Fecha desde</Label>
            <Input
              id="fechaDesde"
              type="date"
              value={currentFechaDesde}
              onChange={(e) => updateSearchParam('fechaDesde', e.target.value)}
            />
          </div>

          {/* Filtro por fecha hasta */}
          <div className="space-y-2">
            <Label htmlFor="fechaHasta">Fecha hasta</Label>
            <Input
              id="fechaHasta"
              type="date"
              value={currentFechaHasta}
              onChange={(e) => updateSearchParam('fechaHasta', e.target.value)}
            />
          </div>

          {/* Filtro por asistencia */}
          <div className="space-y-2">
            <Label htmlFor="asistio">Asistencia</Label>
            <Select
              value={currentAsistio}
              onValueChange={(value) =>
                updateSearchParam('asistio', value === 'TODOS' ? '' : value)
              }
            >
              <SelectTrigger id="asistio">
                <SelectValue placeholder="Todas" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="TODOS">Todas</SelectItem>
                <SelectItem value="true">Asistio</SelectItem>
                <SelectItem value="false">Falta</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Filtro por RPE minimo */}
          <div className="space-y-2">
            <Label htmlFor="rpeMin">RPE minimo</Label>
            <Select
              value={currentRpeMin}
              onValueChange={(value) =>
                updateSearchParam('rpeMin', value === 'TODOS' ? '' : value)
              }
            >
              <SelectTrigger id="rpeMin">
                <SelectValue placeholder="Sin minimo" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="TODOS">Sin minimo</SelectItem>
                {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((val) => (
                  <SelectItem key={val} value={val.toString()}>
                    {val}+
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Boton limpiar filtros */}
          <div className="space-y-2">
            <Label className="invisible">Acciones</Label>
            {hasActiveFilters ? (
              <Button
                variant="outline"
                className="w-full"
                onClick={clearFilters}
              >
                <X className="h-4 w-4 mr-2" />
                Limpiar filtros
              </Button>
            ) : (
              <div className="h-9" />
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
