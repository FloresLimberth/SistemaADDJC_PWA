import type { Macrociclo } from '@/features/comite-tecnico/types/planificacion.types';
import { MacrocicloCard } from './macrociclo-card';
import { Calendar } from 'lucide-react';

interface MacrociclosListProps {
  macrociclos: Macrociclo[];
}

// Lista de macrociclos para ENTRENADOR (solo lectura)
export function MacrociclosList({ macrociclos }: MacrociclosListProps) {
  if (macrociclos.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <Calendar className="h-12 w-12 text-muted-foreground mb-4" />
        <h3 className="text-lg font-medium">No hay macrociclos</h3>
        <p className="text-muted-foreground mt-1">
          Aun no hay macrociclos creados para visualizar.
        </p>
      </div>
    );
  }

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      {macrociclos.map((macrociclo) => (
        <MacrocicloCard key={macrociclo.id} macrociclo={macrociclo} />
      ))}
    </div>
  );
}
