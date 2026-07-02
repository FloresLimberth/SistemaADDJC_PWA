import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  UseGuards,
  ParseIntPipe,
  DefaultValuePipe,
} from '@nestjs/common';
import { MicrociclosService } from '../services/microciclos.service';
import { CreateMicrocicloDto, UpdateMicrocicloDto } from '../dto';
import { JwtAuthGuard } from '../../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../../common/guards/roles.guard';
import { Roles } from '../../../common/decorators/roles.decorator';
import { CurrentUser } from '../../../common/decorators/current-user.decorator';

@Controller('microciclos')
@UseGuards(JwtAuthGuard, RolesGuard)
export class MicrociclosController {
  constructor(private readonly microciclosService: MicrociclosService) {}

  // POST /api/microciclos - Crear microciclo (solo COMITE_TECNICO)
  // Genera automaticamente 7 sesiones PERSONALIZADAS segun el perfil del atleta
  @Post()
  @Roles('COMITE_TECNICO')
  create(@Body() createMicrocicloDto: CreateMicrocicloDto, @CurrentUser() user: any) {
    return this.microciclosService.create(createMicrocicloDto, BigInt(user.id));
  }

  // GET /api/microciclos - Listar microciclos (filtrados por rol)
  @Get()
  @Roles('COMITE_TECNICO', 'ENTRENADOR', 'ATLETA')
  findAll(
    @CurrentUser() user: any,
    @Query('mesocicloId') mesocicloId?: string,
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page?: number,
    @Query('limit', new DefaultValuePipe(10), ParseIntPipe) limit?: number
  ) {
    return this.microciclosService.findAll(BigInt(user.id), user.rol, mesocicloId, page, limit);
  }

  // GET /api/microciclos/:id - Obtener microciclo por ID (con sus 7 sesiones)
  @Get(':id')
  @Roles('COMITE_TECNICO', 'ENTRENADOR', 'ATLETA')
  findOne(@Param('id') id: string, @CurrentUser() user: any) {
    return this.microciclosService.findOne(id, BigInt(user.id), user.rol);
  }

  // PATCH /api/microciclos/:id - Actualizar microciclo (solo COMITE_TECNICO)
  @Patch(':id')
  @Roles('COMITE_TECNICO')
  update(@Param('id') id: string, @Body() updateMicrocicloDto: UpdateMicrocicloDto) {
    return this.microciclosService.update(id, updateMicrocicloDto);
  }

  // GET /api/microciclos/:id/delete-info - Info antes de eliminar (solo COMITE_TECNICO)
  @Get(':id/delete-info')
  @Roles('COMITE_TECNICO')
  getDeleteInfo(@Param('id') id: string) {
    return this.microciclosService.getDeleteInfo(id);
  }

  // DELETE /api/microciclos/:id - Eliminar microciclo (solo COMITE_TECNICO)
  // Las 7 sesiones se eliminan automaticamente en cascada
  @Delete(':id')
  @Roles('COMITE_TECNICO')
  remove(@Param('id') id: string) {
    return this.microciclosService.remove(id);
  }
}
