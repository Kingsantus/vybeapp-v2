import vybeApi from '@api/vybe-api';
const apiKey = process.env.VYBE_API_KEY;

if (!apiKey) {
    throw new Error("VYBE_API_KEY is not defined in the environment variables.");
}

vybeApi.auth(apiKey)

const getKnownAccount = async (ownerAddress?: string):Promise<any> => {
    try {
        const { data } = await vybeApi.get_known_accounts({
            ownerAddress: ownerAddress,
            sortByAsc: 'price'
        });
        return data;
    } catch (err) {
        console.error(err);
        throw err;  // Optionally, rethrow the error if you want to handle it outside
    }
}

export default getKnownAccount;