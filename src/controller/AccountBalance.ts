const apiKey = process.env.VYBE_API_KEY;

if (!apiKey) {
    throw new Error("VYBE_API_KEY is not defined in the environment variables.");
}

const getAccountDetails = async (token: string) => {
    try {
        const response = await fetch(`https://api.vybenetwork.xyz/account/token-balance/${token}`, {
            method: "GET",
            headers: {
                "Content-Type": "application/json",
                "x-api-key": apiKey,
            }
        });

        if (!response.ok) {
            throw new Error(`Request failed with status ${response.status}`);
        }

        const data = await response.json();

        // Extract relevant information from the new data structure
        const {
            ownerAddress,
            totalTokenValueUsd,
            totalTokenCount,
            data: tokenData
        } = data;

        // Process each token in the data array
        interface Token {
            symbol: string;
            name: string;
            amount: number;
            priceUsd: number;
            verified: boolean;
            category: string;
            valueUsd: number;
        }

        const tokens = tokenData.map((token: Token) => {
            const {
                symbol,
                name,
                amount,
                priceUsd,
                verified,
                category,
                valueUsd
            } = token;
            
            return {
                symbol,
                name,
                amount,
                priceUsd,
                verified,
                category,
                valueUsd
            };
        });

        // Construct the result object
        const result = {
            ownerAddress,
            totalTokenValueUsd,
            totalTokenCount,
            tokens
        };
        return result;
    } catch (error) {
        console.error("There was a problem with the fetch operation:", error);
        throw error; // Optional: rethrow if you want the caller to handle it
    }
};

export default getAccountDetails;
