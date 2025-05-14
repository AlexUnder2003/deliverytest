import apiClient from "./apiClient";

// Функция для авторизации пользователя
export const login = async (username, password) => {
  const response = await apiClient.post("/jwt/create/", {
    username,
    password,
  });
  
  if (response.data.access) {
    localStorage.setItem("accessToken", response.data.access);
    localStorage.setItem("refreshToken", response.data.refresh);
  }
  
  return response.data;
};  

// Функция для выхода из системы
export const logout = () => {
  localStorage.removeItem("accessToken");
  localStorage.removeItem("refreshToken");
};

// Функция для обновления токена
export const refreshToken = async () => {
  const refreshToken = localStorage.getItem("refreshToken");
  
  if (!refreshToken) {
    throw new Error("Refresh token not found");
  }
  
  const response = await apiClient.post("/jwt/refresh/", {
    refresh: refreshToken,
  });
  
  if (response.data.access) {
    localStorage.setItem("accessToken", response.data.access);
  }
  
  return response.data;
};

// Функция для проверки, авторизован ли пользователь
export const isAuthenticated = () => {
  return localStorage.getItem("accessToken") !== null;
};

export default {
  login,
  logout,
  refreshToken,
  isAuthenticated,
};