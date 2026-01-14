/*
  Warnings:

  - The values [IMPORTED,AI_GENERATED,COMMUNITY] on the enum `RecipeSourceType` will be removed. If these variants are still used in the database, this will fail.
  - You are about to drop the column `imagePrompt` on the `recipes` table. All the data in the column will be lost.
  - You are about to drop the column `instructions` on the `recipes` table. All the data in the column will be lost.
  - You are about to drop the column `prepTime` on the `recipes` table. All the data in the column will be lost.
  - Added the required column `cookingSteps` to the `recipes` table without a default value. This is not possible if the table is not empty.
  - Added the required column `ingredients` to the `recipes` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "JobType" AS ENUM ('RECIPE_GENERATION');

-- CreateEnum
CREATE TYPE "JobStatus" AS ENUM ('QUEUED', 'PENDING', 'RUNNING', 'COMPLETED', 'FAILED', 'CANCELLED', 'PAUSED');

-- AlterEnum
BEGIN;
CREATE TYPE "RecipeSourceType_new" AS ENUM ('MANUAL', 'INSTAGRAM_REEL', 'INSTAGRAM_POST', 'INSTAGRAM_VIDEO', 'TIKTOK');
ALTER TABLE "public"."recipes" ALTER COLUMN "sourceType" DROP DEFAULT;
ALTER TABLE "recipes" ALTER COLUMN "sourceType" TYPE "RecipeSourceType_new" USING ("sourceType"::text::"RecipeSourceType_new");
ALTER TYPE "RecipeSourceType" RENAME TO "RecipeSourceType_old";
ALTER TYPE "RecipeSourceType_new" RENAME TO "RecipeSourceType";
DROP TYPE "public"."RecipeSourceType_old";
ALTER TABLE "recipes" ALTER COLUMN "sourceType" SET DEFAULT 'MANUAL';
COMMIT;

-- AlterTable
ALTER TABLE "recipes" DROP COLUMN "imagePrompt",
DROP COLUMN "instructions",
DROP COLUMN "prepTime",
ADD COLUMN     "cookingSteps" JSONB NOT NULL,
ADD COLUMN     "ingredients" JSONB NOT NULL,
ADD COLUMN     "sourceMetadata" JSONB,
ADD COLUMN     "tagline" TEXT;

-- CreateTable
CREATE TABLE "jobs" (
    "id" TEXT NOT NULL,
    "bullJobId" TEXT,
    "type" "JobType" NOT NULL,
    "status" "JobStatus" NOT NULL DEFAULT 'QUEUED',
    "progress" INTEGER NOT NULL DEFAULT 0,
    "jobData" JSONB,
    "resultData" JSONB,
    "errorData" JSONB,
    "metadata" JSONB,
    "userId" TEXT,
    "orgId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "failedAt" TIMESTAMP(3),
    "startedAt" TIMESTAMP(3),
    "completedAt" TIMESTAMP(3),

    CONSTRAINT "jobs_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "jobs_bullJobId_key" ON "jobs"("bullJobId");

-- CreateIndex
CREATE INDEX "jobs_id_type_status_idx" ON "jobs"("id", "type", "status");

-- CreateIndex
CREATE INDEX "jobs_id_type_idx" ON "jobs"("id", "type");

-- CreateIndex
CREATE INDEX "jobs_userId_idx" ON "jobs"("userId");

-- CreateIndex
CREATE INDEX "jobs_orgId_idx" ON "jobs"("orgId");

-- CreateIndex
CREATE INDEX "jobs_type_idx" ON "jobs"("type");

-- CreateIndex
CREATE INDEX "jobs_status_idx" ON "jobs"("status");

-- CreateIndex
CREATE INDEX "jobs_bullJobId_idx" ON "jobs"("bullJobId");

-- CreateIndex
CREATE INDEX "jobs_createdAt_idx" ON "jobs"("createdAt");

-- AddForeignKey
ALTER TABLE "jobs" ADD CONSTRAINT "jobs_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "jobs" ADD CONSTRAINT "jobs_orgId_fkey" FOREIGN KEY ("orgId") REFERENCES "organizations"("id") ON DELETE SET NULL ON UPDATE CASCADE;
