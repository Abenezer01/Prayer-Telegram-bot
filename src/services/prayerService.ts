﻿﻿﻿﻿﻿﻿﻿﻿﻿import { prisma } from "../prisma/client";

export interface PrayerRequest {
  id: number;
  groupId: string;
  userId: string;
  userName: string;
  message: string;
  category: string | null;
  priority: string | null;
  amenCount: number;
  isAnonymous: boolean;
  isAnswered: boolean;
  answeredAt: Date | null;
  createdAt: Date;
}

export interface CreatePrayerInput {
  groupId: string;
  userId: string;
  userName: string;
  message: string;
  isAnonymous: boolean;
  category?: string | null;
  priority?: string | null;
}

export async function createPrayerRequest(input: CreatePrayerInput): Promise<PrayerRequest> {
  return prisma.prayerRequest.create({
    data: {
      groupId: input.groupId,
      userId: input.userId,
      userName: input.userName,
      message: input.message,
      category: input.category ?? null,
      priority: input.priority ?? "normal",
      isAnonymous: input.isAnonymous
    }
  });
}

export async function listActivePrayerRequests(groupId: string): Promise<PrayerRequest[]> {
  return prisma.prayerRequest.findMany({
    where: {
      groupId,
      isAnswered: false
    },
    orderBy: {
      createdAt: "asc"
    }
  });
}

export async function markPrayerAnsweredByNumber(groupId: string, number: number): Promise<boolean> {
  const activePrayers = await listActivePrayerRequests(groupId);
  const selectedPrayer = activePrayers[number - 1];

  if (!selectedPrayer) {
    return false;
  }

  await prisma.prayerRequest.update({
    where: {
      id: selectedPrayer.id
    },
    data: {
      isAnswered: true,
      answeredAt: new Date()
    }
  });

  return true;
}

export async function addAmenByNumber(groupId: string, number: number): Promise<boolean> {
  const activePrayers = await listActivePrayerRequests(groupId);
  const selectedPrayer = activePrayers[number - 1];

  if (!selectedPrayer) {
    return false;
  }

  await prisma.prayerRequest.update({
    where: {
      id: selectedPrayer.id
    },
    data: {
      amenCount: {
        increment: 1
      }
    }
  });

  return true;
}

export function formatPrayerList(prayers: PrayerRequest[]): string {
  if (prayers.length === 0) {
    return "No active prayer requests right now.";
  }

  return prayers
    .map((prayer, index) => {
      const label = prayer.isAnonymous ? "Anonymous" : prayer.userName;
      const category = prayer.category ? ` [${prayer.category}]` : "";
      const amenSuffix = prayer.amenCount > 0 ? ` ❤️ ${prayer.amenCount}` : "";
      return `${index + 1}.${category} ${prayer.message} (${label})${amenSuffix}`;
    })
    .join("\n");
}
