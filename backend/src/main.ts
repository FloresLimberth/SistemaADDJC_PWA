import { NestFactory, HttpAdapterHost } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import compression from 'compression';
import { AppModule } from './app.module';
import { AllExceptionsFilter } from './common/filters/all-exceptions.filter';
import { BigIntTransformInterceptor } from './common/interceptors/bigint-transform.interceptor';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    logger: ['error', 'warn', 'log'], // Excluir 'debug' y 'verbose'
  });

  // Habilitar compresion gzip para respuestas HTTP
  app.use(compression());

  // Configurar ValidationPipe global para validar DTOs automaticamente
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true, // Eliminar propiedades que no estan en el DTO
      forbidNonWhitelisted: true, // Lanzar error si hay propiedades no permitidas
      transform: true, // Transformar payloads a instancias de DTO
    })
  );

  // Configurar filtro global de excepciones
  // Captura TODAS las excepciones: HTTP, Prisma, validacion, errores inesperados
  const httpAdapterHost = app.get(HttpAdapterHost);
  app.useGlobalFilters(new AllExceptionsFilter(httpAdapterHost));

  // Configurar interceptor global para transformar BigInt a string
  // Aplica a todas las respuestas HTTP, eliminando necesidad de formatResponse manual
  app.useGlobalInterceptors(new BigIntTransformInterceptor());

  // Habilitar CORS para permitir peticiones desde el frontend
  // IMPORTANTE: credentials: true es necesario para HttpOnly cookies
  app.enableCors({
    origin: 'http://localhost:5000', // URL del frontend Next.js
    credentials: true, // Permite enviar y recibir cookies
  });

  // Agregar prefijo global 'api' a todas las rutas
  // Ejemplo: /auth/login se convierte en /api/auth/login
  app.setGlobalPrefix('api');

  await app.listen(process.env.PORT ?? 3000);
}
void bootstrap();
