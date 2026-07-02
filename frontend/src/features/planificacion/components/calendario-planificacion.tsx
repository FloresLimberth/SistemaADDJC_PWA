'use client';

import { useState, useMemo, useEffect } from 'react';
import { Plus, Edit } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { CalendarioGeneral } from './calendario-general';
import { CalendarioMesociclos } from './calendario-mesociclos';
import { CalendarioMicrociclos } from './calendario-microciclos';
import { DeleteMacrocicloButton } from '@/app/(dashboard)/comite-tecnico/planificacion/[id]/delete-button';
import type { Macrociclo, Mesociclo, MicrocicloType } from '@/features/comite-tecnico/types/planificacion.types';

interface CalendarioPlanificacionProps {
  macrociclos: Macrociclo[];
  mesociclos: Mesociclo[];
  microciclos: MicrocicloType[];
  basePlanificacion: string;
  baseSesiones: string;
  puedeEditar: boolean;
}

// Determina el macrociclo por defecto: primero EN_CURSO, luego PLANIFICADO
function getMacrocicloDefaultId(macrociclos: Macrociclo[]): string | null {
  const enCurso = macrociclos.find((m) => m.estado === 'EN_CURSO');
  if (enCurso) return enCurso.id;

  const planificado = macrociclos.find((m) => m.estado === 'PLANIFICADO');
  if (planificado) return planificado.id;

  return macrociclos[0]?.id || null;
}

// Configuracion del boton de creacion segun el tab activo
function getBotonCrear(
  tab: string,
  basePlanificacion: string,
  macrocicloId: string | null,
): { label: string; href: string } | null {
  switch (tab) {
    case 'general':
      return {
        label: 'Nuevo Macrociclo',
        href: `${basePlanificacion}/nuevo`,
      };
    case 'mesociclos':
      return {
        label: 'Nuevo Mesociclo',
        href: macrocicloId
          ? `${basePlanificacion}/mesociclos/nuevo?macrocicloId=${macrocicloId}`
          : `${basePlanificacion}/mesociclos/nuevo`,
      };
    case 'microciclos':
      return {
        label: 'Nuevo Microciclo',
        href: `${basePlanificacion}/microciclos/nuevo`,
      };
    case 'sin-asignar':
      // En el tab "sin asignar" tambien permitimos crear microciclos sueltos
      // Se crea sin macrocicloId ni mesocicloId; el form acepta esos campos como opcionales
      return {
        label: 'Nuevo Microciclo',
        href: `${basePlanificacion}/microciclos/nuevo`,
      };
    default:
      return null;
  }
}

