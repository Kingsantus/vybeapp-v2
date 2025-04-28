# GanarTradeBot

GanarTradeBot is a comprehensive Telegram bot built using Express.js and the Telegraf library, designed to deliver real-time, on-chain analytics through Vybe APIs. It offers deep blockchain insights on tokens, wallets, programs, and price data, making critical information easily accessible for crypto communities.

Key features include detailed token information (holders, trades, volume, whales), wallet analytics (transactions, profit and loss, balances, NFTs), program statistics (active users, rankings, transaction counts), and price metrics (DEX and AMM markets, OHLCV data). The bot supports a wide range of intuitive commands, such as /tokendetails, /walletpnl, /programlist, and /priceohlcv, with helpful guidance via /help commands for easy navigation.

GanarTradeBot is fully functional, with robust error handling, modular structure, and efficient data retrieval to ensure responsiveness and reliability. The project includes complete documentation detailing setup, usage instructions, and examples of insights provided. It is publicly available on GitHub under an open-source license and deployed live at @GanarTradeBot for testing.

With its broad feature set, user-friendly interface, and scalable architecture, GanarTradeBot is well-positioned for future commercial use and stands out as a highly innovative and valuable tool for crypto enthusiasts and communities.

GanarTradeBot is a powerful and easy-to-use Telegram bot that puts the full power and information of the Solana blockchain in your hands. Whether you're a casual trader or a serious investor, GanarTradeBot gives you real-time insights into tokens, programs, wallets, and market prices — all directly within Telegram.

🔗 Check out AlphaVybe for advanced market charts!
🔗 To access the Telegram bot use @Ganartradebot

## Features

Token Information

    Token Details: Fetch detailed information about a specific token using its mint address.
    Token Holders: Get a list of token holders for a given mint address.
    Tokens List: Retrieve a list of tokens with optional limit.
    Token Trades: Fetch token trades data with various filters like program ID, limit, resolution, etc.
    Token Transfers: Get token transfer data with filters like mint address, limit, calling program, etc.
    Token Volume: Retrieve token volume data for a given mint address.
    Top Token Holders (Whales): Get a list of top token holders.
    Instruction Names: Fetch instruction names based on various filters.
    Wallet Information
    Wallet Transactions: Fetch transaction details for one or more wallet addresses.
    Wallet Profit and Loss: Get profit and loss summary for a wallet address.
    Known Account: Get known account details for a given mint address.
    Token Balance: Fetch token balance for a given mint address.
    Token Balance Time Series: Get token balance time series for a given mint address.
    NFT Balance: Fetch NFT balance for a given mint address.
    NFT Balance for Wallets: Get NFT balance for one or more wallet addresses.
    Token Transactions for Wallets: Fetch token transactions for one or more wallet addresses.
    Programs Information
    Active Users: Get the number of active users for a specific program.
    Instruction Count: Fetch instruction count for a specific program.
    Program Active Users: Get a list of active users for a specific program.
    Program Details: Get detailed information about a specific program.
    Transaction Count: Fetch transaction count for a specific program.
    Ranking: Get the ranking of programs.
    Programs List: Retrieve a list of programs.
    Price Information
    DEX and AMM Programs: Get a list of DEX and AMM programs.
    Markets Data: Fetch markets data for a given wallet address.
    Market OHLCV: Get OHLCV data for a given market address.
    Token OHLCV: Fetch OHLCV data for a given token mint address.
    Price OHLCV: Get OHLCV data for a given pair of base and quote mint addresses.

Commands
The bot supports a wide range of commands to interact with the above features. Some of the key commands include:

Token Commands
   - /tokendetails <mintAddress>: Get detailed information about a token.
   - /tokenholders <mintAddress> [limit]: Get a list of token holders.
   - /tokens [limit]: Retrieve a list of tokens.
   - /tokentrades [options]: Get token trades data.
   - /tokentransfer [options]: Get token transfer data.
   - /tokenvolume <mintAddress> [limit]: Get token volume data.
   - /tokenwales <mintAddress> [limit]: Get top token holders (whales).
   - /tokenname [options]: Get instruction names.

Wallet Commands
   - /wallettx <walletAddress> [day=<number>]: Get transaction details for wallet addresses.
   - /walletpnl <walletAddress> [token=<token>] [limit=<number>] [resolution=<M|W|D>]: Get profit and loss summary.
   - /wallettoken <mintAddress>: Get known account details.
   - /walletbalance <mintAddress> [limit=<number>]: Get token balance.
   - /walletbalancets <mintAddress> [day=<number>]: Get token balance time series.
   - /walletnft <mintAddress> [limit=<number>]: Get NFT balance.
   - /walletsnft <walletAddress> [limit=<number>]: Get NFT balance for wallets.
   - /walletstokentx <walletAddress> [limit=<number>]: Get token transactions for wallets.
    Programs Commands
   - /activeusers <programAddress> [range=<1h|24h|7d>]: Get active users for a program.
   - /instructioncount <programAddress> [range=<1h|24h|7d>]: Get instruction count for a program.
   - /programactiveusers <programAddress> [limit=<number>]: Get active users list for a program.
   - /programdetail <programAddress>: Get program details.
   - /transactioncount <programAddress> [range=<1h|24h|7d>]: Get transaction count for a program.
   - /ranking [limit=<number>]: Get programs ranking.
   - /programlist [limit=<number>]: Get programs list.
    Price Commands
   - /getdexandamm: Get DEX and AMM programs.
   - /getmarkets <walletAddress> [limit=<number>]: Get markets data.
   - /marketohlcv <marketAddress> [limit=<number>] [range=<1d|7d|30d>]: Get market OHLCV data.
   - /tokenohlcv <mintAddress> [limit=<number>] [range=<1d|7d|30d>]: Get token OHLCV data.
   - /priceohlcv <baseMintAddress> <quoteMintAddress> [limit=<number>] [range=<1h|1d|1w|1m|1y>]: Get price OHLCV data.

Helper Commands
The bot also provides helper commands to guide users on how to use the various features:

    - /helptoken: Provides help for token-related commands.
    - /helpprogram: Provides help for program-related commands.
    - /helpwallet: Provides help for wallet-related commands.
    - /helpprice: Provides help for price-related commands.

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

### Contact
For any questions or support, please contact kingsantusasogwa@gmail.com.