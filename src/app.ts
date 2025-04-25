import express from "express";
import bot from "./utils/telegrafConf";
import { Context } from "vm";

// Tokens 
import getTokenDetails from "./controller/tokens/TokenDetails";
import getTokenHolders from "./controller/tokens/TokenHolders";
import getTokens from "./controller/tokens/Tokens";

const app = express();

bot.start((ctx: Context) => {
    const userName = ctx.message?.from?.first_name || "User";
    ctx.reply(`Hello ${userName}, welcome!`);
    ctx.reply(
        "This bot is designed to help you with your trading. Type /help to see what I can do."
    );
});


// Tokens Information
bot.command("tokendetails", async (ctx) => {
    const message = ctx.message?.text;
    if (!message) return ctx.reply("Invalid message.");

    // Remove the /command and split the arguments
    const mintAddress = message.split(" ").slice(1).join(" ");
    if (!mintAddress) {
        return ctx.reply("Please provide a mint address.");
    }

    try {
        const response = await getTokenDetails(mintAddress);
        
        if (!response) {
            return ctx.reply("No token details found.");
        }

        const {
            symbol,
            name,
            price,
            price1d,
            price7d,
            decimal,
            logoUrl,
            category,
            subcategory,
            verified,
            updateTime,
            currentSupply,
            marketCap,
            tokenAmountVolume24h,
            usdValueVolume24h
        } = response;

        let replyMessage = `Token Details:\n\n`;
        replyMessage += `🔹 *Symbol*: ${symbol}\n`;
        replyMessage += `🏷️ *Name*: ${name}\n`;
        replyMessage += `🆔 *Mint Address*: \`${mintAddress}\`\n`;
        replyMessage += `💰 *Price*: $${price.toFixed(6)}\n`;
        replyMessage += `📉 *Price (1d)*: $${price1d.toFixed(6)}\n`;
        replyMessage += `📉 *Price (7d)*: $${price7d.toFixed(6)}\n`;
        replyMessage += `🔢 *Decimal*: ${decimal}\n`;
        replyMessage += `🌐 *Logo URL*: [Link](${logoUrl})\n`;
        replyMessage += `🏷️ *Category*: ${category}\n`;
        replyMessage += `🏷️ *Subcategory*: ${subcategory}\n`;
        replyMessage += `✅ *Verified*: ${verified ? "Yes" : "No"}\n`;
        replyMessage += `🕒 *Update Time*: ${new Date(updateTime * 1000).toLocaleString()}\n`;
        replyMessage += `📊 *Current Supply*: ${currentSupply.toFixed(2)}\n`;
        replyMessage += `💸 *Market Cap*: $${marketCap.toFixed(2)}\n`;
        replyMessage += `📈 *Token Amount Volume (24h)*: ${tokenAmountVolume24h.toFixed(2)}\n`;
        replyMessage += `💵 *USD Value Volume (24h)*: $${usdValueVolume24h.toFixed(2)}\n`;

        // Send the reply message
        ctx.reply(replyMessage, { parse_mode: "Markdown" });
    } catch {
        ctx.reply("🚫 Failed to fetch market data.");
        return;
    }
});


