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
