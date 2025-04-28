import vybeApi from '@api/vybe-api';
const apiKey = process.env.VYBE_API_KEY;

if (!apiKey) {
    throw new Error("VYBE_API_KEY is not defined in the environment variables.");
}

vybeApi.auth(apiKey)

const time = {
    H: '1h',
    D: '1d',
    W: '7h',
    M: '30d'
} as const;

type Time = typeof time[keyof typeof time];

const getTokenTrades = async (programId?: string, resolution?: Time, limit?: number, baseMintAddress?: string, quoteMintAddress?: string, marketId?: string, authorityAddress?: string):Promise<any> => {
    try {
        const { data } = await vybeApi.get_trade_data_program({
            programId: programId,
            baseMintAddress: baseMintAddress,
            quoteMintAddress: quoteMintAddress,
            marketId: marketId,
            authorityAddress: authorityAddress,
            resolution: typeof resolution === 'string' && Object.values(time).includes(resolution as Time)
                ? resolution as Time
                : time.H,
            limit: limit ?? 5,
        });
        return data;
    } catch (err) {
        console.error(err);
        throw err;
    }
}

export default getTokenTrades;