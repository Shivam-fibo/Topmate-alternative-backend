import dotenv from "dotenv";
import { z } from "zod";

dotenv.config();

const envSchema = z.object({
  PORT: z.coerce.number().int().positive().default(5000),

  NODE_ENV: z.enum([
    "development",
    "production",
    "test",
  ]),

  DATABASE_URL: z.url(),

  CLIENT_URL: z.url(),

  JWT_ACCESS_SECRET: z
    .string()
    .min(10, "JWT_ACCESS_SECRET is too short"),

  JWT_REFRESH_SECRET: z
    .string()
    .min(10, "JWT_REFRESH_SECRET is too short"),
});

const parsedEnv = envSchema.safeParse(process.env);

if (!parsedEnv.success) {
  process.stderr.write(
    "Invalid environment variables:\n",
  );

  process.stderr.write(
    JSON.stringify(
      parsedEnv.error.flatten().fieldErrors,
      null,
      2,
    ),
  );

  process.exit(1);
}

export const env = parsedEnv.data;