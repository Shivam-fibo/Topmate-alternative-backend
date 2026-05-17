import { connectPrisma } from "../database/prisma";
import { logger } from "../logger";

export const initializeDatabase = async (): Promise<void> => {
  try {
    logger.info("Initializing database bootstrap");

    await connectPrisma();

    logger.info("Database bootstrap completed successfully");
  } catch (error) {
    logger.fatal({ error }, "Database bootstrap failed");

    process.exit(1);
  }
};
