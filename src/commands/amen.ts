import { Telegraf } from "telegraf";
import { addAmenByNumber } from "../services/prayerService";
import { replyAndDelete } from "./helpers";

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
        return;
      }

      if (ctx.chat.type === "private") {
        await ctx.reply("This command is only available in the group.");
        return;
      }

      const text = ctx.message && "text" in ctx.message ? ctx.message.text : undefined;
      const number = parseAmenNumber(text);

      if (!number || number < 1) {
        // Warning disappears after 10s
        await replyAndDelete(ctx, "Usage: /amen <number>", 10000);
        return;
      }

      const updated = await addAmenByNumber(String(ctx.chat.id), number);

      if (!updated) {
        await replyAndDelete(ctx, "Prayer request number not found.", 10000);
        return;
      }

      // Success message disappears after 1 minute
      await replyAndDelete(ctx, "🙏 Recorded your amen for this request.");
    } catch (error) {
      console.error("Failed to add amen to prayer request:", error);
      await replyAndDelete(ctx, "Something went wrong while recording your amen.", 30000);
    }
  });
}

