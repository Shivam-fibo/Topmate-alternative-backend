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
    input.role === RoleType.MENTOR
      ? await findRoleByName(RoleType.MENTOR)
      : null;

  return runTransaction(async (tx) => {
    const user = await createUser(
      {
        email: input.email,

        passwordHash,
      },
      tx,
    );

    await assignRoleToUser(
      {
        userId: user.id,

        roleId: userRole.id,
      },
      tx,
    );

    if (mentorRole) {
      await assignRoleToUser(
        {
          userId: user.id,

          roleId: mentorRole.id,
        },
        tx,
      );

      await createMentorProfile(user.id, tx);
    }

    return user;
  });
};
