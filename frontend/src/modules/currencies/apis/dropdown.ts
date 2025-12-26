import axios, { AxiosError } from "axios";
import { useQuery } from "@tanstack/react-query";
import { URL_API_CURRENCY } from "../../../constants/config";
import type { CurrencyDropdownResponse } from "../types";

export interface Params {
    skip: number;
    limit: number;
    search?: string;
    status?: string;
}

const getDropdownCurrencies = async (
    params: Params
): Promise<CurrencyDropdownResponse[]> => {
    const res = await axios.get<CurrencyDropdownResponse[]>(
        `${URL_API_CURRENCY}/drop-down`,
        {
            params,
            withCredentials: true,
        }
    );
    return res.data;
};

export const useGetDropdownCurrencies = (params: Params) => {
    return useQuery<CurrencyDropdownResponse[], AxiosError<{ detail?: string }>>({
        queryKey: ["currencies", params],
        queryFn: () => getDropdownCurrencies(params),
    });
};
