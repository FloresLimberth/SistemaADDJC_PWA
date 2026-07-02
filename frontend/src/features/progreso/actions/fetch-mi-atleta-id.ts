'use server';

import { getCurrentUserAction } from '@/app/actions/auth.actions';
import { cookies } from 'next/headers';

// Server Action para obtener el atletaId del usuario autenticado
// Utiliza /tests-fisicos/me y extrae el atletaId del primer registro
// Esto es necesario porque el JWT solo contiene userId, no atletaId
export async function fetchMiAtletaId(): Promise<string | null> {
  try {
    const userResult = await getCurrentUserAction();

    if (!userResult.success || !userResult.user) {
      return null;
    }

    const cookieStore = await cookies();
    const token = cookieStore.get('accessToken')?.value;

    if (!token) {
      return null;
    }

    const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api';

    // Usar /tests-fisicos/me con limit=1 para obtener solo un registro
    const response = await fetch(`${API_URL}/tests-fisicos/me`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      credentials: 'include',
    });

    if (!response.ok) {
      return null;
    }

    const data = await response.json();

    // Extraer atletaId del primer test
    if (Array.isArray(data) && data.length > 0 && data[0].atletaId) {
      return data[0].atletaId.toString();
    }

    // Si no hay tests, intentar con ranking
    const rankingResponse = await fetch(`${API_URL}/ranking/mi-ranking`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      credentials: 'include',
    });

    if (rankingResponse.ok) {
      const rankingData = await rankingResponse.json();
      if (rankingData?.atleta?.id) {
        return rankingData.atleta.id.toString();
      }
    }

    return null;
  } catch (error) {
    console.error('[fetchMiAtletaId] Error:', error);
    return null;
  }
}
