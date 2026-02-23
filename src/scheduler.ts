import cron from "node-cron";
import { Telegraf } from "telegraf";
import { formatPrayerList, listActivePrayerRequests } from "./services/prayerService";
import { prisma } from "./prisma/client";
import { listPrayerParticipants } from "./services/participantService";

const WEEKLY_REMINDER_SCHEDULE = "0 19 * * 2";
const WEEKLY_ASSIGNMENT_SCHEDULE = "0 7 * * 1";
const TIMEZONE = "Africa/Addis_Ababa";

export async function sendWeeklyReminder(bot: Telegraf, groupId: string): Promise<void> {
  const prayers = await listActivePrayerRequests(groupId);
  const prayerList = formatPrayerList(prayers);

  const now = new Date();
  const oneWeekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

  const [activeCount, answeredLastWeekCount] = await Promise.all([
    prisma.prayerRequest.count({
      where: {
        groupId,
        isAnswered: false
      }
    }),
    prisma.prayerRequest.count({
      where: {
        groupId,
        isAnswered: true,
        answeredAt: {
          gte: oneWeekAgo
        }
      }
    })
  ]);

  const reminderMessage = [
    "📖 Bible Study Prayer Reminder",
    "Let's prepare our hearts 🙏",
    "",
    `Active requests: ${activeCount}`,
    `Answered this week: ${answeredLastWeekCount}`,
    "",
    prayerList,
    "",
    "\"Pray without ceasing.\" - 1 Thessalonians 5:17"
  ].join("\n");

  await bot.telegram.sendMessage(groupId, reminderMessage);
}

export async function sendWeeklyAssignments(bot: Telegraf, groupId: string): Promise<void> {
  const [prayers, participants] = await Promise.all([
    listActivePrayerRequests(groupId),
    listPrayerParticipants(groupId)
  ]);

  if (prayers.length === 0 || participants.length === 0) {
    return;
  }

  const assignmentsByUser: Record<string, typeof prayers> = {};
  let index = 0;

  for (const participant of participants) {
    const selected: typeof prayers = [];

    for (let i = 0; i < 3; i++) {
      const prayer = prayers[index % prayers.length];
      selected.push(prayer);
      index++;
    }

    assignmentsByUser[participant.userId] = selected;
  }

  for (const participant of participants) {
    const assigned = assignmentsByUser[participant.userId];

    if (!assigned || assigned.length === 0) {
      continue;
    }

    const listText = formatPrayerList(assigned);

    const message = [
      "📌 Your prayer assignments for this week:",
      "",
      listText,
      "",
      "Thank you for praying faithfully."
    ].join("\n");

    try {
      await bot.telegram.sendMessage(participant.userId, message);
    } catch (error) {
      console.error("Failed to send assignment message:", error);
    }
  }
}

export function startWeeklyReminder(bot: Telegraf, groupId: string): void {
  cron.schedule(
    WEEKLY_REMINDER_SCHEDULE,
    async () => {
      try {
        await sendWeeklyReminder(bot, groupId);
      } catch (error) {
        console.error("Failed to send weekly reminder:", error);
      }
    },
    {
      timezone: TIMEZONE
    }
  );

  console.log(`Weekly reminder scheduled (${WEEKLY_REMINDER_SCHEDULE}, ${TIMEZONE}).`);

  cron.schedule(
    WEEKLY_ASSIGNMENT_SCHEDULE,
    async () => {
      try {
        await sendWeeklyAssignments(bot, groupId);
      } catch (error) {
        console.error("Failed to send weekly assignments:", error);
      }
    },
    {
      timezone: TIMEZONE
    }
  );

  console.log(`Weekly assignments scheduled (${WEEKLY_ASSIGNMENT_SCHEDULE}, ${TIMEZONE}).`);
}
