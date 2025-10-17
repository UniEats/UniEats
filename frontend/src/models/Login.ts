import { z } from "zod";

export const SignupRequestSchema = z.object({
  nombre: z.string().min(1, "El nombre no puede estar vacío"),
  apellido: z.string().min(1, "El apellido no puede estar vacío"),
  email: z.string().email("Debe ser un email válido"),
  foto: z.string().default(""),
  edad: z.string().default(""),
  genero: z.string().default(""),
  domicilio: z.string().default(""),
  password: z.string().min(6, "La contraseña debe tener al menos 6 caracteres"),
});

export type SignupRequest = z.infer<typeof SignupRequestSchema>;


export const LoginRequestSchema = z.object({
  username: z.string().min(1, "Username must not be empty"),
  password: z.string().min(1, "Password must not be empty"),
});

export type LoginRequest = z.infer<typeof LoginRequestSchema>;

export const AuthResponseSchema = z.object({
  accessToken: z.string().min(1),
  refreshToken: z.string().min(1),
  role: z.string(),
});

export type AuthResponse = z.infer<typeof AuthResponseSchema>;
