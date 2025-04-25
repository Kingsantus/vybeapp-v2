import vybeApi from '@api/vybe-api';
const apiKey = process.env.VYBE_API_KEY;

if (!apiKey) {
    throw new Error("VYBE_API_KEY is not defined in the environment variables.");
}

vybeApi.auth(apiKey)

enum range {
    M = '30d',
    W = '7d',
    D = '1d'
}

const getWalletProfitAndLoss = async (wallet: string, token?: string, limit?: number, resolution?: range):Promise<any> => {
    try {
        const { data } = await vybeApi.get_wallet_pnl({
        resolution: resolution,
        tokenAddress: token,
        limit: limit ?? 100,
        ownerAddress: wallet
        })
        return data;
    } catch (err) {
        console.error(err);
        throw err;
    }
}

export default getWalletProfitAndLoss;