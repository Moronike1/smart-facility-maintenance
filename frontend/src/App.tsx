
import { useState, useEffect } from "react";
import {
  BrowserRouter,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";

import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import Facilities from "./pages/Facilities";
import Assets from "./pages/Assets";
import MaintenanceRequests from "./pages/MaintenanceRequests";
import WorkOrders from "./pages/WorkOrders";
import PreventiveMaintenance from "./pages/PreventiveMaintenance";
import Reports from "./pages/Reports";
import MaintenanceHistory from "./pages/MaintenanceHistory";
import AppLayout from "./components/AppLayout";
import ResidentRegister from "./pages/ResidentRegister";
import ResidentRequests from "./pages/ResidentRequests";
import ResidentDashboard from "./pages/ResidentDashboard";
import MyRequests from "./pages/MyRequests";
import ResidentApprovals from "./pages/ResidentApprovals";

export const AUTH_CHANGED_EVENT = "auth-changed";

type UserRole =
  | "ADMIN"
  | "FACILITY_MANAGER"
  | "TECHNICIAN"
  | "FACILITY_USER";

interface StoredUser {
  id: number;
  name: string;
  email: string;
  role: UserRole;
  status: string;
}

function getStoredUser(): StoredUser | null {
  try {
    const storedUser = localStorage.getItem("user");
    return storedUser ? JSON.parse(storedUser) : null;
  } catch {
    return null;
  }
}

function getTokenExpiry(token: string): number | null {
  try {
    const parts = token.split(".");

    if (parts.length !== 3) return null;

    const payload = parts[1]
      .replace(/-/g, "+")
      .replace(/_/g, "/");

    const paddedPayload = payload.padEnd(
      Math.ceil(payload.length / 4) * 4,
      "="
    );

    const decodedPayload = JSON.parse(atob(paddedPayload));

    if (
      typeof decodedPayload.exp !== "number" ||
      !Number.isFinite(decodedPayload.exp)
    ) {
      return null;
    }

    return decodedPayload.exp * 1000;
  } catch {
    return null;
  }
}

function RoleRoute({
  allowedRoles,
  children,
}: {
  allowedRoles: UserRole[];
  children: React.ReactNode;
}) {
  const user = getStoredUser();

  if (!user || !allowedRoles.includes(user.role)) {
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
}

function ResidentPortalPlaceholder() {
  return (
    <div className="min-h-screen p-6">
      <div className="mx-auto max-w-4xl rounded-xl border border-slate-700 bg-slate-900 p-8">
        <h2 className="text-2xl font-bold text-white">
          Welcome to the Resident Portal
        </h2>
        <p className="mt-3 text-slate-300">
          Your resident account is active. The maintenance
          request and tracking features are being prepared.
        </p>
      </div>
    </div>
  );
}

function App() {
  const [token, setToken] = useState(
    () => localStorage.getItem("token")
  );

  useEffect(() => {
    const syncToken = () => {
      setToken(localStorage.getItem("token"));
    };

    window.addEventListener(AUTH_CHANGED_EVENT, syncToken);
    window.addEventListener("storage", syncToken);

    return () => {
      window.removeEventListener(AUTH_CHANGED_EVENT, syncToken);
      window.removeEventListener("storage", syncToken);
    };
  }, []);

  useEffect(() => {
    if (!token) return;

    const expiryTime = getTokenExpiry(token);

    if (expiryTime === null) return;

    const checkExpiry = () => {
      if (Date.now() >= expiryTime) {
        if (localStorage.getItem("token") === token) {
          localStorage.removeItem("token");
          localStorage.removeItem("user");

          window.dispatchEvent(
            new Event(AUTH_CHANGED_EVENT)
          );
        }
      }
    };

    checkExpiry();

    const intervalId = window.setInterval(checkExpiry, 15000);

    window.addEventListener("focus", checkExpiry);
    document.addEventListener("visibilitychange", checkExpiry);

    return () => {
      window.clearInterval(intervalId);
      window.removeEventListener("focus", checkExpiry);
      document.removeEventListener("visibilitychange", checkExpiry);
    };
  }, [token]);

  const user = getStoredUser();

  const managementRoles: UserRole[] = [
    "ADMIN",
    "FACILITY_MANAGER",
  ];

  const technicianRoles: UserRole[] = ["TECHNICIAN"];
  const residentRoles: UserRole[] = ["FACILITY_USER"];

  const defaultRoute =
    user?.role === "FACILITY_USER"
      ? "/resident-portal"
      : user?.role === "TECHNICIAN"
        ? "/work-orders"
        : "/dashboard";

  return (
    <BrowserRouter>
      {!token ? (
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<ResidentRegister />} />
          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      ) : !user ? (
        <Navigate to="/login" replace />
      ) : (
        <AppLayout>
          <Routes>
            <Route
              path="/"
              element={<Navigate to={defaultRoute} replace />}
            />

            {/* ADMIN AND FACILITY MANAGER */}
            <Route
              path="/dashboard"
              element={
                <RoleRoute allowedRoles={managementRoles}>
                  <Dashboard />
                </RoleRoute>
              }
            />

            <Route
              path="/resident-approvals"
              element={
                <RoleRoute allowedRoles={managementRoles}>
                  <ResidentApprovals />
                </RoleRoute>
              }
            />

            <Route
              path="/facilities"
              element={
                <RoleRoute allowedRoles={managementRoles}>
                  <Facilities />
                </RoleRoute>
              }
            />

            <Route
              path="/assets"
              element={
                <RoleRoute allowedRoles={managementRoles}>
                  <Assets />
                </RoleRoute>
              }
            />

            <Route
              path="/maintenance-requests"
              element={
                <RoleRoute allowedRoles={managementRoles}>
                  <MaintenanceRequests />
                </RoleRoute>
              }
            />

            <Route
              path="/preventive-maintenance"
              element={
                <RoleRoute allowedRoles={managementRoles}>
                  <PreventiveMaintenance />
                </RoleRoute>
              }
            />

            <Route
              path="/reports"
              element={
                <RoleRoute allowedRoles={managementRoles}>
                  <Reports />
                </RoleRoute>
              }
            />

            {/* MANAGEMENT AND TECHNICIANS */}
            <Route
              path="/work-orders"
              element={
                <RoleRoute
                  allowedRoles={[...managementRoles, ...technicianRoles]}
                >
                  <WorkOrders />
                </RoleRoute>
              }
            />

            <Route
              path="/maintenance-history"
              element={
                <RoleRoute
                  allowedRoles={[...managementRoles, ...technicianRoles]}
                >
                  <MaintenanceHistory />
                </RoleRoute>
              }
            />

            {/* RESIDENTS */}
            <Route
              path="/resident-portal"
              element={
                <RoleRoute allowedRoles={residentRoles}>
                  <ResidentDashboard />
                </RoleRoute>
              }
            />

            <Route
              path="/submit-request"
              element={
                <RoleRoute allowedRoles={residentRoles}>
                  <ResidentRequests />
                </RoleRoute>
              }
            />

            <Route
              path="/my-requests"
              element={
                <RoleRoute allowedRoles={residentRoles}>
                  <MyRequests />
                </RoleRoute>
              }
            />

            <Route
              path="*"
              element={<Navigate to={defaultRoute} replace />}
            />
          </Routes>
        </AppLayout>
      )}
    </BrowserRouter>
  );
}

export default App;
