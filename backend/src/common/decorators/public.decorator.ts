import { SetMetadata } from '@nestjs/common';

// Decorator para marcar rutas como publicas (sin autenticacion)
// Uso: @Public() en un metodo o clase de controller
// Requiere modificar JwtAuthGuard para verificar este metadata
export const IS_PUBLIC_KEY = 'isPublic';
export const Public = () => SetMetadata(IS_PUBLIC_KEY, true);
