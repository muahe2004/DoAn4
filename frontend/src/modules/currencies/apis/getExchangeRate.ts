import axios, { AxiosError } from "axios";
import { useQuery } from "@tanstack/react-query";
import { URL_API_EXCHANGE_RATE } from "../../../constants/config";

export interface ExchangeRateParams {
  base?: string;
  target?: string;
}

export interface ExchangeRateResponse {
  base: string;
  target: string;
  rate: number;
  timestamp?: string;
}

const fetchExchangeRate = async (
  params: ExchangeRateParams
): Promise<ExchangeRateResponse> => {
  const response = await axios.get<ExchangeRateResponse>(URL_API_EXCHANGE_RATE, {
    params,
    withCredentials: true,
  });
  return response.data;
};

export const useGetExchangeRate = (
  params: ExchangeRateParams = { base: "USD", target: "VND" },
  options?: { enabled?: boolean }
) => {
  return useQuery<ExchangeRateResponse, AxiosError<{ detail?: string }>>({
    queryKey: ["exchange-rate", params],
    queryFn: () => fetchExchangeRate(params),
    enabled: options?.enabled ?? true,
  });
};
