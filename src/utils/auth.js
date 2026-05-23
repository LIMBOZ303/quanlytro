export const TOKEN_KEY = 'quanlytro_token';
export const USER_KEY = 'quanlytro_user';

export const getToken = () => {
  try {
    return localStorage.getItem(TOKEN_KEY);
  } catch {
    return null;
  }
};

export const setToken = (token) => {
  try {
    localStorage.setItem(TOKEN_KEY, token);
  } catch {
    // ignore storage errors
  }
};

export const removeToken = () => {
  try {
    localStorage.removeItem(TOKEN_KEY);
  } catch {
    // ignore storage errors
  }
};

export const getUser = () => {
  try {
    const raw = localStorage.getItem(USER_KEY);
    if (!raw) return null;
    return JSON.parse(raw);
  } catch {
    return null;
  }
};

export const setUser = (user) => {
  try {
    localStorage.setItem(USER_KEY, JSON.stringify(user));
  } catch {
    // ignore storage errors
  }
};

export const removeUser = () => {
  try {
    localStorage.removeItem(USER_KEY);
  } catch {
    // ignore storage errors
  }
};

export const isAuthenticated = () => Boolean(getToken());

export const logout = () => {
  removeToken();
  removeUser();
};
