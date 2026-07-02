import type { AtletaResumen } from '../../types';
import { AtletaCardCT } from './atleta-card-ct';
import { Users } from 'lucide-react';

interface AtletasListCTProps {
  atletas: AtletaResumen[];
}

// Lista de atletas para COMITE_TECNICO
export function AtletasListCT({ atletas }: AtletasListCTProps) {
  if (atletas.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <Users className="h-12 w-12 text-muted-foreground mb-4" />
        <h3 className="text-lg font-medium">No hay atletas registrados</h3>
        <p className="text-muted-foreground mt-1">
          Los atletas apareceran aqui cuando se registren en el sistema.
        </p>
      </div>
    );
  }

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      {atletas.map((atleta) => (
        <AtletaCardCT key={atleta.id} atleta={atleta} />
      ))}
    </div>
  );
}
