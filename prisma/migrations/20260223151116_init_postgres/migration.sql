-- CreateTable
CREATE TABLE "PrayerRequest" (
    "id" SERIAL NOT NULL,
    "groupId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "userName" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    "category" TEXT,
    "priority" TEXT DEFAULT 'normal',
    "amenCount" INTEGER NOT NULL DEFAULT 0,
    "isAnonymous" BOOLEAN NOT NULL DEFAULT false,
    "isAnswered" BOOLEAN NOT NULL DEFAULT false,
    "answeredAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "PrayerRequest_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PrayerParticipant" (
    "id" SERIAL NOT NULL,
    "groupId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "userName" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "PrayerParticipant_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "PrayerRequest_groupId_isAnswered_createdAt_idx" ON "PrayerRequest"("groupId", "isAnswered", "createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "PrayerParticipant_groupId_userId_key" ON "PrayerParticipant"("groupId", "userId");
