import type { EntrenadorResumen } from '../../types/planificacion.types';
import { EntrenadorCard } from './entrenador-card';
import { UserCog } from 'lucide-react';

interface EntrenadoresListProps {
  entrenadores: EntrenadorResumen[];
}

// Lista de entrenadores para COMITE_TECNICO
export function EntrenadoresList({ entrenadores }: EntrenadoresListProps) {
  if (entrenadores.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <UserCog className="h-12 w-12 text-muted-foreground mb-4" />
        <h3 className="text-lg font-medium">No hay entrenadores registrados</h3>
        <p className="text-muted-foreground mt-1">
          Los entrenadores apareceran aqui cuando se registren en el sistema.
        </p>
      </div>
    );
  }

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      {entrenadores.map((entrenador) => (
        <EntrenadorCard key={entrenador.id} entrenador={entrenador} />
      ))}
    </div>
  );
}
