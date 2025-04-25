import vybeApi from '@api/vybe-api';
const apiKey = process.env.VYBE_API_KEY;

if (!apiKey) {
    throw new Error("VYBE_API_KEY is not defined in the environment variables.");
}

vybeApi.auth(apiKey)

type range = "1h" | "1d" | "1w" | "1y";

const getPythPriceOHLC = async (pricefeedid: string, limit?: number, interval?: range):Promise<any> => {
    try {
        const { data } = await vybeApi.get_pyth_price_ohlc({resolution: interval ?? '1h', limit: limit ?? 10, priceFeedId: pricefeedid})
        return data;
    } catch (err) {
        console.error(err);
        throw err;
    }
}

export default getPythPriceOHLC;