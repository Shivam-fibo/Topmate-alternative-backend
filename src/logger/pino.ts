import pino from "pino";

import { config } from "../config";

const isDevelopment =
  config.nodeEnv === "development";

export const pinoConfig: pino.LoggerOptions = {
  level: isDevelopment ? "debug" : "info",

  base: undefined,

  timestamp: pino.stdTimeFunctions.isoTime,

  transport: isDevelopment
    ? {
        target: "pino-pretty",

        options: {
          colorize: true,
          translateTime: "SYS:standard",
          ignore: "pid,hostname",
        },
      }
    : undefined,
};