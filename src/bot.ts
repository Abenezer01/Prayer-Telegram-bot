import "dotenv/config";
import http from "http";
import { Telegraf } from "telegraf";
import { prisma } from "./prisma/client";
import { startWeeklyReminder } from "./scheduler";
import { registerCommands } from "./registerCommands";
import { processScheduledTasks } from "./services/taskService";

const botToken = process.env.BOT_TOKEN;
const prayerGroupId = process.env.PRAYER_GROUP_ID;
const botMode = process.env.BOT_MODE ?? "polling";
const webhookUrl = process.env.WEBHOOK_URL;
const port = Number(process.env.PORT ?? 3000);

if (!botToken) {
  throw new Error("BOT_TOKEN is required in environment variables.");
}

if (!prayerGroupId) {
  throw new Error("PRAYER_GROUP_ID is required in environment variables.");
}

const bot = new Telegraf(botToken);
let httpServer: http.Server | null = null;

registerCommands(bot, prayerGroupId);
startWeeklyReminder(bot, prayerGroupId);

// Process tasks every 30 seconds in polling mode
setInterval(() => {
  processScheduledTasks(bot).catch(err => console.error("Task processing error:", err));
}, 30000);

bot.catch((error, ctx) => {
  console.error("Unhandled bot error:", error, { update: ctx.update });
});

async function start(): Promise<void> {
  await prisma.$connect();

  if (botMode === "webhook" && webhookUrl) {
    const webhookPath = "/telegram-webhook";
    await bot.telegram.setWebhook(webhookUrl + webhookPath);

    httpServer = http.createServer(bot.webhookCallback(webhookPath));
    httpServer.listen(port, () => {
      console.log(`Prayer Telegram bot started in webhook mode on port ${port}.`);
    });
  } else {
    await bot.launch();
    console.log("Prayer Telegram bot started with long polling.");
  }
}

async function shutdown(signal: string): Promise<void> {
  console.log(`Received ${signal}. Shutting down...`);
  bot.stop(signal);
  if (httpServer) {
    httpServer.close();
    httpServer = null;
  }
  await prisma.$disconnect();
}

process.once("SIGINT", () => {
  void shutdown("SIGINT");
});

process.once("SIGTERM", () => {
  void shutdown("SIGTERM");
});

void start().catch(async (error) => {
  console.error("Failed to start bot:", error);
  await prisma.$disconnect();
  process.exit(1);
});
