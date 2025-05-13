import axios from "axios";

const API_URL = "http://localhost:8000";

// Функция для авторизации пользователя
export const login = async (username, password) => {
  const response = await axios.post(`${API_URL}/jwt/create/`, {
    username,
    password,
  });
  
  if (response.data.access) {
    localStorage.setItem("accessToken", response.data.access);
    localStorage.setItem("refreshToken", response.data.refresh);
    
    // Устанавливаем токен в заголовки для будущих запросов
    setAuthHeader(response.data.access);
  }
  
  return response.data;
};

// Функция для выхода из системы
export const logout = () => {
  localStorage.removeItem("accessToken");
  localStorage.removeItem("refreshToken");
  
  // Удаляем заголовок авторизации
  axios.defaults.headers.common["Authorization"] = "";
};

// Функция для обновления токена
export const refreshToken = async () => {
  const refreshToken = localStorage.getItem("refreshToken");
  
  if (!refreshToken) {
    throw new Error("Refresh token not found");
  }
  
  const response = await axios.post(`${API_URL}/jwt/refresh/`, {
    refresh: refreshToken,
  });
  
  if (response.data.access) {
    localStorage.setItem("accessToken", response.data.access);
    setAuthHeader(response.data.access);
  }
  
  return response.data;
};

// Функция для установки заголовка авторизации
export const setAuthHeader = (token) => {
  if (token) {
    axios.defaults.headers.common["Authorization"] = `Bearer ${token}`;
  } else {
    delete axios.defaults.headers.common["Authorization"];
  }
};

// Функция для проверки, авторизован ли пользователь
export const isAuthenticated = () => {
  return localStorage.getItem("accessToken") !== null;
};

// Инициализация заголовка авторизации при загрузке приложения
const initializeAuth = () => {
  const token = localStorage.getItem("accessToken");
  if (token) {
    setAuthHeader(token);
  }
};

// Вызываем инициализацию при импорте сервиса
initializeAuth();

export default {
  login,
  logout,
  refreshToken,
  isAuthenticated,
  setAuthHeader,
};