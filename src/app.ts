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
import getActiveUsers from "./controller/Programs/ActiveUsers";
import getInstructionCount from "./controller/Programs/InstructionCount";
import getProgramActiveUser from "./controller/Programs/ProgramActiveUsers";
import getProgramDetail from "./controller/Programs/ProgramsDetails";
import getTransactionCount from "./controller/Programs/TransactionCount";
import getRanking from "./controller/Programs/Ranking";
import getProgramList from "./controller/Programs/ProgramsList";
import getWalletTokenTransactions from "./controller/account/WalletTokenTransactions";
import getWalletProfitAndLoss from "./controller/account/WalletProfitAndLoss";
import getKnownAccount from "./controller/account/KnownAccounts";
import getTokenBalance from "./controller/account/TokenBalances";
import getTokenBalancests from "./controller/account/TokenBalancests";
import getWalletNFTBalance from "./controller/account/WalletNFTBalance";
import getWalletsNFTBalance from "./controller/account/WalletNFTBalancets";
import getWalletTokenTxs from "./controller/account/WalletTokenTx";

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

type Range = '1h' | '24h' | '7d';

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
            "/helptoken - Get help getting token commands\n" +
            "/helpprogram - Get help working with program list\n" +
            "/helpwallet - Get help working with wallet account\n"
    );
});


/*         Account        */

