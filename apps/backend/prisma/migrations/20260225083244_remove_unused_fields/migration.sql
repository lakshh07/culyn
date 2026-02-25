/*
  Warnings:

  - You are about to drop the column `logo` on the `organizations` table. All the data in the column will be lost.
  - You are about to drop the column `stripeCustomerId` on the `subscriptions` table. All the data in the column will be lost.
  - You are about to drop the column `stripePriceId` on the `subscriptions` table. All the data in the column will be lost.
  - You are about to drop the column `stripeSubscriptionId` on the `subscriptions` table. All the data in the column will be lost.
  - You are about to drop the column `passwordHash` on the `users` table. All the data in the column will be lost.
  - You are about to drop the column `providerId` on the `users` table. All the data in the column will be lost.

*/
-- DropIndex
DROP INDEX "subscriptions_stripeCustomerId_idx";

-- DropIndex
DROP INDEX "subscriptions_stripeCustomerId_key";

-- DropIndex
DROP INDEX "subscriptions_stripeSubscriptionId_idx";

-- DropIndex
DROP INDEX "subscriptions_stripeSubscriptionId_key";

-- AlterTable
ALTER TABLE "organizations" DROP COLUMN "logo";

-- AlterTable
ALTER TABLE "subscriptions" DROP COLUMN "stripeCustomerId",
DROP COLUMN "stripePriceId",
DROP COLUMN "stripeSubscriptionId";

-- AlterTable
ALTER TABLE "users" DROP COLUMN "passwordHash",
DROP COLUMN "providerId";
