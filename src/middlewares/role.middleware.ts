import type { RoleType } from "@prisma/client";
import type { NextFunction, Request, Response } from "express";


import { AppError } from "../common/errors/app-error";

export const requireRoles = (allowedRoles: RoleType[]) => {
  return (req: Request, _res: Response, next: NextFunction): void => {
    if (!req.user) {
      next(new AppError("Authentication required", 401, "UNAUTHENTICATED"));

      return;
    }

    const hasRequiredRole = allowedRoles.some((role) =>
      req.user?.roles.includes(role),
    );

    if (!hasRequiredRole) {
      next(new AppError("Insufficient permissions", 403, "FORBIDDEN"));

      return;
    }

    next();
  };
};
