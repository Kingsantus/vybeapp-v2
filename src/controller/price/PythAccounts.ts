import vybeApi from '@api/vybe-api';
const apiKey = process.env.VYBE_API_KEY;

if (!apiKey) {
    throw new Error("VYBE_API_KEY is not defined in the environment variables.");
}

vybeApi.auth(apiKey);

const getPythAccounts = async (wallet: string):Promise<any> => {
    try {
        const { data } = await vybeApi.get_pyth_price_product_pairs();
        return data;
    } catch (err) {
        console.error(err);
        throw err;
    }
}

export default getPythAccounts;