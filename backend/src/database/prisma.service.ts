import { Injectable, OnModuleInit, OnModuleDestroy, Logger } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { Pool } from 'pg';

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(PrismaService.name);
  private readonly pool: Pool;

  constructor() {
    // Configuracion optimizada del pool de conexiones PostgreSQL
    const pool = new Pool({
      connectionString: process.env.DATABASE_URL,

      // Pool size: suficiente para 50+ usuarios concurrentes
      max: 15, // Maximo de conexiones
      min: 3, // Minimo de conexiones siempre activas

      // Timeouts optimizados
      idleTimeoutMillis: 30000, // 30s - Cerrar conexiones inactivas
      connectionTimeoutMillis: 2000, // 2s - Timeout al intentar conectar

      // Lifecycle - Rotar conexiones cada 1 hora (prevenir zombies)
      maxLifetimeSeconds: 3600,

      // Keep-alive TCP para detectar conexiones muertas
      keepAlive: true,
      keepAliveInitialDelayMillis: 10000,
    });

    // Event listeners para debugging (solo en desarrollo)
    if (process.env.NODE_ENV !== 'production') {
      pool.on('connect', () => {
        this.logger.debug(`Pool: Nueva conexion creada (total: ${pool.totalCount})`);
      });

      pool.on('acquire', () => {
        this.logger.debug(
          `Pool: Conexion adquirida (total: ${pool.totalCount}, idle: ${pool.idleCount})`
        );
      });

      pool.on('remove', () => {
        this.logger.debug(`Pool: Conexion removida (total: ${pool.totalCount})`);
      });
    }

    // Event listener de errores (siempre activo)
    pool.on('error', (err) => {
      this.logger.error('Pool: Error inesperado en conexion idle', err);
    });

    // Crear adapter de Prisma para PostgreSQL
    const adapter = new PrismaPg(pool);

    // Inicializar PrismaClient con el adapter (requerido en Prisma 7)
    super({
      adapter,
      log: process.env.NODE_ENV === 'production' ? ['error'] : ['error', 'warn'],
    });

    this.pool = pool;
  }

  async onModuleInit(): Promise<void> {
    try {
      await this.$connect();
      this.logger.log(
        `Database connected (Pool: max=${this.pool.options.max}, min=${this.pool.options.min})`
      );

      // Test de conexion
      await this.$queryRaw`SELECT 1`;
      this.logger.log('Database health check: OK');
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      this.logger.error('Failed to connect to database', errorMessage);
      throw error;
    }
  }

  async onModuleDestroy(): Promise<void> {
    await this.$disconnect();
    await this.pool.end(); // CRITICO: Cerrar el pool de conexiones
    this.logger.log('Database connection closed and pool ended');
  }

  /**
   * Obtener estadisticas del pool de conexiones
   * Util para monitoreo y debugging
   */
  getPoolStats() {
    return {
      total: this.pool.totalCount, // Total de conexiones en el pool
      idle: this.pool.idleCount, // Conexiones disponibles
      waiting: this.pool.waitingCount, // Requests esperando conexion
      max: this.pool.options.max, // Maximo configurado
      min: this.pool.options.min, // Minimo configurado
    };
  }

  /**
   * Helper method to clean database (util para testing)
   */
  cleanDatabase(): void {
    if (process.env.NODE_ENV === 'production') {
      throw new Error('Cannot clean database in production!');
    }

    // Aqui se puede implementar la limpieza de tablas si es necesario
    this.logger.warn('Database cleaned (only in development/test)');
  }
}
