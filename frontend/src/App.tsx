
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

export const AUTH_CHANGED_EVENT = "auth-changed";

// Read the expiry timestamp from the JWT payload.
// This decodes the payload but does not verify the signature.
function getTokenExpiry(token: string): number | null {
  try {
    const parts = token.split(".");

    if (parts.length !== 3) {
      return null;
    }

    const payload = parts[1]
      .replace(/-/g, "+")
      .replace(/_/g, "/");

    const paddedPayload = payload.padEnd(
      Math.ceil(payload.length / 4) * 4,
      "="
    );

    const decodedPayload = JSON.parse(
      atob(paddedPayload)
    );

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

function App() {
  const [token, setToken] = useState(
    () => localStorage.getItem("token")
  );

  // Keep React's authentication state synchronised.
  useEffect(() => {
    const syncToken = () => {
      setToken(localStorage.getItem("token"));
    };

    window.addEventListener(AUTH_CHANGED_EVENT, syncToken);
    window.addEventListener("storage", syncToken);

    return () => {
      window.removeEventListener(
        AUTH_CHANGED_EVENT,
        syncToken
      );
      window.removeEventListener("storage", syncToken);
    };
  }, []);

  // Detect JWT expiry, including while the user is idle.
  useEffect(() => {
    if (!token) {
      return;
    }

    const expiryTime = getTokenExpiry(token);

    // If the token has no readable expiry claim, leave
    // authentication validation to the backend.
    if (expiryTime === null) {
      return;
    }

    const checkExpiry = () => {
      if (Date.now() >= expiryTime) {
        // Do not clear a newer token that may have replaced
        // the token this effect was monitoring.
        if (localStorage.getItem("token") === token) {
          localStorage.removeItem("token");

          window.dispatchEvent(
            new Event(AUTH_CHANGED_EVENT)
          );
        }
      }
    };

    // Check immediately, then periodically.
    checkExpiry();

    const intervalId = window.setInterval(
      checkExpiry,
      15_000
    );

    // Also check promptly when the user returns to the tab.
    window.addEventListener("focus", checkExpiry);

    document.addEventListener(
      "visibilitychange",
      checkExpiry
    );

    return () => {
      window.clearInterval(intervalId);
      window.removeEventListener("focus", checkExpiry);

      document.removeEventListener(
        "visibilitychange",
        checkExpiry
      );
    };
  }, [token]);

  return (
    <BrowserRouter>
      {!token ? (
        <Login />
      ) : (
        <AppLayout>
        <Routes>
          <Route
            path="/"
            element={<Navigate to="/dashboard" replace />}
          />

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
            path="/maintenance-history"
            element={<MaintenanceHistory />}
          />

          <Route
            path="*"
            element={<Navigate to="/dashboard" replace />}
          />
        </Routes>
        </AppLayout>
      )}
    </BrowserRouter>
  );
}

export default App;
