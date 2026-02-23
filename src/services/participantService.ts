import { prisma } from "../prisma/client";

export async function registerPrayerParticipant(groupId: string, userId: string, userName: string): Promise<void> {
  await prisma.prayerParticipant.upsert({
    where: {
      groupId_userId: {
        groupId,
        userId
      }
    },
    update: {
      userName
    },
    create: {
      groupId,
      userId,
      userName
    }
  });
}

export async function unregisterPrayerParticipant(groupId: string, userId: string): Promise<void> {
  await prisma.prayerParticipant.deleteMany({
    where: {
      groupId,
      userId
    }
  });
}

export async function listPrayerParticipants(groupId: string): Promise<{ userId: string; userName: string }[]> {
  const participants = await prisma.prayerParticipant.findMany({
    where: {
      groupId
    },
    orderBy: {
      createdAt: "asc"
    }
  });

  return participants.map((p: any) => ({
    userId: p.userId,
    userName: p.userName
  }));
}
