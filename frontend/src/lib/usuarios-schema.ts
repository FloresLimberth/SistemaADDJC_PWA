import { z } from 'zod';
import { CategoriaPesoValues } from '@/types/enums';

// Enum de roles (DEBE coincidir EXACTAMENTE con Prisma RolUsuario)
export const rolesUsuario = [
  'ADMINISTRADOR',
  'COMITE_TECNICO',
  'ENTRENADOR',
  'ATLETA',
] as const;

export type RolUsuario = (typeof rolesUsuario)[number];

// Schema para crear usuario (coincide con CreateUserDto del backend)
export const crearUsuarioSchema = z.object({
  ci: z
    .string()
    .min(5, 'CI debe tener al menos 5 caracteres')
    .max(20, 'CI no puede tener más de 20 caracteres')
    .trim(),
  nombreCompleto: z
    .string()
    .min(3, 'Nombre debe tener al menos 3 caracteres')
    .max(255, 'Nombre no puede tener más de 255 caracteres')
    .trim(),
  email: z
    .string()
    .email('Email inválido')
    .max(255, 'Email no puede tener más de 255 caracteres')
    .toLowerCase()
    .trim(),
  contrasena: z
    .string()
    .min(8, 'Contraseña debe tener al menos 8 caracteres')
    .max(100, 'Contraseña no puede tener más de 100 caracteres'),
  rol: z.enum(rolesUsuario),
  estado: z.boolean().optional(),
});

// Schema para editar usuario (coincide con UpdateUserDto del backend)
// Todos los campos son opcionales excepto el ID
export const editarUsuarioSchema = z.object({
  id: z.string(),
  ci: z
    .string()
    .min(5, 'CI debe tener al menos 5 caracteres')
    .max(20, 'CI no puede tener más de 20 caracteres')
    .trim()
    .optional(),
  nombreCompleto: z
    .string()
    .min(3, 'Nombre debe tener al menos 3 caracteres')
    .max(255, 'Nombre no puede tener más de 255 caracteres')
    .trim()
    .optional(),
  email: z
    .string()
    .email('Email inválido')
    .max(255, 'Email no puede tener más de 255 caracteres')
    .toLowerCase()
    .trim()
    .optional(),
  contrasena: z
    .string()
    .min(8, 'Contraseña debe tener al menos 8 caracteres')
    .max(100, 'Contraseña no puede tener más de 100 caracteres')
    .optional(),
  rol: z.enum(rolesUsuario).optional(),
  estado: z.boolean().optional(),
});

// Schema para el formulario (contraseña opcional: vacio o min 8 caracteres)
export const usuarioFormSchema = z.object({
  ci: z
    .string()
    .min(5, 'CI debe tener al menos 5 caracteres')
    .max(20, 'CI no puede tener más de 20 caracteres')
    .trim(),
  nombreCompleto: z
    .string()
    .min(3, 'Nombre debe tener al menos 3 caracteres')
    .max(255, 'Nombre no puede tener más de 255 caracteres')
    .trim(),
  email: z
    .string()
    .email('Email inválido')
    .max(255, 'Email no puede tener más de 255 caracteres')
    .toLowerCase()
    .trim(),
  // Contraseña: vacio es valido, si tiene contenido debe tener min 8 caracteres
  contrasena: z
    .string()
    .refine((val) => val === '' || val.length >= 8, {
      message: 'Contraseña debe tener al menos 8 caracteres',
    })
    .refine((val) => val === '' || val.length <= 100, {
      message: 'Contraseña no puede tener más de 100 caracteres',
    }),
  rol: z.enum(rolesUsuario),
  estado: z.boolean().optional(),
});

// Schema para respuesta del servidor (coincide con UserResponseDto)
export const usuarioResponseSchema = z.object({
  id: z.string(),
  ci: z.string(),
  nombreCompleto: z.string(),
  email: z.string().email(),
  rol: z.enum(rolesUsuario),
  estado: z.boolean(),
  fechaRegistro: z.coerce.date(),
  ultimoAcceso: z.coerce.date().nullable(),
  createdAt: z.coerce.date(),
  updatedAt: z.coerce.date(),
});

export const usuariosListSchema = z.object({
  data: z.array(usuarioResponseSchema),
  meta: z.object({
    total: z.number(),
    page: z.number(),
    limit: z.number(),
    totalPages: z.number(),
  }),
});

// Schema para estadisticas de usuarios (coincide con UsersService.getStats)
export const usuariosStatsSchema = z.object({
  total: z.number(),
  porRol: z.object({
    ADMINISTRADOR: z.number(),
    COMITE_TECNICO: z.number(),
    ENTRENADOR: z.number(),
    ATLETA: z.number(),
  }),
  activos: z.number(),
  inactivos: z.number(),
});

// Schema para crear ATLETA desde el administrador (solo campos obligatorios)
export const crearAtletaAdminSchema = z.object({
  // Datos del usuario
  ci: z.string().min(5).max(20).trim(),
  nombreCompleto: z.string().min(3).max(255).trim(),
  email: z.string().email().max(255).toLowerCase().trim(),
  contrasena: z.string().min(8).max(100),

  // Datos del atleta (solo obligatorios)
  municipio: z.string().min(1, 'Municipio es requerido').max(100),
  club: z.string().min(1, 'Club es requerido').max(100),
  categoria: z.string().min(1, 'Categoría es requerida').max(50),
  fechaNacimiento: z.string().min(1, 'Fecha de nacimiento es requerida'),
  edad: z.coerce.number().int().min(5, 'Edad mínima es 5 años'),
  categoriaPeso: z.enum(CategoriaPesoValues as [string, ...string[]], {
    message: 'Categoría de peso es requerida',
  }),
});

// Schema para crear ENTRENADOR desde el administrador (solo campos obligatorios)
export const crearEntrenadorAdminSchema = z.object({
  // Datos del usuario
  ci: z.string().min(5).max(20).trim(),
  nombreCompleto: z.string().min(3).max(255).trim(),
  email: z.string().email().max(255).toLowerCase().trim(),
  contrasena: z.string().min(8).max(100),

  // Datos del entrenador (solo obligatorios)
  municipio: z.string().min(1, 'Municipio es requerido').max(100),
});

// Tipos inferidos automáticamente
export type CrearUsuarioInput = z.infer<typeof crearUsuarioSchema>;
export type EditarUsuarioInput = z.infer<typeof editarUsuarioSchema>;
export type UsuarioFormInput = z.infer<typeof usuarioFormSchema>;
export type Usuario = z.infer<typeof usuarioResponseSchema>;
export type UsuariosList = z.infer<typeof usuariosListSchema>;
export type UsuariosStats = z.infer<typeof usuariosStatsSchema>;
export type CrearAtletaAdminInput = z.infer<typeof crearAtletaAdminSchema>;
export type CrearEntrenadorAdminInput = z.infer<
  typeof crearEntrenadorAdminSchema
>;
