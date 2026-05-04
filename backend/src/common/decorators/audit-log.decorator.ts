import { SetMetadata } from '@nestjs/common';

// Key para almacenar metadata del audit log
export const AUDIT_LOG_KEY = 'audit_log';

// Metadata que se pasa al decorador
export interface AuditLogMetadata {
  accion: string; // Ej: 'CREAR_USUARIO', 'EDITAR_ATLETA', 'LOGIN'
  recurso: string; // Ej: 'Usuario', 'Atleta', 'Macrociclo'
}

// Decorator para marcar endpoints que deben ser loggeados
// Uso: @AuditLog({ accion: 'CREAR_USUARIO', recurso: 'Usuario' })
// El interceptor lee este metadata y registra la accion en auditorias_acceso
export const AuditLog = (metadata: AuditLogMetadata) => SetMetadata(AUDIT_LOG_KEY, metadata);
