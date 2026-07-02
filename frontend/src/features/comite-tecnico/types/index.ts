// Re-exports de tipos para COMITE_TECNICO
// Reutilizamos tipos existentes de otros features cuando sea posible

// Tipos de atleta desde entrenador (ya definidos y validados)
export type { AtletaResumen, AtletaDetalle, SesionResumen } from '@/features/entrenador/types/entrenador.types';

export {
  atletaResumenSchema,
  atletaDetalleSchema,
  sesionResumenSchema,
} from '@/features/entrenador/types/entrenador.types';

// Tipos propios de comite-tecnico
export * from './dashboard.types';
export * from './planificacion.types';
