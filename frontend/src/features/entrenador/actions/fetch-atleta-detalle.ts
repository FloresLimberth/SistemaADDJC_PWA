'use server';

import { cookies } from 'next/headers';
import { z } from 'zod';
import { atletaDetalleSchema, AtletaDetalle } from '../types/entrenador.types';
import {
  testFisicoSchema,
  registroPostEntrenamientoSchema,
  dolenciaSchema,
  microcicloSchema,
  TestFisico,
  RegistroPostEntrenamiento,
  Dolencia,
  Microciclo,
} from '@/features/atleta/types/atleta.types';

// Tipo para la respuesta completa del detalle de un atleta
export interface AtletaDetalleCompleto {
  atleta: AtletaDetalle;
  tests: TestFisico[];
  registros: RegistroPostEntrenamiento[];
  dolencias: Dolencia[];
  planificacion: Microciclo[];
}

// Server Action para obtener el detalle completo de un atleta
// Endpoint: GET /atletas/:id (verificacion de ownership por el backend)
export async function fetchAtletaDetalle(
  atletaId: string
): Promise<AtletaDetalleCompleto | null> {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get('accessToken')?.value;

    if (!token) {
      console.error('[fetchAtletaDetalle] No se encontro token');
      return null;
    }

    const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api';

    // Hacer peticiones en paralelo
    const [atletaResponse, testsResponse, registrosResponse, dolenciasResponse, planificacionResponse] =
      await Promise.all([
        // Detalle del atleta
        fetch(`${API_URL}/atletas/${atletaId}`, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
          cache: 'no-store',
        }).catch(() => null),

        // Tests del atleta
        fetch(`${API_URL}/tests-fisicos?atletaId=${atletaId}&page=1&limit=20`, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
          cache: 'no-store',
        }).catch(() => null),

        // Registros del atleta
        fetch(`${API_URL}/registros-post-entrenamiento?atletaId=${atletaId}&page=1&limit=20`, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
          cache: 'no-store',
        }).catch(() => null),

        // Dolencias del atleta
        fetch(`${API_URL}/dolencias?atletaId=${atletaId}&page=1&limit=50`, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
          cache: 'no-store',
        }).catch(() => null),

        // Microciclos asignados al atleta
        fetch(`${API_URL}/microciclos?atletaId=${atletaId}&page=1&limit=10`, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
          cache: 'no-store',
        }).catch(() => null),
      ]);

    // Verificar si el atleta existe
    if (!atletaResponse?.ok) {
      console.error('[fetchAtletaDetalle] Atleta no encontrado o sin permiso');
      return null;
    }

    const atletaData = await atletaResponse.json();

    // Parsear respuestas paginadas
    const testsResult = testsResponse?.ok ? await testsResponse.json() : { data: [] };
    const registrosResult = registrosResponse?.ok ? await registrosResponse.json() : { data: [] };
    const dolenciasResult = dolenciasResponse?.ok ? await dolenciasResponse.json() : { data: [] };
    const planificacionResult = planificacionResponse?.ok ? await planificacionResponse.json() : { data: [] };

    // Validar atleta
    const atletaValidation = atletaDetalleSchema.safeParse(atletaData);
    if (!atletaValidation.success) {
      console.error('[fetchAtletaDetalle] Error validando atleta:', atletaValidation.error.issues);
      if (process.env.NODE_ENV === 'development') {
        console.error('[fetchAtletaDetalle] Datos atleta:', JSON.stringify(atletaData, null, 2));
      }
    }

    // Validar tests
    const testsValidation = z.array(testFisicoSchema).safeParse(testsResult.data || []);
    if (!testsValidation.success) {
      console.error('[fetchAtletaDetalle] Error validando tests:', testsValidation.error.issues);
    }

    // Validar registros
    const registrosValidation = z.array(registroPostEntrenamientoSchema).safeParse(registrosResult.data || []);
    if (!registrosValidation.success) {
      console.error('[fetchAtletaDetalle] Error validando registros:', registrosValidation.error.issues);
    }

    // Validar dolencias
    const dolenciasValidation = z.array(dolenciaSchema).safeParse(dolenciasResult.data || []);
    if (!dolenciasValidation.success) {
      console.error('[fetchAtletaDetalle] Error validando dolencias:', dolenciasValidation.error.issues);
    }

    // Validar planificacion
    const planificacionValidation = z.array(microcicloSchema).safeParse(planificacionResult.data || []);
    if (!planificacionValidation.success) {
      console.error('[fetchAtletaDetalle] Error validando planificacion:', planificacionValidation.error.issues);
    }

    console.log('[fetchAtletaDetalle] Atleta:', atletaData.usuario?.nombreCompleto);
    console.log('[fetchAtletaDetalle] Tests:', (testsResult.data || []).length);
    console.log('[fetchAtletaDetalle] Registros:', (registrosResult.data || []).length);
    console.log('[fetchAtletaDetalle] Dolencias:', (dolenciasResult.data || []).length);

    return {
      atleta: atletaValidation.success ? atletaValidation.data : atletaData,
      tests: testsValidation.success ? testsValidation.data : (testsResult.data || []),
      registros: registrosValidation.success ? registrosValidation.data : (registrosResult.data || []),
      dolencias: dolenciasValidation.success ? dolenciasValidation.data : (dolenciasResult.data || []),
      planificacion: planificacionValidation.success ? planificacionValidation.data : (planificacionResult.data || []),
    };
  } catch (error) {
    console.error('[fetchAtletaDetalle] Error:', error);
    return null;
  }
}
