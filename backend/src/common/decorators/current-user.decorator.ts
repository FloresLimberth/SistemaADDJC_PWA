import { createParamDecorator, ExecutionContext } from '@nestjs/common';

// Decorator para obtener el usuario actual desde el request
// El usuario es inyectado por JwtStrategy despues de validar el token
// Uso: async metodo(@CurrentUser() user: any) { ... }
export const CurrentUser = createParamDecorator((data: unknown, ctx: ExecutionContext) => {
  const request = ctx.switchToHttp().getRequest();
  return request.user;
});
