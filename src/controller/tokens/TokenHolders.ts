import vybeApi from '@api/vybe-api';
const apiKey = process.env.VYBE_API_KEY;

if (!apiKey) {
    throw new Error("VYBE_API_KEY is not defined in the environment variables.");
}

vybeApi.auth(apiKey)

const getTokenHolders = async (mintAddress: string, limit?: number):Promise<any> => {
    try {
        const { data } = await vybeApi.get_token_holders_time_series({interval: 'day', limit: limit ?? 10, mintAddress: mintAddress});
        return data;
    } catch (err) {
        console.error(err);
        throw err;
    }
}

export default getTokenHolders;