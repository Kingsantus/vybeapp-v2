import vybeApi from '@api/vybe-api';
const apiKey = process.env.VYBE_API_KEY;

if (!apiKey) {
    throw new Error("VYBE_API_KEY is not defined in the environment variables.");
}

vybeApi.auth(apiKey)

const getTokenTransfer = async (mintAddress?: string, callingProgram?: string, senderTokenAccount?: string, senderAddress?: string, receiverTokenAccount?: string, receiverAddress?: string, limit?: number):Promise<any> => {
    try {
        const { data } = await vybeApi.get_token_transfers({
            mintAddress: mintAddress,
            callingProgram: callingProgram,
            senderTokenAccount: senderTokenAccount,
            senderAddress: senderAddress,
            receiverTokenAccount: receiverTokenAccount,
            receiverAddress: receiverAddress,
            limit: limit ?? 10,
            sortByAsc: 'amount'
        });
        return data;
    } catch (err) {
        console.error(err);
        throw err;
    }
}

export default getTokenTransfer;