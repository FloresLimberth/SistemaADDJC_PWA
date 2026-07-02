import { Module } from '@nestjs/common';
import { UsersService } from './users.service';
import { UsersController } from './users.controller';
import { PrismaService } from '../../database/prisma.service';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [AuthModule], // Importamos AuthModule para usar AuthService (hashPassword)
  controllers: [UsersController],
  providers: [UsersService, PrismaService],
  exports: [UsersService], // Exportamos para que otros módulos puedan usarlo
})
export class UsersModule {}
