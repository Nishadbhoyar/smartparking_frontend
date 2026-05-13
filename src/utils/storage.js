const USER_KEY = "sp_user";
export const saveUser  = (u) => sessionStorage.setItem(USER_KEY, JSON.stringify(u));
export const getUser   = ()  => JSON.parse(sessionStorage.getItem(USER_KEY) || "null");
export const clearUser = ()  => sessionStorage.removeItem(USER_KEY);