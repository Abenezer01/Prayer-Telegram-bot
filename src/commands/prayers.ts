import { Telegraf } from "telegraf";
import { formatPrayerList, listActivePrayerRequests } from "../services/prayerService";

export function registerPrayersCommand(bot: Telegraf): void {
  bot.command("prayers", async (ctx) => {
    try {
      if (!ctx.chat || ctx.chat.type === "private") {
        await ctx.reply("This command must be used in the group chat.");
        return;
      }

      const groupId = String(ctx.chat.id);
      const prayers = await listActivePrayerRequests(groupId);

      await ctx.reply(formatPrayerList(prayers));
    } catch (error) {
      console.error("Failed to list prayers:", error);
      await ctx.reply("Something went wrong while loading prayer requests.");
    }
  });
}
