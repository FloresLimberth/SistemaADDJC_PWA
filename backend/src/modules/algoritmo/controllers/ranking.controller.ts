// Controller de Ranking de Atletas para Competencias
// Endpoints para consultar ranking por categoria y estadisticas

import {
  Controller,
  Get,
  Param,
  Query,
  UseGuards,
  ParseIntPipe,
  DefaultValuePipe,
  BadRequestException,
  ForbiddenException,
} from '@nestjs/common';
import { RankingAtletasService } from '../services/ranking-atletas.service';
import { AccessControlService } from '../../../common/services/access-control.service';
import { JwtAuthGuard } from '../../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../../common/guards/roles.guard';
import { Roles } from '../../../common/decorators/roles.decorator';
import { CurrentUser } from '../../../common/decorators/current-user.decorator';
import { CategoriaPeso } from '@prisma/client';

// Categorias de peso validas
const CATEGORIAS_VALIDAS: CategoriaPeso[] = [
  'MENOS_60K',
  'MENOS_66K',
  'MENOS_73K',
  'MENOS_81K',
  'MENOS_90K',
  'MENOS_100K',
  'MAS_100K',
];

@Controller('ranking')
@UseGuards(JwtAuthGuard, RolesGuard)
export class RankingController {
  constructor(
    private readonly rankingService: RankingAtletasService,
    private readonly accessControl: AccessControlService
  ) {}

  // GET /api/ranking - Obtener ranking global (todas las categorias)
  // Solo COMITE_TECNICO puede ver el ranking global
  @Get()
  @Roles('COMITE_TECNICO')
  async obtenerRankingGlobal() {
    const ranking = await this.rankingService.generarRankingGlobalComoObjeto();

    // Formatear para serializar BigInt
    const resultado: Record<string, any> = {};
    for (const [categoria, data] of Object.entries(ranking)) {
      resultado[categoria] = {
        ...data,
        ranking: data.ranking.map((atleta: any) => ({
          ...atleta,
          atletaId: atleta.atletaId.toString(),
        })),
        mejorAtleta: data.mejorAtleta
          ? {
              ...data.mejorAtleta,
              atletaId: data.mejorAtleta.atletaId.toString(),
            }
          : null,
      };
    }

    return resultado;
  }

  // GET /api/ranking/estadisticas - Estadisticas generales de ranking
  @Get('estadisticas')
  @Roles('COMITE_TECNICO')
  async obtenerEstadisticas() {
    return await this.rankingService.obtenerEstadisticasRanking();
  }

  // GET /api/ranking/categoria/:categoria - Ranking de una categoria especifica
  @Get('categoria/:categoria')
  @Roles('COMITE_TECNICO', 'ENTRENADOR')
  async obtenerRankingPorCategoria(@Param('categoria') categoria: string) {
    // Validar categoria
    if (!CATEGORIAS_VALIDAS.includes(categoria as CategoriaPeso)) {
      throw new BadRequestException(
        `Categoria invalida. Categorias validas: ${CATEGORIAS_VALIDAS.join(', ')}`
      );
    }

    const ranking = await this.rankingService.generarRankingPorCategoria(
      categoria as CategoriaPeso
    );

    // Formatear para serializar BigInt
    return {
      ...ranking,
      ranking: ranking.ranking.map((atleta) => ({
        ...atleta,
        atletaId: atleta.atletaId.toString(),
      })),
      mejorAtleta: ranking.mejorAtleta
        ? {
            ...ranking.mejorAtleta,
            atletaId: ranking.mejorAtleta.atletaId.toString(),
          }
        : null,
    };
  }

  // GET /api/ranking/categoria/:categoria/mejores - Mejores N atletas de una categoria
  @Get('categoria/:categoria/mejores')
  @Roles('COMITE_TECNICO', 'ENTRENADOR', 'ATLETA')
  async obtenerMejoresAtletas(
    @Param('categoria') categoria: string,
    @Query('cantidad', new DefaultValuePipe(5), ParseIntPipe) cantidad: number
  ) {
    // Validar categoria
    if (!CATEGORIAS_VALIDAS.includes(categoria as CategoriaPeso)) {
      throw new BadRequestException(
        `Categoria invalida. Categorias validas: ${CATEGORIAS_VALIDAS.join(', ')}`
      );
    }

    // Limitar cantidad
    if (cantidad < 1 || cantidad > 20) {
      throw new BadRequestException('La cantidad debe estar entre 1 y 20');
    }

    const resultado = await this.rankingService.obtenerMejoresAtletas(
      categoria as CategoriaPeso,
      cantidad
    );

    return {
      ...resultado,
      mejores: resultado.mejores.map((atleta) => ({
        ...atleta,
        atletaId: atleta.atletaId.toString(),
      })),
    };
  }

  // GET /api/ranking/atleta/:id - Ranking de un atleta especifico
  @Get('atleta/:id')
  @Roles('COMITE_TECNICO', 'ENTRENADOR', 'ATLETA')
  async obtenerRankingAtleta(@Param('id') id: string, @CurrentUser() user: any) {
    // Si es ATLETA, solo puede ver su propio ranking
    if (user.rol === 'ATLETA') {
      const atletaId = await this.accessControl.getAtletaId(BigInt(user.id));

      if (!atletaId) {
        throw new BadRequestException('No se encontro perfil de atleta');
      }

      if (atletaId.toString() !== id) {
        throw new ForbiddenException('Solo puedes ver tu propio ranking');
      }
    }

    // Si es ENTRENADOR, solo puede ver atletas asignados
    if (user.rol === 'ENTRENADOR') {
      const hasAccess = await this.accessControl.checkAtletaOwnership(
        BigInt(user.id),
        user.rol,
        BigInt(id),
      );
      if (!hasAccess) {
        throw new ForbiddenException('Solo puedes ver el ranking de tus atletas asignados');
      }
    }

    const resultado = await this.rankingService.obtenerRankingAtleta(BigInt(id));

    if (!resultado) {
      throw new BadRequestException('Atleta no encontrado');
    }

    return resultado;
  }

  // GET /api/ranking/mi-ranking - Ranking del atleta actual (solo para ATLETA)
  @Get('mi-ranking')
  @Roles('ATLETA')
  async obtenerMiRanking(@CurrentUser() user: any) {
    const atletaId = await this.accessControl.getAtletaId(BigInt(user.id));

    if (!atletaId) {
      throw new BadRequestException('No se encontro perfil de atleta');
    }

    const resultado = await this.rankingService.obtenerRankingAtleta(atletaId);

    if (!resultado) {
      throw new BadRequestException('No se pudo calcular el ranking');
    }

    return resultado;
  }
}
