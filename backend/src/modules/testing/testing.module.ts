import { Module } from '@nestjs/common';
import { TestsFisicosController } from './controllers/tests-fisicos.controller';
import { TestsFisicosService } from './services/tests-fisicos.service';
import { CalculationsService } from './services/calculations.service';
import { DatabaseModule } from '../../database/database.module';

@Module({
  imports: [DatabaseModule],
  controllers: [TestsFisicosController],
  providers: [TestsFisicosService, CalculationsService],
  exports: [TestsFisicosService, CalculationsService], // Exportar para usar en Fase 6 (algoritmo)
})
export class TestingModule {}
