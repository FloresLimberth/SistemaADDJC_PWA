import { Injectable } from '@nestjs/common';
import { DiaSemana, TipoSesion, Turno, TipoPlanificacion, CreadoPor } from '@prisma/client';

export interface SesionTemplate {
  numeroSesion: number;
  diaSemana: DiaSemana;
  fecha: Date;
  tipoSesion: TipoSesion;
  turno: Turno;
  duracionPlanificada: number;
  volumenPlanificado: number;
  intensidadPlanificada: number;
  contenidoFisico: string;
  contenidoTecnico: string;
  contenidoTactico: string;
  tipoPlanificacion: TipoPlanificacion;
  creadoPor: CreadoPor;
}

@Injectable()
export class SesionFactory {
  // Genera 7 sesiones para un microciclo basado en fechas
  // Patrón 3-1-2-1: 3 días carga + 1 recuperación + 2 carga + 1 recuperación
  // esSemanaDeTeste: Si es true, el viernes sera sesion tipo TEST
  generateWeeklySessions(
    fechaInicio: Date,
    objetivoSemanal: string,
    esSemanaDeTeste: boolean = false
  ): SesionTemplate[] {
    const sessions: SesionTemplate[] = [];
    const diasSemana: DiaSemana[] = [
      'LUNES',
      'MARTES',
      'MIERCOLES',
      'JUEVES',
      'VIERNES',
      'SABADO',
      'DOMINGO',
    ];

    // Patrón de carga/recuperación basado en documentación (3-1-2-1)
    // Lunes, Martes: Carga (alta intensidad)
    // Miércoles: Recuperación
    // Jueves, Viernes: Carga
    // Sábado: Posible competencia o carga moderada
    // Domingo: Recuperación/Descanso

    for (let i = 0; i < 7; i++) {
      // Usar metodos UTC para evitar bug de timezone con campos DATE de Prisma
      // Ref: https://github.com/prisma/prisma/issues/7490
      const fecha = new Date(fechaInicio);
      fecha.setUTCDate(fecha.getUTCDate() + i);

      const diaSemana = diasSemana[i];
      const numeroSesion = i + 1;

      // Determinar tipo de sesion basado en el patron
      let tipoSesion: TipoSesion;
      let duracionPlanificada: number;
      let volumenPlanificado: number;
      let intensidadPlanificada: number;

      switch (diaSemana) {
        case 'LUNES':
        case 'MARTES':
          // Dias de carga alta
          tipoSesion = 'ENTRENAMIENTO';
          duracionPlanificada = 120; // 2 horas
          volumenPlanificado = 80;
          intensidadPlanificada = 75;
          break;

        case 'MIERCOLES':
          // Dia de recuperacion
          tipoSesion = 'RECUPERACION';
          duracionPlanificada = 60; // 1 hora
          volumenPlanificado = 40;
          intensidadPlanificada = 40;
          break;

        case 'JUEVES':
          // Dia de carga moderada-alta
          tipoSesion = 'ENTRENAMIENTO';
          duracionPlanificada = 100; // 1h 40min
          volumenPlanificado = 70;
          intensidadPlanificada = 70;
          break;

        case 'VIERNES':
          // Si es semana de test, el viernes es sesion de evaluacion fisica
          if (esSemanaDeTeste) {
            tipoSesion = 'TEST';
            duracionPlanificada = 90; // 1h 30min para evaluaciones
            volumenPlanificado = 50;
            intensidadPlanificada = 100; // Test al maximo esfuerzo
          } else {
            tipoSesion = 'ENTRENAMIENTO';
            duracionPlanificada = 100;
            volumenPlanificado = 70;
            intensidadPlanificada = 70;
          }
          break;

        case 'SABADO':
          // Posible competencia o entrenamiento moderado
          tipoSesion = 'ENTRENAMIENTO';
          duracionPlanificada = 90; // 1h 30min
          volumenPlanificado = 60;
          intensidadPlanificada = 65;
          break;

        case 'DOMINGO':
          // Dia de descanso/recuperacion
          tipoSesion = 'DESCANSO';
          duracionPlanificada = 0;
          volumenPlanificado = 0;
          intensidadPlanificada = 0;
          break;

        default:
          tipoSesion = 'ENTRENAMIENTO';
          duracionPlanificada = 90;
          volumenPlanificado = 60;
          intensidadPlanificada = 60;
      }

      sessions.push({
        numeroSesion,
        diaSemana,
        fecha,
        tipoSesion,
        turno: 'COMPLETO',
        duracionPlanificada,
        volumenPlanificado,
        intensidadPlanificada,
        contenidoFisico: `Contenido fisico para ${diaSemana} - ${objetivoSemanal}`,
        contenidoTecnico: `Contenido tecnico para ${diaSemana}`,
        contenidoTactico: `Contenido tactico para ${diaSemana}`,
        tipoPlanificacion: 'INICIAL',
        creadoPor: 'SISTEMA_ALGORITMO',
      });
    }

    return sessions;
  }
}
