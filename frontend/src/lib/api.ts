import axios from "axios";
import { BASE_URL } from "../constants/config";

export const apiClient = axios.create({
    baseURL: BASE_URL,
    timeout: 1000 * 60 * 30 * 3, // 90 minutes
    withCredentials: true,
});

// REQUEST INTERCEPTOR
apiClient.interceptors.request.use(
    function (config) {
        return config;
    },
    function (error) {
        return Promise.reject(error);
    },
);

// RESPONSE INTERCEPTOR
apiClient.interceptors.response.use(
    function (response) {
        return response;
    },
    async function (error) {
        const status = error?.response?.status;

        if (status === 401) {
            return Promise.reject({
                message: "Unauthorized: Invalid or expired token",
                code: 401,
                custom: true,
            });
        }

        if (status === 403) {
            return Promise.reject({
                message: "No access to HR system",
                code: 403,
                custom: true,
            });
        }

        if (status === 404) {
            return Promise.reject({
                message: "Not Found",
                code: 404,
                custom: true,
                data: error.response?.data,
            });
        }

        if (status === 500) {
            return Promise.reject({
                message: "Internal Server Error",
                code: 500,
                custom: true,
                data: error.response?.data,
            });
        }

        return Promise.reject(error);
    },
);
