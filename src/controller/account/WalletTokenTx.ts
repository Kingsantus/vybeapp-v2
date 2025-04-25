import vybeApi from '@api/vybe-api';
const apiKey = process.env.VYBE_API_KEY;

if (!apiKey) {
    throw new Error("VYBE_API_KEY is not defined in the environment variables.");
}

vybeApi.auth(apiKey)

const getWalletTokenTxs = async (day?: number, wallet?: string[]): Promise<any> => {
    try {
        vybeApi.post_wallet_tokens_many({
        wallets: wallet ?? [],
        holderMinimum: 50,
        includeNoPriceBalance: true,
        oneDayTradeMinimum: 100,
        onlyVerified: true,
        sortByDesc: 'yes',
        sortByAsc: 'yes',
        page: 1,
        oneDayTradeVolumeMinimum: 100,
        minAssetValue: '5',
        maxAssetValue: '10',
        limit: 23
        })
        .then(({ data }) => console.log(data))
        .catch(err => console.error(err));

    } catch {

    }
}

export default getWalletTokenTxs;