import { RoleType } from "@prisma/client";
import { addDays } from "date-fns";

import { AppError } from "../../common/errors/app-error";
import { runTransaction } from "../../database/transaction";
import { logger } from "../../logger";

import {
  assignRoleToUser,
  createMentorProfile,
  createSession,
  createUser,
  findRoleByName,
  findSessionById,
  findUserByEmail,
  revokeSession,
  rotateSessionToken,
} from "./auth.repository";
import type {
  AuthResponse,
  LoginUserInput,
  LogoutInput,
  RefreshTokenInput,
  RegisterUserInput,
} from "./auth.types";
import {
  hashPassword,
  comparePassword,
  compareTokenHash,
  generateAccessToken,
  generateRefreshToken,
  verifyRefreshToken,
} from "./auth.utils";
import { hashToken } from "./auth.utils";
import { sendVerificationEmail } from "./services/email-verification.service";

const createInvalidRefreshTokenError = () => {
  return new AppError("Invalid refresh token", 401, "INVALID_REFRESH_TOKEN");
};

const verifyRefreshTokenOrThrow = (refreshToken: string) => {
  try {
    return verifyRefreshToken(refreshToken);
  } catch {
    throw createInvalidRefreshTokenError();
  }
};

export const registerUser = async (input: RegisterUserInput) => {
  const existingUser = await findUserByEmail(input.email);

  if (existingUser) {
    throw new AppError("User already exists", 409, "USER_ALREADY_EXISTS");
  }

  const passwordHash = await hashPassword(input.password);

  const userRole = await findRoleByName(RoleType.USER);

  if (!userRole) {
    throw new AppError("USER role not found", 500, "ROLE_NOT_FOUND");
  }

  const mentorRole =
    input.role === "MENTOR" ? await findRoleByName(RoleType.MENTOR) : null;

  const user = await runTransaction(async (tx) => {
    const createdUser = await createUser(
      {
        email: input.email,

        passwordHash,
      },
      tx,
    );

    await assignRoleToUser(
      {
        userId: createdUser.id,

        roleId: userRole.id,
      },
      tx,
    );

    if (mentorRole) {
      await assignRoleToUser(
        {
          userId: createdUser.id,

          roleId: mentorRole.id,
        },
        tx,
      );

      await createMentorProfile(createdUser.id, tx);
    }

    return createdUser;
  });

  try {
    await sendVerificationEmail({
      userId: user.id,

      email: user.email,
    });
  } catch (error) {
    console.error(
      "Failed to send verification email",
      JSON.stringify(error, null, 2),
    );
  }

  return user;
};

export const loginUser = async (
  input: LoginUserInput,
): Promise<AuthResponse> => {
  const user = await findUserByEmail(input.email);

  if (!user) {
    throw new AppError("Invalid credentials", 401, "INVALID_CREDENTIALS");
  }

  if (!user.isEmailVerified) {
    throw new AppError("Email not verified", 403, "EMAIL_NOT_VERIFIED");
  }

  const isPasswordValid = await comparePassword(
    input.password,
    user.passwordHash,
  );

  if (!isPasswordValid) {
    throw new AppError("Invalid credentials", 401, "INVALID_CREDENTIALS");
  }

  const session = await createSession({
    userId: user.id,

    refreshTokenHash: "",

    expiresAt: addDays(new Date(), 30),

    userAgent: input.userAgent,

    ipAddress: input.ipAddress,
  });

  const roles = user.roles.map((userRole) => userRole.role.name);

  const accessToken = generateAccessToken({
    userId: user.id,

    sessionId: session.id,

    roles,

    tokenVersion: session.tokenVersion,
  });

  const refreshToken = generateRefreshToken({
    sessionId: session.id,

    tokenVersion: session.tokenVersion,
  });

  const refreshTokenHash = hashToken(refreshToken);

  await rotateSessionToken({
    sessionId: session.id,

    refreshTokenHash,

    expiresAt: addDays(new Date(), 30),

    currentTokenVersion: session.tokenVersion,

    nextTokenVersion: session.tokenVersion,
  });

  return {
    accessToken,

    refreshToken,

    user: {
      id: user.id,

      email: user.email,

      isEmailVerified: user.isEmailVerified,

      roles,
    },
  };
};

export const refreshAuthToken = async (
  input: RefreshTokenInput,
): Promise<AuthResponse> => {
  const tokenPayload = verifyRefreshTokenOrThrow(input.refreshToken);

  return runTransaction(async (tx) => {
    const session = await findSessionById(tokenPayload.sessionId, tx);

    if (!session) {
      throw createInvalidRefreshTokenError();
    }

    if (session.revokedAt) {
      throw createInvalidRefreshTokenError();
    }

    if (session.expiresAt <= new Date()) {
      throw createInvalidRefreshTokenError();
    }

    if (session.tokenVersion !== tokenPayload.tokenVersion) {
      throw createInvalidRefreshTokenError();
    }

    if (!compareTokenHash(input.refreshToken, session.refreshTokenHash)) {
      throw createInvalidRefreshTokenError();
    }

    const roles = session.user.roles.map((userRole) => userRole.role.name);

    const nextTokenVersion = session.tokenVersion + 1;

    const accessToken = generateAccessToken({
      userId: session.user.id,

      sessionId: session.id,

      roles,

      tokenVersion: nextTokenVersion,
    });

    const refreshToken = generateRefreshToken({
      sessionId: session.id,

      tokenVersion: nextTokenVersion,
    });

    const refreshTokenHash = hashToken(refreshToken);

    const rotationResult = await rotateSessionToken(
      {
        sessionId: session.id,

        refreshTokenHash,

        expiresAt: addDays(new Date(), 30),

        currentTokenVersion: session.tokenVersion,

        nextTokenVersion,

        userAgent: input.userAgent,

        ipAddress: input.ipAddress,
      },
      tx,
    );

    if (rotationResult.count !== 1) {
      throw createInvalidRefreshTokenError();
    }

    logger.info(
      {
        userId: session.user.id,

        sessionId: session.id,
      },
      "Refresh token rotated",
    );

    return {
      accessToken,

      refreshToken,

      user: {
        id: session.user.id,

        email: session.user.email,

        isEmailVerified: session.user.isEmailVerified,

        roles,
      },
    };
  });
};

export const logoutUser = async (input: LogoutInput): Promise<void> => {
  const tokenPayload = verifyRefreshTokenOrThrow(input.refreshToken);

  await runTransaction(async (tx) => {
    const session = await findSessionById(tokenPayload.sessionId, tx);

    if (!session) {
      throw createInvalidRefreshTokenError();
    }

    if (session.revokedAt) {
      return;
    }

    if (session.expiresAt <= new Date()) {
      throw createInvalidRefreshTokenError();
    }

    if (session.tokenVersion !== tokenPayload.tokenVersion) {
      throw createInvalidRefreshTokenError();
    }

    if (!compareTokenHash(input.refreshToken, session.refreshTokenHash)) {
      throw createInvalidRefreshTokenError();
    }

    await revokeSession(session.id, tx);

    logger.info(
      {
        userId: session.userId,

        sessionId: session.id,
      },
      "Session revoked",
    );
  });
};
