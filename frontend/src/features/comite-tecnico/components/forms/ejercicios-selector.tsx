'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { ChevronDown, Dumbbell } from 'lucide-react';
import type { EjerciciosPorTipoResponse } from '@/features/algoritmo/types/algoritmo.types';

// Tipo para cada ejercicio seleccionado con su metadata
export interface EjercicioSeleccionado {
  ejercicioId: string;
  nombre: string;
  tipo: string;
  orden: number;
  duracionMinutos?: number;
  repeticiones?: number;
  series?: number;
  intensidad?: number;
  observaciones?: string;
}

interface EjerciciosSelectorProps {
  catalogoPorTipo: EjerciciosPorTipoResponse;
  value: EjercicioSeleccionado[];
  onChange: (ejercicios: EjercicioSeleccionado[]) => void;
}

// Labels legibles para cada tipo de ejercicio
const TIPO_EJERCICIO_LABELS: Record<string, string> = {
  FISICO: 'Fisico',
  TECNICO_TACHI: 'Tecnico Tachi-waza',
  TECNICO_NE: 'Tecnico Ne-waza',
  RESISTENCIA: 'Resistencia',
  VELOCIDAD: 'Velocidad',
};

const TIPOS_ORDEN: string[] = [
  'FISICO',
  'TECNICO_TACHI',
  'TECNICO_NE',
  'RESISTENCIA',
  'VELOCIDAD',
];

