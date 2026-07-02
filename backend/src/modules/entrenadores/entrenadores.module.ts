import { Module } from '@nestjs/common';
import { EntrenadoresService } from './entrenadores.service';
import { EntrenadoresController } from './entrenadores.controller';
import { PrismaService } from '../../database/prisma.service';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [AuthModule], // Importamos AuthModule para usar AuthService (hashPassword)
  controllers: [EntrenadoresController],
  providers: [EntrenadoresService, PrismaService],
  exports: [EntrenadoresService], // Exportamos para que otros modulos puedan usarlo
})
export class EntrenadoresModule {}
