-- DropIndex
DROP INDEX IF EXISTS "dietary_preferences_type_idx";

-- DropIndex
DROP INDEX IF EXISTS "dietary_preferences_userId_type_key";

-- AlterTable: drop type column, add types column
ALTER TABLE "dietary_preferences" DROP COLUMN IF EXISTS "type";
ALTER TABLE "dietary_preferences" ADD COLUMN IF NOT EXISTS "types" JSONB;

-- Delete duplicate rows, keeping only one per userId
DELETE FROM "dietary_preferences" a
USING "dietary_preferences" b
WHERE a."userId" = b."userId" AND a."id" > b."id";

-- CreateIndex unique on userId
CREATE UNIQUE INDEX IF NOT EXISTS "dietary_preferences_userId_key" ON "dietary_preferences"("userId");
