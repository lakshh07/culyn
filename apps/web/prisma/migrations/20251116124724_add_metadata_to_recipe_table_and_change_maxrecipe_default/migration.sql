-- AlterTable
ALTER TABLE "recipes" ADD COLUMN     "metadata" JSONB;

-- AlterTable
ALTER TABLE "subscriptions" ALTER COLUMN "maxRecipes" SET DEFAULT 12;
