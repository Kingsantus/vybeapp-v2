import vybeApi from '@api/vybe-api';
const apiKey = process.env.VYBE_API_KEY;

if (!apiKey) {
    throw new Error("VYBE_API_KEY is not defined in the environment variables.");
}

vybeApi.auth(apiKey)

type time = {
    H: '1h',
    D: '1d',
    W: '7h',
    M: '30d'
}

const getTokenTrades = async (programId?: string, resolution?: time, limit?: number, baseMintAddress?: string, quoteMintAddress?: string, marketId?: string, authorityAddress?: string):Promise<any> => {
    try {
        const { data } = await vybeApi.get_trade_data_program({
            programId: programId,
            baseMintAddress: baseMintAddress,
            quoteMintAddress: quoteMintAddress,
            marketId: marketId,
            authorityAddress: authorityAddress,
            resolution: typeof resolution === 'string' ? resolution : resolution ? resolution.H : '1h',
            sortByAsc: 'price',
            limit: limit ?? 10,
        });
        return data;
    } catch (err) {
        console.error(err);
        throw err;
    }
}

export default getTokenTrades;