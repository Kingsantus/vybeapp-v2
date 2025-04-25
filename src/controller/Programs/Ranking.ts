import vybeApi from '@api/vybe-api';
const apiKey = process.env.VYBE_API_KEY;

if (!apiKey) {
    throw new Error("VYBE_API_KEY is not defined in the environment variables.");
}

vybeApi.auth(apiKey)

const range = {
    D: '1d',
    W: '7d',
    M: '30d',
    DEFAULT: '1d'
} as const;

const getRanking = async (limit?: number, interval?:  keyof typeof range):Promise<any> => {
    try {
        const { data } = await vybeApi.ranking({limit: limit ?? 10, interval: interval ? range[interval] : range.DEFAULT });
        return data;
    } catch (err) {
        console.error(err);
        throw err;
    }
}

export default getRanking;