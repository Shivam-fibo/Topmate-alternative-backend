import { env } from "./env";

export const config = {
  port: env.PORT,

  nodeEnv: env.NODE_ENV,

  apiPrefix: "/api/v1",
  
  databaseUrl: env.DATABASE_URL,

  clientUrl: env.CLIENT_URL,
  

  jwt: {
    accessSecret: env.JWT_ACCESS_SECRET,

    refreshSecret: env.JWT_REFRESH_SECRET,
  },
} as const;