import vybeApi from '@api/vybe-api';
const apiKey = process.env.VYBE_API_KEY;

if (!apiKey) {
    throw new Error("VYBE_API_KEY is not defined in the environment variables.");
}

vybeApi.auth(apiKey)

const getWalletTokenTxs = async ( wallet?: string[], limit?: number): Promise<any> => {
   try {
        const { data } = await vybeApi.post_wallet_tokens_many({
            wallets: wallet ?? [],
            onlyVerified: true,
            limit: limit ?? 10
        })
        return data;
    } catch (err) {
        console.error(err);
        throw err;
    }
}

export default getWalletTokenTxs;