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
import { EntrenadoresService } from './entrenadores.service';
import {
  CreateEntrenadorDto,
  UpdateEntrenadorDto,
  QueryEntrenadorDto,
  AssignAtletaDto,
} from './dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';

@Controller('entrenadores')
@UseGuards(JwtAuthGuard, RolesGuard)
export class EntrenadoresController {
  constructor(private readonly entrenadoresService: EntrenadoresService) {}

  // POST /api/entrenadores - Crear entrenador (ADMINISTRADOR y COMITE_TECNICO)
  @Post()
  @Roles('ADMINISTRADOR', 'COMITE_TECNICO')
  create(@Body() createEntrenadorDto: CreateEntrenadorDto) {
    return this.entrenadoresService.create(createEntrenadorDto);
  }

  // GET /api/entrenadores - Listar entrenadores
  // ADMINISTRADOR y COMITE_TECNICO pueden ver todos los entrenadores
  @Get()
  @Roles('ADMINISTRADOR', 'COMITE_TECNICO')
  findAll(@Query() queryDto: QueryEntrenadorDto) {
    return this.entrenadoresService.findAll(queryDto);
  }

  // GET /api/entrenadores/:id - Obtener entrenador por ID
  @Get(':id')
  @Roles('ADMINISTRADOR', 'COMITE_TECNICO', 'ENTRENADOR')
  findOne(@Param('id') id: string, @CurrentUser() user: any) {
    // ENTRENADOR solo puede ver su propio perfil
    // Esta validacion se puede agregar aqui o en el service
    return this.entrenadoresService.findOne(id);
  }

  // PATCH /api/entrenadores/:id - Actualizar entrenador
  // ADMINISTRADOR y COMITE_TECNICO pueden editar entrenadores
  @Patch(':id')
  @Roles('ADMINISTRADOR', 'COMITE_TECNICO')
  update(@Param('id') id: string, @Body() updateEntrenadorDto: UpdateEntrenadorDto) {
    return this.entrenadoresService.update(id, updateEntrenadorDto);
  }

  // DELETE /api/entrenadores/:id - Eliminar entrenador permanentemente
  // ADMINISTRADOR y COMITE_TECNICO pueden eliminar entrenadores
  @Delete(':id')
  @Roles('ADMINISTRADOR', 'COMITE_TECNICO')
  remove(@Param('id') id: string) {
    return this.entrenadoresService.remove(id);
  }

  // POST /api/entrenadores/:id/atletas - Asignar atleta a entrenador
  // ADMINISTRADOR y COMITE_TECNICO pueden asignar atletas
  @Post(':id/atletas')
  @Roles('ADMINISTRADOR', 'COMITE_TECNICO')
  assignAtleta(@Param('id') id: string, @Body() assignAtletaDto: AssignAtletaDto) {
    return this.entrenadoresService.assignAtleta(id, assignAtletaDto);
  }

  // GET /api/entrenadores/:id/atletas - Obtener atletas asignados a un entrenador
  // ADMINISTRADOR, COMITE_TECNICO y el ENTRENADOR propietario pueden ver
  @Get(':id/atletas')
  @Roles('ADMINISTRADOR', 'COMITE_TECNICO', 'ENTRENADOR')
  getAtletas(@Param('id') id: string, @CurrentUser() user: any) {
    return this.entrenadoresService.getAtletas(id, BigInt(user.id), user.rol);
  }
}
