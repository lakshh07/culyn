-- AlterEnum
-- Remove BASIC and ENTERPRISE from SubscriptionPlan
ALTER TYPE "SubscriptionPlan" RENAME TO "SubscriptionPlan_old";
CREATE TYPE "SubscriptionPlan" AS ENUM ('FREE', 'PRO');
ALTER TABLE "subscriptions" ALTER COLUMN "plan" DROP DEFAULT;
ALTER TABLE "subscriptions" ALTER COLUMN "plan" TYPE "SubscriptionPlan" USING ("plan"::text::"SubscriptionPlan");
ALTER TABLE "subscriptions" ALTER COLUMN "plan" SET DEFAULT 'FREE';
DROP TYPE "SubscriptionPlan_old";

-- AlterTable
ALTER TABLE "subscriptions" ADD COLUMN     "cancelAtPeriodEnd" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "currentPeriodEnd" TIMESTAMP(3),
ADD COLUMN     "currentPeriodStart" TIMESTAMP(3),
ADD COLUMN     "paymentMethodBrand" TEXT,
ADD COLUMN     "paymentMethodLast4" TEXT,
ADD COLUMN     "paymentMethodType" TEXT,
ADD COLUMN     "razorpayCustomerId" TEXT,
ADD COLUMN     "razorpaySubscriptionId" TEXT;

-- CreateTable
CREATE TABLE "invoices" (
    "id" TEXT NOT NULL,
    "subscriptionId" TEXT NOT NULL,
    "razorpayPaymentId" TEXT NOT NULL,
    "amount" INTEGER NOT NULL,
    "currency" TEXT NOT NULL DEFAULT 'INR',
    "status" TEXT NOT NULL,
    "paidAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "invoices_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "invoices_razorpayPaymentId_key" ON "invoices"("razorpayPaymentId");

-- CreateIndex
CREATE INDEX "invoices_subscriptionId_idx" ON "invoices"("subscriptionId");

-- CreateIndex
CREATE UNIQUE INDEX "subscriptions_razorpaySubscriptionId_key" ON "subscriptions"("razorpaySubscriptionId");

-- AddForeignKey
ALTER TABLE "invoices" ADD CONSTRAINT "invoices_subscriptionId_fkey" FOREIGN KEY ("subscriptionId") REFERENCES "subscriptions"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
