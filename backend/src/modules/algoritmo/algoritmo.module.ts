import { Module } from '@nestjs/common';
import { DatabaseModule } from '../../database/database.module';
import { AuthModule } from '../auth/auth.module';
import { PrismaService } from '../../database/prisma.service';
import { CatalogoEjerciciosService } from './services/catalogo-ejercicios.service';
import { AlertasSistemaService } from './services/alertas-sistema.service';
import { RankingAtletasService } from './services/ranking-atletas.service';
import { RankingController } from './controllers/ranking.controller';
import { NotificacionesController } from './controllers/notificaciones.controller';
import { NotificacionesService } from './services/notificaciones.service';
import { NotificacionesCronService } from './services/notificaciones-cron.service';
import { AnalisisRendimientoService } from './services/analisis-rendimiento.service';
import { AnalisisRendimientoController } from './controllers/analisis-rendimiento.controller';
import { CatalogoEjerciciosController } from './controllers/catalogo-ejercicios.controller';
import { PerfilAtletaListener } from './listeners/perfil-atleta.listener';

// Modulo de Algoritmo de Recomendaciones
// Incluye:
// - Catalogo de ejercicios y filtrado
// - Sistema de alertas automaticas (fatiga, lesion, peso, desviacion)
// - Ranking de atletas para competencias
// - Notificaciones del sistema
// - Analisis de rendimiento por ejercicio con recomendaciones personalizadas
// - Listener para actualizar perfil del atleta cuando se crea un test fisico
@Module({
  imports: [DatabaseModule, AuthModule],
  controllers: [
    RankingController,
    NotificacionesController,
    AnalisisRendimientoController,
    CatalogoEjerciciosController,
  ],
  providers: [
    PrismaService,
    CatalogoEjerciciosService,
    AlertasSistemaService,
    RankingAtletasService,
    NotificacionesService,
    NotificacionesCronService,
    AnalisisRendimientoService,
    PerfilAtletaListener,
  ],
  exports: [
    CatalogoEjerciciosService,
    AlertasSistemaService,
    RankingAtletasService,
    NotificacionesService,
    AnalisisRendimientoService,
  ],
})
export class AlgoritmoModule {}
