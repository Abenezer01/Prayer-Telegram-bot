import { Telegraf } from "telegraf";
import { getDisplayName } from "./helpers";
import { registerPrayerParticipant, unregisterPrayerParticipant } from "../services/participantService";

export function registerJoinPrayerCommands(bot: Telegraf): void {
  bot.command("joinprayer", async (ctx) => {
    try {
      if (!ctx.chat || !ctx.from) {
        await ctx.reply("Could not identify user or chat.");
        return;
      }

      if (ctx.chat.type === "private") {
        await ctx.reply("Please use /joinprayer in the prayer group.");
        return;
      }

      const groupId = String(ctx.chat.id);
      const userId = String(ctx.from.id);
      const userName = getDisplayName(ctx);

      await registerPrayerParticipant(groupId, userId, userName);

      await ctx.reply("You are now registered to receive weekly prayer assignments.");
    } catch (error) {
      console.error("Failed to register prayer participant:", error);
      await ctx.reply("Something went wrong while registering you for prayer assignments.");
    }
  });

  bot.command("leaveprayer", async (ctx) => {
    try {
      if (!ctx.chat || !ctx.from) {
        await ctx.reply("Could not identify user or chat.");
        return;
      }

      if (ctx.chat.type === "private") {
        await ctx.reply("Please use /leaveprayer in the prayer group.");
        return;
      }

      const groupId = String(ctx.chat.id);
      const userId = String(ctx.from.id);

      await unregisterPrayerParticipant(groupId, userId);

      await ctx.reply("You are no longer registered for weekly prayer assignments.");
    } catch (error) {
      console.error("Failed to unregister prayer participant:", error);
      await ctx.reply("Something went wrong while updating your registration.");
    }
  });
}

