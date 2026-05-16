import { Prisma } from "@prisma/client";
import type { NextFunction, Request, Response } from "express";
import { ZodError } from "zod";

import { AppError } from "../common/errors/app-error";
import { config } from "../config";
import { logger } from "../logger";

interface ErrorResponse {
  success: false;

  message: string;

  errorCode: string;

  details: unknown;

  timestamp: string;
}

export const globalErrorMiddleware = (
  error: unknown,
  req: Request,
  res: Response,
  _next: NextFunction,
): Response<ErrorResponse> => {
  let statusCode = 500;

  let message = "Internal Server Error";

  let errorCode = "INTERNAL_SERVER_ERROR";

  let details: unknown = null;

  let stack: string | undefined;

  if (error instanceof AppError) {
    statusCode = error.statusCode;

    message = error.isOperational ? error.message : "Internal Server Error";

    errorCode = error.errorCode;

    stack = error.stack;
  } else if (error instanceof ZodError) {
    statusCode = 400;

    message = "Validation failed";

    errorCode = "VALIDATION_ERROR";

    details = error.flatten().fieldErrors;
  } else if (error instanceof Prisma.PrismaClientKnownRequestError) {
    statusCode = 400;

    message = "Database operation failed";

    errorCode = error.code;
  } else if (error instanceof Error) {
    stack = error.stack;
  }

  logger.error({
    requestId: req.requestId,

    method: req.method,

    route: req.originalUrl,

    statusCode,

    errorCode,

    message: error instanceof Error ? error.message : message,

    stack,
  });

  return res.status(statusCode).json({
    success: false,

    message,

    errorCode,

    details,

    timestamp: new Date().toISOString(),

    ...(config.nodeEnv === "development" && stack && { stack }),
  });
};
