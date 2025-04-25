import vybeApi from '@api/vybe-api';
const apiKey = process.env.VYBE_API_KEY;

if (!apiKey) {
    throw new Error("VYBE_API_KEY is not defined in the environment variables.");
}

vybeApi.auth(apiKey)

const getPairOHLCV = async (baseMintAddress: string, quoteMintAddress: string, limit?: number, interver?: string, ):Promise<any> => {
    try {
        const data = await fetch(`https://api.vybenetwork.xyz/price/${baseMintAddress}+${quoteMintAddress}/pair-ohlcv?resolution=${interver ?? '1h'}&limit=${limit ?? 10}`, {
            method: "GET",
            headers: {
                "Content-Type": "application/json",
                "x-api-key": apiKey,
            }
        });
        return data;
    } catch (err) {
        console.error(err);
        throw err;
    }
}

export default getPairOHLCV;