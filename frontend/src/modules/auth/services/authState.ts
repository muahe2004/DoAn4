const AUTH_FLAG_KEY = "auth_authenticated";

const getCookie = (name: string): string | null => {
  const match = document.cookie.match(new RegExp(`(?:^|; )${name}=([^;]*)`));
  return match ? decodeURIComponent(match[1]) : null;
};

export const setAuthenticated = () => {
  localStorage.setItem(AUTH_FLAG_KEY, "true");
};

export const clearAuthenticated = () => {
  localStorage.removeItem(AUTH_FLAG_KEY);
};

export const isAuthenticated = (): boolean => {
  const hasCookie = Boolean(getCookie("access_token"));
  const hasFlag = localStorage.getItem(AUTH_FLAG_KEY) === "true";
  return hasCookie || hasFlag;
};
