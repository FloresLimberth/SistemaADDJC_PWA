import type { MicrocicloType } from '@/features/comite-tecnico/types/planificacion.types';
import { MicrocicloCard } from './microciclo-card';
import { Calendar } from 'lucide-react';

interface MicrociclosListProps {
  microciclos: MicrocicloType[];
}

// Lista de microciclos para ENTRENADOR (solo lectura)
export function MicrociclosList({ microciclos }: MicrociclosListProps) {
  if (microciclos.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <Calendar className="h-12 w-12 text-muted-foreground mb-4" />
        <h3 className="text-lg font-medium">No hay microciclos</h3>
        <p className="text-muted-foreground mt-1">
          Aun no hay microciclos creados para visualizar.
        </p>
      </div>
    );
  }

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      {microciclos.map((microciclo) => (
        <MicrocicloCard key={microciclo.id} microciclo={microciclo} />
      ))}
    </div>
  );
}
