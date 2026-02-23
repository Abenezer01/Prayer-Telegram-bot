import { Telegraf } from "telegraf";
import { addAmenByNumber } from "../services/prayerService";

function parseAmenNumber(text: string | undefined): number | null {
  if (!text) {
    return null;
  }

  const match = text.trim().match(/^\/amen(?:@[\w_]+)?\s+(\d+)$/i);
  if (!match) {
    return null;
  }

  return Number(match[1]);
}

export function registerAmenCommand(bot: Telegraf): void {
  bot.command("amen", async (ctx) => {
    try {
      if (!ctx.chat) {
        await ctx.reply("This command must be used in a group.");
        return;
      }

      if (ctx.chat.type === "private") {
        await ctx.reply("This command is only available in the group.");
        return;
      }

      const text = ctx.message && "text" in ctx.message ? ctx.message.text : undefined;
      const number = parseAmenNumber(text);

      if (!number || number < 1) {
        await ctx.reply("Usage: /amen <number>");
        return;
      }

      const updated = await addAmenByNumber(String(ctx.chat.id), number);

      if (!updated) {
        await ctx.reply("Prayer request number not found.");
        return;
      }

      await ctx.reply("🙏 Recorded your amen for this request.");
    } catch (error) {
      console.error("Failed to add amen to prayer request:", error);
      await ctx.reply("Something went wrong while recording your amen.");
    }
  });
}

