import axios, { AxiosError } from "axios";
import { useQuery } from "@tanstack/react-query";
import { URL_API_COUNTRY } from "../../../constants/config";
import type { CountryDropdownResponse } from "../types";

export interface Params {
    skip: number;
    limit: number;
    search?: string;
    status?: string;
}

const getDropdownCountries = async (
    params: Params
): Promise<CountryDropdownResponse[]> => {
    const res = await axios.get<CountryDropdownResponse[]>(
        `${URL_API_COUNTRY}/drop-down`,
        {
            params,
            withCredentials: true,
        }
    );
    return res.data;
};

export const useGetDropdownCountries = (params: Params) => {
    return useQuery<CountryDropdownResponse[], AxiosError<{ detail?: string }>>({
        queryKey: ["countries", params],
        queryFn: () => getDropdownCountries(params),
    });
};
