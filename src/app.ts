import express from "express";
import bot from "./utils/telegrafConf";
import { Context } from "vm";

const app = express();

bot.start((ctx: Context) => {
    const userName = ctx.message?.from?.first_name || "User";
    ctx.reply(`Hello ${userName}, welcome!`);
    ctx.reply(
        "This bot is designed to help you with your trading. Type /help to see what I can do."
    );
});


bot.launch();

export default app;