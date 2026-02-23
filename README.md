# Prayer Telegram Bot

Production-ready Telegram bot for a private Bible study group.

## Features

- `/pray <message>`: Add a prayer request in the group.
- `/pray_anon <message>` (private chat with bot): Post an anonymous prayer into the group.
- `/prayers`: List all active (unanswered) prayer requests.
- `/answered <number>`: Mark a prayer as answered (group admins only).
- Weekly Tuesday reminder at **7:00 PM Africa/Addis_Ababa** with active prayers.

## Stack

- Node.js + TypeScript
- Telegraf (long polling)
- Prisma ORM
- SQLite
- node-cron
- dotenv

## Project Structure

```text
src/
  bot.ts
  scheduler.ts
  commands/
  services/
  prisma/
prisma/
  schema.prisma
```

## Setup

1. Install dependencies:

```bash
npm install
```

2. Copy environment file and fill values:

```bash
cp .env.example .env
```

Required env vars:

- `BOT_TOKEN`: Telegram bot token from BotFather.
- `PRAYER_GROUP_ID`: Target group chat ID (example: `-1001234567890`).
- `DATABASE_URL`: SQLite URL (default: `file:./dev.db`).

3. Generate Prisma client and apply DB migration:

```bash
npx prisma generate
npx prisma migrate dev --name init
```

4. Start in development:

```bash
npm run dev
```

## Production (Railway)

Build and start commands:

```bash
npm run build
npm start
```

This bot uses long polling by default (`bot.launch()`) and does not require webhooks.

## Notes

- Ensure the bot is added to the target group.
- For `/answered`, Telegram admin status is checked before update.
- Anonymous requests are saved in DB with `isAnonymous=true` and posted as `🙏 Anonymous: <message>`.
