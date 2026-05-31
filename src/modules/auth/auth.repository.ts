import type { Prisma, RoleType } from "@prisma/client";

import { prisma } from "../../database/prisma";

import type {
  CreateUserParams,
  CreateSessionParams,
  RotateSessionTokenParams,
  AssignRoleParams,
  CreateEmailVerificationTokenParams,
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
  slug: string,
  tx?: Prisma.TransactionClient,
) => {
  const database = tx ?? prisma;

  return database.mentorProfile.create({
    data: {
      userId,
      slug,
      onboardingStatus: "NOT_STARTED",
      approvalStatus: "PENDING",
      schedulingConnectionStatus: "NOT_CONNECTED",
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

export const findSessionById = (
  sessionId: string,
  tx?: Prisma.TransactionClient,
) => {
  const database = tx ?? prisma;

  return database.session.findUnique({
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

  return database.session.updateMany({
    where: {
      id: data.sessionId,

      tokenVersion: data.currentTokenVersion,

      revokedAt: null,

      expiresAt: {
        gt: new Date(),
      },
    },

    data: {
      refreshTokenHash: data.refreshTokenHash,

      expiresAt: data.expiresAt,

      tokenVersion: data.nextTokenVersion,

      userAgent: data.userAgent,

      ipAddress: data.ipAddress,

      lastUsedAt: new Date(),
    },
  });
};

export const revokeSession = (
  sessionId: string,
  tx?: Prisma.TransactionClient,
) => {
  const database = tx ?? prisma;

  return database.session.updateMany({
    where: {
      id: sessionId,

      revokedAt: null,
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

export const createEmailVerificationToken = (
  data: CreateEmailVerificationTokenParams,
  tx?: Prisma.TransactionClient,
) => {
  const database = tx ?? prisma;

  return database.emailVerificationToken.create({
    data,
  });
};

export const findEmailVerificationToken = (tokenHash: string) => {
  return prisma.emailVerificationToken.findFirst({
    where: {
      tokenHash,

      usedAt: null,
    },

    include: {
      user: true,
    },

    orderBy: {
      createdAt: "desc",
    },
  });
};

export const markEmailVerificationTokenUsed = (tokenId: string) => {
  return prisma.emailVerificationToken.update({
    where: {
      id: tokenId,
    },

    data: {
      usedAt: new Date(),
    },
  });
};

export const markUserEmailVerified = (userId: string) => {
  return prisma.user.update({
    where: {
      id: userId,
    },

    data: {
      isEmailVerified: true,
    },
  });
};

export const incrementEmailVerificationAttempts = (tokenId: string) => {
  return prisma.emailVerificationToken.update({
    where: {
      id: tokenId,
    },

    data: {
      attemptCount: {
        increment: 1,
      },
    },
  });
};
