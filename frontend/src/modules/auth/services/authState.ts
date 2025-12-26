const AUTH_FLAG_KEY = "auth_authenticated";
const USER_ID_KEY = "auth_user_id";

const getCookie = (name: string): string | null => {
  const match = document.cookie.match(new RegExp(`(?:^|; )${name}=([^;]*)`));
  return match ? decodeURIComponent(match[1]) : null;
};

export const setAuthenticated = () => {
  localStorage.setItem(AUTH_FLAG_KEY, "true");
};

export const clearAuthenticated = () => {
  localStorage.removeItem(AUTH_FLAG_KEY);
  localStorage.removeItem(USER_ID_KEY);
};

export const isAuthenticated = (): boolean => {
  const hasCookie = Boolean(getCookie("access_token"));
  const hasFlag = localStorage.getItem(AUTH_FLAG_KEY) === "true";
  return hasCookie || hasFlag;
};

export const setUserId = (id: string) => {
  localStorage.setItem(USER_ID_KEY, id);
};

export const getUserId = (): string | null => {
  return localStorage.getItem(USER_ID_KEY);
};
