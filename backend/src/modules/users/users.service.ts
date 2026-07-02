import {
  Injectable,
  NotFoundException,
  ConflictException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import { AuthService } from '../auth/auth.service';
import { CreateUserDto, UpdateUserDto, QueryUserDto, UserResponseDto } from './dto';
import { RolUsuario } from '@prisma/client';

@Injectable()
export class UsersService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly authService: AuthService
  ) {}

  // Crear un nuevo usuario
  async create(createUserDto: CreateUserDto): Promise<UserResponseDto> {
    // Verificar que el email no exista
    const existingEmail = await this.prisma.usuario.findUnique({
      where: { email: createUserDto.email },
    });

    if (existingEmail) {
      throw new ConflictException('El email ya está registrado');
    }

    // Verificar que el CI no exista
    const existingCI = await this.prisma.usuario.findUnique({
      where: { ci: createUserDto.ci },
    });

    if (existingCI) {
      throw new ConflictException('El CI ya está registrado');
    }

    // Hashear la contraseña
    const hashedPassword = await this.authService.hashPassword(createUserDto.contrasena);

    // Crear el usuario en la base de datos
    const user = await this.prisma.usuario.create({
      data: {
        ci: createUserDto.ci,
        nombreCompleto: createUserDto.nombreCompleto,
        email: createUserDto.email,
        contrasena: hashedPassword,
        rol: createUserDto.rol,
        estado: createUserDto.estado ?? true,
      },
      select: {
        id: true,
        ci: true,
        nombreCompleto: true,
        email: true,
        rol: true,
        estado: true,
        fechaRegistro: true,
        ultimoAcceso: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    return user;
  }

  // Listar usuarios con filtros y paginación
  async findAll(queryDto: QueryUserDto) {
    const { email, nombreCompleto, rol, estado, page = 1, limit = 10 } = queryDto;

    // Construir filtros dinámicos
    const where: any = {};

    if (email) {
      where.email = { contains: email, mode: 'insensitive' };
    }

    if (nombreCompleto) {
      where.nombreCompleto = { contains: nombreCompleto, mode: 'insensitive' };
    }

    if (rol) {
      where.rol = rol;
    }

    if (estado !== undefined) {
      where.estado = estado;
    }

    // Calcular skip para paginación
    const skip = (page - 1) * limit;

    // Ejecutar consultas en paralelo con select explícito (evitar traer contraseña)
    const [users, total] = await Promise.all([
      this.prisma.usuario.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        select: {
          id: true,
          ci: true,
          nombreCompleto: true,
          email: true,
          rol: true,
          estado: true,
          fechaRegistro: true,
          ultimoAcceso: true,
          createdAt: true,
          updatedAt: true,
        },
      }),
      this.prisma.usuario.count({ where }),
    ]);

    return {
      data: users,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  // Obtener un usuario por ID
  async findOne(id: string): Promise<UserResponseDto> {
    const userId = BigInt(id);

    const user = await this.prisma.usuario.findUnique({
      where: { id: userId },
      select: {
        id: true,
        ci: true,
        nombreCompleto: true,
        email: true,
        rol: true,
        estado: true,
        fechaRegistro: true,
        ultimoAcceso: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    if (!user) {
      throw new NotFoundException('Usuario no encontrado');
    }

    return user;
  }

  // Actualizar un usuario
  async update(id: string, updateUserDto: UpdateUserDto): Promise<UserResponseDto> {
    const userId = BigInt(id);

    // Verificar que el usuario exista
    const existingUser = await this.prisma.usuario.findUnique({
      where: { id: userId },
    });

    if (!existingUser) {
      throw new NotFoundException('Usuario no encontrado');
    }

    // Si se actualiza el email, verificar que no esté en uso
    if (updateUserDto.email && updateUserDto.email !== existingUser.email) {
      const emailInUse = await this.prisma.usuario.findUnique({
        where: { email: updateUserDto.email },
      });

      if (emailInUse) {
        throw new ConflictException('El email ya está registrado');
      }
    }

    // Si se actualiza el CI, verificar que no esté en uso
    if (updateUserDto.ci && updateUserDto.ci !== existingUser.ci) {
      const ciInUse = await this.prisma.usuario.findUnique({
        where: { ci: updateUserDto.ci },
      });

      if (ciInUse) {
        throw new ConflictException('El CI ya está registrado');
      }
    }

    // Preparar datos para actualizar
    const dataToUpdate: any = { ...updateUserDto };

    // Si se actualiza la contraseña, hashearla
    if (updateUserDto.contrasena) {
      dataToUpdate.contrasena = await this.authService.hashPassword(updateUserDto.contrasena);
    }

    // Actualizar el usuario
    const updatedUser = await this.prisma.usuario.update({
      where: { id: userId },
      data: dataToUpdate,
      select: {
        id: true,
        ci: true,
        nombreCompleto: true,
        email: true,
        rol: true,
        estado: true,
        fechaRegistro: true,
        ultimoAcceso: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    return updatedUser;
  }

  // Soft delete (desactivar usuario)
  async softDelete(id: string): Promise<UserResponseDto> {
    const userId = BigInt(id);

    const user = await this.prisma.usuario.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new NotFoundException('Usuario no encontrado');
    }

    const updatedUser = await this.prisma.usuario.update({
      where: { id: userId },
      data: { estado: false },
      select: {
        id: true,
        ci: true,
        nombreCompleto: true,
        email: true,
        rol: true,
        estado: true,
        fechaRegistro: true,
        ultimoAcceso: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    return updatedUser;
  }

  // Hard delete (borrar permanentemente)
  // Verifica dependencias RESTRICT antes de eliminar
  async remove(id: string): Promise<{ message: string }> {
    const userId = BigInt(id);

    const user = await this.prisma.usuario.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new NotFoundException('Usuario no encontrado');
    }

    // Verificar dependencias que bloquean la eliminacion (FK con RESTRICT)
    const dependencies = await this.checkUserDependencies(userId);

    if (dependencies.hasBlockingDependencies) {
      throw new BadRequestException(
        `No se puede eliminar el usuario porque tiene datos asociados: ${dependencies.reasons.join(', ')}. ` +
          `Use la opcion de desactivar en su lugar.`
      );
    }

    // Si no hay dependencias bloqueantes, proceder con la eliminacion
    await this.prisma.usuario.delete({
      where: { id: userId },
    });

    return { message: 'Usuario eliminado permanentemente' };
  }

  // Verificar dependencias que bloquean la eliminacion de un usuario
  // Incluye FK directas (RESTRICT) e indirectas (a traves de entrenador/atleta)
  private async checkUserDependencies(userId: bigint): Promise<{
    hasBlockingDependencies: boolean;
    reasons: string[];
  }> {
    const reasons: string[] = [];

    // Verificar macrociclos creados (RESTRICT directo)
    const macrociclosCount = await this.prisma.macrociclo.count({
      where: { creadoPor: userId },
    });
    if (macrociclosCount > 0) {
      reasons.push(`${macrociclosCount} macrociclo(s) creado(s)`);
    }

    // Verificar asignaciones creadas (RESTRICT directo)
    const asignacionesCount = await this.prisma.asignacionAtletaMicrociclo.count({
      where: { asignadoPor: userId },
    });
    if (asignacionesCount > 0) {
      reasons.push(`${asignacionesCount} asignacion(es) de atletas`);
    }

    // Verificar alertas del sistema via junction table
    const alertasCount = await this.prisma.alertaDestinatario.count({
      where: { destinatarioId: userId },
    });
    if (alertasCount > 0) {
      reasons.push(`${alertasCount} alerta(s) del sistema`);
    }

    // Verificar dependencias indirectas a traves de ENTRENADOR
    // Si el usuario es entrenador, verificar tests_fisicos.entrenadorRegistroId (RESTRICT)
    const entrenador = await this.prisma.entrenador.findUnique({
      where: { usuarioId: userId },
      select: { id: true },
    });

    if (entrenador) {
      const testsRegistradosCount = await this.prisma.testFisico.count({
        where: { entrenadorRegistroId: entrenador.id },
      });
      if (testsRegistradosCount > 0) {
        reasons.push(`${testsRegistradosCount} test(s) fisico(s) registrado(s)`);
      }
    }

    return {
      hasBlockingDependencies: reasons.length > 0,
      reasons,
    };
  }

  // Obtener estadisticas de usuarios para el dashboard del administrador
  async getStats(): Promise<{
    total: number;
    porRol: Record<string, number>;
    activos: number;
    inactivos: number;
  }> {
    // Ejecutar consultas en paralelo para mejor rendimiento
    const [total, activos, porRolResult] = await Promise.all([
      // Total de usuarios
      this.prisma.usuario.count(),
      // Usuarios activos
      this.prisma.usuario.count({ where: { estado: true } }),
      // Agrupado por rol
      this.prisma.usuario.groupBy({
        by: ['rol'],
        _count: { rol: true },
      }),
    ]);

    // Transformar resultado de groupBy a objeto
    const porRol: Record<string, number> = {};
    for (const item of porRolResult) {
      porRol[item.rol] = item._count.rol;
    }

    // Asegurar que todos los roles esten presentes (incluso con 0)
    const allRoles: RolUsuario[] = ['ADMINISTRADOR', 'COMITE_TECNICO', 'ENTRENADOR', 'ATLETA'];
    for (const rol of allRoles) {
      if (!(rol in porRol)) {
        porRol[rol] = 0;
      }
    }

    return {
      total,
      porRol,
      activos,
      inactivos: total - activos,
    };
  }
}
