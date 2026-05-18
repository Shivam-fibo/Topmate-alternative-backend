import { RoleType } from "@prisma/client";
import { addDays } from "date-fns";

import { AppError } from "../../common/errors/app-error";
import { runTransaction } from "../../database/transaction";

import {
  assignRoleToUser,
  createMentorProfile,
  createUser,
  findRoleByName,
  findUserByEmail,
  rotateSessionToken,
} from "./auth.repository";
import { createSession } from "./auth.repository";
import type { RegisterUserInput } from "./auth.types";
import type { LoginUserInput, AuthResponse } from "./auth.types";
import {
  hashPassword,
  comparePassword,
  generateAccessToken,
  generateRefreshToken,
} from "./auth.utils";
import { hashToken } from "./auth.utils";
import { sendVerificationEmail } from "./services/email-verification.service";

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

    // tokenVersion:
    // 1,
  });

  const refreshToken = generateRefreshToken({
    sessionId: session.id,

    // tokenVersion:
    // 1,
  });

  const refreshTokenHash = hashToken(refreshToken);

  await rotateSessionToken({
    sessionId: session.id,

    refreshTokenHash,

    expiresAt: addDays(new Date(), 30),
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
