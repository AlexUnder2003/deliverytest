import React, { useState } from "react";
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
import { DateRangePicker } from "@mui/x-date-pickers-pro/DateRangePicker"; // requires @mui/x-date-pickers-pro
import dayjs from "dayjs";

/**
 * DeliveryReportPage — dark theme. Filters inline с заголовком: DateRangePicker + Select.
 */
const DeliveryReportPage = () => {
  // ————————————— State
  const [dateRange, setDateRange] = useState([dayjs("2025-01-01"), dayjs("2025-01-10" )]);
  const [deliveryType, setDeliveryType] = useState("all");

  // ————————————— Mock data (replace with real API data)
  const chartData = [
    { name: "янв. 2", value: 5 },
    { name: "янв. 4", value: 4 },
    { name: "янв. 6", value: 7 },
    { name: "янв. 7", value: 3 },
    { name: "янв. 8", value: 5 },
    { name: "янв. 9", value: 4 },
    { name: "янв. 10", value: 6 },
  ];

  const rows = [
    { id: 1, title: "Доставка 1", date: "01.01.2025", model: "A 001 AA", service: "До клиента", distance: 195 },
    { id: 2, title: "Доставка 2", date: "01.01.2025", model: "C 751 МС", service: "Хрупкий груз", distance: 192 },
    { id: 3, title: "Доставка 3", date: "01.01.2025", model: "О 370 ЕТ", service: "До клиента", distance: 155 },
    { id: 4, title: "Доставка 4", date: "01.01.2025", model: "В 397 СЕ", service: "Хрупкий груз", distance: 185 },
    { id: 5, title: "Доставка 5", date: "01.01.2025", model: "Т 683 АВ", service: "До клиента", distance: 108 },
    { id: 6, title: "Доставка 6", date: "01.01.2025", model: "М 291 АА", service: "Хрупкий груз", distance: 108 },
    { id: 7, title: "Доставка 7", date: "01.01.2025", model: "E 515 CE", service: "До клиента", distance: 193 },
    { id: 8, title: "Доставка 8", date: "01.01.2025", model: "М 408 ОС", service: "Хрупкий груз", distance: 158 },
  ];

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
              {/* Date range picker */}
              <Box sx={{ width: 260 }}>
                <DateRangePicker
                  value={dateRange}
                  onChange={(newValue) => setDateRange(newValue)}
                  renderInput={(startProps, endProps) => (
                    <TextField
                      {...startProps}
                      fullWidth
                      size="small"
                      inputProps={{ ...startProps.inputProps, placeholder: "ДД.ММ.ГГГГ — ДД.ММ.ГГГГ" }}
                    />
                  )}
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
                  <MenuItem value="client">До клиента</MenuItem>
                  <MenuItem value="fragile">Хрупкий груз</MenuItem>
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

            {/* Chart */}
            <Paper sx={{ p: 3, mb: 3, width: "100%" }}>
              <Typography variant="subtitle1" gutterBottom>
                Количество доставок
              </Typography>
              <ResponsiveContainer width="100%" height={240}>
                <LineChart data={chartData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#333333" />
                  <XAxis dataKey="name" />
                  <YAxis allowDecimals={false} />
                  <Tooltip contentStyle={{ backgroundColor: "#1E1E1E" }} />
                  <Line type="monotone" dataKey="value" stroke={theme.palette.primary.main} strokeWidth={2} dot={{ r: 3 }} />
                </LineChart>
              </ResponsiveContainer>
            </Paper>

            {/* Table */}
            <Paper sx={{ p: 2, width: "100%" }}>
              <DataGrid
                rows={rows}
                columns={columns}
                pageSize={8}
                autoHeight
                disableSelectionOnClick
                rowsPerPageOptions={[8, 16, 32]}
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
