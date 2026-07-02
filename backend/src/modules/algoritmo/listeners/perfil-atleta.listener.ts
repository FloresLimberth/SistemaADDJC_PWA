// Listener que actualiza el perfil del atleta cuando se crea un test fisico
// Patron Event-Driven: el servicio de tests emite evento, este listener reacciona

import { Injectable, Logger } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { PrismaService } from '../../../database/prisma.service';
import { TEST_FISICO_EVENTS, TestFisicoCreatedPayload } from '../../../events/test-fisico.events';
import { clasificarPerfilAtleta, DatosTestParaPerfil } from '../services/perfil-atleta.service';

@Injectable()
export class PerfilAtletaListener {
  private readonly logger = new Logger(PerfilAtletaListener.name);

  constructor(private readonly prisma: PrismaService) {}

  @OnEvent(TEST_FISICO_EVENTS.CREATED)
  async handleTestFisicoCreated(payload: TestFisicoCreatedPayload): Promise<void> {
    this.logger.log(`Procesando nuevo test para atleta ${payload.atletaId}`);

    try {
      // Obtener edad del atleta
      const atleta = await this.prisma.atleta.findUnique({
        where: { id: payload.atletaId },
        select: {
          id: true,
          edad: true,
          perfilActual: true,
        },
      });

      if (!atleta) {
        this.logger.error(`Atleta ${payload.atletaId} no encontrado`);
        return;
      }

      // Preparar datos del test para calcular perfil
      const datosTest: DatosTestParaPerfil = {
        fechaTest: payload.fechaTest,
        pressBanca: payload.datosTest.pressBanca,
        tiron: payload.datosTest.tiron,
        sentadilla: payload.datosTest.sentadilla,
        barraFija: payload.datosTest.barraFija,
        paralelas: payload.datosTest.paralelas,
        navettePalier: payload.datosTest.navettePalier,
        navetteVO2max: payload.datosTest.navetteVO2max,
      };

      // Calcular nuevo perfil
      const resultado = clasificarPerfilAtleta(datosTest, atleta.edad || 18);
      const perfilAnterior = atleta.perfilActual;
      const perfilNuevo = resultado.perfil;

      // Actualizar perfil en la base de datos
      await this.prisma.atleta.update({
        where: { id: payload.atletaId },
        data: {
          perfilActual: perfilNuevo,
        },
      });

      // Log del cambio
      if (perfilAnterior !== perfilNuevo) {
        this.logger.log(
          `Perfil actualizado: ${perfilAnterior || 'NULL'} -> ${perfilNuevo} (${resultado.justificacion})`
        );
      } else {
        this.logger.log(`Perfil sin cambios: ${perfilNuevo}`);
      }
    } catch (error) {
      this.logger.error(`Error actualizando perfil del atleta ${payload.atletaId}:`, error);
    }
  }
}
