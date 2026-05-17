import type { Prisma } from "@prisma/client";

import { prisma } from "./prisma";

export const runTransaction = async <T>(
  callback: (tx: Prisma.TransactionClient) => Promise<T>,
): Promise<T> => {
  return prisma.$transaction((tx) => {
    return callback(tx);
  });
};
