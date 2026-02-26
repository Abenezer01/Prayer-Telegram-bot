import { Telegraf } from "telegraf";
import { prisma } from "../src/prisma/client";
import { registerCommands } from "../src/registerCommands";
import { processScheduledTasks } from "../src/services/taskService";

const botToken = process.env.BOT_TOKEN;
const prayerGroupId = process.env.PRAYER_GROUP_ID;

if (!botToken) {
  throw new Error("BOT_TOKEN is required");
}

const bot = new Telegraf(botToken);

if (prayerGroupId) {
  registerCommands(bot, prayerGroupId);
}

// Custom handler to process tasks after handling updates
export default async function (req: any, res: any): Promise<void> {
  if (req.method !== "POST") {
    res.status(200).send("Method Not Allowed");
    return;
  }

  await prisma.$connect();
  
  try {
    // Process the update
    await bot.handleUpdate(req.body, res);
    
    // Process pending deletions (Lazy Cron)
    // We do this after the update to ensure responsiveness, 
    // but on Vercel we must await it before the function terminates.
    await processScheduledTasks(bot);
  } catch (error) {
    console.error("Error in webhook handler:", error);
  } finally {
    // Ensure we send a response if Telegraf didn't
    if (!res.headersSent) {
      res.status(200).send("ok");
    }
  }
}
