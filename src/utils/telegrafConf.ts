import { Telegraf } from "telegraf";
import dotenv from "dotenv";
dotenv.config();

const token = process.env.TELEGRAM_TOKEN;

if (!token) {
    throw new Error("TELEGRAM_TOKEN is not defined in the environment variables.");
}

const bot = new Telegraf(token);

export default bot;