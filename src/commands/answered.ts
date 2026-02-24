import { Telegraf } from "telegraf";
import { markPrayerAnsweredByNumber } from "../services/prayerService";
import { replyAndDelete } from "./helpers";

function parseAnsweredNumber(text: string | undefined): number | null {
  if (!text) {
    return null;
  }

  const match = text.trim().match(/^\/answered(?:@[\w_]+)?\s+(\d+)$/i);
  if (!match) {
    return null;
  }

  return Number(match[1]);
}

async function isGroupAdmin(bot: Telegraf, chatId: number | string, userId: number): Promise<boolean> {
  const member = await bot.telegram.getChatMember(chatId, userId);
  return member.status === "administrator" || member.status === "creator";
}

export function registerAnsweredCommand(bot: Telegraf): void {
  bot.command("answered", async (ctx) => {
    try {
      if (!ctx.chat || !ctx.from) {
        return;
      }

      if (ctx.chat.type === "private") {
        await ctx.reply("This command is only available in the group.");
        return;
      }

      const isAdmin = await isGroupAdmin(bot, ctx.chat.id, ctx.from.id);
      if (!isAdmin) {
        await replyAndDelete(ctx, "Only group admins can mark prayers as answered.", 10000);
        return;
      }

      const text = ctx.message && "text" in ctx.message ? ctx.message.text : undefined;
      const number = parseAnsweredNumber(text);

      if (!number || number < 1) {
        await replyAndDelete(ctx, "Usage: /answered <number>", 10000);
        return;
      }

      const updated = await markPrayerAnsweredByNumber(String(ctx.chat.id), number);

      if (!updated) {
        await replyAndDelete(ctx, "Prayer request number not found.", 10000);
        return;
      }

      await replyAndDelete(ctx, "🎉 Praise God! Prayer marked as answered.");
    } catch (error) {
      console.error("Failed to mark prayer answered:", error);
      await replyAndDelete(ctx, "Something went wrong while updating prayer request.", 30000);
    }
  });
}
