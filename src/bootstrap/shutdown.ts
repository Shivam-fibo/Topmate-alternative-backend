import { Server } from "node:http";

import { disconnectPrisma } from "../database/prisma";
import { logger } from "../logger";

const FORCE_SHUTDOWN_TIMEOUT_MS = 10_000;

type ShutdownReason =
  | "SIGINT"
  | "SIGTERM"
  | "uncaughtException"
  | "unhandledRejection";

interface ShutdownOptions {
  reason: ShutdownReason;
  exitCode: number;
  error?: unknown;
}

let isShuttingDown = false;

const closeHttpServer = (
  server: Server,
): Promise<void> => {
  return new Promise((resolve, reject) => {
    server.close((error) => {
      if (error) {
        reject(error);

        return;
      }

      resolve();
    });
  });
};

const forceCloseConnections = (
  server: Server,
): void => {
  if (typeof server.closeAllConnections === "function") {
    server.closeAllConnections();
  }
};

export const shutdownServer = async (
  server: Server,
  options: ShutdownOptions,
): Promise<void> => {
  if (isShuttingDown) {
    logger.warn(
      { reason: options.reason },
      "Shutdown already in progress",
    );

    return;
  }

  isShuttingDown = true;

  if (options.error) {
    logger.fatal(
      {
        reason: options.reason,
        error: options.error,
      },
      "Fatal process error received",
    );
  }

  logger.info(
    {
      reason: options.reason,
      exitCode: options.exitCode,
    },
    "Starting graceful shutdown",
  );

  const forceShutdownTimer = setTimeout(() => {
    logger.error(
      {
        reason: options.reason,
        timeoutMs: FORCE_SHUTDOWN_TIMEOUT_MS,
      },
      "Graceful shutdown timed out; forcing connection close",
    );

    forceCloseConnections(server);
  }, FORCE_SHUTDOWN_TIMEOUT_MS);

  forceShutdownTimer.unref();

  try {
    await closeHttpServer(server);

    logger.info(
      "HTTP server closed successfully",
    );

    await disconnectPrisma();

    logger.info(
      "Prisma disconnected successfully",
    );

    logger.info(
      {
        exitCode: options.exitCode,
      },
      "Graceful shutdown completed",
    );

    process.exit(options.exitCode);
  } catch (error) {
    logger.error(
      { error },
      "Graceful shutdown failed",
    );

    process.exit(1);
  } finally {
    clearTimeout(forceShutdownTimer);
  }
};
