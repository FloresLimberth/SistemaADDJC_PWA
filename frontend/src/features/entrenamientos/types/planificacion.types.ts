// Tipos TypeScript basados EXACTAMENTE en lo que retorna el backend
// Fuente: backend/src/modules/planificacion/services/microciclos.service.ts:426-470
// Fuente: backend/src/modules/planificacion/services/sesiones.service.ts:334-374

// Tipo para la sesion resumida (dentro de microciclo)
export interface SesionResumida {
  id: string;
  fecha: Date;
  diaSemana: string;
  tipoSesion: string;
}

// Tipo para el mesociclo (dentro de microciclo)
export interface MesocicloResumido {
  id: string;
  nombre: string;
  etapa: string;
}

// Tipo para el microciclo completo (GET /api/microciclos)
export interface Microciclo {
  id: string;
  mesocicloId: string | null;
  codigoMicrociclo: string;
  fechaInicio: Date;
  fechaFin: Date;
  tipoMicrociclo: string;
  volumenTotal: number;
  intensidadPromedio: number;
  objetivoSemanal: string;
  observaciones: string | null;
  creadoPor: string;
  mediaVolumen: number | null;
  mediaIntensidad: number | null;
  sentidoVolumen: string | null;
  sentidoIntensidad: string | null;
  createdAt: Date;
  updatedAt: Date;
  mesociclo?: MesocicloResumido;
  sesiones?: SesionResumida[];
}

// Tipo para el microciclo resumido (dentro de sesion)
export interface MicrocicloResumido {
  id: string;
  codigoMicrociclo: string;
  fechaInicio: Date;
  fechaFin: Date;
}

// Tipo para la sesion completa (GET /api/sesiones/:id)
export interface Sesion {
  id: string;
  microcicloId: string;
  fecha: Date;
  diaSemana: string;
  numeroSesion: number;
  tipoSesion: string;
  turno: string;
  tipoPlanificacion: string;
  sesionBaseId: string | null;
  creadoPor: string;
  duracionPlanificada: number;
  volumenPlanificado: number | null;
  intensidadPlanificada: number | null;
  volumenReal: number | null;
  intensidadReal: number | null;
  contenidoFisico: string | null;
  contenidoTecnico: string | null;
  contenidoTactico: string | null;
  calentamiento: string | null;
  partePrincipal: string | null;
  vueltaCalma: string | null;
  observaciones: string | null;
  materialNecesario: string | null;
  // Campos del algoritmo (schema.prisma lineas 192-194)
  aprobado?: boolean;
  perfilUtilizado?: string | null;
  justificacionAlgoritmo?: string | null;
  createdAt: Date;
  updatedAt: Date;
  microciclo?: MicrocicloResumido;
}
