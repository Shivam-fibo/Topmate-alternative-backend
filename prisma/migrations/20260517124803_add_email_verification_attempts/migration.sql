-- AlterTable
ALTER TABLE "public"."EmailVerificationToken" ADD COLUMN     "attemptCount" INTEGER NOT NULL DEFAULT 0;
