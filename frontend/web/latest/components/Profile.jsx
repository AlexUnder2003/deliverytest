import React, { useState, useEffect } from "react";
import {
  Box,
  Paper,
  Typography,
  Container,
  CircularProgress,
  Alert,
  TextField,
  Button,
  Avatar,
  Grid,
  Divider,
  ThemeProvider,
  CssBaseline,
  createTheme,
} from "@mui/material";
import PersonIcon from "@mui/icons-material/Person";
import { useNavigate } from "react-router-dom";
import apiClient from "../services/apiClient";

/**
 * Компонент страницы профиля пользователя (только для просмотра)
 */
const ProfilePage = () => {
  // Состояния для данных пользователя и UI
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  // Темная тема (соответствует стилю DeliveryReport)
  const theme = createTheme({
    palette: {
      mode: "dark",
      primary: { main: "#BB86FC" },
      secondary: { main: "#03DAC6" },
      background: {
        default: "#121212",
        paper: "#1E1E1E",
      },
    },
    shape: { borderRadius: 12 },
  });

  // Загрузка данных пользователя
  useEffect(() => {
    const fetchUserData = async () => {
      setLoading(true);
      setError(null);

      try {
        // Получаем токен из localStorage
        const token = localStorage.getItem("accessToken");
        
        if (!token) {
          // Если токена нет, перенаправляем на страницу входа
          navigate("/login");
          return;
        }

        // Устанавливаем заголовок авторизации
        apiClient.defaults.headers.common["Authorization"] = `Bearer ${token}`;
        
        // Запрос данных пользователя
        const response = await apiClient.get("/auth/users/me/");
        
        setUser(response.data);
      } catch (err) {
        console.error("Ошибка при загрузке данных пользователя:", err);
        
        if (err.response && err.response.status === 401) {
          // Если ошибка авторизации, перенаправляем на страницу входа
          localStorage.removeItem("accessToken");
          localStorage.removeItem("refreshToken");
          navigate("/login");
        } else {
          setError("Не удалось загрузить данные профиля. Пожалуйста, попробуйте позже.");
        }
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
  }, [navigate]);

  // Обработчик выхода из системы
  const handleLogout = () => {
    localStorage.removeItem("accessToken");
    localStorage.removeItem("refreshToken");
    apiClient.defaults.headers.common["Authorization"] = "";
    navigate("/login");
  };

  // Обработчик возврата к отчетам
  const handleBackToReports = () => {
    navigate("/reports");
  };

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Container maxWidth="md">
        <Box sx={{ width: "100%", p: 3, boxSizing: "border-box" }}>
          <Typography variant="h4" component="h1" gutterBottom align="center" sx={{ mb: 4 }}>
            Профиль пользователя
          </Typography>

          {/* Отображение ошибки */}
          {error && (
            <Alert severity="error" sx={{ mb: 3 }}>
              {error}
            </Alert>
          )}

          {/* Отображение загрузки */}
          {loading ? (
            <Box sx={{ display: "flex", justifyContent: "center", p: 4 }}>
              <CircularProgress />
            </Box>
          ) : (
            <Paper sx={{ p: 4, width: "100%" }}>
              {user && (
                <Grid container spacing={3}>
                  {/* Аватар и имя пользователя */}
                  <Grid item xs={12} display="flex" justifyContent="center" alignItems="center" flexDirection="column">
                    <Avatar sx={{ width: 100, height: 100, mb: 2, bgcolor: theme.palette.primary.main }}>
                      <PersonIcon sx={{ fontSize: 60 }} />
                    </Avatar>
                    <Typography variant="h5" gutterBottom>
                      {user.username}
                    </Typography>
                  </Grid>

                  <Grid item xs={12}>
                    <Divider sx={{ my: 2 }} />
                  </Grid>

                  {/* Информация о пользователе (только для просмотра) */}
                  <Grid item xs={12} md={6}>
                    <Typography variant="subtitle1" color="text.secondary" gutterBottom>
                      Имя
                    </Typography>
                    <Typography variant="body1" gutterBottom>
                      {user.first_name || "Не указано"}
                    </Typography>
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <Typography variant="subtitle1" color="text.secondary" gutterBottom>
                      Фамилия
                    </Typography>
                    <Typography variant="body1" gutterBottom>
                      {user.last_name || "Не указано"}
                    </Typography>
                  </Grid>
                  <Grid item xs={12}>
                    <Typography variant="subtitle1" color="text.secondary" gutterBottom>
                      Email
                    </Typography>
                    <Typography variant="body1" gutterBottom>
                      {user.email || "Не указано"}
                    </Typography>
                  </Grid>

                  {/* Дополнительная информация */}
                  <Grid item xs={12}>
                    <Divider sx={{ my: 2 }} />
                    <Typography variant="subtitle1" color="text.secondary" gutterBottom>
                      ID пользователя
                    </Typography>
                    <Typography variant="body1" gutterBottom>
                      {user.id}
                    </Typography>
                    
                    <Typography variant="subtitle1" color="text.secondary" gutterBottom>
                      Дата регистрации
                    </Typography>
                    <Typography variant="body1" gutterBottom>
                      {new Date(user.date_joined).toLocaleDateString('ru-RU')}
                    </Typography>
                    
                    <Typography variant="subtitle1" color="text.secondary" gutterBottom>
                      Последний вход
                    </Typography>
                    <Typography variant="body1" gutterBottom>
                      {user.last_login ? new Date(user.last_login).toLocaleDateString('ru-RU') + ' ' + new Date(user.last_login).toLocaleTimeString('ru-RU') : "Нет данных"}
                    </Typography>
                  </Grid>

                  {/* Кнопки действий */}
                  <Grid item xs={12} display="flex" justifyContent="space-between" sx={{ mt: 2 }} gap={2}>
                    <Button 
                      variant="outlined" 
                      color="secondary" 
                      onClick={handleBackToReports}
                      className="px-5"
                    >
                      К отчетам
                    </Button>
                    <Button     
                      variant="contained" 
                      color="primary" 
                      onClick={handleLogout}
                    >
                      Выйти
                    </Button>
                  </Grid>
                </Grid>
              )}
            </Paper>
          )}
        </Box>
      </Container>
    </ThemeProvider>
  );
};

export default ProfilePage;