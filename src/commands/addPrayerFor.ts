import { Telegraf } from "telegraf";
import { createPrayerRequest } from "../services/prayerService";
import { extractCategoryFromMessage, extractCommandMessage } from "./helpers";

async function isGroupAdmin(bot: Telegraf, chatId: number | string, userId: number): Promise<boolean> {
    const member = await bot.telegram.getChatMember(chatId, userId);
    return member.status === "administrator" || member.status === "creator";
}

export function registerAddPrayerForCommand(bot: Telegraf): void {
    bot.command("addprayerfor", async (ctx) => {
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
                await ctx.reply("Only group admins can add prayers for members.");
                return;
            }
            const text = ctx.message && "text" in ctx.message ? ctx.message.text : undefined;
            const message = extractCommandMessage(text, "addprayerfor");
            if (!message) {
                await ctx.reply("Usage: /addprayerfor <username> <prayer message>");
                return;
            }
            const match = message.match(/^@(\w+)\s+([\s\S]+)/);
            if (!match) {
                await ctx.reply("Usage: /addprayerfor <username> <prayer message>");
                return;
            }
            const username = match[1];
            const rawPrayerText = match[2];
            const { category, cleanedMessage } = extractCategoryFromMessage(rawPrayerText);
            // Try to find userId by username in the group
            let userId = "unknown";
            try {
                const members = await bot.telegram.getChatAdministrators(ctx.chat.id);
                const user = members.find((m) => m.user.username && m.user.username.toLowerCase() === username.toLowerCase());
                if (user) {
                    userId = String(user.user.id);
                }
            } catch { }
            await createPrayerRequest({
                groupId: String(ctx.chat.id),
                userId,
                userName: `@${username}`,
                message: cleanedMessage,
                isAnonymous: false,
                category,
                priority: null
            });
            await ctx.reply(`🙏 Prayer for @${username} added.`);
        } catch (error) {
            console.error("Failed to add prayer for user:", error);
            await ctx.reply("Something went wrong while saving the prayer request.");
        }
    });
}
