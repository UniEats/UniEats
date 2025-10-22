import { z } from "zod";

export const SignupRequestSchema = z.object({
  nombre: z.string().min(1, "Name can't be void"),
  apellido: z.string().min(1, "Surname can't be void"),
  email: z.string().min(1, "Email can't be void").email("Email must be valid"),
  foto: z
    .instanceof(File)
    .or(z.null())
    .refine((file) => file !== null, "Image is required")
    .refine((file) => file && file.size <= 2 * 1024 * 1024, "Image must be less than 2MB."),
  edad: z.string().min(1, "Age can't be void"),
  genero: z.string().min(1, "Genre can't be void"),
  domicilio: z.string().min(1, "Residence can't be void"),
  password: z.string().min(6, "Password must have at least 6 characters."),
});

export type SignupRequest = z.infer<typeof SignupRequestSchema>;

export const VerifyRequestSchema = z.object({
  email: z.string().min(1, "Email can't be void").email("Email must be valid"),
  code: z.string().min(6, "Code must have 6 characters").max(6, "Code must have 6 characters"),
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

export const MessageResponseSchema = z.object({
  message: z.string(),
});

export type SignUpResponse = z.infer<typeof MessageResponseSchema>;
