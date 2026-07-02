'use server';

import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { loginSchema, type LoginFormData } from '@/lib/validations/auth.schema';
import type { LoginResponse } from '@/types/auth';
import { AUTH_ROUTES } from '@/lib/routes';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api';

// Server Action para hacer login
export async function loginAction(data: LoginFormData) {
  try {
    // Validar datos con Zod
    const validatedData = loginSchema.parse(data);

    // Hacer POST al backend
    const response = await fetch(`${API_URL}/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(validatedData),
      credentials: 'include', // IMPORTANTE: Para enviar/recibir cookies
    });

    // Si la respuesta no es exitosa, lanzar error
    if (!response.ok) {
      const error = await response.json();
      return {
        success: false,
        error: error.message || 'Email o contrasena incorrectos',
      };
    }

    // Obtener el token y datos del usuario
    const loginResponse: LoginResponse = await response.json();

    // Guardar el token en una cookie HttpOnly
    const cookieStore = await cookies();
    cookieStore.set('accessToken', loginResponse.access_token, {
      httpOnly: true, // No accesible desde JavaScript del navegador
      secure: process.env.COOKIE_SECURE === 'true', // true solo con HTTPS (dominio con SSL)
      sameSite: 'lax', // Proteccion CSRF
      maxAge: 60 * 60, // 1 hora (3600 segundos)
      path: '/', // Disponible en toda la app
    });

    // Redirect segun el rol del usuario
    const redirectMap = {
      ADMINISTRADOR: '/admin',
      COMITE_TECNICO: '/comite-tecnico',
      ENTRENADOR: '/entrenador',
      ATLETA: '/atleta',
    };

    const redirectPath = redirectMap[loginResponse.user.rol] || '/dashboard';

    // IMPORTANTE: redirect() lanza un error NEXT_REDIRECT que Next.js captura internamente
    // NO debemos capturar este error - debe propagarse para que funcione la redireccion
    redirect(redirectPath);
  } catch (error) {
    // CRITICO: Si el error es NEXT_REDIRECT, debemos re-lanzarlo
    // Este es el mecanismo interno de Next.js para las redirecciones
    if (error && typeof error === 'object' && 'digest' in error) {
      const digest = (error as any).digest;
      if (typeof digest === 'string' && digest.startsWith('NEXT_REDIRECT')) {
        throw error; // Re-lanzar para que Next.js lo maneje
      }
    }

    // Solo capturamos errores reales (validacion, red, etc)
    return {
      success: false,
      error: 'Error al iniciar sesion. Por favor intenta nuevamente.',
    };
  }
}

// Server Action para hacer logout
export async function logoutAction() {
  try {
    // Borrar la cookie del token
    const cookieStore = await cookies();
    cookieStore.delete('accessToken');

    // Redirect a la pagina de login
    redirect(AUTH_ROUTES.login);
  } catch {
    // Si falla, igual intentar redirect
    redirect(AUTH_ROUTES.login);
  }
}

// Server Action para obtener el usuario actual desde el token
export async function getCurrentUserAction() {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get('accessToken')?.value;

    if (!token) {
      return { success: false, error: 'No autenticado' };
    }

    // Llamar al endpoint /profile del backend
    const response = await fetch(`${API_URL}/auth/profile`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
      credentials: 'include',
    });

    if (!response.ok) {
      return { success: false, error: 'Token invalido o expirado' };
    }

    const data = await response.json();

    return {
      success: true,
      user: data.user,
    };
  } catch {
    return { success: false, error: 'Error al obtener usuario' };
  }
}
