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
import { UsersService } from './users.service';
import { CreateUserDto, UpdateUserDto, QueryUserDto } from './dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { AuditLog } from '../../common/decorators/audit-log.decorator';

@Controller('users')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('ADMINISTRADOR') // Solo el ADMINISTRADOR puede gestionar usuarios
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  // POST /api/users - Crear un nuevo usuario
  @Post()
  @AuditLog({ accion: 'CREAR_USUARIO', recurso: 'Usuario' })
  create(@Body() createUserDto: CreateUserDto) {
    return this.usersService.create(createUserDto);
  }

  // GET /api/users - Listar usuarios con filtros y paginación
  @Get()
  findAll(@Query() queryDto: QueryUserDto) {
    return this.usersService.findAll(queryDto);
  }

  // GET /api/users/stats - Estadisticas de usuarios para el dashboard
  // IMPORTANTE: Esta ruta debe estar ANTES de :id para evitar conflictos
  @Get('stats')
  getStats() {
    return this.usersService.getStats();
  }

  // GET /api/users/:id - Obtener un usuario por ID
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.usersService.findOne(id);
  }

  // PATCH /api/users/:id - Actualizar un usuario (incluye soft delete)
  @Patch(':id')
  @AuditLog({ accion: 'EDITAR_USUARIO', recurso: 'Usuario' })
  update(@Param('id') id: string, @Body() updateUserDto: UpdateUserDto) {
    return this.usersService.update(id, updateUserDto);
  }

  // PATCH /api/users/:id/deactivate - Soft delete (desactivar)
  @Patch(':id/deactivate')
  @AuditLog({ accion: 'DESACTIVAR_USUARIO', recurso: 'Usuario' })
  softDelete(@Param('id') id: string) {
    return this.usersService.softDelete(id);
  }

  // DELETE /api/users/:id - Hard delete (borrar permanentemente)
  @Delete(':id')
  @AuditLog({ accion: 'ELIMINAR_USUARIO', recurso: 'Usuario' })
  remove(@Param('id') id: string) {
    return this.usersService.remove(id);
  }
}
