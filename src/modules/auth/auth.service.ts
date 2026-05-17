import { RoleType } from "@prisma/client";

import { AppError } from "../../common/errors/app-error";
import { runTransaction } from "../../database/transaction";

import {
  assignRoleToUser,
  createMentorProfile,
  createUser,
  findRoleByName,
  findUserByEmail,
} from "./auth.repository";
import type { RegisterUserInput } from "./auth.types";
import { hashPassword } from "./auth.utils";
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
    console.error("Failed to send verification email", error);
  }

  return user;
};
