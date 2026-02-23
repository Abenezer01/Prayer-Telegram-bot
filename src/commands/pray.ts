import { Telegraf } from "telegraf";
import { createPrayerRequest } from "../services/prayerService";
import { extractCategoryFromMessage, extractCommandMessage, getDisplayName } from "./helpers";

export function registerPrayCommand(bot: Telegraf): void {
  bot.command("pray", async (ctx) => {
    try {
      if (ctx.chat?.type === "private") {
        await ctx.reply("Please use /pray in the group chat.");
        return;
      }

      const message = extractCommandMessage(ctx.message && "text" in ctx.message ? ctx.message.text : undefined, "pray");

      if (!message) {
        await ctx.reply("Usage: /pray <message>");
        return;
      }

      if (!ctx.chat || !ctx.from) {
        await ctx.reply("Could not process this request.");
        return;
      }

      const { category, cleanedMessage } = extractCategoryFromMessage(message);

      await createPrayerRequest({
        groupId: String(ctx.chat.id),
        userId: String(ctx.from.id),
        userName: getDisplayName(ctx),
        message: cleanedMessage,
        isAnonymous: false,
        category,
        priority: null
      });

      await ctx.reply("🙏 Prayer request added.");
    } catch (error) {
      console.error("Failed to add prayer request:", error);
      await ctx.reply("Something went wrong while saving the prayer request.");
    }
  });
}
