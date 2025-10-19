import { z } from "zod";

export const SignupRequestSchema = z.object({
  nombre: z.string().min(1, "El nombre no puede estar vacío"),
  apellido: z.string().min(1, "El apellido no puede estar vacío"),
  email: z.string().min(1, "El email no puede estar vacío").email("Debe ser un email válido"),
  foto: z.string().min(1, "La foto no puede estar vacía"),
  edad: z.string().min(1, "La edad no puede estar vacía"),
  genero: z.string().min(1, "El genero no puede estar vacío"),
  domicilio: z.string().min(1, "El domicilio no puede estar vacío"),
  password: z.string().min(6, "La contraseña debe tener al menos 6 caracteres"),
});

export type SignupRequest = z.infer<typeof SignupRequestSchema>;

export const VerifyRequestSchema = z.object({
  email: z.string().min(1, "El email no puede estar vacío").email("Debe ser un email válido"),
  code: z.string().min(6, "El código debe tener 6 caracteres").max(6, "El código debe tener 6 caracteres"),
});

export type VerifyRequest = z.infer<typeof VerifyRequestSchema>;

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
