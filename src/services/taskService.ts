import { Telegraf } from "telegraf";
import { prisma } from "../prisma/client";

export async function scheduleMessageDeletion(chatId: string, messageId: number, delayMs: number = 60000): Promise<void> {
  const executeAt = new Date(Date.now() + delayMs);
  
  await prisma.scheduledTask.create({
    data: {
      chatId,
      messageId,
      executeAt
    }
  });
}

export async function processScheduledTasks(bot: Telegraf): Promise<void> {
  const now = new Date();
  
  const tasks = await prisma.scheduledTask.findMany({
    where: {
      executeAt: {
        lte: now
      }
    },
    take: 50 // Process in batches to avoid timeout
  });

  if (tasks.length === 0) {
    return;
  }

  const idsToDelete: number[] = [];

  for (const task of tasks) {
    try {
      await bot.telegram.deleteMessage(task.chatId, task.messageId);
    } catch (error) {
      console.error(`Failed to delete message ${task.messageId} in chat ${task.chatId}:`, error);
      // Even if failed (e.g. already deleted), we should remove the task
    }
    idsToDelete.push(task.id);
  }

  if (idsToDelete.length > 0) {
    await prisma.scheduledTask.deleteMany({
      where: {
        id: {
          in: idsToDelete
        }
      }
    });
  }
}