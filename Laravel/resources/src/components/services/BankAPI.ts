
export interface Bank {
    id: number;
    name: string;
    code: string;
    bin: string;
    shortName: string;
    logo: string;
    transferSupported: number;
    lookupSupported: number;
}

export const BankAPI = {
    getBanks: async (): Promise<Bank[]> => {
        try {
            const response = await fetch("https://api.vietqr.io/v2/banks");
            const data = await response.json();
            if (data.code === "00") {
                return data.data;
            }
            return [];
        } catch (error) {
            console.error("Error fetching banks:", error);
            return [];
        }
    }
};
