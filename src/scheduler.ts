import cron from "node-cron";
import { Telegraf } from "telegraf";
import { formatPrayerList, listActivePrayerRequests } from "./services/prayerService";
import { prisma } from "./prisma/client";

const WEEKLY_SCHEDULE = "0 19 * * 2";
const TIMEZONE = "Africa/Addis_Ababa";

export function startWeeklyReminder(bot: Telegraf, groupId: string): void {
  cron.schedule(
    WEEKLY_SCHEDULE,
    async () => {
      try {
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
      } catch (error) {
        console.error("Failed to send weekly reminder:", error);
      }
    },
    {
      timezone: TIMEZONE
    }
  );

  console.log(`Weekly reminder scheduled (${WEEKLY_SCHEDULE}, ${TIMEZONE}).`);
}
