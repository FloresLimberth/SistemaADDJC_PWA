import { Injectable } from '@nestjs/common';
import { PrismaService } from './database/prisma.service';

@Injectable()
export class AppService {
  constructor(private readonly prisma: PrismaService) {}

  // Informacion basica del servidor
  getInfo() {
    return {
      app: 'Sistema ADDJC - API Backend',
      version: '1.0.0',
      status: 'running',
      timestamp: new Date().toISOString(),
      environment: process.env.NODE_ENV || 'development',
    };
  }

  // Health check simple del servidor
  getHealth() {
    return {
      status: 'ok',
      uptime: process.uptime(),
      timestamp: new Date().toISOString(),
    };
  }

  // Health check de la conexion a la base de datos
  async getDatabaseHealth() {
    try {
      // Ejecutar una query simple para verificar conexion
      await this.prisma.$queryRaw`SELECT 1`;
      return {
        status: 'ok',
        database: 'connected',
        timestamp: new Date().toISOString(),
      };
    } catch (error) {
      return {
        status: 'error',
        database: 'disconnected',
        error: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date().toISOString(),
      };
    }
  }

  // Estadisticas del pool de conexiones
  getPoolStats() {
    const stats = this.prisma.getPoolStats();
    return {
      status: 'ok',
      pool: stats,
      utilizationPercent: ((stats.total - stats.idle) / stats.max) * 100,
      timestamp: new Date().toISOString(),
    };
  }
}
