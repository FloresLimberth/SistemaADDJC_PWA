import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { AuditLogService } from '../../common/services/audit-log.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { QueryAuditLogDto } from './dto/query-audit-log.dto';

@Controller('audit-logs')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('ADMINISTRADOR') // Solo el ADMINISTRADOR puede ver los logs
export class AuditLogsController {
  constructor(private readonly auditLogService: AuditLogService) {}

  // GET /api/audit-logs - Listar logs con filtros y paginacion
  @Get()
  async findAll(@Query() query: QueryAuditLogDto) {
    return this.auditLogService.findAll({
      usuarioId: query.usuarioId ? BigInt(query.usuarioId) : undefined,
      recurso: query.recurso,
      accion: query.accion,
      desde: query.desde ? new Date(query.desde) : undefined,
      hasta: query.hasta ? new Date(query.hasta) : undefined,
      page: query.page ? parseInt(query.page, 10) : 1,
      limit: query.limit ? parseInt(query.limit, 10) : 50,
    });
  }
}
