import React, { useEffect, useState } from "react";
import { Navigate } from "react-router-dom";
import axios from "axios";
import { CircularProgress, Box } from "@mui/material";

/**
 * Компонент для защиты маршрутов, требующих авторизации
 */
const ProtectedRoute = ({ children }) => {
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    const checkAuth = async () => {
      const token = localStorage.getItem("accessToken");
      
      if (!token) {
        setIsAuthenticated(false);
        setIsLoading(false);
        return;
      }

      try {
        // Устанавливаем токен в заголовки
        axios.defaults.headers.common["Authorization"] = `Bearer ${token}`;
        
        // Проверяем валидность токена, делая запрос к защищенному эндпоинту
        // Можно заменить на более подходящий эндпоинт в вашем API
        await axios.get("http://localhost:8000/api/deliveries/");
        
        setIsAuthenticated(true);
      } catch (error) {
        console.error("Ошибка проверки токена:", error);
        
        // Если токен истек, пробуем обновить его
        if (error.response && error.response.status === 401) {
          const refreshToken = localStorage.getItem("refreshToken");
          
          if (refreshToken) {
            try {
              const response = await axios.post("http://localhost:8000/jwt/refresh/", {
                refresh: refreshToken
              });
              
              localStorage.setItem("accessToken", response.data.access);
              axios.defaults.headers.common["Authorization"] = `Bearer ${response.data.access}`;
              
              setIsAuthenticated(true);
            } catch (refreshError) {
              console.error("Ошибка обновления токена:", refreshError);
              localStorage.removeItem("accessToken");
              localStorage.removeItem("refreshToken");
              setIsAuthenticated(false);
            }
          } else {
            setIsAuthenticated(false);
          }
        } else {
          setIsAuthenticated(false);
        }
      } finally {
        setIsLoading(false);
      }
    };

    checkAuth();
  }, []);

  if (isLoading) {
    return (
      <Box
        sx={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          height: "100vh",
        }}
      >
        <CircularProgress />
      </Box>
    );
  }

  return isAuthenticated ? children : <Navigate to="/login" />;
};

export default ProtectedRoute;