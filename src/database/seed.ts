import { prisma } from "./prisma";
import { seedRoles } from "./seed/role.seed";

const runSeeds = async (): Promise<void> => {
  try {
    console.log("Starting database seeds");

    await seedRoles();

    console.log("Database seeds completed successfully");
  } catch (error) {
    console.error("Database seeds failed", error);

    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
};

void runSeeds();
