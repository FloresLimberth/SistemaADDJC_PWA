import * as Joi from 'joi';

// Schema de validacion Joi para variables de entorno
// Se ejecuta en ConfigModule.forRoot() durante el startup de la aplicacion
// Si la validacion falla, la app NO inicia (comportamiento deseado para seguridad)
export const validationSchema = Joi.object({
  // Configuracion de la aplicacion
  NODE_ENV: Joi.string()
    .valid('development', 'production', 'test')
    .default('development')
    .messages({
      'any.only': 'NODE_ENV debe ser: development, production o test',
    }),

  PORT: Joi.number().port().default(3000).messages({
    'number.port': 'PORT debe ser un numero de puerto valido (1-65535)',
  }),

  // Base de datos (Prisma + PostgreSQL 17)
  DATABASE_URL: Joi.string().uri().required().messages({
    'string.uri': 'DATABASE_URL debe ser una URI valida',
    'any.required':
      'DATABASE_URL es requerida. Ejemplo: postgresql://user:pass@localhost:5432/db_addjc',
  }),

  // Autenticacion JWT
  JWT_SECRET: Joi.string().min(32).required().messages({
    'string.min':
      "JWT_SECRET debe tener al menos 32 caracteres para seguridad. Genera uno con: node -e \"console.log(require('crypto').randomBytes(32).toString('hex'))\"",
    'any.required': 'JWT_SECRET es requerida',
  }),

  JWT_EXPIRATION: Joi.string()
    .pattern(/^[0-9]+(s|m|h|d)$/)
    .default('1h')
    .messages({
      'string.pattern.base': 'JWT_EXPIRATION debe tener formato: 60s, 15m, 1h, 7d',
    }),
});
