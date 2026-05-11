import { Server } from "node:http";

import { shutdownServer } from "./shutdown";

export const registerProcessHandlers = (
  server: Server,
): void => {
  process.on("SIGINT", () => {
    void shutdownServer(server, {
      reason: "SIGINT",
      exitCode: 0,
    });
  });

  process.on("SIGTERM", () => {
    void shutdownServer(server, {
      reason: "SIGTERM",
      exitCode: 0,
    });
  });

  process.on("uncaughtException", (error) => {
    void shutdownServer(server, {
      reason: "uncaughtException",
      exitCode: 1,
      error,
    });
  });

  process.on("unhandledRejection", (reason) => {
    void shutdownServer(server, {
      reason: "unhandledRejection",
      exitCode: 1,
      error: reason,
    });
  });
};
