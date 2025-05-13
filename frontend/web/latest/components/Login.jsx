import React, { useState } from "react";
import {
  Box,
  Paper,
  Typography,
  TextField,
  Button,
  Container,
  Alert,
  ThemeProvider,
  CssBaseline,
  createTheme,
  CircularProgress,
} from "@mui/material";
import axios from "axios";
import { useNavigate } from "react-router-dom";

/**
 * Компонент страницы авторизации
 */
const LoginPage = () => {
  // Состояния для формы и обработки ошибок
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
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

  // Обработчик отправки формы
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      // Запрос на получение JWT токена
      const response = await axios.post("http://localhost:8000/jwt/create/", {
        username,
        password,
      });

      // Сохраняем токены в localStorage
      localStorage.setItem("accessToken", response.data.access);
      localStorage.setItem("refreshToken", response.data.refresh);
      
      // Устанавливаем токен в заголовки для будущих запросов
      axios.defaults.headers.common["Authorization"] = `Bearer ${response.data.access}`;
      
      // Перенаправляем на страницу отчетов
      navigate("/reports");
    } catch (err) {
      console.error("Ошибка авторизации:", err);
      if (err.response && err.response.status === 401) {
        setError("Неверное имя пользователя или пароль");
      } else {
        setError("Произошла ошибка при авторизации. Пожалуйста, попробуйте позже.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Container maxWidth="sm">
        <Box
          sx={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            minHeight: "100vh",
          }}
        >
          <Paper
            elevation={3}
            sx={{
              p: 4,
              width: "100%",
              maxWidth: 500,
              borderRadius: 2,
            }}
          >
            <Typography variant="h4" component="h1" gutterBottom align="center">
              Вход в систему
            </Typography>
            
            {error && (
              <Alert severity="error" sx={{ mb: 3 }}>
                {error}
              </Alert>
            )}
            
            <form onSubmit={handleSubmit}>
              <TextField
                label="Имя пользователя"
                variant="outlined"
                fullWidth
                margin="normal"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
                autoFocus
              />
              
              <TextField
                label="Пароль"
                type="password"
                variant="outlined"
                fullWidth
                margin="normal"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
              
              <Button
                type="submit"
                variant="contained"
                color="primary"
                fullWidth
                size="large"
                sx={{ mt: 3, mb: 2 }}
                disabled={loading}
              >
                {loading ? <CircularProgress size={24} /> : "Войти"}
              </Button>
            </form>
          </Paper>
        </Box>
      </Container>
    </ThemeProvider>
  );
};

export default LoginPage;