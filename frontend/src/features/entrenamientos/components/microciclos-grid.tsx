'use client';

import { Microciclo } from '../types/planificacion.types';
import { MicrocicloCard } from './microciclo-card';

interface MicrociclosGridProps {
  microciclos: Microciclo[];
}

export function MicrociclosGrid({ microciclos }: MicrociclosGridProps) {
  if (microciclos.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground">
          No tienes microciclos asignados actualmente.
        </p>
      </div>
    );
  }

  return (
    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
      {microciclos.map((microciclo) => (
        <MicrocicloCard key={microciclo.id} microciclo={microciclo} />
      ))}
    </div>
  );
}