export function EjerciciosSelector({ catalogoPorTipo, value, onChange }: EjerciciosSelectorProps) {
  const [openSections, setOpenSections] = useState<Record<string, boolean>>({});

  // Verificar si un ejercicio esta seleccionado
  const isSelected = (ejercicioId: string): boolean => {
    return value.some((e) => e.ejercicioId === ejercicioId);
  };

  // Obtener ejercicio seleccionado por ID
  const getSelected = (ejercicioId: string): EjercicioSeleccionado | undefined => {
    return value.find((e) => e.ejercicioId === ejercicioId);
  };

  // Calcular siguiente orden
  const getNextOrden = (): number => {
    if (value.length === 0) return 1;
    return Math.max(...value.map((e) => e.orden)) + 1;
  };

  // Toggle seleccion de ejercicio
  const handleToggle = (ejercicioId: string, nombre: string, tipo: string, checked: boolean) => {
    if (checked) {
      const nuevo: EjercicioSeleccionado = {
        ejercicioId,
        nombre,
        tipo,
        orden: getNextOrden(),
      };
      onChange([...value, nuevo]);
    } else {
      const filtered = value.filter((e) => e.ejercicioId !== ejercicioId);
      // Reordenar
      const reordered = filtered.map((e, idx) => ({ ...e, orden: idx + 1 }));
      onChange(reordered);
    }
  };

  // Actualizar metadata de un ejercicio seleccionado
  const handleMetadataChange = (
    ejercicioId: string,
    field: keyof EjercicioSeleccionado,
    rawValue: string
  ) => {
    const updated = value.map((e) => {
      if (e.ejercicioId !== ejercicioId) return e;
      const numValue = rawValue === '' ? undefined : Number(rawValue);
      return { ...e, [field]: numValue };
    });
    onChange(updated);
  };

  const toggleSection = (tipo: string) => {
    setOpenSections((prev) => ({ ...prev, [tipo]: !prev[tipo] }));
  };

  const totalSeleccionados = value.length;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg flex items-center gap-2">
          <Dumbbell className="h-5 w-5" />
          Ejercicios de la Sesion
          {totalSeleccionados > 0 && (
            <span className="text-sm font-normal text-muted-foreground">
              ({totalSeleccionados} seleccionados)
            </span>
          )}
        </CardTitle>
        <CardDescription>
          Selecciona los ejercicios del catalogo para esta sesion
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-2">
        {TIPOS_ORDEN.map((tipo) => {
          const ejerciciosDelTipo = catalogoPorTipo.data[tipo as keyof typeof catalogoPorTipo.data] || [];
          if (ejerciciosDelTipo.length === 0) return null;

          const seleccionadosDelTipo = value.filter((e) => e.tipo === tipo).length;
          const isOpen = openSections[tipo] ?? false;

          return (
            <Collapsible key={tipo} open={isOpen} onOpenChange={() => toggleSection(tipo)}>
              <CollapsibleTrigger className="flex w-full items-center justify-between rounded-md border px-4 py-3 text-sm font-medium hover:bg-muted/50 transition-colors">
                <span className="flex items-center gap-2">
                  {TIPO_EJERCICIO_LABELS[tipo] || tipo}
                  <span className="text-xs text-muted-foreground">
                    ({ejerciciosDelTipo.length} disponibles)
                  </span>
                  {seleccionadosDelTipo > 0 && (
                    <span className="text-xs bg-primary/10 text-primary px-2 py-0.5 rounded-full">
                      {seleccionadosDelTipo} seleccionados
                    </span>
                  )}
                </span>
                <ChevronDown
                  className={`h-4 w-4 transition-transform ${isOpen ? 'rotate-180' : ''}`}
                />
              </CollapsibleTrigger>
              <CollapsibleContent className="pt-2 space-y-1">
                {ejerciciosDelTipo.map((ejercicio) => {
                  const selected = isSelected(ejercicio.id);
                  const selectedData = getSelected(ejercicio.id);

                  return (
                    <div key={ejercicio.id} className="rounded-md border p-3 space-y-2">
                      <div className="flex items-center gap-3">
                        <Checkbox
                          id={`ej-${ejercicio.id}`}
                          checked={selected}
                          onCheckedChange={(checked) =>
                            handleToggle(ejercicio.id, ejercicio.nombre, tipo, checked === true)
                          }
                        />
                        <Label
                          htmlFor={`ej-${ejercicio.id}`}
                          className="text-sm font-normal cursor-pointer flex-1"
                        >
                          {ejercicio.nombre}
                          {ejercicio.subtipo && (
                            <span className="text-xs text-muted-foreground ml-2">
                              ({ejercicio.subtipo})
                            </span>
                          )}
                        </Label>
                        {selected && selectedData && (
                          <span className="text-xs text-muted-foreground">
                            #{selectedData.orden}
                          </span>
                        )}
                      </div>

                      {selected && (
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-2 pl-7">
                          <div className="space-y-1">
                            <Label className="text-xs text-muted-foreground">
                              Duracion (min)
                            </Label>
                            <Input
                              type="number"
                              min="1"
                              placeholder="--"
                              className="h-8 text-xs"
                              value={selectedData?.duracionMinutos ?? ''}
                              onChange={(e) =>
                                handleMetadataChange(ejercicio.id, 'duracionMinutos', e.target.value)
                              }
                            />
                          </div>
                          <div className="space-y-1">
                            <Label className="text-xs text-muted-foreground">
                              Repeticiones
                            </Label>
                            <Input
                              type="number"
                              min="1"
                              placeholder="--"
                              className="h-8 text-xs"
                              value={selectedData?.repeticiones ?? ''}
                              onChange={(e) =>
                                handleMetadataChange(ejercicio.id, 'repeticiones', e.target.value)
                              }
                            />
                          </div>
                          <div className="space-y-1">
                            <Label className="text-xs text-muted-foreground">Series</Label>
                            <Input
                              type="number"
                              min="1"
                              placeholder="--"
                              className="h-8 text-xs"
                              value={selectedData?.series ?? ''}
                              onChange={(e) =>
                                handleMetadataChange(ejercicio.id, 'series', e.target.value)
                              }
                            />
                          </div>
                          <div className="space-y-1">
                            <Label className="text-xs text-muted-foreground">
                              Intensidad (%)
                            </Label>
                            <Input
                              type="number"
                              min="0"
                              max="100"
                              placeholder="--"
                              className="h-8 text-xs"
                              value={selectedData?.intensidad ?? ''}
                              onChange={(e) =>
                                handleMetadataChange(ejercicio.id, 'intensidad', e.target.value)
                              }
                            />
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </CollapsibleContent>
            </Collapsible>
          );
        })}

        {TIPOS_ORDEN.every(
          (tipo) =>
            (catalogoPorTipo.data[tipo as keyof typeof catalogoPorTipo.data] || []).length === 0
        ) && (
          <p className="text-sm text-muted-foreground text-center py-4">
            No hay ejercicios disponibles en el catalogo
          </p>
        )}
      </CardContent>
    </Card>
  );
}
