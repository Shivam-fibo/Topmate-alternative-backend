import type { NextFunction, Request, Response } from "express";

import { AppError } from "../common/errors/app-error";
import { findSessionById } from "../modules/auth/auth.repository";
import { verifyAccessToken } from "../modules/auth/auth.utils";

const extractBearerToken = (authorizationHeader?: string): string => {
  if (!authorizationHeader) {
    throw new AppError(
      "Authorization token missing",
      401,
      "AUTH_TOKEN_MISSING",
    );
  }

  const [scheme, token] = authorizationHeader.split(" ");

  if (scheme !== "Bearer" || !token) {
    throw new AppError(
      "Invalid authorization format",
      401,
      "INVALID_AUTH_FORMAT",
    );
  }

  return token;
};

export const authMiddleware = async (
  req: Request,
  _res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const token = extractBearerToken(req.headers.authorization);

    const payload = verifyAccessToken(token);

    const session = await findSessionById(payload.sessionId);

    if (!session) {
      throw new AppError("Invalid session", 401, "INVALID_SESSION");
    }

    if (session.revokedAt) {
      throw new AppError("Session revoked", 401, "SESSION_REVOKED");
    }

    if (session.expiresAt <= new Date()) {
      throw new AppError("Session expired", 401, "SESSION_EXPIRED");
    }

    if (session.tokenVersion !== payload.tokenVersion) {
      throw new AppError("Invalid token version", 401, "INVALID_TOKEN_VERSION");
    }

    req.user = {
      userId: session.user.id,

      sessionId: session.id,

      tokenVersion: session.tokenVersion,

      roles: session.user.roles.map((userRole) => userRole.role.name),
    };

    next();
  } catch (error) {
    next(error);
  }
};
