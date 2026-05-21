import { z } from "zod";

export const registerUserSchema = z.object({
  email: z.email(),

  password: z.string().min(8).max(72),

  role: z.enum(["USER", "MENTOR"]),
});

export type RegisterUserSchema = z.infer<typeof registerUserSchema>;

export const verifyEmailOtpSchema = z.object({
  otp: z.string().length(6),
});

export type VerifyEmailOtpSchema = z.infer<typeof verifyEmailOtpSchema>;

export const loginSchema = z.object({
  email: z.email(),

  password: z.string().min(8).max(72),
});

export type LoginSchema = z.infer<typeof loginSchema>;

export const refreshTokenSchema = z.object({
  refreshToken: z.string().min(1),
});

export type RefreshTokenSchema = z.infer<typeof refreshTokenSchema>;

export const logoutSchema = z.object({
  refreshToken: z.string().min(1),
});

export type LogoutSchema = z.infer<typeof logoutSchema>;
