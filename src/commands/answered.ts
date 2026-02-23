import { Telegraf } from "telegraf";
import { markPrayerAnsweredByNumber } from "../services/prayerService";

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
        await ctx.reply("This command must be used in a group.");
        return;
      }

      if (ctx.chat.type === "private") {
        await ctx.reply("This command is only available in the group.");
        return;
      }

      const isAdmin = await isGroupAdmin(bot, ctx.chat.id, ctx.from.id);
      if (!isAdmin) {
        await ctx.reply("Only group admins can mark prayers as answered.");
        return;
      }

      const text = ctx.message && "text" in ctx.message ? ctx.message.text : undefined;
      const number = parseAnsweredNumber(text);

      if (!number || number < 1) {
        await ctx.reply("Usage: /answered <number>");
        return;
      }

      const updated = await markPrayerAnsweredByNumber(String(ctx.chat.id), number);

      if (!updated) {
        await ctx.reply("Prayer request number not found.");
        return;
      }

      await ctx.reply("🎉 Praise God! Prayer marked as answered.");
    } catch (error) {
      console.error("Failed to mark prayer answered:", error);
      await ctx.reply("Something went wrong while updating prayer request.");
    }
  });
}
