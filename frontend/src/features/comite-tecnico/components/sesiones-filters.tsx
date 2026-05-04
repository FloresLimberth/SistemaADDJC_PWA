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
import { TipoSesion } from '@/types/enums';
import type { MicrocicloParaSelector } from '../actions/fetch-planificacion';

// Labels legibles para tipos de sesion (coincide con el enum TipoSesion)
const TIPO_SESION_LABELS: Record<string, string> = {
  ENTRENAMIENTO: 'Entrenamiento',
  TEST: 'Test',
  RECUPERACION: 'Recuperacion',
  DESCANSO: 'Descanso',
  COMPETENCIA: 'Competencia',
};

interface SesionesFiltersProps {
  microciclos: MicrocicloParaSelector[];
}

export function SesionesFilters({ microciclos }: SesionesFiltersProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const pathname = usePathname();

  // Leer filtros actuales de la URL
  const currentTipoSesion = searchParams.get('tipoSesion') || '';
  const currentMicrocicloId = searchParams.get('microcicloId') || '';
  const currentFecha = searchParams.get('fecha') || '';

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

  const hasActiveFilters = currentTipoSesion || currentMicrocicloId || currentFecha;

  return (
    <Card>
      <CardContent className="pt-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Filtro por tipo de sesion (client-side, el backend no lo soporta en findAll) */}
          <div className="space-y-2">
            <Label htmlFor="tipoSesion">Tipo de sesion</Label>
            <Select
              value={currentTipoSesion}
              onValueChange={(value) =>
                updateSearchParam('tipoSesion', value === 'TODOS' ? '' : value)
              }
            >
              <SelectTrigger id="tipoSesion">
                <SelectValue placeholder="Todos los tipos" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="TODOS">Todos los tipos</SelectItem>
                {Object.values(TipoSesion).map((tipo) => (
                  <SelectItem key={tipo} value={tipo}>
                    {TIPO_SESION_LABELS[tipo] || tipo}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Filtro por microciclo (backend param) */}
          <div className="space-y-2">
            <Label htmlFor="microcicloId">Microciclo</Label>
            <Select
              value={currentMicrocicloId}
              onValueChange={(value) =>
                updateSearchParam('microcicloId', value === 'TODOS' ? '' : value)
              }
            >
              <SelectTrigger id="microcicloId">
                <SelectValue placeholder="Todos los microciclos" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="TODOS">Todos los microciclos</SelectItem>
                {microciclos.map((micro) => (
                  <SelectItem key={micro.id} value={micro.id}>
                    {micro.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Filtro por fecha (backend param) */}
          <div className="space-y-2">
            <Label htmlFor="fecha">Fecha</Label>
            <Input
              id="fecha"
              type="date"
              value={currentFecha}
              onChange={(e) => updateSearchParam('fecha', e.target.value)}
            />
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
