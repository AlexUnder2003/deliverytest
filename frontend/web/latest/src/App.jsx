import React from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import LoginPage from "../components/Login";
import DeliveryReportPage from "../components/DeliveryReport";
import ProtectedRoute from "../components/ProtectedRoute";

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route 
          path="/reports" 
          element={
            <ProtectedRoute>
              <DeliveryReportPage />
            </ProtectedRoute>
          } 
        />
        {/* Перенаправление с корневого маршрута на страницу логина */}
        <Route path="/" element={<Navigate to="/login" />} />
      </Routes>
    </Router>
  );
}

export default App;