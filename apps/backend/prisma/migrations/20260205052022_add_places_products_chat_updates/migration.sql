-- CreateEnum
CREATE TYPE "SourcePlatform" AS ENUM ('INSTAGRAM_REEL', 'INSTAGRAM_POST', 'INSTAGRAM_VIDEO', 'TIKTOK', 'YOUTUBE_SHORT', 'MANUAL');

-- CreateEnum
CREATE TYPE "ContentCategory" AS ENUM ('RECIPE', 'PLACE', 'PRODUCT');

-- CreateEnum
CREATE TYPE "PlaceType" AS ENUM ('RESTAURANT', 'CAFE', 'BAR', 'BAKERY', 'FOOD_TRUCK', 'MARKET', 'GROCERY_STORE', 'SPECIALTY_SHOP', 'OTHER');

-- CreateEnum
CREATE TYPE "ProductCategory" AS ENUM ('BEAUTY', 'TECH', 'FASHION', 'KITCHEN', 'HOME', 'HEALTH', 'SPORTS', 'BOOKS', 'TOYS', 'OTHER');

-- CreateEnum
CREATE TYPE "ChatContextType" AS ENUM ('GENERAL', 'RECIPE', 'PLACE', 'PRODUCT');

-- AlterEnum
-- This migration adds more than one value to an enum.
-- With PostgreSQL versions 11 and earlier, this is not possible
-- in a single migration. This can be worked around by creating
-- multiple migrations, each migration adding only one value to
-- the enum.


ALTER TYPE "JobType" ADD VALUE 'PLACE_GENERATION';
ALTER TYPE "JobType" ADD VALUE 'PRODUCT_GENERATION';
ALTER TYPE "JobType" ADD VALUE 'CONTENT_IMPORT';

-- AlterTable
ALTER TABLE "chat_conversations" ADD COLUMN     "contextType" "ChatContextType" NOT NULL DEFAULT 'GENERAL',
ADD COLUMN     "placeId" TEXT,
ADD COLUMN     "productId" TEXT;

