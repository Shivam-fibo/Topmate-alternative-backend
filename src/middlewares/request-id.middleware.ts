import { randomUUID } from "crypto";

import { NextFunction, Request, Response } from "express";

export const requestIdMiddleware = (
  req: Request,
  _res: Response,
  next: NextFunction,
): void => {
  req.requestId = randomUUID();

  next();
};