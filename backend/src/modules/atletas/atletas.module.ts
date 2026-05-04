import { Module } from '@nestjs/common';
import { AtletasService } from './atletas.service';
import { AtletasController } from './atletas.controller';
import { PrismaService } from '../../database/prisma.service';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [AuthModule], // Importamos AuthModule para usar AuthService (hashPassword)
  controllers: [AtletasController],
  providers: [AtletasService, PrismaService],
  exports: [AtletasService], // Exportamos para que otros modulos puedan usarlo
})
export class AtletasModule {}
