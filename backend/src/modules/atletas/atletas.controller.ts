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
} from '@nestjs/common';
import { AtletasService } from './atletas.service';
import { CreateAtletaDto, UpdateAtletaDto, QueryAtletaDto } from './dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';

@Controller('atletas')
@UseGuards(JwtAuthGuard, RolesGuard)
export class AtletasController {
  constructor(private readonly atletasService: AtletasService) {}

  // POST /api/atletas - Crear atleta (ADMINISTRADOR y COMITE_TECNICO)
  @Post()
  @Roles('ADMINISTRADOR', 'COMITE_TECNICO')
  create(@Body() createAtletaDto: CreateAtletaDto) {
    return this.atletasService.create(createAtletaDto);
  }

  // GET /api/atletas - Listar atletas
  // COMITE_TECNICO: ve todos los atletas
  // ENTRENADOR: solo ve atletas asignados a el
  @Get()
  @Roles('ADMINISTRADOR', 'COMITE_TECNICO', 'ENTRENADOR')
  findAll(@Query() queryDto: QueryAtletaDto, @CurrentUser() user: any) {
    return this.atletasService.findAll(queryDto, user.id, user.rol);
  }

  // GET /api/atletas/:id - Obtener atleta por ID
  // COMITE_TECNICO: puede ver cualquier atleta
  // ENTRENADOR: solo si el atleta esta asignado a el
  @Get(':id')
  @Roles('ADMINISTRADOR', 'COMITE_TECNICO', 'ENTRENADOR')
  findOne(@Param('id') id: string, @CurrentUser() user: any) {
    return this.atletasService.findOne(id, user.id, user.rol);
  }

  // PATCH /api/atletas/:id - Actualizar atleta
  // Solo ADMINISTRADOR y COMITE_TECNICO pueden editar atletas
  @Patch(':id')
  @Roles('ADMINISTRADOR', 'COMITE_TECNICO')
  update(@Param('id') id: string, @Body() updateAtletaDto: UpdateAtletaDto) {
    return this.atletasService.update(id, updateAtletaDto);
  }

  // DELETE /api/atletas/:id - Eliminar atleta permanentemente
  // ADMINISTRADOR y COMITE_TECNICO pueden eliminar atletas
  @Delete(':id')
  @Roles('ADMINISTRADOR', 'COMITE_TECNICO')
  remove(@Param('id') id: string) {
    return this.atletasService.remove(id);
  }
}
