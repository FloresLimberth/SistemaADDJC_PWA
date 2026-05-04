'use client';

import { useState, useMemo } from 'react';
import { Plus } from 'lucide-react';
import Link from 'next/link';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { CalendarioGeneral } from './calendario-general';
import { CalendarioMesociclos } from './calendario-mesociclos';
import { CalendarioMicrociclos } from './calendario-microciclos';
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
  const defaultId = getMacrocicloDefaultId(macrociclos);
  const [macrocicloSeleccionadoId, setMacrocicloSeleccionadoId] = useState<string | null>(defaultId);
  const [tabActivo, setTabActivo] = useState('general');

  // Macrociclo seleccionado
  const macrocicloActivo = useMemo(
    () => macrociclos.find((m) => m.id === macrocicloSeleccionadoId) || null,
    [macrociclos, macrocicloSeleccionadoId],
  );

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

  // Boton de creacion dinamico segun tab
  const botonCrear = puedeEditar
    ? getBotonCrear(tabActivo, basePlanificacion, macrocicloSeleccionadoId)
    : null;

  return (
    <div className="space-y-6">
      {/* Selector de macrociclo + boton crear */}
      <div className="flex items-center justify-between">
        {/* Selector de macrociclo (solo si hay mas de 1) */}
        {macrociclos.length > 1 ? (
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

        {/* Boton de crear dinamico */}
        {botonCrear && (
          <Button asChild>
            <Link href={botonCrear.href}>
              <Plus className="mr-2 h-4 w-4" />
              {botonCrear.label}
            </Link>
          </Button>
        )}
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
      </Tabs>
    </div>
  );
}
