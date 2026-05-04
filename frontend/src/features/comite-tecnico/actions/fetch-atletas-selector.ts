'use server';

import { fetchAtletas } from './fetch-atletas';

// Obtener atletas como lista simple para dropdowns/selectores
export async function fetchAtletasParaSelector(): Promise<
  { id: string; nombreCompleto: string }[] | null
> {
  const result = await fetchAtletas({ limit: 100 });

  if (!result) return null;

  return result.data.map((atleta) => ({
    id: atleta.id,
    nombreCompleto: atleta.usuario.nombreCompleto,
  }));
}
