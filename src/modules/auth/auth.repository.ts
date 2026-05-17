import type { Prisma, RoleType } from "@prisma/client";

import { prisma } from "../../database/prisma";

import type {
  CreateUserParams,
  CreateSessionParams,
  RotateSessionTokenParams,
  AssignRoleParams,
} from "./auth.types";

export const findUserByEmail = (email: string) => {
  return prisma.user.findUnique({
    where: {
      email,
    },

    include: {
      roles: {
        include: {
          role: true,
        },
      },

      mentorProfile: true,
    },
  });
};

export const findRoleByName = (roleName: RoleType) => {
  return prisma.role.findUnique({
    where: {
      name: roleName,
    },
  });
};

export const createUser = (
  data: CreateUserParams,
  tx?: Prisma.TransactionClient,
) => {
  const database = tx ?? prisma;

  return database.user.create({
    data,
  });
};

export const assignRoleToUser = (
  data: AssignRoleParams,
  tx?: Prisma.TransactionClient,
) => {
  const database = tx ?? prisma;

  return database.userRole.create({
    data,
  });
};

export const createMentorProfile = (
  userId: string,
  tx?: Prisma.TransactionClient,
) => {
  const database = tx ?? prisma;

  return database.mentorProfile.create({
    data: {
      userId,
    },
  });
};

export const createSession = (
  data: CreateSessionParams,
  tx?: Prisma.TransactionClient,
) => {
  const database = tx ?? prisma;

  return database.session.create({
    data,
  });
};

export const findSessionById = (sessionId: string) => {
  return prisma.session.findUnique({
    where: {
      id: sessionId,
    },

    include: {
      user: {
        include: {
          roles: {
            include: {
              role: true,
            },
          },

          mentorProfile: true,
        },
      },
    },
  });
};

export const rotateSessionToken = (
  data: RotateSessionTokenParams,
  tx?: Prisma.TransactionClient,
) => {
  const database = tx ?? prisma;

  return database.session.update({
    where: {
      id: data.sessionId,
    },

    data: {
      refreshTokenHash: data.refreshTokenHash,

      expiresAt: data.expiresAt,

      tokenVersion: {
        increment: 1,
      },

      lastUsedAt: new Date(),
    },
  });
};

export const revokeSession = (sessionId: string) => {
  return prisma.session.update({
    where: {
      id: sessionId,
    },

    data: {
      revokedAt: new Date(),
    },
  });
};

export const revokeAllUserSessions = (userId: string) => {
  return prisma.session.updateMany({
    where: {
      userId,

      revokedAt: null,
    },

    data: {
      revokedAt: new Date(),
    },
  });
};

export const updateSessionLastUsed = (sessionId: string) => {
  return prisma.session.update({
    where: {
      id: sessionId,
    },

    data: {
      lastUsedAt: new Date(),
    },
  });
};
