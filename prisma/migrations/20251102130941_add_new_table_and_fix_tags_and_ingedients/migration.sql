/*
  Warnings:

  - You are about to drop the column `tag` on the `recipe_tags` table. All the data in the column will be lost.
  - You are about to drop the column `type` on the `recipe_tags` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[recipeId,tagId]` on the table `recipe_tags` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `tagId` to the `recipe_tags` table without a default value. This is not possible if the table is not empty.

*/
-- DropIndex
DROP INDEX "public"."recipe_tags_recipeId_tag_key";

-- DropIndex
DROP INDEX "public"."recipe_tags_tag_idx";

-- DropIndex
DROP INDEX "public"."recipe_tags_type_idx";

-- AlterTable
ALTER TABLE "recipe_tags" DROP COLUMN "tag",
DROP COLUMN "type",
ADD COLUMN     "tagId" TEXT NOT NULL;

-- CreateTable
CREATE TABLE "tags" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "type" "TagType" NOT NULL DEFAULT 'CUSTOM',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "tags_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "tags_name_key" ON "tags"("name");

-- CreateIndex
CREATE INDEX "tags_name_idx" ON "tags"("name");

-- CreateIndex
CREATE INDEX "tags_type_idx" ON "tags"("type");

-- CreateIndex
CREATE INDEX "tags_deletedAt_idx" ON "tags"("deletedAt");

-- CreateIndex
CREATE INDEX "recipe_tags_tagId_idx" ON "recipe_tags"("tagId");

-- CreateIndex
CREATE UNIQUE INDEX "recipe_tags_recipeId_tagId_key" ON "recipe_tags"("recipeId", "tagId");

-- AddForeignKey
ALTER TABLE "recipe_tags" ADD CONSTRAINT "recipe_tags_tagId_fkey" FOREIGN KEY ("tagId") REFERENCES "tags"("id") ON DELETE CASCADE ON UPDATE CASCADE;
