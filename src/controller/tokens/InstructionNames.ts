import vybeApi from '@api/vybe-api';
const apiKey = process.env.VYBE_API_KEY;

if (!apiKey) {
    throw new Error("VYBE_API_KEY is not defined in the environment variables.");
}

vybeApi.auth(apiKey)

const getInstructionNames = async (ixName?: string, callingProgram?: string, programName?: string):Promise<any> => {
    try {
        const { data } = await vybeApi.get_token_instruction_names({
            ixName: ixName,
            callingProgram: callingProgram,
            programName: programName
        })
        return data;
    } catch (err) {
        console.error(err);
        throw err;
    }
}

export default getInstructionNames;