export function CalendarioPlanificacion({
  macrociclos,
  mesociclos,
  microciclos,
  basePlanificacion,
  baseSesiones,
  puedeEditar,
}: CalendarioPlanificacionProps) {
  const router = useRouter();
  const defaultId = getMacrocicloDefaultId(macrociclos);
  const [macrocicloSeleccionadoId, setMacrocicloSeleccionadoId] = useState<string | null>(defaultId);
  const [tabActivo, setTabActivo] = useState('general');

  // Macrociclo seleccionado
  const macrocicloActivo = useMemo(
    () => macrociclos.find((m) => m.id === macrocicloSeleccionadoId) || null,
    [macrociclos, macrocicloSeleccionadoId],
  );

  // Si el macrociclo seleccionado ya no existe (ej. fue eliminado y router.refresh trajo
  // la nueva lista sin el), reasignar al default de la lista actual
  useEffect(() => {
    if (
      macrocicloSeleccionadoId &&
      !macrociclos.find((m) => m.id === macrocicloSeleccionadoId)
    ) {
      setMacrocicloSeleccionadoId(getMacrocicloDefaultId(macrociclos));
    }
  }, [macrociclos, macrocicloSeleccionadoId]);

  // Mesociclos del macrociclo seleccionado
  const mesociclosDelMacro = useMemo(
    () => macrocicloActivo
      ? mesociclos.filter((m) => m.macrocicloId === macrocicloActivo.id)
      : [],
    [mesociclos, macrocicloActivo],
  );

  // Microciclos de los mesociclos del macrociclo seleccionado
  const microciclosDelMacro = useMemo(() => {
    const ids = new Set(mesociclosDelMacro.map((m) => m.id));
    return microciclos.filter((mc) => mc.mesocicloId && ids.has(mc.mesocicloId));
  }, [microciclos, mesociclosDelMacro]);

  // Microciclos sueltos: los creados sin mesociclo padre (caso valido del modelo)
  // No dependen del macrociclo seleccionado en el dropdown porque no pertenecen a ninguno
  const microciclosSinMesociclo = useMemo(
    () => microciclos.filter((mc) => !mc.mesocicloId),
    [microciclos],
  );

  // Boton de creacion dinamico segun tab
  const botonCrear = puedeEditar
    ? getBotonCrear(tabActivo, basePlanificacion, macrocicloSeleccionadoId)
    : null;

  return (
    <div className="space-y-6">
      {/* Selector de macrociclo + boton crear */}
      <div className="flex items-center justify-between">
        {/* Selector de macrociclo (solo si hay mas de 1 y NO estamos en el tab sin-asignar
            porque los microciclos sueltos no pertenecen a ningun macrociclo) */}
        {macrociclos.length > 1 && tabActivo !== 'sin-asignar' ? (
          <div className="flex items-center gap-2">
            <label htmlFor="macrociclo-select" className="text-sm text-gray-500">
              Macrociclo:
            </label>
            <select
              id="macrociclo-select"
              value={macrocicloSeleccionadoId || ''}
              onChange={(e) => setMacrocicloSeleccionadoId(e.target.value || null)}
              className="text-sm font-medium text-gray-900 bg-white border border-gray-200 rounded-lg px-3 py-2 cursor-pointer"
            >
              {macrociclos.map((mac) => (
                <option key={mac.id} value={mac.id}>
                  {mac.nombre} ({mac.temporada})
                </option>
              ))}
            </select>
          </div>
        ) : (
          <div />
        )}

        {/* Botones de accion: Nuevo (siempre) + Editar/Eliminar del macrociclo seleccionado */}
        <div className="flex items-center gap-2">
          {botonCrear && (
            <Button asChild>
              <Link href={botonCrear.href}>
                <Plus className="mr-2 h-4 w-4" />
                {botonCrear.label}
              </Link>
            </Button>
          )}

          {/* Editar y Eliminar del macrociclo actualmente seleccionado en el dropdown.
              Se ocultan en el tab sin-asignar porque ahi no hay macrociclo de contexto. */}
          {puedeEditar && macrocicloActivo && tabActivo !== 'sin-asignar' && (
            <>
              <Button asChild variant="outline">
                <Link href={`${basePlanificacion}/${macrocicloActivo.id}/editar`}>
                  <Edit className="mr-2 h-4 w-4" />
                  Editar
                </Link>
              </Button>
              <DeleteMacrocicloButton
                macrocicloId={macrocicloActivo.id}
                macrocicloNombre={macrocicloActivo.nombre}
                onDeleteSuccess={() => {
                  // Limpiar la seleccion local; el useEffect reasignara al default
                  // cuando router.refresh traiga la lista nueva sin el eliminado
                  setMacrocicloSeleccionadoId(null);
                  router.refresh();
                }}
              />
            </>
          )}
        </div>
      </div>

      <Tabs
        defaultValue="general"
        className="space-y-6"
        onValueChange={setTabActivo}
      >
        <TabsList>
          <TabsTrigger value="general">General</TabsTrigger>
          <TabsTrigger value="mesociclos">Mesociclos</TabsTrigger>
          <TabsTrigger value="microciclos">Microciclos</TabsTrigger>
          <TabsTrigger value="sin-asignar">
            Sin asignar
            {microciclosSinMesociclo.length > 0 && (
              <span className="ml-2 inline-flex items-center justify-center rounded-full bg-amber-100 text-amber-700 text-[10px] font-semibold w-5 h-5">
                {microciclosSinMesociclo.length}
              </span>
            )}
          </TabsTrigger>
        </TabsList>

        <TabsContent value="general">
          <CalendarioGeneral
            macrociclo={macrocicloActivo}
            mesociclos={mesociclosDelMacro}
            basePlanificacion={basePlanificacion}
            puedeEditar={puedeEditar}
          />
        </TabsContent>

        <TabsContent value="mesociclos">
          <CalendarioMesociclos
            mesociclos={mesociclosDelMacro}
            microciclos={microciclosDelMacro}
            basePlanificacion={basePlanificacion}
            puedeEditar={puedeEditar}
          />
        </TabsContent>

        <TabsContent value="microciclos">
          <CalendarioMicrociclos
            microciclos={microciclosDelMacro}
            mesociclos={mesociclosDelMacro}
            basePlanificacion={basePlanificacion}
            baseSesiones={baseSesiones}
          />
        </TabsContent>

        <TabsContent value="sin-asignar">
          {microciclosSinMesociclo.length === 0 ? (
            <div className="text-center py-12 text-gray-500">
              <p className="font-medium">No hay microciclos sin asignar</p>
              <p className="text-sm mt-1">
                Todos los microciclos del sistema pertenecen a algun mesociclo.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="bg-amber-50 border border-amber-200 rounded-lg px-4 py-3">
                <p className="text-sm text-amber-800">
                  <span className="font-semibold">
                    Microciclos sueltos ({microciclosSinMesociclo.length})
                  </span>
                  : creados sin un mesociclo padre. No pertenecen a ningun macrociclo
                  de la jerarquia de planificacion.
                </p>
              </div>
              <CalendarioMicrociclos
                microciclos={microciclosSinMesociclo}
                mesociclos={[]}
                basePlanificacion={basePlanificacion}
                baseSesiones={baseSesiones}
              />
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
