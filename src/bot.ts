import "dotenv/config";
import http from "http";
import { Telegraf } from "telegraf";
import { registerAnsweredCommand } from "./commands/answered";
import { registerAnonymousPrayCommand } from "./commands/prayAnon";
import { registerPrayCommand } from "./commands/pray";
import { registerPrayersCommand } from "./commands/prayers";
import { prisma } from "./prisma/client";
import { startWeeklyReminder } from "./scheduler";
import { registerAddPrayerForCommand } from "./commands/addPrayerFor";
import { registerMyPrayersCommand } from "./commands/myPrayers";
import { registerAmenCommand } from "./commands/amen";

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

registerPrayCommand(bot);
registerAnonymousPrayCommand(bot, prayerGroupId);
registerPrayersCommand(bot);
registerAnsweredCommand(bot);
registerAddPrayerForCommand(bot);
registerMyPrayersCommand(bot);
registerAmenCommand(bot);
startWeeklyReminder(bot, prayerGroupId);

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
