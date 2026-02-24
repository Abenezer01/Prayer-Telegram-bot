import { Telegraf } from "telegraf";
import { createPrayerRequest } from "../services/prayerService";
import { extractCategoryFromMessage, extractCommandMessage, getDisplayName, replyAndDelete } from "./helpers";

export function registerPrayCommand(bot: Telegraf): void {
  bot.command("pray", async (ctx) => {
    try {
      if (ctx.chat?.type === "private") {
        await ctx.reply("Please use /pray in the group chat.");
        return;
      }

      const message = extractCommandMessage(ctx.message && "text" in ctx.message ? ctx.message.text : undefined, "pray");

      if (!message) {
        // Delete the invalid command message and the warning after 10 seconds (shorter delay for errors)
        await replyAndDelete(ctx, "Usage: /pray <message>", 10000);
        return;
      }

      if (!ctx.chat || !ctx.from) {
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

      // Confirm and delete after 1 minute
      await replyAndDelete(ctx, "🙏 Prayer request added.");
    } catch (error) {
      console.error("Failed to add prayer request:", error);
      // Even errors should disappear eventually to keep chat clean
      await replyAndDelete(ctx, "Something went wrong while saving the prayer request.", 30000);
    }
  });
}
