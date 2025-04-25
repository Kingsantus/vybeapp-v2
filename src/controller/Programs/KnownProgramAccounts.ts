import vybeApi from '@api/vybe-api';
const apiKey = process.env.VYBE_API_KEY;

if (!apiKey) {
    throw new Error("VYBE_API_KEY is not defined in the environment variables.");
}

vybeApi.auth(apiKey)

const getKnownProgramAcct = async (programId?: string, name?: string, entityName?: string):Promise<any> => {
    try {
        const { data } = await vybeApi.get_known_program_accounts({
            programId: programId,
            name: name,
            entityName: entityName 
        });
        return data;
    } catch (err) {
        console.error(err);
        throw err;
    }
}

export default getKnownProgramAcct;