import { RoleType } from "@prisma/client";

import { config } from "../../config";
import { prisma } from "../../database/prisma";
import { logger } from "../../logger";
import { hashPassword } from "../../modules/auth/auth.utils";

export const seedAdmin = async (): Promise<void> => {
  const existingAdmin = await prisma.user.findUnique({
    where: {
      email: config.admin.email,
    },

    include: {
      roles: {
        include: {
          role: true,
        },
      },
    },
  });

  if (existingAdmin) {
    logger.info(
      {
        email: existingAdmin.email,
      },
      "Admin already exists, skipping admin seed",
    );

    return;
  }

  const passwordHash = await hashPassword(config.admin.password);

  const userRole = await prisma.role.findUnique({
    where: {
      name: RoleType.USER,
    },
  });

  const adminRole = await prisma.role.findUnique({
    where: {
      name: RoleType.ADMIN,
    },
  });

  if (!userRole || !adminRole) {
    throw new Error("Required roles not found");
  }

  const adminUser = await prisma.user.create({
    data: {
      email: config.admin.email,

      passwordHash,

      isEmailVerified: true,

      roles: {
        create: [
          {
            roleId: userRole.id,
          },

          {
            roleId: adminRole.id,
          },
        ],
      },
    },
  });

  logger.info(
    {
      userId: adminUser.id,

      email: adminUser.email,
    },
    "Admin seeded successfully",
  );
};
