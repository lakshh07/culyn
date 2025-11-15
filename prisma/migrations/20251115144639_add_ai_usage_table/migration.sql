-- CreateTable
CREATE TABLE "ai_usages" (
    "id" TEXT NOT NULL,
    "feature" TEXT NOT NULL,
    "initiator" TEXT NOT NULL,
    "provider" TEXT NOT NULL,
    "model" TEXT NOT NULL,
    "input_tokens" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "output_tokens" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "user_id" TEXT NOT NULL,
    "recipe_id" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ai_usages_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "ai_usages_user_id_idx" ON "ai_usages"("user_id");

-- CreateIndex
CREATE INDEX "ai_usages_user_id_created_at_idx" ON "ai_usages"("user_id", "created_at");

-- CreateIndex
CREATE INDEX "ai_usages_recipe_id_idx" ON "ai_usages"("recipe_id");

-- CreateIndex
CREATE INDEX "ai_usages_created_at_idx" ON "ai_usages"("created_at");

-- CreateIndex
CREATE INDEX "ai_usages_updated_at_idx" ON "ai_usages"("updated_at");

-- CreateIndex
CREATE INDEX "ai_usages_provider_model_idx" ON "ai_usages"("provider", "model");
