import vybeApi from '@api/vybe-api';
const apiKey = process.env.VYBE_API_KEY;

if (!apiKey) {
    throw new Error("VYBE_API_KEY is not defined in the environment variables.");
}

vybeApi.auth(apiKey);

type res = '1d' | '7d' | '30d' | undefined;

const getMarketOHLCV = async (marketId: string, range: res = '1d', limit?: number):Promise<any> => {
    try {
        const { data } = await vybeApi.get_market_filtered_ohlcv({
            marketId: marketId,
            resolution: range,
            limit: limit ?? 10
        });
        return data;
    } catch (err) {
        console.error(err);
        throw err;
    }
}

export default getMarketOHLCV;