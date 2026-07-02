import { Module, Global } from '@nestjs/common';
import { AccessControlService } from './services/access-control.service';
import { AuditLogService } from './services/audit-log.service';

@Global() // Hace los servicios disponibles en toda la aplicacion sin imports explicitos
@Module({
  providers: [AccessControlService, AuditLogService],
  exports: [AccessControlService, AuditLogService],
})
export class CommonModule {}
