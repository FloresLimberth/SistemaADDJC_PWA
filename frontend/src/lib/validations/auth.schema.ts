import { z } from 'zod';

// Schema de validacion para login
// IMPORTANTE: Debe coincidir con LoginDto del backend
export const loginSchema = z.object({
  email: z
    .string({ message: 'El email es requerido' })
    .min(1, { message: 'El email es requerido' })
    .email({ message: 'El email debe ser valido' }),
  password: z
    .string({ message: 'La contrasena es requerida' })
    .min(6, { message: 'La contrasena debe tener minimo 6 caracteres' }),
});

// Tipo TypeScript inferido del schema
export type LoginFormData = z.infer<typeof loginSchema>;
