import { Telegraf } from "telegraf";
import { prisma } from "../src/prisma/client";
import { sendWeeklyReminder } from "../src/scheduler";

const botToken = process.env.BOT_TOKEN as string;
const prayerGroupId = process.env.PRAYER_GROUP_ID as string;

if (!botToken) {
  throw new Error("BOT_TOKEN is required");
}

if (!prayerGroupId) {
  throw new Error("PRAYER_GROUP_ID is required");
}

const bot = new Telegraf(botToken);

export default async function (req: any, res: any): Promise<void> {
  await prisma.$connect();
  await sendWeeklyReminder(bot, prayerGroupId);
  res.status(200).send("ok");
}
