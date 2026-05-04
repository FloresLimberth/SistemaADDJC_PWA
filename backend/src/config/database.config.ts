import { registerAs } from '@nestjs/config';

// Configuracion de base de datos (Prisma + PostgreSQL 17)
// Usar ConfigType<typeof databaseConfig> para type-safety
export default registerAs('database', () => ({
  url: process.env.DATABASE_URL,
}));
