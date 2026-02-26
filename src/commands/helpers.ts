import { Context } from "telegraf";
import { scheduleMessageDeletion } from "../services/taskService";

export function extractCommandMessage(text: string | undefined, command: string): string {
  if (!text) {
    return "";
  }

  const commandPattern = new RegExp(`^/${command}(?:@[\\w_]+)?(?:\\s+([\\s\\S]+))?$`, "i");
  const match = text.trim().match(commandPattern);

  if (!match) {
    return "";
  }

  return (match[1] ?? "").trim();
}

export function extractCategoryFromMessage(message: string): { category: string | null; cleanedMessage: string } {
  const tagMatch = message.match(/#([^\s#]+)/);
  if (!tagMatch) {
    return { category: null, cleanedMessage: message.trim() };
  }
  const category = tagMatch[1];
  const cleanedMessage = message.replace(tagMatch[0], "").replace(/\s+/g, " ").trim();
  return { category, cleanedMessage };
}

export function getDisplayName(ctx: Context): string {
  const from = ctx.from;

  if (!from) {
    return "Unknown user";
  }

  if (from.username) {
    return `@${from.username}`;
  }

  const fullName = [from.first_name, from.last_name].filter(Boolean).join(" ").trim();
  return fullName || "Unknown user";
}

export async function replyAndDelete(ctx: Context, text: string, delayMs: number = 60000): Promise<void> {
  try {
    const reply = await ctx.reply(text);

    // Schedule deletion in DB instead of setTimeout
    if (ctx.message?.message_id && ctx.chat?.id) {
      await scheduleMessageDeletion(String(ctx.chat.id), ctx.message.message_id, delayMs).catch(err => 
        console.error("Failed to schedule user message deletion:", err)
      );
    }
    
    if (reply?.message_id && ctx.chat?.id) {
      await scheduleMessageDeletion(String(ctx.chat.id), reply.message_id, delayMs).catch(err => 
        console.error("Failed to schedule bot reply deletion:", err)
      );
    }
  } catch (error) {
    console.error("Failed to send reply:", error);
  }
}
