import { fetchCatalogoEjercicios } from '@/features/algoritmo/actions/fetch-catalogo';
import { EjerciciosTable } from '@/features/algoritmo/components/ejercicios-table';

export default async function CatalogoEjerciciosCTPage() {
  const catalogoData = await fetchCatalogoEjercicios();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Catalogo de Ejercicios</h1>
        <p className="text-muted-foreground">
          Ejercicios disponibles para la planificacion de sesiones
        </p>
      </div>

      {catalogoData ? (
        <EjerciciosTable dataInicial={catalogoData} />
      ) : (
        <p className="text-center text-muted-foreground py-8">
          No se pudo cargar el catalogo de ejercicios.
        </p>
      )}
    </div>
  );
}
