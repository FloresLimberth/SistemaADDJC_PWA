import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../../common/guards/roles.guard';
import { Roles } from '../../../common/decorators/roles.decorator';
import { PrismaService } from '../../../database/prisma.service';
import { TipoEjercicio } from '@prisma/client';

// Controlador para exponer el catalogo de ejercicios al frontend
// Usado para el selector de ejercicios en la edicion de sesiones
@Controller('catalogo-ejercicios')
@UseGuards(JwtAuthGuard, RolesGuard)
export class CatalogoEjerciciosController {
  constructor(private readonly prisma: PrismaService) {}

  // GET /api/catalogo-ejercicios - Listar ejercicios del catalogo con paginacion
  // Query params:
  //   - tipo: Filtrar por tipo (FISICO, TECNICO_TACHI, TECNICO_NE, RESISTENCIA, VELOCIDAD)
  //   - dificultad: Filtrar por nivel de dificultad (1, 2, 3)
  //   - activo: Filtrar por estado activo (default: true)
  //   - search: Buscar por nombre (parcial, case insensitive)
  //   - page: Numero de pagina (default: 1)
  //   - limit: Items por pagina (default: 20)
  @Get()
  @Roles('COMITE_TECNICO', 'ENTRENADOR')
  async findAll(
    @Query('tipo') tipo?: TipoEjercicio,
    @Query('dificultad') dificultadParam?: string,
    @Query('activo') activo?: string,
    @Query('search') search?: string,
    @Query('page') pageParam?: string,
    @Query('limit') limitParam?: string
  ) {
    // Parsear paginacion con defaults
    const page = Math.max(1, parseInt(pageParam || '1', 10) || 1);
    const limit = Math.max(1, Math.min(100, parseInt(limitParam || '20', 10) || 20));
    const skip = (page - 1) * limit;

    // Parsear dificultad (1, 2, 3 o undefined)
    const dificultad = dificultadParam ? parseInt(dificultadParam, 10) : undefined;

    // Construir filtros
    const where: any = {};

    // Filtro por tipo
    if (tipo) {
      where.tipo = tipo;
    }

    // Filtro por dificultad
    if (dificultad && dificultad >= 1 && dificultad <= 3) {
      where.nivelDificultad = dificultad;
    }

    // Filtro por activo (default: true)
    const activoBoolean = activo === 'false' ? false : true;
    where.activo = activoBoolean;

    // Filtro por busqueda de nombre
    if (search && search.trim()) {
      where.nombre = {
        contains: search.trim(),
        mode: 'insensitive',
      };
    }

    // Consultar total y ejercicios en paralelo
    const [total, ejercicios] = await Promise.all([
      this.prisma.catalogoEjercicios.count({ where }),
      this.prisma.catalogoEjercicios.findMany({
        where,
        select: {
          id: true,
          nombre: true,
          tipo: true,
          subtipo: true,
          categoria: true,
          descripcion: true,
          duracionMinutos: true,
          nivelDificultad: true,
        },
        orderBy: [{ tipo: 'asc' }, { nombre: 'asc' }],
        skip,
        take: limit,
      }),
    ]);

    // Formatear respuesta (convertir BigInt a string)
    const data = ejercicios.map((ej) => ({
      id: ej.id.toString(),
      nombre: ej.nombre,
      tipo: ej.tipo,
      subtipo: ej.subtipo,
      categoria: ej.categoria,
      descripcion: ej.descripcion,
      duracionMinutos: ej.duracionMinutos,
      nivelDificultad: ej.nivelDificultad,
    }));

    const totalPages = Math.ceil(total / limit);

    return {
      data,
      meta: {
        total,
        page,
        limit,
        totalPages,
        filtros: {
          tipo: tipo || null,
          activo: activoBoolean,
          search: search || null,
        },
      },
    };
  }

  // GET /api/catalogo-ejercicios/por-tipo - Listar ejercicios agrupados por tipo
  // Util para el frontend cuando necesita mostrar selectores por categoria
  @Get('por-tipo')
  @Roles('COMITE_TECNICO', 'ENTRENADOR')
  async findAllGroupedByType() {
    const ejercicios = await this.prisma.catalogoEjercicios.findMany({
      where: { activo: true },
      select: {
        id: true,
        nombre: true,
        tipo: true,
        subtipo: true,
        categoria: true,
      },
      orderBy: [{ tipo: 'asc' }, { nombre: 'asc' }],
    });

    // Agrupar por tipo
    const agrupados: Record<
      string,
      Array<{
        id: string;
        nombre: string;
        subtipo: string | null;
        categoria: string | null;
      }>
    > = {
      FISICO: [],
      TECNICO_TACHI: [],
      TECNICO_NE: [],
      RESISTENCIA: [],
      VELOCIDAD: [],
    };

    for (const ej of ejercicios) {
      agrupados[ej.tipo].push({
        id: ej.id.toString(),
        nombre: ej.nombre,
        subtipo: ej.subtipo,
        categoria: ej.categoria,
      });
    }

    return {
      data: agrupados,
      meta: {
        totales: {
          FISICO: agrupados.FISICO.length,
          TECNICO_TACHI: agrupados.TECNICO_TACHI.length,
          TECNICO_NE: agrupados.TECNICO_NE.length,
          RESISTENCIA: agrupados.RESISTENCIA.length,
          VELOCIDAD: agrupados.VELOCIDAD.length,
        },
      },
    };
  }
}
