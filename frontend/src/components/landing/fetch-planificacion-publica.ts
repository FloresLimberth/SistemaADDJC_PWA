'use server';

// Datos publicos de planificacion (sin autenticacion)
// Para la landing page - solo muestra mesociclos con nombre y etapa

interface MesocicloPublico {
  nombre: string;
  etapa: string;
  fechaInicio: string;
  fechaFin: string;
}

interface MacrocicloPublico {
  nombre: string;
  temporada: string;
  fechaInicio: string;
  fechaFin: string;
}

export interface PlanificacionPublica {
  macrociclo: MacrocicloPublico | null;
  mesociclos: MesocicloPublico[];
}

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api';

export async function fetchPlanificacionPublica(): Promise<PlanificacionPublica> {
  try {
    const response = await fetch(`${API_URL}/public/planificacion`, {
      next: { revalidate: 15 },
    });

    if (!response.ok) {
      return { macrociclo: null, mesociclos: [] };
    }

    return await response.json();
  } catch {
    return { macrociclo: null, mesociclos: [] };
  }
}
