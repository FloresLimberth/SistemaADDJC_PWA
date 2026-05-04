import { Module } from '@nestjs/common';
import { DatabaseModule } from '../../database/database.module';
import { AuthModule } from '../auth/auth.module';
import { EstadisticasController } from './estadisticas.controller';
import { EstadisticasService } from './estadisticas.service';

// Modulo de Estadisticas para graficos
// Provee endpoints optimizados para alimentar charts del frontend:
// - Bienestar temporal (RPE, sueno, animo, dolencias)
// - Intensidad planificada vs real (cumplimiento de sesiones)
@Module({
  imports: [DatabaseModule, AuthModule],
  controllers: [EstadisticasController],
  providers: [EstadisticasService],
  exports: [EstadisticasService],
})
export class EstadisticasModule {}
