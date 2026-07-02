import { z } from 'zod';

// Schema para un registro de actividad
export const actividadSchema = z.object({
  id: z.string(),
  usuarioId: z.string().nullable(),
  accion: z.string(),
  recurso: z.string().nullable(),
  recursoId: z.string().nullable(),
  ip: z.string(),
  userAgent: z.string(),
  exito: z.boolean(),
  createdAt: z.coerce.date(),
  usuario: z
    .object({
      id: z.string(),
      nombreCompleto: z.string(),
      email: z.string(),
      rol: z.string(),
    })
    .nullable(),
});

// Schema para lista paginada de actividades
export const actividadesListSchema = z.object({
  data: z.array(actividadSchema),
  meta: z.object({
    total: z.number(),
    page: z.number(),
    limit: z.number(),
    totalPages: z.number(),
  }),
});

// Tipos inferidos
export type Actividad = z.infer<typeof actividadSchema>;
export type ActividadesList = z.infer<typeof actividadesListSchema>;

// Mapeo de acciones a texto legible
export const ACCIONES_TEXTO: Record<string, string> = {
  LOGIN: 'Inicio de sesion',
  LOGOUT: 'Cierre de sesion',
  CREAR_USUARIO: 'Creo un usuario',
  EDITAR_USUARIO: 'Edito un usuario',
  DESACTIVAR_USUARIO: 'Desactivo un usuario',
  ELIMINAR_USUARIO: 'Elimino un usuario',
};

// Mapeo de recursos a texto legible
export const RECURSOS_TEXTO: Record<string, string> = {
  Usuario: 'Usuario',
  Atleta: 'Atleta',
  Entrenador: 'Entrenador',
  Macrociclo: 'Macrociclo',
  Mesociclo: 'Mesociclo',
  Microciclo: 'Microciclo',
  Sesion: 'Sesion',
};

// Funcion para formatear la accion
export function formatearAccion(accion: string): string {
  return ACCIONES_TEXTO[accion] || accion.replace(/_/g, ' ').toLowerCase();
}

// Funcion para formatear el recurso
export function formatearRecurso(recurso: string | null): string {
  if (!recurso) return '';
  return RECURSOS_TEXTO[recurso] || recurso;
}
