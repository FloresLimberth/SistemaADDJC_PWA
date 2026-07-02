import { registerAs } from '@nestjs/config';

// Configuracion general de la aplicacion
// Usar ConfigType<typeof appConfig> para type-safety
export default registerAs('app', () => ({
  nodeEnv: process.env.NODE_ENV || 'development',
  port: parseInt(process.env.PORT || '3000', 10),
  corsOrigin: process.env.CORS_ORIGIN || 'http://localhost:5000',
}));
