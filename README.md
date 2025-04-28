# GanarTradeBot

GanarTradeBot is a powerful and easy-to-use Telegram bot that puts the full power and information of the Solana blockchain in your hands. Whether you're a casual trader or a serious investor, GanarTradeBot gives you real-time insights into tokens, programs, wallets, and market prices — all directly within Telegram.

🔗 Check out AlphaVybe for advanced market charts!

## Features

- Get detailed wallet transactions, balances, and NFT holdings.
- Fetch price data, OHLCV (Open-High-Low-Close-Volume) charts, and token info.
- Monitor blockchain programs, active users, transaction counts, and rankings.
- Quickly access the most relevant Solana market data with simple commands.

## Commands

### General Commands

| Command       | Description                       |
|---------------|-----------------------------------|
| `/start`      | Start interacting with the bot    |
| `/help`       | List all available commands       |

### Token Commands

| Command                      | Description                                                   |
|------------------------------|---------------------------------------------------------------|
| `/tokendetails <mintAddress>`| Get detailed information about a token                         |
| `/tokenholders <mintAddress> [limit]` | Get the list of token holders                     |
| `/tokens [limit]`            | Get a list of tokens                                          |

**Example:**
/tokendetails 9LoLQDJb...

### Wallet Commands

| Command                          | Description                                                   |
|----------------------------------|---------------------------------------------------------------|
| `/wallettx <walletAddress> [day]`| Get wallet transactions within a specified number of days      |
| `/walletpnl <walletAddress> [token] [limit] [resolution]` | Get wallet profit and loss summary     |
| `/wallettoken <mintAddress>`     | Get known account details for a mint address                  |
| `/walletbalance <mintAddress> [limit]` | Get wallet token balance                     |
| `/walletbalancets <mintAddress> [day]` | Get time series of wallet balance                    |
| `/walletnft <mintAddress> [limit]`     | Get NFT balance for a mint address                            |
| `/walletsnft <walletAddress> [limit]`  | Get NFT balance for wallet addresses                           |
| `/walletstokentx <walletAddress> [limit]` | Get token transactions for wallets                    |

**Example:**
/wallettx 5CgWc77mp15NRktbnqz8MENM4w3fXqcGYUVUbEhciZ8U day=7

### Price Commands

| Command                              | Description                                                   |
|--------------------------------------|---------------------------------------------------------------|
| `/getdexandamm`                     | Get a list of DEX and AMM programs                            |
| `/getmarkets <walletAddress> [limit]`| Get market data for a wallet address                          |
| `/marketohlcv <marketAddress> [limit] [range]` | Get OHLCV data for a market address             |
| `/tokenohlcv <mintAddress> [limit] [range]` | Get OHLCV data for a token mint address                 |
| `/priceohlcv <baseMintAddress> <quoteMintAddress> [limit] [range]` | Get OHLCV data for a token pair         |

**Example:**
/marketohlcv 5CgWc77mp15NRktbnqz8MENM4w3fXqcGYUVUbEhciZ8U limit=10 range=7d

### Program Commands

| Command                                | Description                                                   |
|----------------------------------------|---------------------------------------------------------------|
| `/activeusers <programAddress> [range]`| Get number of active users for a program                     |
| `/instructioncount <programAddress> [range]` | Get instruction count for a program             |
| `/programactiveusers <programAddress> [limit]` | Get active users list for a program             |
| `/programdetail <programAddress>`      | Get detailed program information                              |
| `/transactioncount <programAddress> [range]` | Get transaction count for a program             |
| `/ranking [limit]`                     | Get program rankings                                         |
| `/programlist [limit]`                 | Get list of programs                                          |

**Example:**
/activeusers program123 range=24h

## Notes

- Replace placeholders like `<walletAddress>`, `<mintAddress>`, `<programAddress>` with real Solana addresses.
- Optional parameters like `limit`, `day`, and `range` can fine-tune your results.

**Accepted values:**

- **Range:** `1h`, `24h`, `7d`, `30d`, `1w`, `1m`, `1y`
- **Resolution:** `D` (Daily), `W` (Weekly), `M` (Monthly)

## Installation

This project uses Node.js with Telegraf.js (Telegram Bot Framework).

```bash
npm install
npm run start
```
 
Or deploy it to your preferred server environment or cloud provider!

### License
This project is licensed under the MIT License.

### Author
👑 Kingingsantus Asogwa
https://www.github.com/kingsantus

To access the Telegram bot use @Ganartradebot