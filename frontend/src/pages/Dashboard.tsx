import { useEffect, useState } from "react";
import { getDashboardSummary } from "../api/dashboard.api";
import type { DashboardSummary } from "../api/dashboard.api";

import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip,
  Legend,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
} from "recharts";

const Dashboard = () => {
  const [dashboard, setDashboard] = useState<DashboardSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const loadDashboard = async () => {
      try {
        const data = await getDashboardSummary();
        setDashboard(data);
      } catch (error) {
        console.error("Failed to load dashboard:", error);
        setError("Failed to load dashboard data.");
      } finally {
        setLoading(false);
      }
    };

    loadDashboard();
  }, []);

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center text-white">
        <p className="text-slate-400">Loading dashboard...</p>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center text-white">
        <p className="text-red-400">{error}</p>
      </div>
    );
  }

  // Empty state
  if (!dashboard) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center text-white">
        <p className="text-slate-400">No dashboard data available.</p>
      </div>
    );
  }

  /*
   * ================================
   * CHART DATA
   * ================================
   */

  const maintenanceRequestChartData = [
    {
      name: "Pending",
      value: dashboard.maintenanceRequestsByStatus.pending,
    },
    {
      name: "Approved",
      value: dashboard.maintenanceRequestsByStatus.approved,
    },
    {
      name: "Assigned",
      value: dashboard.maintenanceRequestsByStatus.assigned,
    },
    {
      name: "In Progress",
      value: dashboard.maintenanceRequestsByStatus.inProgress,
    },
    {
      name: "Completed",
      value: dashboard.maintenanceRequestsByStatus.completed,
    },
    {
      name: "Cancelled",
      value: dashboard.maintenanceRequestsByStatus.cancelled,
    },
  ].filter((item) => item.value > 0);

  const workOrderChartData = [
    {
      name: "Assigned",
      value: dashboard.workOrdersByStatus.assigned,
    },
    {
      name: "In Progress",
      value: dashboard.workOrdersByStatus.inProgress,
    },
    {
      name: "Completed",
      value: dashboard.workOrdersByStatus.completed,
    },
    {
      name: "Cancelled",
      value: dashboard.workOrdersByStatus.cancelled,
    },
  ].filter((item) => item.value > 0);

  const preventiveMaintenanceChartData = [
    {
      name: "Scheduled",
      value: dashboard.preventiveMaintenanceByStatus.scheduled,
    },
    {
      name: "In Progress",
      value: dashboard.preventiveMaintenanceByStatus.inProgress,
    },
    {
      name: "Completed",
      value: dashboard.preventiveMaintenanceByStatus.completed,
    },
    {
      name: "Overdue",
      value: dashboard.preventiveMaintenanceByStatus.overdue,
    },
    {
      name: "Cancelled",
      value: dashboard.preventiveMaintenanceByStatus.cancelled,
    },
  ].filter((item) => item.value > 0);

  const assetRiskChartData = [
    {
      name: "Low",
      value: dashboard.assetsByRiskLevel.low,
    },
    {
      name: "Medium",
      value: dashboard.assetsByRiskLevel.medium,
    },
    {
      name: "High",
      value: dashboard.assetsByRiskLevel.high,
    },
    {
      name: "Critical",
      value: dashboard.assetsByRiskLevel.critical,
    },
  ].filter((item) => item.value > 0);

  const maintenanceCategoryChartData = [
    {
      name: "Electrical",
      value: dashboard.maintenanceRequestsByCategory.electrical,
    },
    {
      name: "Plumbing",
      value: dashboard.maintenanceRequestsByCategory.plumbing,
    },
    {
      name: "HVAC",
      value: dashboard.maintenanceRequestsByCategory.hvac,
    },
    {
      name: "Structural",
      value: dashboard.maintenanceRequestsByCategory.structural,
    },
    {
      name: "Security",
      value: dashboard.maintenanceRequestsByCategory.security,
    },
    {
      name: "Cleaning",
      value: dashboard.maintenanceRequestsByCategory.cleaning,
    },
    {
      name: "Equipment",
      value: dashboard.maintenanceRequestsByCategory.equipment,
    },
    {
      name: "Other",
      value: dashboard.maintenanceRequestsByCategory.other,
    },
  ].filter((item) => item.value > 0);

  const maintenanceCostChartData = [
    {
      name: "Labour",
      value: Number(dashboard.maintenanceCosts.totalLabourCost),
    },
    {
      name: "Materials",
      value: Number(dashboard.maintenanceCosts.totalMaterialCost),
    },
    {
      name: "Other",
      value: Number(dashboard.maintenanceCosts.totalOtherCost),
    },
  ].filter((item) => item.value > 0);

  return (
    <div className="min-h-screen bg-slate-950 text-white flex">
      {/* =========================================
          SIDEBAR
      ========================================== */}
      <aside className="hidden lg:flex w-64 bg-slate-900 border-r border-slate-800 flex-col">
        {/* Logo */}
        <div className="p-6 border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-500 flex items-center justify-center font-bold text-slate-950">
              SF
            </div>

            <div>
              <h1 className="font-semibold text-white">
                Smart Facility
              </h1>

              <p className="text-xs text-slate-500">
                Maintenance System
              </p>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-4 space-y-2">
          <button className="w-full text-left px-4 py-3 rounded-xl bg-emerald-500/10 text-emerald-400 font-medium">
            Dashboard
          </button>

          <button className="w-full text-left px-4 py-3 rounded-xl text-slate-400 hover:bg-slate-800 hover:text-white">
            Facilities
          </button>

          <button className="w-full text-left px-4 py-3 rounded-xl text-slate-400 hover:bg-slate-800 hover:text-white">
            Assets
          </button>

          <button className="w-full text-left px-4 py-3 rounded-xl text-slate-400 hover:bg-slate-800 hover:text-white">
            Maintenance Requests
          </button>

          <button className="w-full text-left px-4 py-3 rounded-xl text-slate-400 hover:bg-slate-800 hover:text-white">
            Work Orders
          </button>

          <button className="w-full text-left px-4 py-3 rounded-xl text-slate-400 hover:bg-slate-800 hover:text-white">
            Preventive Maintenance
          </button>

          <button className="w-full text-left px-4 py-3 rounded-xl text-slate-400 hover:bg-slate-800 hover:text-white">
            Reports
          </button>
        </nav>

        {/* Logout */}
        <div className="p-4 border-t border-slate-800">
          <button
            onClick={() => {
              localStorage.removeItem("token");
              localStorage.removeItem("user");
              window.location.href = "/";
            }}
            className="w-full text-left px-4 py-3 rounded-xl text-slate-400 hover:bg-red-500/10 hover:text-red-400"
          >
            Logout
          </button>
        </div>
      </aside>

      {/* =========================================
          MAIN CONTENT
      ========================================== */}
      <main className="flex-1 min-w-0">
        {/* Header */}
        <header className="border-b border-slate-800 bg-slate-950/80 backdrop-blur">
          <div className="px-6 lg:px-8 py-5 flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-500">
                Facility Management
              </p>

              <h2 className="text-2xl font-semibold text-white">
                Dashboard
              </h2>
            </div>

            <div className="flex items-center gap-4">
              <div className="hidden sm:block text-right">
                <p className="text-sm font-medium text-white">
                  Facility Manager
                </p>

                <p className="text-xs text-slate-500">
                  Operations Overview
                </p>
              </div>

              <div className="w-10 h-10 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center text-emerald-400 font-semibold">
                FM
              </div>
            </div>
          </div>
        </header>

        {/* =========================================
            DASHBOARD CONTENT
        ========================================== */}
        <div className="p-6 lg:p-8">
          {/* Introduction */}
          <div className="mb-8">
            <h3 className="text-xl font-semibold text-white">
              Good day
            </h3>

            <p className="text-slate-500 mt-1">
              Here's an overview of your facility maintenance operations.
            </p>
          </div>

          {/* =========================================
              KPI CARDS
          ========================================== */}
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-5 gap-4">
            {/* Facilities */}
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5">
              <p className="text-sm text-slate-500">
                Facilities
              </p>

              <p className="text-3xl font-bold text-white mt-3">
                {dashboard.totalFacilities}
              </p>

              <p className="text-xs text-emerald-400 mt-2">
                Active facilities
              </p>
            </div>

            {/* Assets */}
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5">
              <p className="text-sm text-slate-500">
                Assets
              </p>

              <p className="text-3xl font-bold text-white mt-3">
                {dashboard.totalAssets}
              </p>

              <p className="text-xs text-slate-500 mt-2">
                Registered assets
              </p>
            </div>

            {/* Maintenance Requests */}
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5">
              <p className="text-sm text-slate-500">
                Maintenance Requests
              </p>

              <p className="text-3xl font-bold text-white mt-3">
                {dashboard.totalMaintenanceRequests}
              </p>

              <p className="text-xs text-amber-400 mt-2">
                {dashboard.maintenanceRequestsByStatus.pending} pending
              </p>
            </div>

            {/* Overdue */}
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5">
              <p className="text-sm text-slate-500">
                Overdue Maintenance
              </p>

              <p className="text-3xl font-bold text-white mt-3">
                {dashboard.preventiveMaintenanceByStatus.overdue}
              </p>

              <p className="text-xs text-red-400 mt-2">
                Requires attention
              </p>
            </div>

            {/* Maintenance Cost */}
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5">
              <p className="text-sm text-slate-500">
                Maintenance Cost
              </p>

              <p className="text-3xl font-bold text-white mt-3">
                ₦
                {Number(
                  dashboard.maintenanceCosts.totalMaintenanceCost
                ).toLocaleString()}
              </p>

              <p className="text-xs text-slate-500 mt-2">
                Completed work orders
              </p>
            </div>
          </div>

          {/* =========================================
              WORK ORDER & PREVENTIVE MAINTENANCE
          ========================================== */}
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 mt-6">
            {/* Work Orders */}
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
              <div className="mb-4">
                <h3 className="font-semibold text-white">
                  Work Order Status
                </h3>

                <p className="text-sm text-slate-500 mt-1">
                  Current work order distribution
                </p>
              </div>

              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={workOrderChartData}
                      dataKey="value"
                      nameKey="name"
                      cx="50%"
                      cy="50%"
                      innerRadius={65}
                      outerRadius={105}
                      paddingAngle={3}
                      label
                    >
                      {workOrderChartData.map((entry, index) => (
                        <Cell key={`work-order-${index}`} />
                      ))}
                    </Pie>

                    <Tooltip />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Preventive Maintenance */}
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
              <div className="mb-4">
                <h3 className="font-semibold text-white">
                  Preventive Maintenance
                </h3>

                <p className="text-sm text-slate-500 mt-1">
                  Maintenance schedule and overdue status
                </p>
              </div>

              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={preventiveMaintenanceChartData}
                      dataKey="value"
                      nameKey="name"
                      cx="50%"
                      cy="50%"
                      innerRadius={65}
                      outerRadius={105}
                      paddingAngle={3}
                      label
                    >
                      {preventiveMaintenanceChartData.map(
                        (entry, index) => (
                          <Cell key={`preventive-${index}`} />
                        )
                      )}
                    </Pie>

                    <Tooltip />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>

          {/* =========================================
              ASSET RISK ANALYTICS
          ========================================== */}
          <div className="mt-6 bg-slate-900 border border-slate-800 rounded-2xl p-6">
            <div className="mb-4">
              <h3 className="font-semibold text-white">
                Asset Risk Distribution
              </h3>

              <p className="text-sm text-slate-500 mt-1">
                Current risk classification of registered assets
              </p>
            </div>

            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={assetRiskChartData}
                    dataKey="value"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    innerRadius={65}
                    outerRadius={105}
                    paddingAngle={3}
                    label
                  >
                    {assetRiskChartData.map((entry, index) => (
                      <Cell key={`asset-risk-${index}`} />
                    ))}
                  </Pie>

                  <Tooltip />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* =========================================
              MAINTENANCE REQUESTS BY CATEGORY
          ========================================== */}
          <div className="mt-6 bg-slate-900 border border-slate-800 rounded-2xl p-6">
            <div className="mb-4">
              <h3 className="font-semibold text-white">
                Maintenance Requests by Category
              </h3>

              <p className="text-sm text-slate-500 mt-1">
                Distribution of reported maintenance issues
              </p>
            </div>

            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={maintenanceCategoryChartData}
                  layout="vertical"
                  margin={{
                    top: 5,
                    right: 20,
                    left: 20,
                    bottom: 5,
                  }}
                >
                  <CartesianGrid strokeDasharray="3 3" />

                  <XAxis
                    type="number"
                    allowDecimals={false}
                  />

                  <YAxis
                    type="category"
                    dataKey="name"
                    width={100}
                  />

                  <Tooltip />

                  <Bar
                    dataKey="value"
                    name="Requests"
                    radius={[0, 6, 6, 0]}
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* =========================================
              MAINTENANCE COST ANALYTICS
          ========================================== */}
          <div className="mt-6 bg-slate-900 border border-slate-800 rounded-2xl p-6">
            <div className="mb-4">
              <h3 className="font-semibold text-white">
                Maintenance Cost Breakdown
              </h3>

              <p className="text-sm text-slate-500 mt-1">
                Cost distribution across completed maintenance work
              </p>
            </div>

            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={maintenanceCostChartData}
                  margin={{
                    top: 10,
                    right: 20,
                    left: 20,
                    bottom: 10,
                  }}
                >
                  <CartesianGrid strokeDasharray="3 3" />

                  <XAxis dataKey="name" />

                  <YAxis allowDecimals={false} />

                  <Tooltip
                    formatter={(value) =>
                      `₦${Number(value).toLocaleString()}`
                    }
                  />

                  <Bar
                    dataKey="value"
                    name="Cost"
                    radius={[6, 6, 0, 0]}
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* =========================================
              QUICK STATUS CARDS
          ========================================== */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mt-6">
            {/* Maintenance Requests */}
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
              <h3 className="font-semibold text-white">
                Maintenance Requests
              </h3>

              <div className="mt-5 grid grid-cols-2 gap-4">
                <div>
                  <p className="text-xs text-slate-500">
                    Pending
                  </p>

                  <p className="text-2xl font-bold text-amber-400 mt-1">
                    {dashboard.maintenanceRequestsByStatus.pending}
                  </p>
                </div>

                <div>
                  <p className="text-xs text-slate-500">
                    Completed
                  </p>

                  <p className="text-2xl font-bold text-emerald-400 mt-1">
                    {dashboard.maintenanceRequestsByStatus.completed}
                  </p>
                </div>
              </div>
            </div>

            {/* Work Orders */}
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
              <h3 className="font-semibold text-white">
                Work Orders
              </h3>

              <div className="mt-5">
                <p className="text-xs text-slate-500">
                  Completed
                </p>

                <p className="text-3xl font-bold text-emerald-400 mt-1">
                  {dashboard.workOrdersByStatus.completed}
                </p>
              </div>
            </div>

            {/* Asset Risk */}
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
              <h3 className="font-semibold text-white">
                Asset Risk
              </h3>

              <div className="mt-5 grid grid-cols-2 gap-4">
                <div>
                  <p className="text-xs text-slate-500">
                    Medium
                  </p>

                  <p className="text-2xl font-bold text-amber-400 mt-1">
                    {dashboard.assetsByRiskLevel.medium}
                  </p>
                </div>

                <div>
                  <p className="text-xs text-slate-500">
                    Critical
                  </p>

                  <p className="text-2xl font-bold text-red-400 mt-1">
                    {dashboard.assetsByRiskLevel.critical}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* =========================================
              MAINTENANCE REQUEST STATUS
          ========================================== */}
          <div className="mt-6 bg-slate-900 border border-slate-800 rounded-2xl p-6">
            <div className="mb-4">
              <h3 className="font-semibold text-white">
                Maintenance Request Status
              </h3>

              <p className="text-sm text-slate-500 mt-1">
                Current distribution of maintenance requests
              </p>
            </div>

            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={maintenanceRequestChartData}
                    dataKey="value"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    innerRadius={70}
                    outerRadius={110}
                    paddingAngle={3}
                    label
                  >
                    {maintenanceRequestChartData.map(
                      (entry, index) => (
                        <Cell key={`maintenance-request-${index}`} />
                      )
                    )}
                  </Pie>

                  <Tooltip />

                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Dashboard;