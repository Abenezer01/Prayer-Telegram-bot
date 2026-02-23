import { Telegraf } from "telegraf";
import { createPrayerRequest } from "../services/prayerService";
import { extractCategoryFromMessage, extractCommandMessage } from "./helpers";

export function registerAnonymousPrayCommand(bot: Telegraf, groupId: string): void {
  bot.command("pray_anon", async (ctx) => {
    try {
      if (ctx.chat?.type !== "private") {
        await ctx.reply("Please use /pray_anon in a private chat with the bot.");
        return;
      }

      const message = extractCommandMessage(ctx.message && "text" in ctx.message ? ctx.message.text : undefined, "pray_anon");

      if (!message) {
        await ctx.reply("Usage: /pray_anon <message>");
        return;
      }

      if (!ctx.from) {
        await ctx.reply("Could not identify sender.");
        return;
      }

      const { category, cleanedMessage } = extractCategoryFromMessage(message);

      await createPrayerRequest({
        groupId,
        userId: String(ctx.from.id),
        userName: "Anonymous",
        message: cleanedMessage,
        isAnonymous: true,
        category,
        priority: null
      });

      await bot.telegram.sendMessage(groupId, `🙏 Anonymous: ${cleanedMessage}`);
      await ctx.reply("🙏 Anonymous prayer shared with the group.");
    } catch (error) {
      console.error("Failed to post anonymous prayer request:", error);
      await ctx.reply("Something went wrong while posting anonymous prayer.");
    }
  });
}