bot.command("wallettx", async (ctx) => {
    const message = ctx.message?.text;
    if (!message) return ctx.reply("Invalid message.");
    // remove the /command
    const args = message.split(" ").slice(1);
    
    // Initialize variables
    let day: number | undefined;
    const wallets: string[] = [];

    // Process arguments to separate wallets and day
    args.forEach(arg => {
        const num = Number(arg);
        if (!isNaN(num)) {
        day = num;
        } else {
        wallets.push(arg);
        }
    });

    if (wallets.length === 0) {
        return ctx.reply("Please provide at least one valid wallet address.");
    }

    try {
        const result = await getWalletTokenTransactions(day, wallets);

        if (!result || !result.data || result.data.length === 0) {
            return ctx.reply("No transaction data found.");
        }

        let replyMessage = "Transaction Details:\n\n";

        result.ownerAddresses.forEach((address: string, index: number) => {
            replyMessage += `💼 *Owner Address ${index + 1}*: \`${address}\`\n\n`;
        });

        result.data.forEach((transaction: any, index: number) => {
            const blockTime = new Date(transaction.blockTime * 1000).toLocaleString();
            replyMessage +=
                `🕒 *Transaction ${index + 1}*\n` +
                `📅 Block Time: ${blockTime}\n` +
                `💸 Token Value: ${transaction.tokenValue}\n` +
                `🔒 Stake Value: ${transaction.stakeValue}\n` +
                `🔧 System Value: ${transaction.systemValue}\n` +
                `🔒 Stake Value (SOL): ${transaction.stakeValueSol}\n\n`;

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
        return;
    } catch (error) {
        console.error(error);
        ctx.reply("🚫 Failed to fetch wallet transactions.");
    }
})

bot.command("walletpnl", async (ctx) => {
    const message = ctx.message?.text;
    if (!message) return ctx.reply("Invalid message.");
    // remove the /command
    const args = message.split(" ").slice(1);
     if (args.length === 0) {
        return ctx.reply("Please provide a wallet address.");
    }

    const wallet = args[0];
    let token: string | undefined;
    let limit: number | undefined;
    let resolution: range | undefined;

    // Parse optional arguments
    let i = 1;
    while (i < args.length) {
        if (args[i].startsWith("token=")) {
            token = args[i].split("=")[1];
        } else if (args[i].startsWith("limit=")) {
            limit = parseInt(args[i].split("=")[1], 10);
        } else if (args[i].startsWith("days=")) {
            const res = args[i].split("=")[1].toUpperCase();
            if (res in range) {
                resolution = range[res as keyof typeof range];
            } else {
                return ctx.reply("Invalid resolution. Use M, W, or D.");
            }
        } else {
            return ctx.reply("Invalid argument format. Use 'token=<token>', 'limit=<number>', 'resolution=<M|W|D>'.");
        }
        i++;
    }

    try {
        const result = await getWalletProfitAndLoss(wallet, token, limit, resolution);
         if (!result || !result.summary) {
            return ctx.reply("No profit and loss data found.");
        }

        const {
            winRate,
            realizedPnlUsd,
            unrealizedPnlUsd,
            uniqueTokensTraded,
            averageTradeUsd,
            tradesCount,
            winningTradesCount,
            losingTradesCount,
            tradesVolumeUsd,
            bestPerformingToken,
            worstPerformingToken,
            pnlTrendSevenDays
        } = result.summary;

        let replyMessage = "Wallet Profit and Loss Summary:\n\n";
        replyMessage += `🏆 Win Rate: ${winRate}%\n`;
        replyMessage += `💰 Realized PnL (USD): $${realizedPnlUsd.toFixed(2)}\n`;
        replyMessage += `💸 Unrealized PnL (USD): $${unrealizedPnlUsd.toFixed(2)}\n`;
        replyMessage += `🔄 Unique Tokens Traded: ${uniqueTokensTraded}\n`;
        replyMessage += `💵 Average Trade (USD): $${averageTradeUsd.toFixed(2)}\n`;
        replyMessage += `📊 Trades Count: ${tradesCount}\n`;
        replyMessage += `✅ Winning Trades: ${winningTradesCount}\n`;
        replyMessage += `❌ Losing Trades: ${losingTradesCount}\n`;
        replyMessage += `📈 Trades Volume (USD): $${tradesVolumeUsd.toFixed(2)}\n`;

        if (bestPerformingToken) {
            replyMessage += `🏅 Best Performing Token: ${bestPerformingToken}\n`;
        }

        if (worstPerformingToken) {
            replyMessage += `🏅 Worst Performing Token: ${worstPerformingToken}\n`;
        }

        if (pnlTrendSevenDays.length > 0) {
            replyMessage += `\n📅 PnL Trend (Last 7 Days):\n`;
            pnlTrendSevenDays.forEach((pnl: number, index: number) => {
                replyMessage += `Day ${index + 1}: $${pnl.toFixed(2)}\n`;
            });
        }

        // Send the reply message
        ctx.reply(replyMessage, { parse_mode: "Markdown" });
    } catch (error) {
        console.error(error);
        ctx.reply("🚫 Failed to fetch wallet transactions.");
    }
});

bot.command("wallettoken", async (ctx) => {
    const message = ctx.message?.text;
    if (!message) return ctx.reply("Invalid message.");
    // remove the /command
    const args = message.split(" ").slice(1);
    if (args.length === 0) {
        return ctx.reply("Please provide a mint address.");
    }

    const address = args[0];

    try {
        const response = await getKnownAccount(address);
        if (response && response.accounts && response.accounts.length > 0) {
            let replyMessage = "";

            response.accounts.forEach((account: { ownerAddress: string; name: string; logoUrl: string; labels: string[]; entity: string; dateAdded: string }, index: number) => {
                const dateAdded = new Date(account.dateAdded).toLocaleString();

                replyMessage +=
                `🔹 *Known Account ${index + 1}*\n` +
                `🔑 Owner Address: \`${account.ownerAddress}\`\n` +
                `🏷️ Name: ${account.name}\n` +
                `🌐 Logo URL: [Link](${account.logoUrl})\n` +
                `🏷️ Labels: ${account.labels.join(", ") || "N/A"}\n` +
                `🏢 Entity: ${account.entity}\n` +
                `📅 Date Added: ${dateAdded}\n\n` +
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
            ctx.reply("No known account data found.");
        }
    } catch (error) {
        console.error(error);
        ctx.reply("🚫 Failed to fetch token data.");
    }
})

bot.command("walletbalance", async (ctx) => {
    const message = ctx.message?.text;
    if (!message) return ctx.reply("Invalid message.");
    // remove the /command
    const args = message.split(" ").slice(1);
    if (args.length === 0) {
        return ctx.reply("Please provide a mint address.");
    }

    const address = args[0];
    let limit: number | undefined;

    for (let i = 1; i < args.length; i++) {
        if (args[i].startsWith("limit=")) {
            const limitValue = parseInt(args[i].split("=")[1], 10);
            if (isNaN(limitValue)) {
                return ctx.reply("Invalid limit. Please provide a valid number.");
            }
            limit = limitValue;
        } else {
            return ctx.reply("Invalid argument format. Use 'limit=<number>'.");
        }
    }

    try {
        const response = await getTokenBalance(address, limit);
        
        if (response) {
            let replyMessage = "";
            const date = new Date(response.date).toLocaleString();

            replyMessage +=
            `📅 Date: ${date}\n` +
            `🔑 Owner Address: \`${response.ownerAddress}\`\n` +
            `💰 Staked SOL Balance (USD): ${response.stakedSolBalanceUsd}\n` +
            `💰 Staked SOL Balance: ${response.stakedSolBalance}\n` +
            `💰 Active Staked SOL Balance (USD): ${response.activeStakedSolBalanceUsd}\n` +
            `💰 Active Staked SOL Balance: ${response.activeStakedSolBalance}\n` +
            `💰 Total Token Value (USD): ${response.totalTokenValueUsd}\n` +
            `📈 Total Token Value (USD 1d Change): ${response.totalTokenValueUsd1dChange}\n` +
            `🔢 Total Token Count: ${response.totalTokenCount}\n\n`;

            response.data.forEach((token: { symbol: string; name: string; mintAddress: string; amount: number; priceUsd: number; priceUsd1dChange: number; valueUsd: number; valueUsd1dChange: number; logoUrl: string; category: string; decimals: number; verified: boolean; slot: number }, index: number) => {
                replyMessage +=
                `🔹 *Token ${index + 1}*\n` +
                `🏷️ Symbol: ${token.symbol}\n` +
                `🏷️ Name: ${token.name}\n` +
                `🔗 Mint Address: \`${token.mintAddress}\`\n` +
                `💰 Amount: ${token.amount}\n` +
                `💰 Price (USD): ${token.priceUsd}\n` +
                `📈 Price (USD 1d Change): ${token.priceUsd1dChange}\n` +
                `💰 Value (USD): ${token.valueUsd}\n` +
                `📈 Value (USD 1d Change): ${token.valueUsd1dChange}\n` +
                `🌐 Logo URL: [Link](${token.logoUrl})\n` +
                `🏷️ Category: ${token.category}\n` +
                `🔢 Decimals: ${token.decimals}\n` +
                `✅ Verified: ${token.verified ? "Yes" : "No"}\n` +
                `🏷️ Slot: ${token.slot}\n\n` +
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
            ctx.reply("No token balance data found.");
        }
        
    } catch (error) {
        console.error(error);
        ctx.reply("🚫 Failed to fetch token data.");
    }
})


bot.command("walletbalancets", async (ctx) => {
    const message = ctx.message?.text;
    if (!message) return ctx.reply("Invalid message.");
    // remove the /command
    const args = message.split(" ").slice(1);
    if (args.length === 0) {
        return ctx.reply("Please provide a mint address.");
    }

    const address = args[0];
    let limit: number | undefined;

    for (let i = 1; i < args.length; i++) {
        if (args[i].startsWith("day=")) {
            const limitValue = parseInt(args[i].split("=")[1], 10);
            if (isNaN(limitValue)) {
                return ctx.reply("Invalid limit. Please provide a valid number.");
            }
            limit = limitValue;
        } else {
            return ctx.reply("Invalid argument format. Use 'day=<number>'.");
        }
    }

    try {
        const response = await getTokenBalancests(address, limit);
        
        if (response && response.data && response.data.length > 0) {
            let replyMessage = "";

            replyMessage +=
            `🔑 Owner Address: \`${response.ownerAddress}\`\n\n`;

            response.data.forEach((balance: { blockTime: number; tokenValue: number; stakeValue: number; systemValue: number; stakeValueSol: number }, index: number) => {
                const blockTime = new Date(balance.blockTime * 1000).toLocaleString();

                replyMessage +=
                `🔹 *Token Balance ${index + 1}*\n` +
                `⏰ Block Time: ${blockTime}\n` +
                `💰 Token Value: ${balance.tokenValue}\n` +
                `💰 Stake Value: ${balance.stakeValue}\n` +
                `💰 System Value: ${balance.systemValue}\n` +
                `💰 Stake Value (SOL): ${balance.stakeValueSol}\n\n` +
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
            ctx.reply("No token balance data found.");
        }
        
    } catch (error) {
        console.error(error);
        ctx.reply("🚫 Failed to fetch token data.");
    }
})

bot.command("walletnft", async (ctx) => {
    const message = ctx.message?.text;
    if (!message) return ctx.reply("Invalid message.");
    // remove the /command
    const args = message.split(" ").slice(1);
    if (args.length === 0) {
        return ctx.reply("Please provide a mint address.");
    }

    const address = args[0];
    let limit: number | undefined;

    for (let i = 1; i < args.length; i++) {
        if (args[i].startsWith("limit=")) {
            const limitValue = parseInt(args[i].split("=")[1], 10);
            if (isNaN(limitValue)) {
                return ctx.reply("Invalid limit. Please provide a valid number.");
            }
            limit = limitValue;
        } else {
            return ctx.reply("Invalid argument format. Use 'limit=<number>'.");
        }
    }

    try {
        const response = await getWalletNFTBalance(address, limit);
        
        if (response) {
            let replyMessage = "";
            const date = new Date(response.date).toLocaleString();

            replyMessage +=
            `📅 Date: ${date}\n` +
            `🔑 Owner Address: \`${response.ownerAddress}\`\n` +
            `💰 Total SOL: ${response.totalSol}\n` +
            `💰 Total USD: ${response.totalUsd}\n` +
            `🎨 Total NFT Collection Count: ${response.totalNftCollectionCount}\n\n`;

            if (response.data && response.data.length > 0) {
                response.data.forEach((nft: { name: string; collectionAddress: string; totalItems: number; valueSol: number; priceSol: number; valueUsd: number; priceUsd: number; logoUrl: string; slot: number }, index: number) => {
                    replyMessage +=
                    `🔹 *NFT Collection ${index + 1}*\n` +
                    `🏷️ Name: ${nft.name}\n` +
                    `🔗 Collection Address: \`${nft.collectionAddress}\`\n` +
                    `🎨 Total Items: ${nft.totalItems}\n` +
                    `💰 Value (SOL): ${nft.valueSol}\n` +
                    `💰 Price (SOL): ${nft.priceSol}\n` +
                    `💰 Value (USD): ${nft.valueUsd}\n` +
                    `💰 Price (USD): ${nft.priceUsd}\n` +
                    `🌐 Logo URL: [Link](${nft.logoUrl})\n` +
                    `🏷️ Slot: ${nft.slot}\n\n` +
                    `---\n`;

                    // Check if the message is getting too long
                    if (replyMessage.length > 4000) {
                        ctx.reply(replyMessage, { parse_mode: "Markdown" });
                        replyMessage = ""; // Reset the message for the next batch
                    }
                });
            } else {
                replyMessage += "No NFT collections found.\n";
            }

            // Send any remaining part of the message
            if (replyMessage) {
                ctx.reply(replyMessage, { parse_mode: "Markdown" });
            }
        } else {
            ctx.reply("No NFT balance data found.");
        }

    } catch (error) {
        console.error(error);
        ctx.reply("🚫 Failed to fetch token data.");
    }
})


bot.command("walletsnft", async (ctx) => {
    const message = ctx.message?.text;
    if (!message) return ctx.reply("Invalid message.");
    // remove the /command
    const args = message.split(" ").slice(1);
    if (args.length === 0) {
        return ctx.reply("Please provide a wallet address.");
    }
    //adddress is array

    const addresses: string[] = [];
    let limit: number | undefined;

    // Parse arguments
    for (let i = 0; i < args.length; i++) {
        if (args[i].startsWith("limit=")) {
            const limitValue = parseInt(args[i].split("=")[1], 10);
            if (isNaN(limitValue)) {
                return ctx.reply("Invalid limit. Please provide a valid number.");
            }
            limit = limitValue;
        } else {
            addresses.push(args[i]);
        }
    }

    // Check if at least one address is provided
    if (addresses.length === 0) {
        return ctx.reply("Please provide one or more mint addresses.");
    }

    try {
        const response = await getWalletsNFTBalance(addresses, limit);
        
        if (response) {
            let replyMessage = "";
            const date = new Date(response.date).toLocaleString();

            replyMessage +=
            `📅 Date: ${date}\n` +
            `💰 Total SOL: ${response.totalSol}\n` +
            `💰 Total USD: ${response.totalUsd}\n` +
            `🎨 Total NFT Collection Count: ${response.totalNftCollectionCount}\n\n` +
            `🔑 Owner Addresses:\n`;

            response.ownerAddresses.forEach((address: string) => {
                replyMessage += `- \`${address}\`\n`;
            });

            replyMessage += "\n";

            if (response.data && response.data.length > 0) {
                response.data.forEach((nft: { name: string; collectionAddress: string; totalItems: number; valueSol: number; priceSol: number; valueUsd: number; priceUsd: number; logoUrl: string; slot: number }, index: number) => {
                    replyMessage +=
                    `🔹 *NFT Collection ${index + 1}*\n` +
                    `🏷️ Name: ${nft.name}\n` +
                    `🔗 Collection Address: \`${nft.collectionAddress}\`\n` +
                    `🎨 Total Items: ${nft.totalItems}\n` +
                    `💰 Value (SOL): ${nft.valueSol}\n` +
                    `💰 Price (SOL): ${nft.priceSol}\n` +
                    `💰 Value (USD): ${nft.valueUsd}\n` +
                    `💰 Price (USD): ${nft.priceUsd}\n` +
                    `🌐 Logo URL: [Link](${nft.logoUrl})\n` +
                    `🏷️ Slot: ${nft.slot}\n\n` +
                    `---\n`;

                    // Check if the message is getting too long
                    if (replyMessage.length > 4000) {
                        ctx.reply(replyMessage, { parse_mode: "Markdown" });
                        replyMessage = ""; // Reset the message for the next batch
                    }
                });
            } else {
                replyMessage += "No NFT collections found.\n";
            }

            // Send any remaining part of the message
            if (replyMessage) {
                ctx.reply(replyMessage, { parse_mode: "Markdown" });
            }
        } else {
            ctx.reply("No NFT balance data found.");
        }

    } catch (error) {
        console.error(error);
        ctx.reply("🚫 Failed to fetch token data.");
    }
})

bot.command("walletstokentx", async (ctx) => {
    const message = ctx.message?.text;
    if (!message) return ctx.reply("Invalid message.");
    // remove the /command
    const args = message.split(" ").slice(1);
    if (args.length === 0) {
        return ctx.reply("Please provide a wallet address.");
    }
    //adddress is array

    const addresses: string[] = [];
    let limit: number | undefined;

    // Parse arguments
    for (let i = 0; i < args.length; i++) {
        if (args[i].startsWith("limit=")) {
            const limitValue = parseInt(args[i].split("=")[1], 10);
            if (isNaN(limitValue)) {
                return ctx.reply("Invalid limit. Please provide a valid number.");
            }
            limit = limitValue;
        } else {
            addresses.push(args[i]);
        }
    }

    // Check if at least one address is provided
    if (addresses.length === 0) {
        return ctx.reply("Please provide one or more mint addresses.");
    }

    try {
        const response = await getWalletTokenTxs(addresses, limit);
        
        if (response) {
            let replyMessage = "";
            const date = new Date(response.date).toLocaleString();

            replyMessage +=
            `📅 Date: ${date}\n` +
            `🔑 Owner Addresses:\n`;

            response.ownerAddresses.forEach((address: string) => {
                replyMessage += `- \`${address}\`\n`;
            });

            replyMessage +=
            `💰 Staked SOL Balance (USD): ${response.stakedSolBalanceUsd}\n` +
            `💰 Staked SOL Balance: ${response.stakedSolBalance}\n` +
            `💰 Active Staked SOL Balance (USD): ${response.activeStakedSolBalanceUsd}\n` +
            `💰 Active Staked SOL Balance: ${response.activeStakedSolBalance}\n` +
            `💰 Total Token Value (USD): ${response.totalTokenValueUsd}\n` +
            `📈 Total Token Value (USD 1d Change): ${response.totalTokenValueUsd1dChange}\n` +
            `🔢 Total Token Count: ${response.totalTokenCount}\n\n`;

            if (response.data && response.data.length > 0) {
                response.data.forEach((token: { symbol: string; name: string; mintAddress: string; amount: number; priceUsd: number; priceUsd1dChange: number; valueUsd: number; valueUsd1dChange: number; logoUrl: string; category: string; decimals: number; verified: boolean; slot: number }, index: number) => {
                    replyMessage +=
                    `🔹 *Token ${index + 1}*\n` +
                    `🏷️ Symbol: ${token.symbol}\n` +
                    `🏷️ Name: ${token.name}\n` +
                    `🔗 Mint Address: \`${token.mintAddress}\`\n` +
                    `💰 Amount: ${token.amount}\n` +
                    `💰 Price (USD): ${token.priceUsd}\n` +
                    `📈 Price (USD 1d Change): ${token.priceUsd1dChange}\n` +
                    `💰 Value (USD): ${token.valueUsd}\n` +
                    `📈 Value (USD 1d Change): ${token.valueUsd1dChange}\n` +
                    `🌐 Logo URL: [Link](${token.logoUrl})\n` +
                    `🏷️ Category: ${token.category}\n` +
                    `🔢 Decimals: ${token.decimals}\n` +
                    `✅ Verified: ${token.verified ? "Yes" : "No"}\n` +
                    `🏷️ Slot: ${token.slot}\n\n` +
                    `---\n`;

                    // Check if the message is getting too long
                    if (replyMessage.length > 4000) {
                        ctx.reply(replyMessage, { parse_mode: "Markdown" });
                        replyMessage = ""; // Reset the message for the next batch
                    }
                });
            } else {
                replyMessage += "No token transactions found.\n";
            }

            // Send any remaining part of the message
            if (replyMessage) {
                ctx.reply(replyMessage, { parse_mode: "Markdown" });
            }
        } else {
            ctx.reply("No wallet token transaction data found.");
        }

    } catch (error) {
        console.error(error);
        ctx.reply("🚫 Failed to fetch token data.");
    }
})

bot.command("helpwallet", async (ctx) => {
    const helpMessage = `
💼 **Wallet Commands:**

1. **/wallettx <walletAddress> [day=<number>]**
   - Get the transaction details for one or more wallet addresses within a specified number of days.
   - Example: /wallettx 5CgWc77mp15NRktbnqz8MENM4w3fXqcGYUVUbEhciZ8U day=7

2. **/walletpnl <walletAddress> [token=<token>] [limit=<number>] [resolution=<M|W|D>]**
   - Get the profit and loss summary for a wallet address with optional token, limit, and resolution parameters.
   - Example: /walletpnl 5CgWc77mp15NRktbnqz8MENM4w3fXqcGYUVUbEhciZ8U token=SOL limit=10 resolution=D

3. **/wallettoken <mintAddress>**
   - Get the known account details for a given mint address.
   - Example: /wallettoken 5CgWc77mp15NRktbnqz8MENM4w3fXqcGYUVUbEhciZ8U

4. **/walletbalance <mintAddress> [limit=<number>]**
   - Get the token balance for a given mint address with an optional limit.
   - Example: /walletbalance 5CgWc77mp15NRktbnqz8MENM4w3fXqcGYUVUbEhciZ8U limit=5

5. **/walletbalancets <mintAddress> [day=<number>]**
   - Get the token balance time series for a given mint address within a specified number of days.
   - Example: /walletbalancets 5CgWc77mp15NRktbnqz8MENM4w3fXqcGYUVUbEhciZ8U day=30

6. **/walletnft <mintAddress> [limit=<number>]**
   - Get the NFT balance for a given mint address with an optional limit.
   - Example: /walletnft 5CgWc77mp15NRktbnqz8MENM4w3fXqcGYUVUbEhciZ8U limit=5

7. **/walletsnft <walletAddress> [limit=<number>]**
   - Get the NFT balance for one or more wallet addresses with an optional limit.
   - Example: /walletsnft 5CgWc77mp15NRktbnqz8MENM4w3fXqcGYUVUbEhciZ8U limit=5

8. **/walletstokentx <walletAddress> [limit=<number>]**
   - Get the token transactions for one or more wallet addresses with an optional limit.
   - Example: /walletstokentx 5CgWc77mp15NRktbnqz8MENM4w3fXqcGYUVUbEhciZ8U limit=5

📌 **Notes:**
- Replace \`<walletAddress>\` and \`<mintAddress>\` with the actual addresses.
- The \`day\`, \`token\`, \`limit\`, and \`resolution\` parameters are optional and should be provided in the format shown.
- The \`resolution\` parameter can be \`M\` (Monthly), \`W\` (Weekly), or \`D\` (Daily).

🔍 **Usage:**
- Use these commands to fetch various metrics and details related to wallets and mint addresses.
- Ensure you provide the correct addresses and optional parameters as needed.
    `;

    ctx.reply(helpMessage, { parse_mode: "Markdown" });
});



/*       PROGRAMS     */

bot.command("activeusers", async (ctx) => {
    const message = ctx.message?.text;
    if (!message) return ctx.reply("Invalid message.");

    const args = message.split(" ").slice(1);
    if (args.length === 0) {
        return ctx.reply("Please provide a program address.");
    }

    const programAddress = args[0];
    let range: Range = '1h';

    // Parse optional arguments
    for (let i = 1; i < args.length; i++) {
        if (args[i].startsWith("range=")) {
            const res = args[i].split("=")[1];
            if (res === '1h' || res === '24h' || res === '7d') {
                range = res as Range;
            } else {
                return ctx.reply("Invalid range. Use '1h', '24h', or '7d'.");
            }
        } else {
            return ctx.reply("Invalid argument format. Use 'range=<1h|24h|7d>'.");
        }
    }

    try {
        const response = await getActiveUsers(programAddress, range);
        
        if (response && response.data && response.data.length > 0) {
            let replyMessage = "";

            response.data.forEach((userData: { programId: string; dau: number; blockTime: number }, index: number) => {
                const blockTime = new Date(userData.blockTime * 1000).toLocaleString();

                replyMessage +=
                `🔹 *Active User Data ${index + 1}*\n` +
                `🏢 Program ID: \`${userData.programId}\`\n` +
                `👥 Daily Active Users (DAU): ${userData.dau}\n` +
                `⏰ Block Time: ${blockTime}\n\n` +
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
            ctx.reply("No active user data found.");
        }

    } catch (error) {
        console.error(error);
        ctx.reply("🚫 Failed to fetch token data.");
    }
})

bot.command("instructioncount", async (ctx) => {
    const message = ctx.message?.text;
    if (!message) return ctx.reply("Invalid message.");

    const args = message.split(" ").slice(1);
    if (args.length === 0) {
        return ctx.reply("Please provide a program address.");
    }

    const programAddress = args[0];
    let range: Range = '1h';

    // Parse optional arguments
    for (let i = 1; i < args.length; i++) {
        if (args[i].startsWith("range=")) {
            const res = args[i].split("=")[1];
            if (res === '1h' || res === '24h' || res === '7d') {
                range = res as Range;
            } else {
                return ctx.reply("Invalid range. Use '1h', '24h', or '7d'.");
            }
        } else {
            return ctx.reply("Invalid argument format. Use 'range=<1h|24h|7d>'.");
        }
    }

    try {
        const response = await getInstructionCount(programAddress, range);

        if (response && response.data && response.data.length > 0) {
            let replyMessage = "";

            response.data.forEach((countData: { programId: string; instructionsCount: number; blockTime: number }, index: number) => {
                const blockTime = new Date(countData.blockTime * 1000).toLocaleString();

                replyMessage +=
                `🔹 *Instruction Count Data ${index + 1}*\n` +
                `🏢 Program ID: \`${countData.programId}\`\n` +
                `📊 Instructions Count: ${countData.instructionsCount}\n` +
                `⏰ Block Time: ${blockTime}\n\n` +
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
            ctx.reply("No instruction count data found.");
        }
        
    } catch (error) {
        console.error(error);
        ctx.reply("🚫 Failed to fetch token data.");
    }

});

bot.command("programactiveusers", async (ctx) => {
    const message = ctx.message?.text;
    if (!message) return ctx.reply("Invalid message.");

    const args = message.split(" ").slice(1);
    if (args.length === 0) {
        return ctx.reply("Please provide a program address.");
    }

    const programAddress = args[0];
    let limit: number | undefined;

    // Parse optional arguments
    for (let i = 1; i < args.length; i++) {
        if (args[i].startsWith("limit=")) {
            const limitValue = parseInt(args[i].split("=")[1], 10);
            if (isNaN(limitValue)) {
                return ctx.reply("Invalid limit. Please provide a valid number.");
            }
            limit = limitValue;
        } else {
            return ctx.reply("Invalid argument format. Use 'range=<1h|24h|7d>'.");
        }
    }

    try {
        const response = await getProgramActiveUser(programAddress, limit);
        
        if (response && response.data && response.data.length > 0) {
            let replyMessage = "";

            response.data.forEach((userData: { programId: string; wallet: string; transactions: number; instructions: number }, index: number) => {
                replyMessage +=
                `🔹 *Active User ${index + 1}*\n` +
                `🏢 Program ID: \`${userData.programId}\`\n` +
                `🔑 Wallet: \`${userData.wallet}\`\n` +
                `📊 Transactions: ${userData.transactions}\n` +
                `📋 Instructions: ${userData.instructions}\n\n` +
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
            ctx.reply("No active user data found.");
        }
    } catch (error) {
        console.error(error);
        ctx.reply("🚫 Failed to fetch token data.");
    }

})

bot.command("programdetail", async (ctx) => {
    const message = ctx.message?.text;
    if (!message) return ctx.reply("Invalid message.");

    const args = message.split(" ").slice(1);
    if (args.length === 0) {
        return ctx.reply("Please provide a program address.");
    }

    const programAddress = args[0];

    try {
        const response = await getProgramDetail(programAddress);
        
        if (response) {
            let replyMessage = "";

            const blockTime = new Date(response.blockTime * 1000).toLocaleString();

            replyMessage +=
            `🔹 *Program Details*\n` +
            `🏢 Program ID: \`${response.programId}\`\n` +
            `🏷️ Name: ${response.name}\n` +
            `🌐 Logo URL: [Link](${response.logoUrl || "#"})\n` +
            `🏷️ Friendly Name: ${response.friendlyName}\n` +
            `👥 Daily Active Users (DAU): ${response.dau}\n` +
            `📉 New Users Change (1d): ${response.newUsersChange1d}\n` +
            `📊 Transactions (1d): ${response.transactions1d}\n` +
            `📋 Instructions (1d): ${response.instructions1d}\n` +
            `🏢 Entity Name: ${response.entityName}\n` +
            `📝 Program Description: ${response.programDescription}\n` +
            `🏷️ Labels: ${response.labels.join(", ") || "N/A"}\n`;

            // Check if the message is getting too long
            if (replyMessage.length > 4000) {
                ctx.reply(replyMessage, { parse_mode: "Markdown" });
                replyMessage = ""; // Reset the message for the next batch
            }

            // Send any remaining part of the message
            if (replyMessage) {
                ctx.reply(replyMessage, { parse_mode: "Markdown" });
            }
        } else {
            ctx.reply("No program details found.");
        }
        
    } catch (error) {
        console.error(error);
        ctx.reply("🚫 Failed to fetch token data.");
    }

})

bot.command("transactioncount", async (ctx) => {
    const message = ctx.message?.text;
    if (!message) return ctx.reply("Invalid message.");

    const args = message.split(" ").slice(1);
    if (args.length === 0) {
        return ctx.reply("Please provide a program address.");
    }

    const programAddress = args[0];
    let range: Range = '1h';

    // Parse optional arguments
    for (let i = 1; i < args.length; i++) {
        if (args[i].startsWith("range=")) {
            const res = args[i].split("=")[1];
            if (res === '1h' || res === '24h' || res === '7d') {
                range = res as Range;
            } else {
                return ctx.reply("Invalid range. Use '1h', '24h', or '7d'.");
            }
        } else {
            return ctx.reply("Invalid argument format. Use 'range=<1h|24h|7d>'.");
        }
    }

    try {
        const response = await getTransactionCount(programAddress, range);
        
        if (response && response.data && response.data.length > 0) {
            let replyMessage = "";

            response.data.forEach((transactionData: { programId: string; transactionsCount: number; blockTime: number }, index: number) => {
                const blockTime = new Date(transactionData.blockTime * 1000).toLocaleString();

                replyMessage +=
                `🔹 *Transaction Count Data ${index + 1}*\n` +
                `🏢 Program ID: \`${transactionData.programId}\`\n` +
                `📊 Transactions Count: ${transactionData.transactionsCount}\n` +
                `⏰ Block Time: ${blockTime}\n\n` +
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
            ctx.reply("No transaction count data found.");
        }
        
    } catch (error) {
        console.error(error);
        ctx.reply("🚫 Failed to fetch token data.");
    }

});


bot.command("ranking", async (ctx) => {
    const message = ctx.message?.text;
    if (!message) return ctx.reply("Invalid message.");

    const args = message.split(" ").slice(1);
    
    let limit: number | undefined;

    // Parse optional arguments
   for (let i = 0; i < args.length; i++) {
        if (args[i].startsWith("limit=")) {
            const limitValue = parseInt(args[i].split("=")[1], 10);
            if (isNaN(limitValue)) {
                return ctx.reply("Invalid limit. Please provide a valid number.");
            }
            limit = limitValue;
        } else {
            return ctx.reply("Invalid argument format. Use 'limit=<number>'.");
        }
    }

    try {
        const response = await getRanking(limit);
        
        if (response && response.data && response.data.length > 0) {
            let replyMessage = "";
            const date = new Date(response.date * 1000).toLocaleString();

            replyMessage += `📅 Date: ${date}\n🕒 Interval: ${response.interval}\n🔢 Limit: ${response.limit}\n\n`;

            response.data.forEach((rankData: { programRank: number; programId: string; score: number; programName: string }, index: number) => {
                replyMessage +=
                `🔹 *Ranking ${index + 1}*\n` +
                `🏆 Rank: ${rankData.programRank}\n` +
                `🏢 Program ID: \`${rankData.programId}\`\n` +
                `📈 Score: ${rankData.score.toFixed(6)}\n` +
                `🏷️ Program Name: ${rankData.programName}\n\n` +
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
            ctx.reply("No ranking data found.");
        }

    } catch (error) {
        console.error(error);
        ctx.reply("🚫 Failed to fetch token data.");
    }

});

bot.command("programlist", async (ctx) => {
    const message = ctx.message?.text;
    if (!message) return ctx.reply("Invalid message.");

    const args = message.split(" ").slice(1);
    
    let limit: number | undefined;

    // Parse optional arguments
   for (let i = 0; i < args.length; i++) {
        if (args[i].startsWith("limit=")) {
            const limitValue = parseInt(args[i].split("=")[1], 10);
            if (isNaN(limitValue)) {
                return ctx.reply("Invalid limit. Please provide a valid number.");
            }
            limit = limitValue;
        } else {
            return ctx.reply("Invalid argument format. Use 'limit=<number>'.");
        }
    }

    try {
        const response = await getProgramList(limit);
        
        if (response && response.data && response.data.length > 0) {
            let replyMessage = "";

            response.data.forEach((program: { programId: string; name?: string; logoUrl?: string; friendlyName?: string; dau: number; newUsersChange1d: number; transactions1d: number; instructions1d: number; entityName?: string; programDescription?: string; labels: string[] }, index: number) => {
                replyMessage +=
                `🔹 *Program ${index + 1}*\n` +
                `🏢 Program ID: \`${program.programId}\`\n` +
                `🏷️ Name: ${program.name || "N/A"}\n` +
                `🌐 Logo URL: [Link](${program.logoUrl || "#"})\n` +
                `🏷️ Friendly Name: ${program.friendlyName || "N/A"}\n` +
                `👥 Daily Active Users (DAU): ${program.dau}\n` +
                `📉 New Users Change (1d): ${program.newUsersChange1d}\n` +
                `📊 Transactions (1d): ${program.transactions1d}\n` +
                `📋 Instructions (1d): ${program.instructions1d}\n` +
                `🏢 Entity Name: ${program.entityName || "N/A"}\n` +
                `📝 Program Description: ${program.programDescription || "N/A"}\n` +
                `🏷️ Labels: ${program.labels.join(", ") || "N/A"}\n\n` +
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
            ctx.reply("No program list data found.");
        }

    } catch (error) {
        console.error(error);
        ctx.reply("🚫 Failed to fetch token data.");
    }

});

bot.command("/helpprogram", async (ctx) => {
    const helpMessage = `
🤖 **Available Commands:**

1. **/activeusers <programAddress> [range=<1h|24h|7d>]**
   - Get the number of active users for a specific program within a given time range.
   - Example: /activeusers program123 range=24h

2. **/instructioncount <programAddress> [range=<1h|24h|7d>]**
   - Get the instruction count for a specific program within a given time range.
   - Example: /instructioncount program123 range=7d

3. **/programactiveusers <programAddress> [limit=<number>]**
   - Get the list of active users for a specific program with an optional limit.
   - Example: /programactiveusers program123 limit=10

4. **/programdetail <programAddress>**
   - Get detailed information about a specific program.
   - Example: /programdetail program123

5. **/transactioncount <programAddress> [range=<1h|24h|7d>]**
   - Get the transaction count for a specific program within a given time range.
   - Example: /transactioncount program123 range=24h

6. **/ranking [limit=<number>]**
   - Get the ranking of programs with an optional limit.
   - Example: /ranking limit=5

7. **/programlist [limit=<number>]**
   - Get the list of programs with an optional limit.
   - Example: /programlist limit=10

📌 **Notes:**
- Replace \`<programAddress>\` with the actual program address.
- The \`range\` parameter can be \`1h\`, \`24h\`, or \`7d\`.
- The \`limit\` parameter should be a positive integer.

🔍 **Usage:**
- Use these commands to fetch various metrics and details about programs.
- Ensure you provide the correct program address and optional parameters as needed.
    `;

    ctx.reply(helpMessage, { parse_mode: "Markdown" });
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