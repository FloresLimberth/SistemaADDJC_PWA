import { z } from 'zod';
import { CategoriaPesoValues, MUNICIPIOS_CLUB, TODOS_LOS_CLUBES } from '@/types/enums';

// Schema para crear atleta
// Basado EXACTAMENTE en: backend/src/modules/atletas/dto/create-atleta.dto.ts

export const createAtletaSchema = z.object({
  // Datos del usuario (se crea automaticamente con rol ATLETA)
  ci: z
    .string()
    .min(5, 'CI debe tener al menos 5 caracteres')
    .max(20, 'CI no puede exceder 20 caracteres'),

  nombreCompleto: z
    .string()
    .min(3, 'Nombre debe tener al menos 3 caracteres')
    .max(255, 'Nombre no puede exceder 255 caracteres'),

  email: z
    .string()
    .email('Email invalido')
    .max(255, 'Email no puede exceder 255 caracteres'),

  contrasena: z
    .string()
    .min(8, 'Contrasena debe tener al menos 8 caracteres')
    .max(100, 'Contrasena no puede exceder 100 caracteres'),

  // Datos personales del atleta
  municipio: z.string().min(1, 'Municipio es requerido').max(100, 'Municipio no puede exceder 100 caracteres'),

  // Datos deportivos: municipio del club y club
  municipioClub: z.enum(MUNICIPIOS_CLUB as unknown as [string, ...string[]], {
    message: 'Municipio del club es requerido',
  }),

  club: z.enum(TODOS_LOS_CLUBES as unknown as [string, ...string[]], {
    message: 'Club es requerido',
  }),

  categoria: z.string().min(1, 'Categoria es requerida').max(50, 'Categoria no puede exceder 50 caracteres'),

  fechaNacimiento: z.string().min(1, 'Fecha de nacimiento es requerida'),

  edad: z.coerce.number().int().min(5, 'Edad minima es 5 anios'),

  // Campos opcionales
  direccion: z.string().optional(),

  telefono: z.string().max(50, 'Telefono no puede exceder 50 caracteres').optional(),

  entrenadorAsignadoId: z.string().optional(),

  categoriaPeso: z.enum(CategoriaPesoValues as [string, ...string[]], {
    message: 'Categoria de peso es requerida'
  }),

  pesoActual: z.coerce.number().positive('Peso actual debe ser positivo').optional(),
});

export type CreateAtletaInput = z.infer<typeof createAtletaSchema>;

// Schema para actualizar atleta
// Los campos club, categoria y categoriaPeso son OBLIGATORIOS
// Los demas campos son opcionales
export const updateAtletaSchema = z.object({
  // Campos obligatorios (siempre se envian desde el form de edicion)
  municipio: z.string().min(1, 'Municipio es requerido').max(100, 'Municipio no puede exceder 100 caracteres'),
  municipioClub: z.enum(MUNICIPIOS_CLUB as unknown as [string, ...string[]], {
    message: 'Municipio del club es requerido',
  }),
  club: z.enum(TODOS_LOS_CLUBES as unknown as [string, ...string[]], {
    message: 'Club es requerido',
  }),
  categoria: z.string().min(1, 'Categoria es requerida').max(50, 'Categoria no puede exceder 50 caracteres'),
  fechaNacimiento: z.string().min(1, 'Fecha de nacimiento es requerida'),
  edad: z.coerce.number().int().min(5, 'Edad minima es 5 anios'),
  categoriaPeso: z.enum(CategoriaPesoValues as [string, ...string[]], {
    message: 'Categoria de peso es requerida'
  }),

  // Campos opcionales
  direccion: z.string().optional(),
  telefono: z.string().max(50, 'Telefono no puede exceder 50 caracteres').optional(),
  entrenadorAsignadoId: z.string().optional(),
  pesoActual: z.coerce.number().positive('Peso actual debe ser positivo').optional(),

  // Estado del atleta (para activar/desactivar)
  estado: z.boolean().optional(),
});

export type UpdateAtletaInput = z.infer<typeof updateAtletaSchema>;
