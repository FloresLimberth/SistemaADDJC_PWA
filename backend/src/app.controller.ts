import { Controller, Get } from '@nestjs/common';
import { AppService } from './app.service';
import { Public } from './common/decorators/public.decorator';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  // GET /api - Informacion basica del servidor
  @Public()
  @Get()
  getInfo() {
    return this.appService.getInfo();
  }

  // GET /api/health - Health check del servidor
  @Public()
  @Get('health')
  getHealth() {
    return this.appService.getHealth();
  }

  // GET /api/health/db - Health check de la base de datos
  @Public()
  @Get('health/db')
  getDatabaseHealth() {
    return this.appService.getDatabaseHealth();
  }

  // GET /api/health/pool - Estadisticas del pool de conexiones
  @Public()
  @Get('health/pool')
  getPoolStats() {
    return this.appService.getPoolStats();
  }
}
