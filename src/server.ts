import app from "./app";
import { initializeDatabase } from "./bootstrap/database";
import { startHttpServer } from "./bootstrap/http-server";
import { registerProcessHandlers } from "./bootstrap/process-handlers";
import { logger } from "./logger";

const bootstrapServer = async (): Promise<void> => {
  try {
    logger.info("Starting application bootstrap");

    await initializeDatabase();

    const server = startHttpServer(app);

    registerProcessHandlers(server);

    logger.info("Application bootstrap completed successfully");
  } catch (error) {
    logger.fatal({ error }, "Application bootstrap failed");

    process.exit(1);
  }
};

void bootstrapServer();
