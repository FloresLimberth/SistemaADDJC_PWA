import { Module } from '@nestjs/common';
import { AuditLogsController } from './audit-logs.controller';

// Modulo para exponer endpoints de consulta de activity logs
// AuditLogService ya esta disponible globalmente via CommonModule
@Module({
  controllers: [AuditLogsController],
})
export class AuditLogsModule {}
