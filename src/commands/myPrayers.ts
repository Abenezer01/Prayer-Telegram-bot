import { Telegraf } from "telegraf";
import { prisma } from "../prisma/client";

export function registerMyPrayersCommand(bot: Telegraf): void {
  bot.command("myprayers", async (ctx) => {
    try {
      if (!ctx.chat || !ctx.from) {
        await ctx.reply("Could not identify user or chat.");
        return;
      }

      const groupId = ctx.chat.type === "private" ? null : String(ctx.chat.id);

      if (!groupId) {
        await ctx.reply("Please run /myprayers from the group or by replying to a group message in DM in a future version.");
        return;
      }

      const userId = String(ctx.from.id);

      const [active, recentAnswered] = await Promise.all([
        prisma.prayerRequest.findMany({
          where: {
            groupId,
            userId,
            isAnswered: false
          },
          orderBy: {
            createdAt: "asc"
          }
        }),
        prisma.prayerRequest.findMany({
          where: {
            groupId,
            userId,
            isAnswered: true
          },
          orderBy: {
            answeredAt: "desc"
          },
          take: 5
        })
      ]);

      if (active.length === 0 && recentAnswered.length === 0) {
        await ctx.reply("You do not have any recorded prayer requests in this group yet.");
        return;
      }

      const lines: string[] = [];

      if (active.length > 0) {
        lines.push("🙏 Your active prayer requests:");
        active.forEach((prayer: any) => {
          const category = prayer.category ? ` [${prayer.category}]` : "";
          const amenSuffix = prayer.amenCount > 0 ? ` ❤️ ${prayer.amenCount}` : "";
          lines.push(`- ${prayer.message}${category}${amenSuffix}`);
        });
      }

      if (recentAnswered.length > 0) {
        if (lines.length > 0) {
          lines.push("");
        }
        lines.push("🎉 Recently answered requests:");
        recentAnswered.forEach((prayer: any) => {
          const category = prayer.category ? ` [${prayer.category}]` : "";
          lines.push(`- ${prayer.message}${category}`);
        });
      }

      await ctx.reply(lines.join("\n"));
    } catch (error) {
      console.error("Failed to load personal prayers:", error);
      await ctx.reply("Something went wrong while loading your prayer history.");
    }
  });
}
