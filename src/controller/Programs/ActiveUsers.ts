import vybeApi from '@api/vybe-api';
const apiKey = process.env.VYBE_API_KEY;

if (!apiKey) {
    throw new Error("VYBE_API_KEY is not defined in the environment variables.");
}

vybeApi.auth(apiKey)

type Range = '1h' | '24h' | '7d';

const getActiveUsers = async (programAddress: string, range: Range = '1h'):Promise<any> => {
    try {
        const { data } = await vybeApi.get_program_active_users_count({range: range, programAddress: programAddress});
        return data;
    } catch (err) {
        console.error(err);
        throw err;
    }
}

export default getActiveUsers;