import { z } from 'zod';
import { CategoriaPesoValues } from '@/types/enums';

// ===================================
// TIPOS ESPECIFICOS DEL ROL ENTRENADOR
// ===================================

// Nota: Los tipos comunes (TestFisico, Dolencia, RegistroPostEntrenamiento, etc.)
// se reutilizan de @/features/atleta/types/atleta.types.ts

// ===================================
// ESTADISTICAS DEL DASHBOARD
// ===================================

// Estadisticas para el dashboard del entrenador
export interface EntrenadorDashboardStats {
  totalAtletas: number;
  testsEsteMes: number;
  registrosHoy: number;
  dolenciasActivas: number;
}

// Schema para validar respuesta del dashboard
export const entrenadorDashboardStatsSchema = z.object({
  totalAtletas: z.number().int().nonnegative(),
  testsEsteMes: z.number().int().nonnegative(),
  registrosHoy: z.number().int().nonnegative(),
  dolenciasActivas: z.number().int().nonnegative(),
});

// ===================================
// ATLETA RESUMEN (para listas)
// ===================================

// Schema para atleta en lista (version resumida)
// Basado en: backend/src/modules/atletas/dto/atleta-response.dto.ts
export const atletaResumenSchema = z.object({
  id: z.string(),
  usuarioId: z.string(),
  municipio: z.string(),
  municipioClub: z.string(),
  club: z.string(),
  categoria: z.string(),
  fechaNacimiento: z.coerce.date(),
  edad: z.number().int(),
  categoriaPeso: z.enum(CategoriaPesoValues as [string, ...string[]]),
  pesoActual: z.number().nullable(),
  perfilActual: z.string().nullable().optional(),

  // Datos del usuario asociado
  usuario: z.object({
    id: z.string(),
    ci: z.string(),
    nombreCompleto: z.string(),
    email: z.string(),
    estado: z.boolean(),
  }),

  // Campos calculados/agregados que el backend puede incluir
  // (depende de la query que se haga)
  ultimoTest: z.object({
    id: z.string(),
    fechaTest: z.coerce.date(),
  }).nullable().optional(),

  dolenciasActivasCount: z.number().int().nonnegative().optional(),

  // Entrenador asignado (para verificar que es del entrenador actual)
  entrenadorAsignado: z.object({
    id: z.string(),
    nombreCompleto: z.string(),
  }).nullable().optional(),
});

export type AtletaResumen = z.infer<typeof atletaResumenSchema>;

// ===================================
// ATLETA DETALLE (vista completa para el entrenador)
// ===================================

// Schema para atleta con toda la informacion
export const atletaDetalleSchema = atletaResumenSchema.extend({
  direccion: z.string().nullable(),
  telefono: z.string().nullable(),
  createdAt: z.coerce.date(),
  updatedAt: z.coerce.date(),
});

export type AtletaDetalle = z.infer<typeof atletaDetalleSchema>;

// ===================================
// SESION RESUMIDA (para selector en formularios)
// ===================================

// Schema para sesion en dropdown de formularios
export const sesionResumenSchema = z.object({
  id: z.string(),
  fecha: z.coerce.date(),
  numeroSesion: z.number().int(),
  tipoSesion: z.string(),
  microciclo: z.object({
    codigoMicrociclo: z.string(),
  }).optional(),
});

export type SesionResumen = z.infer<typeof sesionResumenSchema>;

// ===================================
// RESPUESTAS PAGINADAS
// ===================================

// Respuesta paginada de atletas
export const atletasListResponseSchema = z.object({
  data: z.array(atletaResumenSchema),
  meta: z.object({
    total: z.number().int(),
    page: z.number().int(),
    limit: z.number().int(),
    totalPages: z.number().int(),
  }),
});

export type AtletasListResponse = z.infer<typeof atletasListResponseSchema>;

// ===================================
// TIPOS PARA ACCIONES
// ===================================

// Respuesta al crear un test fisico
export interface CreateTestResponse {
  id: string;
  atletaId: string;
  fechaTest: Date;
  message?: string;
}

// Respuesta al crear un registro
export interface CreateRegistroResponse {
  id: string;
  atletaId: string;
  sesionId: string;
  fechaRegistro: Date;
  dolenciasCreadas?: number;
  message?: string;
}

// Respuesta al marcar dolencia como recuperada
export interface MarcarRecuperadoResponse {
  id: string;
  recuperado: boolean;
  fechaRecuperacion: Date;
  message?: string;
}
