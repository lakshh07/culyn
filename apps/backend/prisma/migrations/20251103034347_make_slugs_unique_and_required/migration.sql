/*
  Warnings:

  - Made the column `slug` on table `ingredients` required. This step will fail if there are existing NULL values in that column.
  - Made the column `slug` on table `recipes` required. This step will fail if there are existing NULL values in that column.
  - Made the column `slug` on table `tags` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "ingredients" ALTER COLUMN "slug" SET NOT NULL;

-- AlterTable
ALTER TABLE "recipes" ALTER COLUMN "slug" SET NOT NULL;

-- AlterTable
ALTER TABLE "tags" ALTER COLUMN "slug" SET NOT NULL;
