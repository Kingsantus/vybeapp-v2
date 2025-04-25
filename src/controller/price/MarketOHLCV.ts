import vybeApi from '@api/vybe-api';
const apiKey = process.env.VYBE_API_KEY;

if (!apiKey) {
    throw new Error("VYBE_API_KEY is not defined in the environment variables.");
}

vybeApi.auth(apiKey);

enum range {
    H = "1h",
    M = "1m",
    W = "1w",
    D = "1d",
    Y = "1y"
}

const getMarketOHLCV = async (marketId: string, range?: range, limit?: number):Promise<any> => {
    try {
        const { data } = await vybeApi.get_market_filtered_ohlcv({
            marketId: marketId,
            resolution: (range ?? "1d") as "1d" | "7d" | "30d" | undefined,
            page: 1,
            limit: limit ?? 10
        });
        return data;
    } catch (err) {
        console.error(err);
        throw err;
    }
}

export default getMarketOHLCV;