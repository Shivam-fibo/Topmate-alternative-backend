import type { RoleType } from "@prisma/client";

export {};

declare global {
  namespace Express {
    interface AuthenticatedUser {
      userId: string;

      sessionId: string;

      roles: RoleType[];

      tokenVersion: number;
    }

    interface Request {
      requestId: string;

      user?: AuthenticatedUser;
    }
  }
}
