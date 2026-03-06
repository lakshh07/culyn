-- AlterTable
ALTER TABLE "invoices" ADD COLUMN     "acquirerData" JSONB,
ADD COLUMN     "bankCode" TEXT,
ADD COLUMN     "bankTransactionId" TEXT,
ADD COLUMN     "cardInternational" BOOLEAN,
ADD COLUMN     "cardIssuer" TEXT,
ADD COLUMN     "cardLast4" TEXT,
ADD COLUMN     "cardNetwork" TEXT,
ADD COLUMN     "cardSubType" TEXT,
ADD COLUMN     "description" TEXT,
ADD COLUMN     "errorCode" TEXT,
ADD COLUMN     "errorDescription" TEXT,
ADD COLUMN     "fee" INTEGER,
ADD COLUMN     "method" TEXT,
ADD COLUMN     "razorpayInvoiceId" TEXT,
ADD COLUMN     "razorpayOrderId" TEXT,
ADD COLUMN     "tax" INTEGER,
ADD COLUMN     "upiVpa" TEXT,
ADD COLUMN     "wallet" TEXT;

-- AlterTable
ALTER TABLE "subscriptions" ADD COLUMN     "chargeAt" TIMESTAMP(3),
ADD COLUMN     "paidCount" INTEGER,
ADD COLUMN     "remainingCount" INTEGER;

-- CreateIndex
CREATE INDEX "invoices_method_idx" ON "invoices"("method");
