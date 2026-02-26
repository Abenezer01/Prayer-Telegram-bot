-- CreateTable
CREATE TABLE "ScheduledTask" (
    "id" SERIAL NOT NULL,
    "chatId" TEXT NOT NULL,
    "messageId" INTEGER NOT NULL,
    "executeAt" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ScheduledTask_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "ScheduledTask_executeAt_idx" ON "ScheduledTask"("executeAt");
