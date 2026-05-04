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
import { MacrociclosService } from '../services/macrociclos.service';
import { CreateMacrocicloDto, UpdateMacrocicloDto } from '../dto';
import { JwtAuthGuard } from '../../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../../common/guards/roles.guard';
import { Roles } from '../../../common/decorators/roles.decorator';
import { CurrentUser } from '../../../common/decorators/current-user.decorator';

@Controller('macrociclos')
@UseGuards(JwtAuthGuard, RolesGuard)
export class MacrociclosController {
  constructor(private readonly macrociclosService: MacrociclosService) {}

  // POST /api/macrociclos - Crear macrociclo (solo COMITE_TECNICO)
  @Post()
  @Roles('COMITE_TECNICO')
  create(@Body() createMacrocicloDto: CreateMacrocicloDto, @CurrentUser() user: any) {
    return this.macrociclosService.create(createMacrocicloDto, user.id);
  }

  // GET /api/macrociclos - Listar macrociclos (COMITE_TECNICO, ENTRENADOR, ATLETA)
  @Get()
  @Roles('COMITE_TECNICO', 'ENTRENADOR', 'ATLETA')
  findAll(
    @CurrentUser() user: any,
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number,
    @Query('limit', new DefaultValuePipe(10), ParseIntPipe) limit: number
  ) {
    return this.macrociclosService.findAll(BigInt(user.id), user.rol, page, limit);
  }

  // GET /api/macrociclos/:id - Obtener macrociclo por ID
  @Get(':id')
  @Roles('COMITE_TECNICO', 'ENTRENADOR', 'ATLETA')
  findOne(@Param('id') id: string, @CurrentUser() user: any) {
    return this.macrociclosService.findOne(id, BigInt(user.id), user.rol);
  }

  // PATCH /api/macrociclos/:id - Actualizar macrociclo (solo COMITE_TECNICO)
  @Patch(':id')
  @Roles('COMITE_TECNICO')
  update(@Param('id') id: string, @Body() updateMacrocicloDto: UpdateMacrocicloDto) {
    return this.macrociclosService.update(id, updateMacrocicloDto);
  }

  // GET /api/macrociclos/:id/delete-info - Info antes de eliminar (solo COMITE_TECNICO)
  @Get(':id/delete-info')
  @Roles('COMITE_TECNICO')
  getDeleteInfo(@Param('id') id: string) {
    return this.macrociclosService.getDeleteInfo(id);
  }

  // DELETE /api/macrociclos/:id - Eliminar macrociclo (solo COMITE_TECNICO)
  @Delete(':id')
  @Roles('COMITE_TECNICO')
  remove(@Param('id') id: string) {
    return this.macrociclosService.remove(id);
  }
}
