import vybeApi from '@api/vybe-api';
const apiKey = process.env.VYBE_API_KEY;

if (!apiKey) {
    throw new Error("VYBE_API_KEY is not defined in the environment variables.");
}

vybeApi.auth(apiKey)

const getProgramList = async (limit?: number):Promise<any> => {
    try {
        const { data } = await vybeApi.get_programs_list({limit: limit ?? 10});
        return data;
    } catch (err) {
        console.error(err);
        throw err;
    }
}

export default getProgramList;