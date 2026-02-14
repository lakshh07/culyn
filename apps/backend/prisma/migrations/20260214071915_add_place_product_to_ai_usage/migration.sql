-- AlterTable
ALTER TABLE "ai_usages" ADD COLUMN     "place_id" TEXT,
ADD COLUMN     "product_id" TEXT;

-- CreateIndex
CREATE INDEX "ai_usages_place_id_idx" ON "ai_usages"("place_id");

-- CreateIndex
CREATE INDEX "ai_usages_product_id_idx" ON "ai_usages"("product_id");
