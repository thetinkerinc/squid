-- CreateTable
CREATE TABLE "public"."Entry" (
    "id" TEXT NOT NULL DEFAULT gen_random_uuid(),
    "user" TEXT NOT NULL,
    "date" TIMESTAMPTZ(3) NOT NULL,
    "hours" INTEGER NOT NULL,
    "project" TEXT,

    CONSTRAINT "Entry_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Entry_user_idx" ON "public"."Entry"("user");
