import ky from 'ky';

// URL del backend - por defecto localhost:3000
const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api';

// Cliente HTTP configurado para comunicarse con el backend
export const apiClient = ky.create({
  prefixUrl: API_URL,
  credentials: 'include', // Incluir cookies (accessToken HttpOnly)
  hooks: {
    beforeRequest: [
      (request) => {
        // El token JWT ya esta en la cookie HttpOnly
        // Se envia automaticamente con credentials: 'include'
      },
    ],
    afterResponse: [
      async (_request, _options, response) => {
        // Manejar respuestas no exitosas
        if (!response.ok) {
          const errorData = await response.json().catch(() => ({
            message: 'Error desconocido',
          }));
          const message =
            typeof errorData === 'object' && errorData !== null && 'message' in errorData
              ? String(errorData.message)
              : 'Error en la peticion';
          throw new Error(message);
        }
      },
    ],
  },
});
