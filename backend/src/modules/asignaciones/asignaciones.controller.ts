import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
  ParseIntPipe,
} from '@nestjs/common';
import { AsignacionesService } from './asignaciones.service';
import { CreateAsignacionDto, UpdateAsignacionDto } from './dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';

@Controller('asignaciones')
@UseGuards(JwtAuthGuard, RolesGuard)
export class AsignacionesController {
  constructor(private readonly asignacionesService: AsignacionesService) {}

  // POST /api/asignaciones - Asignar atleta a microciclo (solo COMITE_TECNICO)
  @Post()
  @Roles('COMITE_TECNICO')
  create(@Body() createDto: CreateAsignacionDto, @CurrentUser() user: any) {
    return this.asignacionesService.create(createDto, BigInt(user.id));
  }

  // GET /api/asignaciones - Listar asignaciones con filtros (solo COMITE_TECNICO)
  @Get()
  @Roles('COMITE_TECNICO')
  findAll(
    @Query('atletaId') atletaId?: string,
    @Query('microcicloId') microcicloId?: string,
    @Query('page', new ParseIntPipe({ optional: true })) page = 1,
    @Query('limit', new ParseIntPipe({ optional: true })) limit = 10
  ) {
    return this.asignacionesService.findAll(atletaId, microcicloId, page, limit);
  }

  // GET /api/asignaciones/:id - Obtener asignacion por ID (solo COMITE_TECNICO)
  @Get(':id')
  @Roles('COMITE_TECNICO')
  findOne(@Param('id') id: string) {
    return this.asignacionesService.findOne(id);
  }

  // PATCH /api/asignaciones/:id - Actualizar asignacion (solo COMITE_TECNICO)
  @Patch(':id')
  @Roles('COMITE_TECNICO')
  update(@Param('id') id: string, @Body() updateDto: UpdateAsignacionDto) {
    return this.asignacionesService.update(id, updateDto);
  }

  // DELETE /api/asignaciones/:id - Eliminar asignacion (solo COMITE_TECNICO)
  @Delete(':id')
  @Roles('COMITE_TECNICO')
  remove(@Param('id') id: string) {
    return this.asignacionesService.remove(id);
  }
}
