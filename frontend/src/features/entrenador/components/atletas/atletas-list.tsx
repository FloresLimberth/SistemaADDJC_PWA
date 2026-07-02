import { AtletaResumen } from '../../types/entrenador.types';
import { AtletaCard } from './atleta-card';
import { Users } from 'lucide-react';

interface AtletasListProps {
  atletas: AtletaResumen[];
}

// Lista de atletas asignados al entrenador
export function AtletasList({ atletas }: AtletasListProps) {
  if (atletas.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <Users className="h-12 w-12 text-muted-foreground mb-4" />
        <h3 className="text-lg font-medium">No tienes atletas asignados</h3>
        <p className="text-muted-foreground mt-1">
          Contacta al administrador para que te asigne atletas.
        </p>
      </div>
    );
  }

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      {atletas.map((atleta) => (
        <AtletaCard key={atleta.id} atleta={atleta} />
      ))}
    </div>
  );
}
