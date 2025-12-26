import axios, { AxiosError } from "axios";
import { useQuery } from "@tanstack/react-query";
import { URL_API_PARTNER } from "../../../constants/config";
import type { PartnerDropdownResponse } from "../types";

export interface Params {
    skip: number;
    limit: number;
    search?: string;
    status?: string;
}

const getDropdownPartners = async (
    params: Params
): Promise<PartnerDropdownResponse[]> => {
    const res = await axios.get<PartnerDropdownResponse[]>(
        `${URL_API_PARTNER}/drop-down`,
        {
            params,
            withCredentials: true,
        }
    );
    return res.data;
};

export const useGetDropdownPartners = (params: Params) => {
    return useQuery<PartnerDropdownResponse[], AxiosError<{ detail?: string }>>({
        queryKey: ["partners", params],
        queryFn: () => getDropdownPartners(params),
    });
};
