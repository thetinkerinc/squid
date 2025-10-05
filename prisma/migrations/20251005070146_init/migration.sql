-- CreateEnum
CREATE TYPE "EntryType" AS ENUM ('expense', 'income', 'withdrawal');

-- CreateEnum
CREATE TYPE "AccountType" AS ENUM ('bank', 'cash');

-- CreateEnum
CREATE TYPE "CurrencyType" AS ENUM ('CAD', 'EUR', 'MXN', 'USD');

-- CreateTable
CREATE TABLE "Partners" (
    "id" TEXT NOT NULL DEFAULT gen_random_uuid(),
    "user" TEXT NOT NULL,
    "partners" TEXT[],

    CONSTRAINT "Partners_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Entry" (
    "id" TEXT NOT NULL DEFAULT gen_random_uuid(),
    "user" TEXT NOT NULL,
    "userEmail" TEXT NOT NULL,
    "created" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "type" "EntryType" NOT NULL,
    "account" "AccountType" NOT NULL,
    "amount" DOUBLE PRECISION NOT NULL,
    "enteredAmount" DOUBLE PRECISION NOT NULL,
    "enteredCurrency" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "description" TEXT,

    CONSTRAINT "Entry_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Invitation" (
    "id" TEXT NOT NULL DEFAULT gen_random_uuid(),
    "from" TEXT NOT NULL,
    "to" TEXT NOT NULL,
    "sent" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "accepted" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "Invitation_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Currency" (
    "id" TEXT NOT NULL DEFAULT gen_random_uuid(),
    "code" "CurrencyType" NOT NULL,
    "name" TEXT NOT NULL,
    "symbol" TEXT NOT NULL,
    "value" DOUBLE PRECISION NOT NULL,

    CONSTRAINT "Currency_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Partners_user_key" ON "Partners"("user");

-- CreateIndex
CREATE INDEX "Partners_user_idx" ON "Partners"("user");

-- CreateIndex
CREATE INDEX "Entry_user_idx" ON "Entry"("user");

-- CreateIndex
CREATE INDEX "Invitation_from_idx" ON "Invitation"("from");