-- CreateTable
CREATE TABLE "places" (
    "id" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "name" TEXT,
    "shortName" TEXT,
    "description" TEXT,
    "type" "PlaceType" NOT NULL DEFAULT 'OTHER',
    "address" TEXT,
    "city" TEXT,
    "state" TEXT,
    "country" TEXT,
    "postalCode" TEXT,
    "latitude" DECIMAL(10,8),
    "longitude" DECIMAL(11,8),
    "imageUrl" TEXT,
    "thumbnailUrl" TEXT,
    "videoUrl" TEXT,
    "sourceType" "SourcePlatform" NOT NULL DEFAULT 'MANUAL',
    "sourceUrl" TEXT,
    "sourceName" TEXT,
    "sourceMetadata" JSONB,
    "phoneNumber" TEXT,
    "website" TEXT,
    "priceRange" TEXT,
    "cuisine" TEXT,
    "hours" JSONB,
    "rating" DECIMAL(3,2),
    "notes" TEXT,
    "metadata" JSONB,
    "userId" TEXT,
    "orgId" TEXT,
    "isPublic" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "places_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "place_tags" (
    "id" TEXT NOT NULL,
    "placeId" TEXT NOT NULL,
    "tagId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "place_tags_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "place_favorites" (
    "id" TEXT NOT NULL,
    "placeId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "place_favorites_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "products" (
    "id" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "name" TEXT,
    "shortName" TEXT,
    "description" TEXT,
    "category" "ProductCategory" NOT NULL DEFAULT 'OTHER',
    "brand" TEXT,
    "modelNumber" TEXT,
    "price" DECIMAL(10,2),
    "currency" TEXT DEFAULT 'USD',
    "imageUrl" TEXT,
    "thumbnailUrl" TEXT,
    "videoUrl" TEXT,
    "sourceType" "SourcePlatform" NOT NULL DEFAULT 'MANUAL',
    "sourceUrl" TEXT,
    "sourceName" TEXT,
    "sourceMetadata" JSONB,
    "purchaseUrl" TEXT,
    "affiliateUrl" TEXT,
    "specifications" JSONB,
    "features" JSONB,
    "notes" TEXT,
    "metadata" JSONB,
    "userId" TEXT,
    "orgId" TEXT,
    "isPublic" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "products_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "product_tags" (
    "id" TEXT NOT NULL,
    "productId" TEXT NOT NULL,
    "tagId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "product_tags_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "product_favorites" (
    "id" TEXT NOT NULL,
    "productId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "product_favorites_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "places_slug_key" ON "places"("slug");

-- CreateIndex
CREATE INDEX "places_userId_idx" ON "places"("userId");

-- CreateIndex
CREATE INDEX "places_orgId_idx" ON "places"("orgId");

-- CreateIndex
CREATE INDEX "places_type_idx" ON "places"("type");

-- CreateIndex
CREATE INDEX "places_city_idx" ON "places"("city");

-- CreateIndex
CREATE INDEX "places_latitude_longitude_idx" ON "places"("latitude", "longitude");

-- CreateIndex
CREATE INDEX "places_deletedAt_idx" ON "places"("deletedAt");

-- CreateIndex
CREATE INDEX "places_createdAt_idx" ON "places"("createdAt");

-- CreateIndex
CREATE INDEX "place_tags_placeId_idx" ON "place_tags"("placeId");

-- CreateIndex
CREATE INDEX "place_tags_tagId_idx" ON "place_tags"("tagId");

-- CreateIndex
CREATE INDEX "place_tags_deletedAt_idx" ON "place_tags"("deletedAt");

-- CreateIndex
CREATE UNIQUE INDEX "place_tags_placeId_tagId_key" ON "place_tags"("placeId", "tagId");

-- CreateIndex
CREATE INDEX "place_favorites_placeId_idx" ON "place_favorites"("placeId");

-- CreateIndex
CREATE INDEX "place_favorites_userId_idx" ON "place_favorites"("userId");

-- CreateIndex
CREATE INDEX "place_favorites_deletedAt_idx" ON "place_favorites"("deletedAt");

-- CreateIndex
CREATE UNIQUE INDEX "place_favorites_placeId_userId_key" ON "place_favorites"("placeId", "userId");

-- CreateIndex
CREATE UNIQUE INDEX "products_slug_key" ON "products"("slug");

-- CreateIndex
CREATE INDEX "products_userId_idx" ON "products"("userId");

-- CreateIndex
CREATE INDEX "products_orgId_idx" ON "products"("orgId");

-- CreateIndex
CREATE INDEX "products_category_idx" ON "products"("category");

-- CreateIndex
CREATE INDEX "products_brand_idx" ON "products"("brand");

-- CreateIndex
CREATE INDEX "products_deletedAt_idx" ON "products"("deletedAt");

-- CreateIndex
CREATE INDEX "products_createdAt_idx" ON "products"("createdAt");

-- CreateIndex
CREATE INDEX "product_tags_productId_idx" ON "product_tags"("productId");

-- CreateIndex
CREATE INDEX "product_tags_tagId_idx" ON "product_tags"("tagId");

-- CreateIndex
CREATE INDEX "product_tags_deletedAt_idx" ON "product_tags"("deletedAt");

-- CreateIndex
CREATE UNIQUE INDEX "product_tags_productId_tagId_key" ON "product_tags"("productId", "tagId");

-- CreateIndex
CREATE INDEX "product_favorites_productId_idx" ON "product_favorites"("productId");

-- CreateIndex
CREATE INDEX "product_favorites_userId_idx" ON "product_favorites"("userId");

-- CreateIndex
CREATE INDEX "product_favorites_deletedAt_idx" ON "product_favorites"("deletedAt");

-- CreateIndex
CREATE UNIQUE INDEX "product_favorites_productId_userId_key" ON "product_favorites"("productId", "userId");

-- CreateIndex
CREATE INDEX "chat_conversations_placeId_idx" ON "chat_conversations"("placeId");

-- CreateIndex
CREATE INDEX "chat_conversations_productId_idx" ON "chat_conversations"("productId");

-- CreateIndex
CREATE INDEX "chat_conversations_contextType_idx" ON "chat_conversations"("contextType");

-- AddForeignKey
ALTER TABLE "places" ADD CONSTRAINT "places_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "places" ADD CONSTRAINT "places_orgId_fkey" FOREIGN KEY ("orgId") REFERENCES "organizations"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "place_tags" ADD CONSTRAINT "place_tags_placeId_fkey" FOREIGN KEY ("placeId") REFERENCES "places"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "place_tags" ADD CONSTRAINT "place_tags_tagId_fkey" FOREIGN KEY ("tagId") REFERENCES "tags"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "place_favorites" ADD CONSTRAINT "place_favorites_placeId_fkey" FOREIGN KEY ("placeId") REFERENCES "places"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "place_favorites" ADD CONSTRAINT "place_favorites_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "products" ADD CONSTRAINT "products_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "products" ADD CONSTRAINT "products_orgId_fkey" FOREIGN KEY ("orgId") REFERENCES "organizations"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "product_tags" ADD CONSTRAINT "product_tags_productId_fkey" FOREIGN KEY ("productId") REFERENCES "products"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "product_tags" ADD CONSTRAINT "product_tags_tagId_fkey" FOREIGN KEY ("tagId") REFERENCES "tags"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "product_favorites" ADD CONSTRAINT "product_favorites_productId_fkey" FOREIGN KEY ("productId") REFERENCES "products"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "product_favorites" ADD CONSTRAINT "product_favorites_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "chat_conversations" ADD CONSTRAINT "chat_conversations_recipeId_fkey" FOREIGN KEY ("recipeId") REFERENCES "recipes"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "chat_conversations" ADD CONSTRAINT "chat_conversations_placeId_fkey" FOREIGN KEY ("placeId") REFERENCES "places"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "chat_conversations" ADD CONSTRAINT "chat_conversations_productId_fkey" FOREIGN KEY ("productId") REFERENCES "products"("id") ON DELETE SET NULL ON UPDATE CASCADE;
