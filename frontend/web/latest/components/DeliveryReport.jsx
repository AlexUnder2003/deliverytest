import React, { useState, useEffect } from "react";
import {
  Box,
  Paper,
  Typography,
  IconButton,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  ThemeProvider,
  CssBaseline,
  createTheme,
  Container,
  CircularProgress,
  Alert,
} from "@mui/material";
import SettingsIcon from "@mui/icons-material/Settings";
import MoreVertIcon from "@mui/icons-material/MoreVert";
import { DataGrid } from "@mui/x-data-grid";
import {
  LineChart,
  Line,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { LocalizationProvider } from "@mui/x-date-pickers";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import dayjs from "dayjs";
import apiClient from "../services/apiClient";

const DeliveryReportPage = () => {
  const [startDate, setStartDate] = useState(dayjs());
  const [endDate, setEndDate] = useState(dayjs().add(10, "day"));
  const [deliveryType, setDeliveryType] = useState("all");
  const [deliveries, setDeliveries] = useState([]);
  const [chartData, setChartData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [services, setServices] = useState([]);

  useEffect(() => {
    const fetchServices = async () => {
      try {
        const response = await apiClient.get("/services/");
        setServices(response.data);
      } catch (err) {
        console.error("Ошибка при загрузке услуг:", err);
        setServices([
          { id: "client", name: "До клиента" },
          { id: "fragile", name: "Хрупкий груз" },
        ]);
      }
    };

    fetchServices();
  }, []);

  useEffect(() => {
    const fetchDeliveries = async () => {
      setLoading(true);
      setError(null);

      try {
        const formattedStartDate = startDate.format("YYYY-MM-DD");
        const formattedEndDate = endDate.format("YYYY-MM-DD");

        const params = {
          start_date: formattedStartDate,
          end_date: formattedEndDate,
        };

        if (deliveryType !== "all") {
          params.service = deliveryType;
        }

        const response = await apiClient.get("/deliveries/", { params });
        const data = response.data;

        const formattedDeliveries = data.map((delivery) => ({
          id: delivery.id,
          title: `Доставка ${delivery.id}`,
          date: new Date(delivery.delivery_date).toLocaleDateString("ru-RU"),
          model: delivery.transport_model?.name || "Не указано",
          service: delivery.service?.name || "Не указано",
          distance: delivery.distance || 0,
        }));

        setDeliveries(formattedDeliveries);

        const deliveriesByDate = data.reduce((acc, delivery) => {
          const date = new Date(delivery.delivery_date).toLocaleDateString("ru-RU", {
            month: "short",
            day: "numeric",
          });
          acc[date] = (acc[date] || 0) + 1;
          return acc;
        }, {});

        const chartDataFormatted = Object.entries(deliveriesByDate).map(([date, count]) => ({
          name: date,
          value: count,
        }));

        setChartData(chartDataFormatted);
      } catch (err) {
        console.error("Ошибка при загрузке данных:", err);
        setError("Не удалось загрузить данные о доставках. Проверьте подключение к API.");
        setDeliveries([]);
        setChartData([]);
      } finally {
        setLoading(false);
      }
    };

    fetchDeliveries();
  }, [startDate, endDate, deliveryType]);

  const columns = [
    { field: "title", headerName: "Итого", flex: 1, minWidth: 120 },
    { field: "date", headerName: "Дата доставки", flex: 1, minWidth: 140 },
    { field: "model", headerName: "Модель ТС", flex: 1, minWidth: 120 },
    { field: "service", headerName: "Услуга", flex: 1, minWidth: 140 },
    { field: "distance", headerName: "Дистанция (км)", type: "number", flex: 1, minWidth: 160 },
  ];

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

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <LocalizationProvider dateAdapter={AdapterDayjs}>
        <Container maxWidth="xl">
          <Box sx={{ width: "100%", p: 3 }}>
            <Box className="flex flex-wrap items-center gap-4 mb-6">
              <Box sx={{ display: "flex", gap: 2 }}>
                <DatePicker
                  label="С даты"
                  value={startDate}
                  onChange={(newValue) => setStartDate(newValue)}
                  slotProps={{ textField: { size: "small" } }}
                />
                <DatePicker
                  label="По дату"
                  value={endDate}
                  onChange={(newValue) => setEndDate(newValue)}
                  slotProps={{ textField: { size: "small" } }}
                />
              </Box>

              <FormControl size="small" sx={{ width: 180 }}>
                <InputLabel id="delivery-type-label">По типу доставки</InputLabel>
                <Select
                  labelId="delivery-type-label"
                  value={deliveryType}
                  label="По типу доставки"
                  onChange={(e) => setDeliveryType(e.target.value)}
                >
                  <MenuItem value="all">Все</MenuItem>
                  {services.map((service) => (
                    <MenuItem key={service.id} value={service.id}>
                      {service.name}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>

              <div className="ml-auto flex">
                <IconButton color="inherit">
                  <SettingsIcon />
                </IconButton>
                <IconButton color="inherit">
                  <MoreVertIcon />
                </IconButton>
              </div>
            </Box>

            {error && (
              <Alert severity="error" sx={{ mb: 3 }}>
                {error}
              </Alert>
            )}

            <Paper sx={{ p: 3, mb: 3 }}>
              <Typography variant="subtitle1" gutterBottom>
                Количество доставок
              </Typography>
              {loading ? (
                <Box sx={{ display: "flex", justifyContent: "center", p: 4 }}>
                  <CircularProgress />
                </Box>
              ) : chartData.length === 0 ? (
                <Typography sx={{ textAlign: "center", p: 3 }}>
                  Нет данных для отображения графика.
                </Typography>
              ) : (
                <ResponsiveContainer width="100%" height={240}>
                  <LineChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#333333" />
                    <XAxis dataKey="name" />
                    <YAxis allowDecimals={false} />
                    <Tooltip contentStyle={{ backgroundColor: "#1E1E1E" }} />
                    <Line
                      type="monotone"
                      dataKey="value"
                      stroke={theme.palette.primary.main}
                      strokeWidth={2}
                      dot={{ r: 3 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              )}
            </Paper>

            <Paper sx={{ p: 2 }}>
              {loading ? (
                <Box sx={{ display: "flex", justifyContent: "center", p: 4 }}>
                  <CircularProgress />
                </Box>
              ) : deliveries.length === 0 ? (
                <Typography sx={{ textAlign: "center", p: 3 }}>
                  Пока что нет данных о доставках.
                </Typography>
              ) : (
                <DataGrid
                  rows={deliveries}
                  columns={columns}
                  pageSize={8}
                  autoHeight
                  disableRowSelectionOnClick
                  pageSizeOptions={[8, 16, 32]}
                  sx={{
                    "& .MuiDataGrid-cell": {
                      color: theme.palette.text.primary,
                    },
                    "& .MuiDataGrid-columnHeaders": {
                      backgroundColor: "rgba(255, 255, 255, 0.05)",
                    },
                  }}
                />
              )}
            </Paper>
          </Box>
        </Container>
      </LocalizationProvider>
    </ThemeProvider>
  );
};

export default DeliveryReportPage;
