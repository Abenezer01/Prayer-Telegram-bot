import { Telegraf } from "telegraf";
import { sendWeeklyAssignments } from "../scheduler";
import { replyAndDelete } from "./helpers";

async function isGroupAdmin(bot: Telegraf, chatId: number | string, userId: number): Promise<boolean> {
  const member = await bot.telegram.getChatMember(chatId, userId);
  return member.status === "administrator" || member.status === "creator";
}

export function registerAssignPrayersCommand(bot: Telegraf): void {
  bot.command("assignprayers", async (ctx) => {
    try {
      if (!ctx.chat || !ctx.from) {
        return;
      }

      if (ctx.chat.type === "private") {
        await ctx.reply("Please use /assignprayers in the prayer group.");
        return;
      }

      const isAdmin = await isGroupAdmin(bot, ctx.chat.id, ctx.from.id);

      if (!isAdmin) {
        await replyAndDelete(ctx, "Only group admins can assign weekly prayers.", 10000);
        return;
      }

      const groupId = String(ctx.chat.id);
      await sendWeeklyAssignments(bot, groupId);

      await replyAndDelete(ctx, "Prayer assignments have been sent to all registered participants.");
    } catch (error) {
      console.error("Failed to assign prayers:", error);
      await replyAndDelete(ctx, "Something went wrong while assigning prayers.", 30000);
    }
  });
}

