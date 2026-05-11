import {
  NextFunction,
  Request,
  Response,
} from "express";

import { AppError } from "../common/errors/app-error";

export const notFoundMiddleware = (
  req: Request,
  _res: Response,
  next: NextFunction,
): void => {
  next(
    new AppError(
      `Route ${req.originalUrl} not found`,
      404,
      "ROUTE_NOT_FOUND",
    ),
  );
};