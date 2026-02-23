import { Telegraf } from "telegraf";
import { prisma } from "../src/prisma/client";
import { registerCommands } from "../src/registerCommands";

const botToken = process.env.BOT_TOKEN;
const prayerGroupId = process.env.PRAYER_GROUP_ID;

if (!botToken) {
  throw new Error("BOT_TOKEN is required");
}

const bot = new Telegraf(botToken);

if (prayerGroupId) {
  registerCommands(bot, prayerGroupId);
}

const webhookPath = "/api/telegram";
const handler = bot.webhookCallback(webhookPath);

export default async function (req: any, res: any): Promise<void> {
  await prisma.$connect();
  await handler(req, res);
}
