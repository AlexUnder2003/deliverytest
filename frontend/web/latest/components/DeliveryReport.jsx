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
  Stack,
  ThemeProvider,
  CssBaseline,
  createTheme,
  TextField,
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
import axios from "axios";

/**
 * DeliveryReportPage — dark theme. Filters inline с заголовком: DateRangePicker + Select.
 */
const DeliveryReportPage = () => {
  // ————————————— State
  const [startDate, setStartDate] = useState(dayjs());
  const [endDate, setEndDate] = useState(dayjs().add(10, 'day'));
  const [deliveryType, setDeliveryType] = useState("all");
  const [deliveries, setDeliveries] = useState([]);
  const [chartData, setChartData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [services, setServices] = useState([]);

  // ————————————— Fetch services from backend
  useEffect(() => {
    const fetchServices = async () => {
      try {
        const response = await axios.get('http://localhost:8000/api/services/');
        setServices(response.data);
      } catch (err) {
        console.error("Ошибка при загрузке услуг:", err);
        // Используем моковые данные в случае ошибки
        const mockServices = [
          { id: "client", name: "До клиента" },
          { id: "fragile", name: "Хрупкий груз" }
        ];
        setServices(mockServices);
      }
    };

    fetchServices();
  }, []);

  useEffect(() => {
    const fetchDeliveries = async () => {
      setLoading(true);
      setError(null);
      
      try {
        // Форматируем даты для API запроса
        const formattedStartDate = startDate.format('YYYY-MM-DD');
        const formattedEndDate = endDate.format('YYYY-MM-DD');
        
        // Создаем параметры запроса
        let params = {
          start_date: formattedStartDate,
          end_date: formattedEndDate
        };
        
        // Добавляем фильтр по типу доставки, если выбран не "all"
        if (deliveryType !== "all") {
          params.service = deliveryType;
        }
        
        const response = await axios.get('http://localhost:8000/api/deliveries/', { params });
        
        // Преобразуем данные для таблицы
        const formattedDeliveries = response.data.map(delivery => ({
          id: delivery.id,
          title: `Доставка ${delivery.id}`,
          date: new Date(delivery.delivery_date).toLocaleDateString('ru-RU'),
          model: delivery.transport_model?.name || 'Не указано',
          service: delivery.service?.name || 'Не указано',
          distance: delivery.distance || 0
        }));
        
        setDeliveries(formattedDeliveries);
        
        // Подготавливаем данные для графика
        // Группируем доставки по дате и считаем количество
        const deliveriesByDate = response.data.reduce((acc, delivery) => {
          const date = new Date(delivery.delivery_date).toLocaleDateString('ru-RU', { month: 'short', day: 'numeric' });
          acc[date] = (acc[date] || 0) + 1;
          return acc;
        }, {});
        
        // Преобразуем в формат для графика
        const chartDataFormatted = Object.keys(deliveriesByDate).map(date => ({
          name: date,
          value: deliveriesByDate[date]
        }));
        
        setChartData(chartDataFormatted);
      } catch (err) {
        console.error("Ошибка при загрузке данных:", err);
        setError("Не удалось загрузить данные о доставках. Пожалуйста, проверьте, что бэкенд запущен и доступен.");
        
        // Используем моковые данные в случае ошибки
        const mockData = [
          { id: 1, delivery_date: "2025-01-01", transport_model: { name: "A 001 AA" }, service: { name: "До клиента" }, distance: 195 },
          { id: 2, delivery_date: "2025-01-01", transport_model: { name: "C 751 МС" }, service: { name: "Хрупкий груз" }, distance: 192 },
          { id: 3, delivery_date: "2025-01-02", transport_model: { name: "О 370 ЕТ" }, service: { name: "До клиента" }, distance: 155 },
          { id: 4, delivery_date: "2025-01-03", transport_model: { name: "В 397 СЕ" }, service: { name: "Хрупкий груз" }, distance: 185 },
          { id: 5, delivery_date: "2025-01-04", transport_model: { name: "Т 683 АВ" }, service: { name: "До клиента" }, distance: 108 },
          { id: 6, delivery_date: "2025-01-05", transport_model: { name: "М 291 АА" }, service: { name: "Хрупкий груз" }, distance: 108 },
          { id: 7, delivery_date: "2025-01-06", transport_model: { name: "E 515 CE" }, service: { name: "До клиента" }, distance: 193 },
          { id: 8, delivery_date: "2025-01-07", transport_model: { name: "М 408 ОС" }, service: { name: "Хрупкий груз" }, distance: 158 },
        ];
        
        // Фильтрация по типу доставки
        let filteredData = mockData;
        if (deliveryType !== "all") {
          filteredData = mockData.filter(delivery => 
            delivery.service.name === (deliveryType === "client" ? "До клиента" : "Хрупкий груз")
          );
        }
        
        // Фильтрация по дате
        const startDateObj = startDate.toDate();
        const endDateObj = endDate.toDate();
        
        filteredData = filteredData.filter(delivery => {
          const deliveryDate = new Date(delivery.delivery_date);
          return deliveryDate >= startDateObj && deliveryDate <= endDateObj;
        });
        
        // Преобразуем данные для таблицы
        const formattedDeliveries = filteredData.map(delivery => ({
          id: delivery.id,
          title: `Доставка ${delivery.id}`,
          date: new Date(delivery.delivery_date).toLocaleDateString('ru-RU'),
          model: delivery.transport_model?.name || 'Не указано',
          service: delivery.service?.name || 'Не указано',
          distance: delivery.distance || 0
        }));
        
        setDeliveries(formattedDeliveries);
        
        // Подготавливаем данные для графика
        const deliveriesByDate = filteredData.reduce((acc, delivery) => {
          const date = new Date(delivery.delivery_date).toLocaleDateString('ru-RU', { month: 'short', day: 'numeric' });
          acc[date] = (acc[date] || 0) + 1;
          return acc;
        }, {});
        
        const chartDataFormatted = Object.keys(deliveriesByDate).map(date => ({
          name: date,
          value: deliveriesByDate[date]
        }));
        
        setChartData(chartDataFormatted);
      } finally {
        setLoading(false);
      }
    };
    
    fetchDeliveries();
  }, [startDate, endDate, deliveryType]); // Перезагружаем данные при изменении фильтров

  // ————————————— Columns configuration
  const columns = [
    { field: "title", headerName: "Итого", flex: 1, minWidth: 120 },
    { field: "date", headerName: "Дата доставки", flex: 1, minWidth: 140 },
    { field: "model", headerName: "Модель ТС", flex: 1, minWidth: 120 },
    { field: "service", headerName: "Услуга", flex: 1, minWidth: 140 },
    { field: "distance", headerName: "Дистанция (км)", type: "number", flex: 1, minWidth: 160 },
  ];

  // ————————————— Dark theme
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
          <Box sx={{ width: "100%", p: 3, boxSizing: "border-box" }}>
            {/* Header + inline filters */}
            <div className="flex flex-wrap items-center gap-4 mb-6">
              {/* Два отдельных DatePicker вместо DateRangePicker */}
              <Box sx={{ display: 'flex', gap: 2 }}>
                <DatePicker
                  label="С даты"
                  value={startDate}
                  onChange={(newValue) => setStartDate(newValue)}
                  slotProps={{ textField: { size: 'small' } }}
                />
                <DatePicker
                  label="По дату"
                  value={endDate}
                  onChange={(newValue) => setEndDate(newValue)}
                  slotProps={{ textField: { size: 'small' } }}
                />
              </Box>

              {/* Delivery type select, same width */}
              <FormControl size="small" sx={{ width: 180 }}>
                <InputLabel id="delivery-type-label">По типу доставки</InputLabel>
                <Select
                  labelId="delivery-type-label"
                  value={deliveryType}
                  label="По типу доставки"
                  onChange={(e) => setDeliveryType(e.target.value)}
                >
                  <MenuItem value="all">Все</MenuItem>
                  {services.map(service => (
                    <MenuItem key={service.id} value={service.id}>{service.name}</MenuItem>
                  ))}
                </Select>
              </FormControl>

              {/* Actions - используем Tailwind для выравнивания вправо */}
              <div className="ml-auto flex">
                <IconButton color="inherit">
                  <SettingsIcon />
                </IconButton>
                <IconButton color="inherit">
                  <MoreVertIcon />
                </IconButton>
              </div>
            </div>

            {/* Error message */}
            {error && (
              <Alert severity="error" sx={{ mb: 3 }}>
                {error}
              </Alert>
            )}

            {/* Chart */}
            <Paper sx={{ p: 3, mb: 3, width: "100%" }}>
              <Typography variant="subtitle1" gutterBottom>
                Количество доставок
              </Typography>
              {loading ? (
                <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
                  <CircularProgress />
                </Box>
              ) : (
                <ResponsiveContainer width="100%" height={240}>
                  <LineChart data={chartData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#333333" />
                    <XAxis dataKey="name" />
                    <YAxis allowDecimals={false} />
                    <Tooltip contentStyle={{ backgroundColor: "#1E1E1E" }} />
                    <Line type="monotone" dataKey="value" stroke={theme.palette.primary.main} strokeWidth={2} dot={{ r: 3 }} />
                  </LineChart>
                </ResponsiveContainer>
              )}
            </Paper>

            {/* Table */}
            <Paper sx={{ p: 2, width: "100%" }}>
              <DataGrid
                rows={deliveries}
                columns={columns}
                pageSize={8}
                autoHeight
                disableRowSelectionOnClick
                pageSizeOptions={[8, 16, 32]}
                loading={loading}
                sx={{
                  '& .MuiDataGrid-cell': {
                    color: theme.palette.text.primary,
                  },
                  '& .MuiDataGrid-columnHeaders': {
                    backgroundColor: 'rgba(255, 255, 255, 0.05)',
                  },
                }}
              />
            </Paper>
          </Box>
        </Container>
      </LocalizationProvider>
    </ThemeProvider>
  );
};

export default DeliveryReportPage;
