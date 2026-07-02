import { Controller, Post, Get, Body, UseGuards } from '@nestjs/common';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { Public } from '../../common/decorators/public.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { AuditLog } from '../../common/decorators/audit-log.decorator';

@Controller('auth')
@UseGuards(JwtAuthGuard) // Aplicar autenticacion a todas las rutas por defecto
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  // POST /auth/login - Endpoint publico para login
  // No requiere autenticacion (marcado con @Public())
  @Public()
  @Post('login')
  @AuditLog({ accion: 'LOGIN', recurso: 'Usuario' })
  async login(@Body() loginDto: LoginDto) {
    console.log('[AuthController] Login request recibido para email:', loginDto.email);
    const result = await this.authService.signIn(loginDto.email, loginDto.password);
    console.log('[AuthController] Login exitoso para:', loginDto.email);
    return result;
  }

  // GET /auth/profile - Endpoint protegido para obtener perfil del usuario actual
  // Requiere autenticacion JWT (token valido)
  @Get('profile')
  getProfile(@CurrentUser() user: any) {
    // El usuario viene del token JWT validado por JwtStrategy
    return {
      message: 'Perfil del usuario autenticado',
      user,
    };
  }
}
