-- AlterTable
ALTER TABLE "Payment" ADD COLUMN     "hostAmount" DECIMAL(65,30),
ADD COLUMN     "platformFee" DECIMAL(65,30),
ADD COLUMN     "refundId" TEXT,
ADD COLUMN     "refundReason" TEXT,
ADD COLUMN     "refundedAt" TIMESTAMP(3),
ADD COLUMN     "stripeConnectId" TEXT;

-- AlterTable
ALTER TABLE "Subscription" ADD COLUMN     "techFeePerBooking" DECIMAL(65,30) DEFAULT 0;

-- CreateTable
CREATE TABLE "HostPayout" (
    "id" TEXT NOT NULL,
    "hostId" TEXT NOT NULL,
    "legalName" TEXT NOT NULL,
    "taxId" TEXT,
    "businessType" TEXT NOT NULL DEFAULT 'individual',
    "bankName" TEXT,
    "accountHolderName" TEXT,
    "accountNumber" TEXT,
    "routingCode" TEXT,
    "stripeConnectId" TEXT,
    "onboardingStatus" TEXT NOT NULL DEFAULT 'PENDING',
    "chargesEnabled" BOOLEAN NOT NULL DEFAULT false,
    "payoutsEnabled" BOOLEAN NOT NULL DEFAULT false,
    "detailsSubmitted" BOOLEAN NOT NULL DEFAULT false,
    "platformFeePercent" DECIMAL(65,30),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "HostPayout_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "WebhookLog" (
    "id" TEXT NOT NULL,
    "provider" TEXT NOT NULL,
    "eventId" TEXT NOT NULL,
    "eventType" TEXT NOT NULL,
    "payload" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'RECEIVED',
    "error" TEXT,
    "processedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "WebhookLog_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "HostPayout_hostId_key" ON "HostPayout"("hostId");

-- CreateIndex
CREATE UNIQUE INDEX "HostPayout_stripeConnectId_key" ON "HostPayout"("stripeConnectId");

-- CreateIndex
CREATE INDEX "HostPayout_stripeConnectId_idx" ON "HostPayout"("stripeConnectId");

-- CreateIndex
CREATE INDEX "HostPayout_onboardingStatus_idx" ON "HostPayout"("onboardingStatus");

-- CreateIndex
CREATE UNIQUE INDEX "WebhookLog_eventId_key" ON "WebhookLog"("eventId");

-- CreateIndex
CREATE INDEX "WebhookLog_provider_eventId_idx" ON "WebhookLog"("provider", "eventId");

-- CreateIndex
CREATE INDEX "WebhookLog_status_idx" ON "WebhookLog"("status");

-- CreateIndex
CREATE INDEX "WebhookLog_createdAt_idx" ON "WebhookLog"("createdAt");

-- AddForeignKey
ALTER TABLE "HostPayout" ADD CONSTRAINT "HostPayout_hostId_fkey" FOREIGN KEY ("hostId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
