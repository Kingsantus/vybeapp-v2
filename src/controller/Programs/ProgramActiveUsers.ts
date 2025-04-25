import vybeApi from '@api/vybe-api';
const apiKey = process.env.VYBE_API_KEY;

if (!apiKey) {
    throw new Error("VYBE_API_KEY is not defined in the environment variables.");
}

vybeApi.auth(apiKey)

const getProgramActiveUser = async (programAddress: string, limit?: number):Promise<any> => {
    try {
        const { data } = await vybeApi.get_program_active_users({limit: limit ?? 10, programAddress: programAddress});
        return data;
    } catch (err) {
        console.error(err);
        throw err;
    }
}

export default getProgramActiveUser;