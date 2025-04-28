import vybeApi from '@api/vybe-api';
const apiKey = process.env.VYBE_API_KEY;

if (!apiKey) {
    throw new Error("VYBE_API_KEY is not defined in the environment variables.");
}

vybeApi.auth(apiKey)

const getRanking = async ( limit?: number ):Promise<any> => {
    try {
        const { data } = await vybeApi.ranking({limit: limit ?? 10});
        return data;
    } catch (err) {
        console.error(err);
        throw err;
    }
}

export default getRanking;