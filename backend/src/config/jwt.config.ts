import { registerAs } from '@nestjs/config';

// Configuracion de autenticacion JWT
// Usar ConfigType<typeof jwtConfig> para type-safety
export default registerAs('jwt', () => ({
  secret: process.env.JWT_SECRET,
  expiresIn: process.env.JWT_EXPIRATION || '1h',
}));
