import { fetchMisAtletas } from '@/features/entrenador/actions/fetch-mis-atletas';
import { EstadisticasEntrenadorView } from './estadisticas-entrenador-view';

export default async function EstadisticasEntrenadorPage() {
  // Obtener lista de atletas asignados al entrenador
  const atletasResult = await fetchMisAtletas({ limit: 100 });

  const atletas = (atletasResult?.data || []).map((a) => ({
    id: a.id,
    nombreCompleto: a.usuario.nombreCompleto,
    categoriaPeso: a.categoriaPeso,
    club: a.club,
  }));

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Estadisticas de Mis Atletas</h1>
        <p className="text-muted-foreground">
          Analiza el bienestar, rendimiento y evolucion de tus atletas asignados
        </p>
      </div>

      <EstadisticasEntrenadorView atletas={atletas} />
    </div>
  );
}
