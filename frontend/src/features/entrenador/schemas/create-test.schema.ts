import { z } from 'zod';

// Schema para crear un test fisico
// Basado en: backend/src/modules/testing/dto/create-test-fisico.dto.ts
// IMPORTANTE: sesionId es REQUERIDO. fechaTest y microcicloId se derivan de la sesion en el backend
export const createTestSchema = z.object({
  // IDs de relaciones
  atletaId: z.coerce.number().int().positive('El ID del atleta debe ser positivo'),

  // sesionId es REQUERIDO - la fecha y microciclo se derivan automaticamente de la sesion
  sesionId: z.coerce.number().int().positive('Debes seleccionar una sesion'),

  // Asistencia
  asistio: z.coerce.boolean().default(true),

  motivoInasistencia: z.string().max(500, 'El motivo no puede exceder 500 caracteres').optional(),

  // Tests de fuerza maxima (1RM) - kg
  pressBanca: z.union([
    z.coerce.number().min(0, 'Press banca no puede ser negativo').max(300, 'Press banca no puede exceder 300 kg'),
    z.literal(''),
  ]).optional(),

  tiron: z.union([
    z.coerce.number().min(0, 'Tiron no puede ser negativo').max(400, 'Tiron no puede exceder 400 kg'),
    z.literal(''),
  ]).optional(),

  sentadilla: z.union([
    z.coerce.number().min(0, 'Sentadilla no puede ser negativo').max(400, 'Sentadilla no puede exceder 400 kg'),
    z.literal(''),
  ]).optional(),

  // Tests de fuerza resistencia - repeticiones (enteros)
  barraFija: z.union([
    z.coerce.number().int('Barra fija debe ser entero').min(0, 'Barra fija no puede ser negativo').max(100, 'Barra fija no puede exceder 100'),
    z.literal(''),
  ]).optional(),

  paralelas: z.union([
    z.coerce.number().int('Paralelas debe ser entero').min(0, 'Paralelas no puede ser negativo').max(100, 'Paralelas no puede exceder 100'),
    z.literal(''),
  ]).optional(),

  // Tests de resistencia aerobica
  navettePalier: z.union([
    z.coerce.number().min(0, 'Navette palier no puede ser negativo').max(20, 'Navette palier no puede exceder 20'),
    z.literal(''),
  ]).optional(),

  test1500m: z.string()
    .max(5, 'Formato invalido para test 1500m')
    .regex(/^([0-5]?\d):([0-5]\d)$/, {
      message: 'Formato invalido. Usa MM:SS (ej: 05:30)',
    })
    .optional()
    .or(z.literal('')),

  // Observaciones
  observaciones: z.string().max(1000, 'Las observaciones no pueden exceder 1000 caracteres').optional(),

  condicionesTest: z.string().max(500, 'Las condiciones del test no pueden exceder 500 caracteres').optional(),
}).refine(
  (data) => {
    // Si no asistio, no se requieren tests
    if (!data.asistio) {
      return true;
    }

    // Si asistio, al menos un test debe tener valor
    const hasPressBanca = data.pressBanca !== undefined && data.pressBanca !== '';
    const hasTiron = data.tiron !== undefined && data.tiron !== '';
    const hasSentadilla = data.sentadilla !== undefined && data.sentadilla !== '';
    const hasBarraFija = data.barraFija !== undefined && data.barraFija !== '';
    const hasParalelas = data.paralelas !== undefined && data.paralelas !== '';
    const hasNavette = data.navettePalier !== undefined && data.navettePalier !== '';
    const hasTest1500 = data.test1500m !== undefined && data.test1500m !== '';

    return hasPressBanca || hasTiron || hasSentadilla ||
           hasBarraFija || hasParalelas || hasNavette || hasTest1500;
  },
  {
    message: 'Debes completar al menos un tipo de test',
    path: ['_form'],
  }
).refine(
  (data) => {
    // Si no asistio, motivoInasistencia es requerido
    if (!data.asistio && (!data.motivoInasistencia || data.motivoInasistencia.trim() === '')) {
      return false;
    }
    return true;
  },
  {
    message: 'Debes indicar el motivo de inasistencia',
    path: ['motivoInasistencia'],
  }
);

export type CreateTestInput = z.infer<typeof createTestSchema>;

// Tipo para enviar al backend (limpiando strings vacios)
// NOTA: fechaTest y microcicloId se derivan de la sesion en el backend
export type CreateTestPayload = {
  atletaId: number;
  sesionId: number;
  asistio: boolean;
  motivoInasistencia?: string;
  pressBanca?: number;
  tiron?: number;
  sentadilla?: number;
  barraFija?: number;
  paralelas?: number;
  navettePalier?: number;
  test1500m?: string;
  observaciones?: string;
  condicionesTest?: string;
};
