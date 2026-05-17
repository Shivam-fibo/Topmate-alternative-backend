import { RoleType } from "@prisma/client";

import { prisma } from "../../database/prisma";

const roles: RoleType[] = [RoleType.USER, RoleType.MENTOR, RoleType.ADMIN];

export const seedRoles = async (): Promise<void> => {
  await Promise.all(
    roles.map((roleName) =>
      prisma.role.upsert({
        where: {
          name: roleName,
        },

        update: {},

        create: {
          name: roleName,
        },
      }),
    ),
  );
};
