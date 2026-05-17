import { PrismaClient } from "@prisma/client";

import { config } from "../config";
import { logger } from "../logger";

const globalForPrisma = globalThis as unknown as {
  prisma?: PrismaClient;
};

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: config.nodeEnv === "development" ? ["error", "warn"] : ["error"],
  });

if (config.nodeEnv !== "production") {
  globalForPrisma.prisma = prisma;
}

export const connectPrisma = async (): Promise<void> => {
  try {
    logger.info("Connecting to PostgreSQL database");

    await prisma.$connect();

    await prisma.$queryRaw`SELECT 1`;

    logger.info("PostgreSQL database connected successfully");
  } catch (error) {
    logger.fatal({ error }, "Failed to connect to PostgreSQL database");

    throw error;
  }
};

export const disconnectPrisma = async (): Promise<void> => {
  try {
    logger.info("Disconnecting PostgreSQL database");

    await prisma.$disconnect();

    logger.info("PostgreSQL database disconnected successfully");
  } catch (error) {
    logger.error({ error }, "Failed to disconnect PostgreSQL database");
  }
};
