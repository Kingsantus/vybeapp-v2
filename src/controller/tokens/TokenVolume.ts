import vybeApi from '@api/vybe-api';
const apiKey = process.env.VYBE_API_KEY;

if (!apiKey) {
    throw new Error("VYBE_API_KEY is not defined in the environment variables.");
}

vybeApi.auth(apiKey)

const getTokenVolume = async (mintAddress: string, limit?: number):Promise<any> => {
    try {
        const { data } = await vybeApi.get_token_volume_time_series({
            mintAddress: mintAddress,
            limit: limit ?? 5
        });
        return data;
    } catch (err) {
        console.error(err);
        throw err;
    }
}

export default getTokenVolume;