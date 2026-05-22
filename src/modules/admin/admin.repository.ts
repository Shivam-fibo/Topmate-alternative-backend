import { prisma } from "../../database/prisma";

export const findAdminById = (userId: string) => {
  return prisma.user.findUnique({
    where: {
      id: userId,
    },

    include: {
      roles: {
        include: {
          role: true,
        },
      },
    },
  });
};
