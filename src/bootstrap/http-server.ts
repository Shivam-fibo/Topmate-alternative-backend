import { Server } from "node:http";

import { Express } from "express";

import { config } from "../config";
import { logger } from "../logger";

export const startHttpServer = (
  app: Express,
): Server => {
  const server = app.listen(config.port, () => {
    logger.info(
      {
        port: config.port,
        environment: config.nodeEnv,
      },
      "HTTP server started",
    );
  });

  server.keepAliveTimeout = 65_000;
  server.headersTimeout = 66_000;

  return server;
};
