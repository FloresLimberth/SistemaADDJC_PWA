import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../../database/prisma.service';
import * as bcrypt from 'bcrypt';

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService
  ) {}

  // Valida las credenciales del usuario (email y contraseña)
  async validateUser(email: string, password: string): Promise<any> {
    // Buscar usuario por email en la base de datos
    const user = await this.prisma.usuario.findUnique({
      where: { email },
    });

    // Si no existe el usuario, retornar null
    if (!user) {
      return null;
    }

    // Comparar la contraseña ingresada con el hash guardado en la BD
    const isPasswordValid = await bcrypt.compare(password, user.contrasena);

    // Si la contraseña no coincide, retornar null
    if (!isPasswordValid) {
      return null;
    }

    // Si todo es correcto, retornar el usuario sin la contraseña
    const { contrasena: _, ...result } = user;
    return result;
  }

  // Genera el token JWT para el usuario autenticado
  async login(user: any) {
    // Crear el payload (datos que irán dentro del token)
    // IMPORTANTE: Convertir BigInt a String porque JWT no puede serializar BigInt
    const payload = {
      sub: user.id.toString(), // ID del usuario (BigInt convertido a String)
      email: user.email, // Email del usuario
      rol: user.rol, // Rol del usuario (ADMIN, ENTRENADOR, etc.)
    };

    // Generar y devolver el token JWT
    return {
      access_token: this.jwtService.sign(payload),
      user: {
        id: user.id.toString(), // Convertir BigInt a String para JSON
        email: user.email,
        nombreCompleto: user.nombreCompleto,
        rol: user.rol,
      },
    };
  }

  // Método para hacer login (combina validación y generación de token)
  async signIn(email: string, password: string) {
    // Validar las credenciales
    const user = await this.validateUser(email, password);

    // Si las credenciales son inválidas, lanzar error
    if (!user) {
      throw new UnauthorizedException('Email o contraseña incorrectos');
    }

    // Generar y retornar el token JWT
    return this.login(user);
  }

  // Crear hash de una contraseña (útil para crear usuarios)
  async hashPassword(password: string): Promise<string> {
    // Salt rounds: 10 es el estándar (balance entre seguridad y performance)
    const saltRounds = 10;
    return bcrypt.hash(password, saltRounds);
  }

  // Verificar si una contraseña coincide con un hash
  async comparePasswords(password: string, hash: string): Promise<boolean> {
    return bcrypt.compare(password, hash);
  }
}
