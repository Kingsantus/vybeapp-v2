import vybeApi from '@api/vybe-api';
const apiKey = process.env.VYBE_API_KEY;

if (!apiKey) {
    throw new Error("VYBE_API_KEY is not defined in the environment variables.");
}

vybeApi.auth(apiKey)

type res = '1d' | '7d' | '30d' | undefined;

const getTokenOHLCV = async (mintAddress: string, interval: res = '1d', limit?: number):Promise<any> => {
    try {
        const { data } = await vybeApi.get_token_trade_ohlc({resolution: interval, limit: limit ?? 10, mintAddress: mintAddress});
        return data;
    } catch (err) {
        console.error(err);
        throw err;
    }
}

export default getTokenOHLCV;