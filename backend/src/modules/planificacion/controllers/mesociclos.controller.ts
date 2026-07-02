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
import { MesociclosService } from '../services/mesociclos.service';
import { CreateMesocicloDto, UpdateMesocicloDto } from '../dto';
import { JwtAuthGuard } from '../../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../../common/guards/roles.guard';
import { Roles } from '../../../common/decorators/roles.decorator';
import { CurrentUser } from '../../../common/decorators/current-user.decorator';

@Controller('mesociclos')
@UseGuards(JwtAuthGuard, RolesGuard)
export class MesociclosController {
  constructor(private readonly mesociclosService: MesociclosService) {}

  // POST /api/mesociclos - Crear mesociclo (solo COMITE_TECNICO)
  @Post()
  @Roles('COMITE_TECNICO')
  create(@Body() createMesocicloDto: CreateMesocicloDto) {
    return this.mesociclosService.create(createMesocicloDto);
  }

  // GET /api/mesociclos - Listar mesociclos (COMITE_TECNICO, ENTRENADOR, ATLETA)
  @Get()
  @Roles('COMITE_TECNICO', 'ENTRENADOR', 'ATLETA')
  findAll(
    @CurrentUser() user: any,
    @Query('macrocicloId') macrocicloId?: string,
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page?: number,
    @Query('limit', new DefaultValuePipe(10), ParseIntPipe) limit?: number
  ) {
    return this.mesociclosService.findAll(BigInt(user.id), user.rol, macrocicloId, page, limit);
  }

  // GET /api/mesociclos/:id - Obtener mesociclo por ID
  @Get(':id')
  @Roles('COMITE_TECNICO', 'ENTRENADOR', 'ATLETA')
  findOne(@Param('id') id: string, @CurrentUser() user: any) {
    return this.mesociclosService.findOne(id, BigInt(user.id), user.rol);
  }

  // PATCH /api/mesociclos/:id - Actualizar mesociclo (solo COMITE_TECNICO)
  @Patch(':id')
  @Roles('COMITE_TECNICO')
  update(@Param('id') id: string, @Body() updateMesocicloDto: UpdateMesocicloDto) {
    return this.mesociclosService.update(id, updateMesocicloDto);
  }

  // GET /api/mesociclos/:id/delete-info - Info antes de eliminar (solo COMITE_TECNICO)
  @Get(':id/delete-info')
  @Roles('COMITE_TECNICO')
  getDeleteInfo(@Param('id') id: string) {
    return this.mesociclosService.getDeleteInfo(id);
  }

  // DELETE /api/mesociclos/:id - Eliminar mesociclo (solo COMITE_TECNICO)
  @Delete(':id')
  @Roles('COMITE_TECNICO')
  remove(@Param('id') id: string) {
    return this.mesociclosService.remove(id);
  }
}
