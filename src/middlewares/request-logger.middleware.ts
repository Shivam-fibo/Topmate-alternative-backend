import {
  NextFunction,
  Request,
  Response,
} from "express";

import { logger } from "../logger";

export const requestLoggerMiddleware = (
  req: Request,
  res: Response,
  next: NextFunction,
): void => {
  const startTime = Date.now();

  res.on("finish", () => {
    const responseTime =
      Date.now() - startTime;

    logger.info({
      requestId: req.requestId,

      method: req.method,

      route: req.originalUrl,

      statusCode: res.statusCode,

      responseTime: `${responseTime}ms`,
    });
  });

  next();
};