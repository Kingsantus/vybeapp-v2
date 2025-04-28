import express from "express";
import bot from "./utils/telegrafConf";
import { Context } from "vm";

// Tokens 
import getTokenDetails from "./controller/tokens/TokenDetails";
import getTokenHolders from "./controller/tokens/TokenHolders";
import getTokens from "./controller/tokens/Tokens";
import getInstructionNames from "./controller/tokens/InstructionNames";
import getTopTokenHolders from "./controller/tokens/TopTokenHolders";
import getTokenVolume from "./controller/tokens/TokenVolume";
import getTokenTransfer from "./controller/tokens/TokenTransfers";
import getTokenTrades from "./controller/tokens/TokenTrades";

const app = express();

enum range {
    M = '30d',
    W = '7d',
    D = '1d'
}

const time = {
    H: '1h',
    D: '1d',
    W: '7h',
    M: '30d'
} as const;

// Correct type for time values ("1h", "1d", etc)
type Time = (typeof time)[keyof typeof time];
type Resolution = keyof typeof time;

bot.start((ctx: Context) => {
    const userName = ctx.message?.from?.first_name || "User";
    ctx.reply(`Hello ${userName}, welcome!`);
    ctx.reply(
        "This bot is designed to help you with your trading. Type /help to see what I can do."
    );
});

bot.help((ctx: Context) => {
    ctx.reply(
        "Here are the commands you can use:\n" +
            "/start - Start the bot\n" +
            "/help - List available commands\n" +
            "/helptoken - Get help on token commands\n"
    );
});


/* Tokens Information  */

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
            mintAddress: responseMintAddress,
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
    } catch (error) {
        console.error(error);
        ctx.reply("🚫 Failed to fetch market data.");
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

    } catch (error) {
        console.error(error);
        ctx.reply("🚫 Failed to fetch token holders data.");
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

    } catch (error) {
        console.error(error);
        ctx.reply("🚫 Failed to fetch token data.");
    }
});

