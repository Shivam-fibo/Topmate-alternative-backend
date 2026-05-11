import dotenv from "dotenv";
import pino from "pino";
import { z } from "zod";

dotenv.config();

const envLogger = pino({
  level: "fatal",
  base: undefined,
  timestamp: pino.stdTimeFunctions.isoTime,
});

const envSchema = z.object({
  PORT: z.coerce.number().int().positive().default(5000),

  NODE_ENV: z.enum([
    "development",
    "production",
    "test",
  ]),

  DATABASE_URL: z.url(),

  CLIENT_URL: z.url(),

  TRUST_PROXY: z
    .union([
      z.boolean(),
      z.coerce.number().int().nonnegative(),
      z.string().min(1),
    ])
    .default(1),

  JWT_ACCESS_SECRET: z
    .string()
    .min(10, "JWT_ACCESS_SECRET is too short"),

  JWT_REFRESH_SECRET: z
    .string()
    .min(10, "JWT_REFRESH_SECRET is too short"),
});

const parsedEnv = envSchema.safeParse(process.env);

if (!parsedEnv.success) {
  envLogger.fatal(
    {
      errors:
        parsedEnv.error.flatten().fieldErrors,
    },
    "Invalid environment variables",
  );

  process.exit(1);
}

export const env = parsedEnv.data;
