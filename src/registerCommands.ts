import { Telegraf } from "telegraf";
import { registerAnsweredCommand } from "./commands/answered";
import { registerAnonymousPrayCommand } from "./commands/prayAnon";
import { registerPrayCommand } from "./commands/pray";
import { registerPrayersCommand } from "./commands/prayers";
import { registerAddPrayerForCommand } from "./commands/addPrayerFor";
import { registerMyPrayersCommand } from "./commands/myPrayers";
import { registerAmenCommand } from "./commands/amen";
import { registerJoinPrayerCommands } from "./commands/joinPrayer";
import { registerAssignPrayersCommand } from "./commands/assignPrayers";

export function registerCommands(bot: Telegraf, groupId: string): void {
  registerPrayCommand(bot);
  registerAnonymousPrayCommand(bot, groupId);
  registerPrayersCommand(bot);
  registerAnsweredCommand(bot);
  registerAddPrayerForCommand(bot);
  registerMyPrayersCommand(bot);
  registerAmenCommand(bot);
  registerJoinPrayerCommands(bot);
  registerAssignPrayersCommand(bot);
}