bot.command("tokentrades", async (ctx) => {
    const message = ctx.message?.text;
    if (!message) return ctx.reply("Invalid message.");

    const args = message.split(" ").slice(1);

    let programId: string | undefined;
    let limit: number | undefined;
    let baseMintAddress: string | undefined;
    let quoteMintAddress: string | undefined;
    let marketId: string | undefined;
    let authorityAddress: string | undefined;
    let resolution: Resolution | undefined;


    // Parse optional arguments
    let i = 0;
    while (i < args.length) {
        const arg = args[i];
        if (arg.startsWith("programId=")) {
            programId = arg.split("=")[1];
        } else if (arg.startsWith("limit=")) {
            const limitValue = parseInt(arg.split("=")[1], 10);
            if (isNaN(limitValue)) {
                return ctx.reply("Invalid limit. Please provide a valid number.");
            }
            limit = limitValue;
        } else if (arg.startsWith("resolution=")) {
            const res = arg.split("=")[1].toUpperCase();
            if (res in time) {
                resolution = res as Resolution;
            } else {
                return ctx.reply("Invalid resolution. Use H, D, W, or M.");
            }
        } else if (arg.startsWith("baseMintAddress=")) {
            baseMintAddress = arg.split("=")[1];
        } else if (arg.startsWith("quoteMintAddress=")) {
            quoteMintAddress = arg.split("=")[1];
        } else if (arg.startsWith("marketId=")) {
            marketId = arg.split("=")[1];
        } else if (arg.startsWith("authorityAddress=")) {
            authorityAddress = arg.split("=")[1];
        }  else {
            return ctx.reply("Invalid argument format. Use 'programId=<id>', 'limit=<number>', 'resolution=<H|D|W|M>', 'baseMintAddress=<address>', 'quoteMintAddress=<address>', 'marketId=<id>', 'authorityAddress=<address>'.");
        }
        i++;
    }

    try {
        const resolvedTime: Time = resolution ? time[resolution] : time.H;

        const response = await getTokenTrades(programId, resolvedTime, limit, baseMintAddress, quoteMintAddress, marketId, authorityAddress);

        if (response && response.data && response.data.length > 0) {
            let replyMessage = "";

            response.data.forEach((trade: { authorityAddress: string; blockTime: number; baseMintAddress: string; quoteMintAddress: string; price: number; marketId: string; signature: string; fee: number; feePayer: string; baseSize: number; quoteSize: number; }, index: number) => {
                const blockTime = new Date(trade.blockTime * 1000).toLocaleString();
                const price = Number(trade.price);
                const fee = Number(trade.fee);
                const baseSize = Number(trade.baseSize);
                const quoteSize = Number(trade.quoteSize);

                // Format numbers to fixed or scientific notation based on their magnitude
                const formatNumber = (num: number) => {
                    return Math.abs(num) < 1e-6 || Math.abs(num) >= 1e6 ? num.toExponential(6) : num.toFixed(6);
                };

                replyMessage +=
                `🔹 *Trade ${index + 1}*\n` +
                `🔑 Authority Address: \`${trade.authorityAddress}\`\n` +
                `⏰ Block Time: ${blockTime}\n` +
                `📊 Base Mint Address: \`${trade.baseMintAddress}\`\n` +
                `📊 Quote Mint Address: \`${trade.quoteMintAddress}\`\n` +
                `💸 Price: ${formatNumber(price)}\n` +
                `📈 Market ID: \`${trade.marketId}\`\n` +
                `🔗 Signature: \`${trade.signature}\`\n` +
                `💼 Fee: ${formatNumber(fee)}\n` +
                `💼 Fee Payer: \`${trade.feePayer}\`\n` +
                `📏 Base Size: ${formatNumber(baseSize)}\n` +
                `📏 Quote Size: ${formatNumber(quoteSize)}\n\n` +
                `---\n`;

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

        } else {
            ctx.reply("No token trades found.");
        }
    } catch (error) {
        console.error(error);
        ctx.reply("🚫 Failed to fetch token data.");
    }
});


bot.command("tokentransfer", async (ctx) => {
    const message = ctx.message?.text;
    if (!message) return ctx.reply("Invalid message.");

    const args = message.split(" ").slice(1);

    let mintAddress: string | undefined;
    let limit: number | undefined;
    let callingProgram: string | undefined;
    let senderTokenAccount: string | undefined;
    let senderAddress: string | undefined;
    let receiverTokenAccount: string | undefined;
    let receiverAddress: string | undefined;

    let i = 0;
    while (i < args.length) {
        const arg = args[i];
        if (arg.startsWith("mintAddress=")) {
            mintAddress = arg.split("=")[1];
        } else if (arg.startsWith("limit=")) {
            const limitValue = parseInt(arg.split("=")[1], 10);
            if (isNaN(limitValue)) {
                return ctx.reply("Invalid limit. Please provide a valid number.");
            }
            limit = limitValue;
        } else if (arg.startsWith("callingProgram=")) {
            callingProgram = arg.split("=")[1];
        } else if (arg.startsWith("senderTokenAccount=")) {
            senderTokenAccount = arg.split("=")[1];
        } else if (arg.startsWith("senderAddress=")) {
            senderAddress = arg.split("=")[1];
        } else if (arg.startsWith("receiverTokenAccount=")) {
            receiverTokenAccount = arg.split("=")[1];
        } else if (arg.startsWith("receiverAddress=")) {
            receiverAddress = arg.split("=")[1];
        } else {
            return ctx.reply("Invalid argument format. Use 'mintAddress=<address>', 'limit=<number>', 'callingProgram=<program>', 'senderTokenAccount=<account>', 'senderAddress=<address>', 'receiverTokenAccount=<account>', 'receiverAddress=<address>'.");
        }
        i++;
    }

    try {
        const response = await getTokenTransfer(mintAddress, callingProgram, senderTokenAccount, senderAddress, receiverTokenAccount, receiverAddress, limit);
        
        if (response && response.transfers && response.transfers.length > 0) {
            let replyMessage = "";

            response.transfers.forEach((transfer: { signature: string; blockTime: number; senderAddress: string; receiverAddress: string; mintAddress: string; feePayer: string; decimal: number; price: number; calculatedAmount: number; valueUsd: number; amount: number; slot: number }, index: number) => {
                const blockTime = new Date(transfer.blockTime * 1000).toLocaleString();
                const price = Number(transfer.price);
                const calculatedAmount = Number(transfer.calculatedAmount);
                const valueUsd = Number(transfer.valueUsd);

                // Format numbers to fixed or scientific notation based on their magnitude
                const formatNumber = (num: number) => {
                    return Math.abs(num) < 1e-6 || Math.abs(num) >= 1e6 ? num.toExponential(6) : num.toFixed(6);
                };

                replyMessage +=
                `🔹 *Transfer ${index + 1}*\n` +
                `🔗 Signature: \`${transfer.signature}\`\n` +
                `📅 Block Time: ${blockTime}\n` +
                `📤 Sender Address: \`${transfer.senderAddress}\`\n` +
                `📥 Receiver Address: \`${transfer.receiverAddress}\`\n` +
                `🏷️ Mint Address: \`${transfer.mintAddress}\`\n` +
                `💼 Fee Payer: \`${transfer.feePayer}\`\n` +
                `🔢 Decimal: ${transfer.decimal}\n` +
                `💸 Price: ${formatNumber(price)}\n` +
                `💰 Calculated Amount: ${formatNumber(calculatedAmount)}\n` +
                `💵 Value USD: ${formatNumber(valueUsd)}\n` +
                `📊 Amount: ${transfer.amount.toFixed(2)}\n` +
                `🏷️ Slot: ${transfer.slot}\n\n` +
                `---\n`;

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
        } else {
            ctx.reply("No token transfers found.");
        }
    } catch (error) {
        console.error(error);
        ctx.reply("🚫 Failed to fetch token data.");
    }
});

bot.command("tokenvolume", async (ctx) => {
    const message = ctx.message?.text;
    if (!message) return ctx.reply("Invalid message.");
    // remove the /command
    const args = message.split(" ").slice(1);
     if (args.length === 0) {
        return ctx.reply("Please provide a mint address.");
    }

    const mintAddress = args[0];
    let limit: number | undefined;

    // Parse optional arguments
    let i = 1;
    while (i < args.length) {
        if (args[i].startsWith("limit=")) {
            limit = parseInt(args[i].split("=")[1], 10);
        } else {
            return ctx.reply("Invalid argument format. Use 'limit=<number>'.");
        }
        i++;
    }

    try {
        const response = await getTokenVolume(mintAddress, limit);
        if (response && response.data && response.data.length > 0) {
            let replyMessage = "";

            response.data.forEach((volumeData: { timeBucketStart: number; volume: number; amount: number }, index: number) => {
                const timeBucketStart = new Date(volumeData.timeBucketStart * 1000).toLocaleString();
                const volume = Number(volumeData.volume);
                const amount = Number(volumeData.amount);

                replyMessage +=
                `🔹 *Volume Data ${index + 1}*\n` +
                `📅 Time Bucket Start: ${timeBucketStart}\n` +
                `💸 Token Volume: ${volume.toFixed(2)}\n` +
                `💰 Token Amount: ${amount.toFixed(2)}\n\n` +
                `---\n`;

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
        } else {
            ctx.reply("No volume data found.");
        }
    } catch (error) {
        console.error(error);
        ctx.reply("🚫 Failed to fetch token data.");
    }
});

bot.command("tokenwales", async (ctx) => {
    const message = ctx.message?.text;
    if (!message) return ctx.reply("Invalid message.");
    // remove the /command
    const args = message.split(" ").slice(1);
     if (args.length === 0) {
        return ctx.reply("Please provide a mint address.");
    }

    const mintAddress = args[0];
    let limit: number | undefined;

    // Parse optional arguments
    let i = 1;
    while (i < args.length) {
        if (args[i].startsWith("limit=")) {
            limit = parseInt(args[i].split("=")[1], 10);
        } else {
            return ctx.reply("Invalid argument format. Use 'limit=<number>'.");
        }
        i++;
    }

    try {
        const response = await getTopTokenHolders(mintAddress, limit);

        if (response && response.data && response.data.length > 0) {
            let replyMessage = "";

            response.data.forEach((holder: { rank: number; ownerAddress: string; ownerName?: string; ownerLogoUrl?: string; tokenMint: string; tokenSymbol: string; tokenLogoUrl: string; balance: number; valueUsd: number; percentageOfSupplyHeld: number }, index: number) => {
                const balance = Number(holder.balance);
                const valueUsd = Number(holder.valueUsd);

                replyMessage +=
                `🔹 *Holder ${index + 1}*\n` +
                `🏆 Rank: ${holder.rank}\n` +
                `🔑 Owner Address: \`${holder.ownerAddress}\`\n` +
                `🏷️ Owner Name: ${holder.ownerName || "N/A"}\n` +
                `🌐 Owner Logo URL: [Link](${holder.ownerLogoUrl || "#"})\n` +
                `🏷️ Token Mint: \`${holder.tokenMint}\`\n` +
                `🔹 Token Symbol: ${holder.tokenSymbol}\n` +
                `🌐 Token Logo URL: [Link](${holder.tokenLogoUrl})\n` +
                `💰 Balance: ${balance.toFixed(2)}\n` +
                `💵 Value USD: ${valueUsd.toFixed(2)}\n` +
                `📊 Percentage of Supply Held: ${holder.percentageOfSupplyHeld.toFixed(2)}%\n\n` +
                `---\n`;

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
        } else {
            ctx.reply("No top token holders found.");
        }
    } catch (error) {
        console.error(error);
        ctx.reply("🚫 Failed to fetch token data.");
    }
});


bot.command("tokenname", async (ctx) => {
    const message = ctx.message?.text;
    if (!message) return ctx.reply("Invalid message.");
    // remove the /command
    const args = message.split(" ").slice(1);

    let ixName: string | undefined;
    let callingProgram: string | undefined;
    let programName: string | undefined;

    let i = 0;
    while (i < args.length) {
        const arg = args[i];
        if (arg.startsWith("ixName=")) {
            ixName = arg.split("=")[1];
        } else if (arg.startsWith("callingProgram=")) {
            callingProgram = arg.split("=")[1];
        } else if (arg.startsWith("programName=")) {
            programName = arg.split("=")[1];
        } else {
            return ctx.reply("Invalid argument format. Use 'ixName=<name>', 'callingProgram=<program>', 'programName=<name>'.");
        }
        i++;
    }


    try {
        const response = await getInstructionNames(ixName, callingProgram, programName);

        if (response && response.data && response.data.length > 0) {
            let replyMessage = "";

            response.data.forEach((instruction: { ixName: string; callingProgram: string; programName: string }, index: number) => {
                replyMessage +=
                `🔹 *Instruction ${index + 1}*\n` +
                `🏷️ Instruction Name: ${instruction.ixName}\n` +
                `🔗 Calling Program: \`${instruction.callingProgram}\`\n` +
                `🏢 Program Name: ${instruction.programName}\n\n` +
                `---\n`;

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
        } else {
            ctx.reply("No instruction names found.");
        }
    } catch (error) {
        console.error(error);
        ctx.reply("🚫 Failed to fetch token data.");
    }
})

bot.command("helptoken", async (ctx) => {
    const helpMessage = `
    🤖 **Token Commands Help** 🤖

    Here are the available token-related commands and how to use them:

    1. **/tokendetails <mintAddress>**
    - Get detailed information about a token.
    - *Usage*: /tokendetails <mintAddress>
    - *Example*: /tokendetails 9LoLQDJb...

    2. **/tokenholders <mintAddress> [limit]**
    - Get the list of token holders.
    - *Usage*: /tokenholders <mintAddress> [limit]
    - *Example*: /tokenholders 9LoLQDJb... 10
    - *Note*: limit is optional and defaults to 10 if not provided.

    3. **/tokens [limit]**
    - Get a list of tokens.
    - *Usage*: /tokens [limit]
    - *Example*: /tokens 10
    - *Note*: limit is optional and defaults to 10 if not provided.

    4. **/tokentrades [options]**
    - Get token trades data.
    - *Usage*: /tokentrades [programId=<id>] [limit=<number>] [resolution=<H|D|W|M>] [baseMintAddress=<address>] [quoteMintAddress=<address>] [marketId=<id>] [authorityAddress=<address>]
    - *Example*: /tokentrades programId=123 limit=10 resolution=H baseMintAddress=9LoLQDJb...

    5. **/tokentransfer [options]**
    - Get token transfer data.
    - *Usage*: /tokentransfer [mintAddress=<address>] [limit=<number>] [callingProgram=<program>] [senderTokenAccount=<account>] [senderAddress=<address>] [receiverTokenAccount=<account>] [receiverAddress=<address>]
    - *Example*: /tokentransfer mintAddress=9LoLQDJb... limit=10

    6. **/tokenvolume <mintAddress> [limit]**
    - Get token volume data.
    - *Usage*: /tokenvolume <mintAddress> [limit]
    - *Example*: /tokenvolume 9LoLQDJb... 10
    - *Note*: limit is optional.

    7. **/tokenwales <mintAddress> [limit]**
    - Get top token holders (whales).
    - *Usage*: /tokenwales <mintAddress> [limit]
    - *Example*: /tokenwales 9LoLQDJb... 10
    - *Note*: limit is optional.

    8. **/tokenname [options]**
    - Get instruction names.
    - *Usage*: /tokenname [ixName=<name>] [callingProgram=<program>] [programName=<name>]
    - *Example*: /tokenname ixName=transfer callingProgram=123

    ---

    💡 **Tips**:
    - Ensure you provide the correct mint address and other parameters as required.
    - Use the commands responsibly and avoid spamming.

    If you need further assistance, feel free to ask!
    `;

    ctx.reply(helpMessage, { parse_mode: "Markdown" });
});


bot.launch();

export default app;