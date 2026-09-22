-- CreateEnum
CREATE TYPE "UserRole" AS ENUM ('customer', 'admin');

-- AlterTable (safe for existing rows)
ALTER TABLE "User" ADD COLUMN "fullName" TEXT;
ALTER TABLE "User" ADD COLUMN "dateOfBirth" DATE;
ALTER TABLE "User" ADD COLUMN "passwordHash" TEXT;
ALTER TABLE "User" ADD COLUMN "role" "UserRole" NOT NULL DEFAULT 'customer';

UPDATE "User"
SET
  "fullName" = COALESCE("name", 'User'),
  "dateOfBirth" = COALESCE("dateOfBirth", DATE '2000-01-01'),
  "passwordHash" = COALESCE("passwordHash", '')
WHERE "fullName" IS NULL OR "dateOfBirth" IS NULL OR "passwordHash" IS NULL;

ALTER TABLE "User" ALTER COLUMN "fullName" SET NOT NULL;
ALTER TABLE "User" ALTER COLUMN "dateOfBirth" SET NOT NULL;
ALTER TABLE "User" ALTER COLUMN "passwordHash" SET NOT NULL;

ALTER TABLE "User" DROP COLUMN IF EXISTS "name";
