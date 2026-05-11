import pino from "pino";

import { pinoConfig } from "./pino";

export const logger = pino(pinoConfig);