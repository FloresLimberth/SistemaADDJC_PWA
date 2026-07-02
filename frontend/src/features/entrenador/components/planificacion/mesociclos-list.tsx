import type { Mesociclo } from '@/features/comite-tecnico/types/planificacion.types';
import { MesocicloCard } from './mesociclo-card';
import { Layers } from 'lucide-react';

interface MesociclosListProps {
  mesociclos: Mesociclo[];
}

// Lista de mesociclos para ENTRENADOR (solo lectura)
export function MesociclosList({ mesociclos }: MesociclosListProps) {
  if (mesociclos.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <Layers className="h-12 w-12 text-muted-foreground mb-4" />
        <h3 className="text-lg font-medium">No hay mesociclos</h3>
        <p className="text-muted-foreground mt-1">
          Aun no hay mesociclos creados para visualizar.
        </p>
      </div>
    );
  }

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      {mesociclos.map((mesociclo) => (
        <MesocicloCard key={mesociclo.id} mesociclo={mesociclo} />
      ))}
    </div>
  );
}
