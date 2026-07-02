import { SetMetadata } from '@nestjs/common';

// Decorator para especificar los roles requeridos para acceder a una ruta
// Uso: @Roles('ADMINISTRADOR', 'COMITE_TECNICO')
// RolesGuard lee este metadata para validar permisos
export const Roles = (...roles: string[]) => SetMetadata('roles', roles);
