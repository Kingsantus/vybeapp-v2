import vybeApi from '@api/vybe-api';
const apiKey = process.env.VYBE_API_KEY;

if (!apiKey) {
    throw new Error("VYBE_API_KEY is not defined in the environment variables.");
}

vybeApi.auth(apiKey)

const getTokenBalance = async ( wallet: string, limit?: number): Promise<any> => {
    try {
        const { data } = await  vybeApi.get_wallet_tokens({
            limit: limit ?? 10,
            ownerAddress: wallet
        });
        return data;  // Return the response data
    } catch (err) {
        console.error(err);
        throw err;  // Optionally, rethrow the error if you want to handle it outside
    }
}

export default getTokenBalance;