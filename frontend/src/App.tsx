import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";

import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import Facilities from "./pages/Facilities";
import Assets from "./pages/Assets";
import MaintenanceRequests from "./pages/MaintenanceRequests";
import WorkOrders from "./pages/WorkOrders";
import PreventiveMaintenance from "./pages/PreventiveMaintenance";
import Reports from "./pages/Report";

function App() {
  const token = localStorage.getItem("token");

  if (!token) {
    return <Login />;
  }

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Navigate to="/dashboard" replace />} />

        <Route path="/dashboard" element={<Dashboard />} />

        <Route path="/facilities" element={<Facilities />} />

        <Route path="/assets" element={<Assets />} />

        <Route
          path="/maintenance-requests"
          element={<MaintenanceRequests />}
        />

        <Route path="/work-orders" element={<WorkOrders />} />

        <Route
          path="/preventive-maintenance"
          element={<PreventiveMaintenance />}
        />

        <Route path="/reports" element={<Reports />} />

        <Route
          path="*"
          element={<Navigate to="/dashboard" replace />}
        />
      </Routes>
    </BrowserRouter>
  );
}

export default App;