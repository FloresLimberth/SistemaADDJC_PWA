import { NextRequest, NextResponse } from 'next/server';
import { verifyToken } from './lib/auth/verify-token';

// Middleware para proteger rutas basadas en autenticacion
export async function middleware(request: NextRequest) {
  // Obtener el token de las cookies
  const token = request.cookies.get('accessToken')?.value;

  // Si no hay token, redirect a login
  if (!token) {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  // Verificar que el token sea valido
  const payload = await verifyToken(token);

  if (!payload) {
    // Token invalido o expirado - borrar cookie y redirect a login
    const response = NextResponse.redirect(new URL('/login', request.url));
    response.cookies.delete('accessToken');
    return response;
  }

  // Token valido - permitir acceso
  // Agregar info del usuario a los headers para uso en la app
  const response = NextResponse.next();
  response.headers.set('x-user-id', payload.sub);
  response.headers.set('x-user-email', payload.email);
  response.headers.set('x-user-rol', payload.rol);

  return response;
}

// Configurar en que rutas se ejecuta el middleware
export const config = {
  matcher: [
    '/dashboard/:path*',
    '/admin/:path*',
    '/comite-tecnico/:path*',
    '/entrenador/:path*',
    '/atleta/:path*',
  ],
};
