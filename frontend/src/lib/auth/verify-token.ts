import { jwtVerify } from 'jose';
import type { JWTPayload, RolUsuario } from '@/types/auth';

// JWT_SECRET es obligatorio - debe estar definido en .env.local (dev) o .env.production (prod)
const JWT_SECRET = process.env.JWT_SECRET;
if (!JWT_SECRET) {
  throw new Error('JWT_SECRET no esta definido en las variables de entorno');
}

// Verificar y decodificar un JWT usando jose (compatible con Edge Runtime)
export async function verifyToken(token: string): Promise<JWTPayload | null> {
  try {
    // Convertir el secret a Uint8Array (requerido por jose)
    const secret = new TextEncoder().encode(JWT_SECRET);

    // Verificar y decodificar el token
    const { payload } = await jwtVerify(token, secret);

    // Validar que el payload tenga la estructura esperada
    if (
      typeof payload.sub === 'string' &&
      typeof payload.email === 'string' &&
      typeof payload.rol === 'string' &&
      typeof payload.iat === 'number' &&
      typeof payload.exp === 'number'
    ) {
      // Construir objeto tipado con los campos validados
      return {
        sub: payload.sub,
        email: payload.email,
        rol: payload.rol as RolUsuario,
        iat: payload.iat,
        exp: payload.exp,
      };
    }

    return null;
  } catch {
    // Token invalido, expirado, o con firma incorrecta
    return null;
  }
}
