import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import authRoutes from "./routes/auth.routes";
import testRoutes from "./routes/test.routes";
import facilityRoutes from "./routes/facility.routes";
import assetRoutes from "./routes/asset.routes";
import maintenanceRequestRoutes from "./routes/maintenanceRequest.routes";
import workOrderRoutes from "./routes/workOrder.routes";
import preventiveMaintenanceRoutes from "./routes/preventiveMaintenance.routes";
import dashboardRoutes from "./routes/dashboard.routes";

dotenv.config();

const app = express();

app.use(cors());
app.use(express.json());

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/test", testRoutes);
app.use("/api/facilities", facilityRoutes);
app.use("/api/assets", assetRoutes);
app.use(
  "/api/maintenance-requests",
  maintenanceRequestRoutes
);
app.use("/api/work-orders", workOrderRoutes);
app.use(
  "/api/preventive-maintenance",
  preventiveMaintenanceRoutes
);
app.use("/api/dashboard", dashboardRoutes);

// Health check
app.get("/", (_req, res) => {
  res.json({
    message: "Smart Facility Maintenance System API is running",
  });
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});