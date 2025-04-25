import vybeApi from '@api/vybe-api';
const apiKey = process.env.VYBE_API_KEY;

if (!apiKey) {
    throw new Error("VYBE_API_KEY is not defined in the environment variables.");
}

vybeApi.auth(apiKey)

const getWalletTokenTransactions = async (day?: number, wallet?: string[]): Promise<any> => {
    try {
        const { data } = await vybeApi.post_wallet_tokens_ts_many({
            days: day ?? 1,
            wallets: wallet ?? []
        });
        return data;  // Return the response data
    } catch (err) {
        console.error(err);
        throw err;  // Optionally, rethrow the error if you want to handle it outside
    }
}

export default getWalletTokenTransactions;