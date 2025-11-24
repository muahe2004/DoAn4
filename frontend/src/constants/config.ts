import { joinUrl } from "../utils/url";

export const BASE_URL = import.meta.env.VITE_BASE_URL;

//Authentication
export const URL_API_AUTH_LOGIN = joinUrl(BASE_URL, "auth/login");
export const URL_API_AUTH_REGISTER = joinUrl(BASE_URL, "auth/register");