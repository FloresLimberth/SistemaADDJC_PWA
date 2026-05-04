import { DiaSemana, TipoSesion, Turno, TipoPlanificacion, CreadoPor } from '@prisma/client';

export interface SesionResponseDto {
  id: string; // BigInt → string
  microcicloId: string; // BigInt → string
  fecha: Date;
  diaSemana: DiaSemana;
  numeroSesion: number;
  tipoSesion: TipoSesion;
  turno: Turno;
  tipoPlanificacion: TipoPlanificacion;
  sesionBaseId: string | null; // BigInt → string
  creadoPor: CreadoPor;
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
  aprobado: boolean;
  perfilUtilizado: string | null;
  justificacionAlgoritmo: string | null;
  createdAt: Date;
  updatedAt: Date;
  microciclo?: {
    id: string;
    codigoMicrociclo: string;
    fechaInicio: Date;
    fechaFin: Date;
  };
}