bot.command("tokenholders", async (ctx) => {
    const message = ctx.message?.text;
    if (!message) return ctx.reply("Invalid message.");

    // Remove the /command and split the arguments
    const args = message.split(" ").slice(1);
    const mintAddress = args[0];
    const limit = args[1];

    if (!mintAddress) {
        return ctx.reply("Please provide a mint address.");
    }

    // Parse the limit if provided, otherwise set a default value (e.g., 10)
    const parsedLimit = limit && !isNaN(Number(limit)) ? Number(limit) : 10;

    try {
        const response = await getTokenHolders(mintAddress, parsedLimit);
        if (!response || !response.data || response.data.length === 0) {
            return ctx.reply("No token holders data found.");
        }

        let replyMessage = "Token Holders Data:\n\n";

        response.data.forEach((holder: { holdersTimestamp: number; nHolders: number }, index: number) => {
            const timestamp = new Date(holder.holdersTimestamp * 1000).toLocaleString();
            replyMessage +=
                `🔹 *Entry ${index + 1}*\n` +
                `🕒 Timestamp: ${timestamp}\n` +
                `👥 Number of Holders: ${holder.nHolders}\n\n`;

            // Check if the message is getting too long
            if (replyMessage.length > 4000) {
                ctx.reply(replyMessage, { parse_mode: "Markdown" });
                replyMessage = ""; // Reset the message for the next batch
            }
        });

        // Send any remaining part of the message
        if (replyMessage) {
            ctx.reply(replyMessage, { parse_mode: "Markdown" });
        }

    } catch {
        ctx.reply("🚫 Failed to fetch token holders data.");
        return;
    }
});

bot.command("tokens", async (ctx) => {
    const message = ctx.message?.text;
    if (!message) return ctx.reply("Invalid message.");

    // Remove the /command and split the arguments
    const args = message.split(" ").slice(1);
    const limit = args[0];

    // Parse the limit if provided, otherwise set a default value (e.g., 10)
    const parsedLimit = limit && !isNaN(Number(limit)) ? Number(limit) : 10;

    try {
        const response = await getTokens(parsedLimit);
        if (!response || !response.data || response.data.length === 0) {
            return ctx.reply("No token data found.");
        }

        let replyMessage = "Tokens Data:\n\n";

        interface TokenData {
            name: string;
            symbol: string;
            mintAddress: string;
            price: number;
            price1d: number;
            price7d: number;
            decimal: number;
            logoUrl: string;
            category?: string;
            subcategory?: string;
            verified: boolean;
            updateTime: number;
            currentSupply: number;
            marketCap: number;
            tokenAmountVolume24h: number | null;
            usdValueVolume24h: number | null;
        }

        response.data.forEach((token: TokenData, index: number) => {
            const updateTime = new Date(token.updateTime * 1000).toLocaleString();
            replyMessage +=
            `🔹 *Token ${index + 1}*\n` +
            `🏷️ Name: ${token.name}\n` +
            `🔹 Symbol: ${token.symbol}\n` +
            `🆔 Mint Address: \`${token.mintAddress}\`\n` +
            `💰 Price: $${token.price.toFixed(6)}\n` +
            `📉 Price (1d): $${token.price1d.toFixed(6)}\n` +
            `📉 Price (7d): $${token.price7d.toFixed(6)}\n` +
            `🔢 Decimal: ${token.decimal}\n` +
            `🌐 Logo URL: [Link](${token.logoUrl})\n` +
            `🏷️ Category: ${token.category || "N/A"}\n` +
            `🏷️ Subcategory: ${token.subcategory || "N/A"}\n` +
            `✅ Verified: ${token.verified ? "Yes" : "No"}\n` +
            `🕒 Update Time: ${updateTime}\n` +
            `📊 Current Supply: ${token.currentSupply.toFixed(2)}\n` +
            `💸 Market Cap: $${token.marketCap.toFixed(2)}\n` +
            `📈 Token Amount Volume (24h): ${token.tokenAmountVolume24h !== null ? token.tokenAmountVolume24h.toFixed(2) : "N/A"}\n` +
            `💵 USD Value Volume (24h): ${token.usdValueVolume24h !== null ? `$${token.usdValueVolume24h.toFixed(2)}` : "N/A"}\n\n`;

            // Check if the message is getting too long
            if (replyMessage.length > 4000) {
            ctx.reply(replyMessage, { parse_mode: "Markdown" });
            replyMessage = ""; // Reset the message for the next batch
            }
        });

        // Send any remaining part of the message
        if (replyMessage) {
            ctx.reply(replyMessage, { parse_mode: "Markdown" });
        }

    } catch  {
        ctx.reply("🚫 Failed to fetch token data.");
        return;
    }
});


bot.launch();

export default app;