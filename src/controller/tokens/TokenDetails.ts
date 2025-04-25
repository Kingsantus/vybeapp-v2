import vybeApi from '@api/vybe-api';
const apiKey = process.env.VYBE_API_KEY;

if (!apiKey) {
    throw new Error("VYBE_API_KEY is not defined in the environment variables.");
}

vybeApi.auth(apiKey)

const getTokenDetails = async (mintAddress: string):Promise<any> => {
    try {
        const { data } = await vybeApi.get_token_details({mintAddress: mintAddress});
        return data;
    } catch (err) {
        console.error(err);
        throw err;
    }
}

export default getTokenDetails;