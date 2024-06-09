// Initialize the bot
require('dotenv').config();

const TelegramBot = require('node-telegram-bot-api');
const BOT_TOKEN = process.env.BOT_KEY;
const bot = new TelegramBot(BOT_TOKEN, { polling: true });

module.exports = bot;
