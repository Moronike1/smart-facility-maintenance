
import { useCallback, useEffect, useMemo, useState } from "react";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  PieChart,
  Pie,
  Cell,
  Legend,
} from "recharts";
import {
  getDashboardSummary,
  type DashboardSummary,
} from "../api/dashboard.api";
import {
  getMaintenanceHistory,
  type MaintenanceHistoryRecord,
} from "../api/maintenanceHistory.api";
import { getFacilities, type Facility } from "../api/facility.api";
import { getAssets, type Asset } from "../api/asset.api";


const chartColours = [
  "#06b6d4",
  "#3b82f6",
  "#22c55e",
  "#f59e0b",
  "#a78bfa",
  "#f97316",
  "#ec4899",
  "#94a3b8",
];

const formatCurrency = (value: string | number) => {
  const amount = Number(value);
  return new Intl.NumberFormat("en-NG", {
    style: "currency",
    currency: "NGN",
    maximumFractionDigits: 2,
  }).format(Number.isFinite(amount) ? amount : 0);
};

const Reports = () => {
  const [summary, setSummary] = useState<DashboardSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [history, setHistory] = useState<MaintenanceHistoryRecord[]>([]);
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  // Facility and asset report filters.
  const [facilities, setFacilities] = useState<Facility[]>([]);
  const [assets, setAssets] = useState<Asset[]>([]);
  const [selectedFacilityId, setSelectedFacilityId] = useState("");
  const [selectedAssetId, setSelectedAssetId] = useState("");


  const loadReports = useCallback(async () => {
    try {
      setLoading(true);
      setError("");

      const [summaryData, historyData] = await Promise.all([
        getDashboardSummary(),
        getMaintenanceHistory(),
      ]);

      setSummary(summaryData);
      setHistory(historyData);
    } catch (err) {
      console.error("Failed to load reports:", err);
      setError(
        "Unable to load reports. Please check your connection and try again."
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const loadFilterOptions = async () => {
      try {
        const [facilityData, assetData] = await Promise.all([
          getFacilities(),
          getAssets(),
        ]);

        setFacilities(facilityData);
        setAssets(assetData);
      } catch (error) {
        console.error("Failed to load report filters:", error);
      }
    };

    void loadFilterOptions();
  }, []);


  useEffect(() => {
    void loadReports();
  }, [loadReports]);

  const filteredAssets = useMemo(() => {
    if (!selectedFacilityId) {
      return assets;
    }

    return assets.filter(
      (asset) => asset.facilityId === Number(selectedFacilityId)
    );
  }, [assets, selectedFacilityId]);

  const filteredHistory = useMemo(() => {
    return history.filter((record) => {
      const dateValue = new Date(record.maintenanceDate);

      if (Number.isNaN(dateValue.getTime())) {
        return false;
      }

      // Keep the existing date filtering.
      const year = dateValue.getFullYear();
      const month = String(dateValue.getMonth() + 1).padStart(2, "0");
      const day = String(dateValue.getDate()).padStart(2, "0");
      const recordDate = `${year}-${month}-${day}`;

      if (startDate && recordDate < startDate) {
        return false;
      }

      if (endDate && recordDate > endDate) {
        return false;
      }

      // Filter by facility.
      if (
        selectedFacilityId &&
        record.asset?.facility?.id !== Number(selectedFacilityId)
      ) {
        return false;
      }

      // Filter by asset.
      if (
        selectedAssetId &&
        record.assetId !== Number(selectedAssetId)
      ) {
        return false;
      }

      return true;
    });
  }, [
    history,
    startDate,
    endDate,
    selectedFacilityId,
    selectedAssetId,
  ]);

  const filteredMaintenanceCost = filteredHistory.reduce(
    (total, record) => total + (Number(record.cost) || 0),
    0
  );
  const exportCSV = () => {
    const headers = [
      "Maintenance Date",
      "Asset",
      "Asset Category",
      "Work Order",
      "Request Number",
      "Description",
      "Cost (NGN)",
      "Remarks",
    ];

    const escapeCSV = (value: unknown) => {
      const text = String(value ?? "");
      return `"${text.replace(/"/g, '""')}"`;
    };

    const rows = filteredHistory.map((record) => [
      record.maintenanceDate
        ? new Date(record.maintenanceDate).toLocaleDateString("en-GB")
        : "",
      record.asset?.name,
      record.asset?.category,
      record.workOrder?.workOrderNumber,
      record.workOrder?.request?.requestNumber,
      record.description,
      record.cost ?? "",
      record.remarks ?? "",
    ]);

    const csv = [
      headers,
      ...rows,
    ]
      .map((row) => row.map(escapeCSV).join(","))
      .join("\r\n");

    // BOM helps Excel recognise UTF-8 text correctly.
    const blob = new Blob(["\uFEFF", csv], {
      type: "text/csv;charset=utf-8;",
    });

    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");

    link.href = url;
    link.download = "maintenance-history-report.csv";
    document.body.appendChild(link);
    link.click();
    link.remove();
    URL.revokeObjectURL(url);
  };


  if (loading && !summary) {
    return (
      <div className="min-h-screen bg-slate-950 p-8 text-slate-300">
        Loading reports...
      </div>
    );
  }

  if (error && !summary) {
    return (
      <div className="min-h-screen bg-slate-950 p-6 text-white">
        <h1 className="text-2xl font-bold">Reports and Analytics</h1>
        <p role="alert" className="mt-4 text-red-400">{error}</p>
        <button
          onClick={() => void loadReports()}
          className="mt-4 rounded-lg bg-cyan-600 px-4 py-2 font-medium hover:bg-cyan-500"
        >
          Try Again
        </button>
      </div>
    );
  }

  if (!summary) return null;

  const workOrderData = [
    { name: "Assigned", value: summary.workOrdersByStatus.assigned },
    { name: "In Progress", value: summary.workOrdersByStatus.inProgress },
    { name: "Completed", value: summary.workOrdersByStatus.completed },
    { name: "Cancelled", value: summary.workOrdersByStatus.cancelled },
  ];

  const requestData = [
    { name: "Pending", value: summary.maintenanceRequestsByStatus.pending },
    { name: "Approved", value: summary.maintenanceRequestsByStatus.approved },
    { name: "Assigned", value: summary.maintenanceRequestsByStatus.assigned },
    { name: "In Progress", value: summary.maintenanceRequestsByStatus.inProgress },
    { name: "Completed", value: summary.maintenanceRequestsByStatus.completed },
    { name: "Cancelled", value: summary.maintenanceRequestsByStatus.cancelled },
  ];

  const categoryData = Object.entries(
    summary.maintenanceRequestsByCategory
  ).map(([name, value]) => ({
    name: name.charAt(0).toUpperCase() + name.slice(1),
    value,
  }));

  const riskData = Object.entries(summary.assetsByRiskLevel).map(
    ([name, value]) => ({
      name: name.charAt(0).toUpperCase() + name.slice(1),
      value,
    })
  );

  const costData = [
    {
      name: "Labour",
      amount: Number(summary.maintenanceCosts.totalLabourCost),
    },
    {
      name: "Materials",
      amount: Number(summary.maintenanceCosts.totalMaterialCost),
    },
    {
      name: "Other",
      amount: Number(summary.maintenanceCosts.totalOtherCost),
    },
  ].map((item) => ({
    ...item,
    amount: Number.isFinite(item.amount) ? item.amount : 0,
  }));

  const cards = [
    { label: "Facilities", value: summary.totalFacilities },
    { label: "Assets", value: summary.totalAssets },
    { label: "Maintenance Requests", value: summary.totalMaintenanceRequests },
    { label: "Work Orders", value: summary.totalWorkOrders },
    { label: "Preventive Maintenance Plans", value: summary.totalPreventiveMaintenance },
  ];

  const riskColours: Record<string, string> = {
    Low: "#22c55e",
    Medium: "#f59e0b",
    High: "#f97316",
    Critical: "#ef4444",
  };

  return (
    <>
      <style>{`
@page {
  size: A4 portrait;
  margin: 12mm;
}

@media print {
  html,
  body {
    background: #ffffff !important;
    color: #111827 !important;
    margin: 0 !important;
    padding: 0 !important;
    print-color-adjust: exact !important;
    -webkit-print-color-adjust: exact !important;
  }

  body * {
    visibility: hidden !important;
  }

  .report-print-root,
  .report-print-root * {
    visibility: visible !important;
  }

  .report-print-root {
    position: absolute !important;
    top: 0 !important;
    left: 0 !important;
    width: 100% !important;
    min-height: 0 !important;
    margin: 0 !important;
    padding: 0 !important;
    background: #ffffff !important;
    color: #111827 !important;
  }

  .report-print-root section,
  .report-print-root div[class*="bg-slate-"],
  .report-print-root div[class*="bg-gray-"] {
    background-color: #ffffff !important;
    color: #111827 !important;
    box-shadow: none !important;
  }

  .report-print-root section {
    border: 1px solid #d1d5db !important;
    break-inside: avoid !important;
    page-break-inside: avoid !important;
    margin-bottom: 12px !important;
  }

  .report-print-root .report-period-section,
  .report-print-root .report-print-controls,
  .report-print-root .print\:hidden,
  .report-print-root button,
  .report-print-root select,
  .report-print-root input {
    display: none !important;
  }

  .report-print-root * {
    color: #111827 !important;
  }

  .report-print-root h1,
  .report-print-root h2,
  .report-print-root h3 {
    color: #111827 !important;
  }

  .report-print-root svg {
    max-width: 100% !important;
    overflow: visible !important;
    print-color-adjust: exact !important;
    -webkit-print-color-adjust: exact !important;
  }

  .report-print-root .recharts-wrapper {
    visibility: visible !important;
    overflow: visible !important;
  }

  .report-print-root .recharts-text,
  .report-print-root .recharts-cartesian-axis-tick-value,
  .report-print-root .recharts-legend-item-text {
    fill: #374151 !important;
  }

  .report-print-root .recharts-legend-item-text {
    color: #374151 !important;
  }

  .report-print-root .recharts-cartesian-grid line {
    stroke: #d1d5db !important;
  }

  .report-print-root .recharts-tooltip-wrapper {
    display: none !important;
  }

  .report-print-root table {
    width: 100% !important;
    min-width: 0 !important;
    border-collapse: collapse !important;
  }

  .report-print-root th,
  .report-print-root td {
    border: 1px solid #d1d5db !important;
    padding: 6px !important;
    color: #111827 !important;
  }

  .report-print-root .overflow-x-auto {
    overflow: visible !important;
  }

  /* Page 2: four charts in a controlled two-column layout. */
  .report-print-root .report-chart-grid {
    display: grid !important;
    grid-template-columns: repeat(2, minmax(0, 1fr)) !important;
    grid-template-rows: repeat(2, 285px) !important;
    gap: 12px !important;
    break-before: page !important;
    page-break-before: always !important;
    margin-bottom: 0 !important;
  }

  .report-print-root .report-chart-grid .report-chart-card {
    display: block !important;
    width: 100% !important;
    height: 285px !important;
    min-width: 0 !important;
    min-height: 285px !important;
    box-sizing: border-box !important;
    padding: 12px !important;
    margin: 0 !important;
    overflow: visible !important;
    border: 1px solid #d1d5db !important;
    background: #ffffff !important;
    break-inside: avoid !important;
    page-break-inside: avoid !important;
  }

  .report-print-root .report-chart-grid .report-chart-card > div {
    height: 210px !important;
    min-height: 210px !important;
    width: 100% !important;
  }

  .report-print-root .report-chart-grid .recharts-wrapper,
  .report-print-root .report-chart-grid .recharts-surface {
    overflow: visible !important;
  }

  /* Page 3: begin the cost breakdown on a fresh page. */
  .report-print-root .report-cost-section {
    break-before: page !important;
    page-break-before: always !important;
  }
}
`}
      </style>
      <div className="report-print-root min-h-screen space-y-6 bg-slate-950 p-4 text-white sm:p-6 lg:p-8">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-sm text-cyan-400">Facility Management</p>

            <div>
              <h1 className="mt-1 text-2xl font-bold sm:text-3xl">
                Reports and Analytics
              </h1>

              <div className="mt-3 hidden print:block">
                <h2 className="text-xl font-bold">
                  Smart Facility Maintenance and Service Management System
                </h2>
                <p>Maintenance and Cost Report</p>
                <p>
                  Reporting Period: {startDate || "All dates"} to{" "}
                  {endDate || "Present"}
                </p>
                <p>
                  Generated on: {new Date().toLocaleDateString("en-GB")}
                </p>
              </div>
            </div>
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2 print:hidden">
              <div>
                <label
                  htmlFor="facilityFilter"
                  className="mb-1 block text-sm font-medium"
                >
                  Filter by Facility
                </label>

                <select
                  id="facilityFilter"
                  value={selectedFacilityId}
                  onChange={(event) => {
                    setSelectedFacilityId(event.target.value);
                    setSelectedAssetId("");
                  }}
                  className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900"
                >
                  <option value="">All Facilities</option>

                  {facilities.map((facility) => (
                    <option key={facility.id} value={facility.id}>
                      {facility.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label
                  htmlFor="assetFilter"
                  className="mb-1 block text-sm font-medium"
                >
                  Filter by Asset
                </label>

                <select
                  id="assetFilter"
                  value={selectedAssetId}
                  onChange={(event) => setSelectedAssetId(event.target.value)}
                  className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900"
                >
                  <option value="">All Assets</option>

                  {filteredAssets.map((asset) => (
                    <option key={asset.id} value={asset.id}>
                      {asset.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>
            <p className="mt-2 text-sm text-slate-400">
              An overview of maintenance activities, costs and asset risks.
            </p>
          </div>

          <button
            onClick={() => void loadReports()}
            disabled={loading}
            className="print:hidden rounded-lg border border-slate-700 bg-slate-900 px-4 py-3 text-sm hover:border-cyan-500 disabled:opacity-50"
          >
            {loading ? "Refreshing..." : "Refresh Reports"}
          </button>
        </div>

        {error && (
          <p role="alert" className="rounded-lg border border-red-900 bg-red-950/40 p-3 text-sm text-red-300">
            {error} The figures below may be from the previous successful load.
          </p>
        )}


        <section className="report-period-section rounded-xl border border-slate-800 bg-slate-900 p-5 print:hidden">
          <div className="mb-4">
            <h2 className="text-lg font-semibold">Report Period</h2>
            <p className="mt-1 text-sm text-slate-400">
              Filter maintenance history by its recorded maintenance date.
            </p>
          </div>

          <div className="report-print-controls flex flex-col gap-4 md:flex-row md:items-end">
            <div className="flex-1">
              <label
                htmlFor="reportStartDate"
                className="mb-2 block text-sm text-slate-300"
              >
                Start Date
              </label>
              <input
                id="reportStartDate"
                type="date"
                value={startDate}
                max={endDate || undefined}
                onChange={(event) => setStartDate(event.target.value)}
                className="w-full rounded-lg border border-slate-700 bg-slate-950 p-3 text-white"
              />
            </div>

            <div className="flex-1">
              <label
                htmlFor="reportEndDate"
                className="mb-2 block text-sm text-slate-300"
              >
                End Date
              </label>
              <input
                id="reportEndDate"
                type="date"
                value={endDate}
                min={startDate || undefined}
                onChange={(event) => setEndDate(event.target.value)}
                className="w-full rounded-lg border border-slate-700 bg-slate-950 p-3 text-white"
              />
            </div>

            <button
              type="button"
              onClick={() => {
                setStartDate("");
                setEndDate("");
              }}
              className="rounded-lg border border-slate-700 px-4 py-3 text-sm hover:border-cyan-500"
            >
              Clear Dates
            </button>


            <div className="flex flex-wrap gap-3">
              <button
                type="button"
                onClick={exportCSV}
                disabled={filteredHistory.length === 0}
                className="rounded-lg bg-cyan-600 px-4 py-3 text-sm font-semibold hover:bg-cyan-500 disabled:cursor-not-allowed disabled:opacity-50"
              >
                Export CSV
              </button>

              <button
                type="button"
                onClick={() => window.print()}
                className="rounded-lg bg-slate-700 px-4 py-3 text-sm font-semibold text-white hover:bg-slate-600"
              >
                Print Report
              </button>
            </div>

          </div>

          <div className="mt-5 grid gap-4 sm:grid-cols-2">
            <div className="rounded-lg bg-slate-950 p-4">
              <p className="text-sm text-slate-400">Matching History Records</p>
              <p className="mt-2 text-2xl font-bold">{filteredHistory.length}</p>
            </div>

            <div className="rounded-lg bg-slate-950 p-4">
              <p className="text-sm text-slate-400">Maintenance History Cost</p>
              <p className="mt-2 text-2xl font-bold text-cyan-400">
                {formatCurrency(filteredMaintenanceCost)}
              </p>
            </div>
          </div>
        </section>



        <section className="rounded-xl border border-slate-800 bg-slate-900 p-5 print:border-slate-300 print:bg-white print:text-black">
          <h2 className="mb-4 text-lg font-semibold print:text-black">
            Filtered Maintenance History
          </h2>

          <div className="mb-5 grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="rounded-lg border border-slate-700 p-4 print:border-slate-300">
              <p className="text-sm text-slate-400 print:text-slate-600">
                Total Maintenance Records
              </p>
              <p className="mt-2 text-2xl font-bold print:text-black">
                {filteredHistory.length}
              </p>
            </div>

            <div className="rounded-lg border border-slate-700 p-4 print:border-slate-300">
              <p className="text-sm text-slate-400 print:text-slate-600">
                Total Maintenance Cost
              </p>
              <p className="mt-2 text-2xl font-bold print:text-black">
                {formatCurrency(filteredMaintenanceCost)}
              </p>
            </div>
          </div>


          {filteredHistory.length === 0 ? (
            <p className="py-6 text-sm text-slate-400">
              No maintenance history records match the selected filters.
            </p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[650px] text-left text-sm">
                <thead>
                  <tr className="border-b border-slate-800 text-slate-400">
                    <th className="px-3 py-3">Date</th>
                    <th className="px-3 py-3">Asset</th>
                    <th className="px-3 py-3">Work Order</th>
                    <th className="px-3 py-3">Description</th>
                    <th className="px-3 py-3">Cost</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredHistory.map((record) => (
                    <tr key={record.id} className="border-b border-slate-800/70">
                      <td className="whitespace-nowrap px-3 py-3">
                        {new Date(record.maintenanceDate).toLocaleDateString("en-GB")}
                      </td>
                      <td className="px-3 py-3">
                        {record.asset?.name ?? "Unknown asset"}
                      </td>
                      <td className="px-3 py-3">
                        {record.workOrder?.workOrderNumber ?? `#${record.workOrderId}`}
                      </td>
                      <td className="px-3 py-3">{record.description}</td>
                      <td className="whitespace-nowrap px-3 py-3">
                        {formatCurrency(record.cost ?? 0)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>


        <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
          {cards.map((card) => (
            <div
              key={card.label}
              className="rounded-xl border border-slate-800 bg-slate-900 p-5"
            >
              <p className="text-sm text-slate-400">{card.label}</p>
              <p className="mt-3 text-3xl font-bold text-white">{card.value}</p>
            </div>
          ))}
        </section>

        <section className="report-total-cost rounded-xl border border-slate-800 bg-slate-900 p-5 sm:p-6">
          <p className="text-sm text-slate-400">Total Recorded Maintenance Cost</p>
          <p className="mt-2 text-3xl font-bold text-cyan-400">
            {formatCurrency(summary.maintenanceCosts.totalMaintenanceCost)}
          </p>
          <p className="mt-2 text-xs text-slate-500">
            Cost figures reflect the values returned by the backend summary.
          </p>
        </section>

        <section className="report-chart-grid grid gap-6 xl:grid-cols-2">
          <div className="report-chart-card rounded-xl border border-slate-800 bg-slate-900 p-5">
            <h2 className="mb-5 text-lg font-semibold">Work Order Status</h2>
            <div className="report-chart-canvas" style={{ height: 210 }}>
              <ResponsiveContainer width="100%" height={210}>
                <PieChart>
                  <Pie
                    data={workOrderData}
                    dataKey="value"
                    nameKey="name"
                    cx="50%"
                    cy="42%"
                    outerRadius={62}
                    label
                  >
                    {workOrderData.map((entry, index) => (
                      <Cell
                        key={entry.name}
                        fill={chartColours[index % chartColours.length]}
                      />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "#0f172a",
                      border: "1px solid #334155",
                      borderRadius: 8,
                      color: "#fff",
                    }}
                  />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="report-chart-card rounded-xl border border-slate-800 bg-slate-900 p-5">
            <h2 className="mb-5 text-lg font-semibold">Maintenance Request Status</h2>
            <div className="report-chart-canvas" style={{ height: 210 }}>
              <ResponsiveContainer width="100%" height={210}>
                <BarChart data={requestData} margin={{ bottom: 15 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                  <XAxis
                    dataKey="name"
                    tick={{ fill: "#94a3b8", fontSize: 11 }}
                    angle={-20}
                    textAnchor="end"
                    interval={0}
                  />
                  <YAxis allowDecimals={false} tick={{ fill: "#94a3b8" }} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "#0f172a",
                      border: "1px solid #334155",
                      borderRadius: 8,
                      color: "#fff",
                    }}
                  />
                  <Bar dataKey="value" name="Requests" fill="#06b6d4" radius={[5, 5, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="report-chart-card rounded-xl border border-slate-800 bg-slate-900 p-5">
            <h2 className="mb-5 text-lg font-semibold">Requests by Category</h2>
            <div className="report-chart-canvas" style={{ height: 210 }}>
              <ResponsiveContainer width="100%" height={210}>
                <BarChart data={categoryData} layout="vertical" margin={{ left: 15 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                  <XAxis type="number" allowDecimals={false} tick={{ fill: "#94a3b8" }} />
                  <YAxis
                    type="category"
                    dataKey="name"
                    width={90}
                    tick={{ fill: "#94a3b8", fontSize: 12 }}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "#0f172a",
                      border: "1px solid #334155",
                      borderRadius: 8,
                      color: "#fff",
                    }}
                  />
                  <Bar dataKey="value" name="Requests" fill="#3b82f6" radius={[0, 5, 5, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="report-chart-card rounded-xl border border-slate-800 bg-slate-900 p-5">
            <h2 className="mb-5 text-lg font-semibold">Asset Risk Levels</h2>
            <div className="report-chart-canvas" style={{ height: 210 }}>
              <ResponsiveContainer width="100%" height={210}>
                <PieChart>
                  <Pie
                    data={riskData}
                    dataKey="value"
                    nameKey="name"
                    cx="50%"
                    cy="42%"
                    outerRadius={62}
                    label
                  >
                    {riskData.map((entry) => (
                      <Cell
                        key={entry.name}
                        fill={riskColours[entry.name] ?? "#94a3b8"}
                      />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "#0f172a",
                      border: "1px solid #334155",
                      borderRadius: 8,
                      color: "#fff",
                    }}
                  />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>
        </section>

        <section className="report-cost-section rounded-xl border border-slate-800 bg-slate-900 p-5 sm:p-6">
          <h2 className="mb-5 text-lg font-semibold">Maintenance Cost Breakdown</h2>

          <div className="mb-6 grid gap-4 sm:grid-cols-3">
            {costData.map((item, index) => (
              <div key={item.name} className="rounded-lg bg-slate-950 p-4">
                <p className="text-sm text-slate-400">{item.name} Cost</p>
                <p className="mt-2 text-xl font-semibold">
                  {formatCurrency(item.amount)}
                </p>
                <div className="mt-3 h-1.5 rounded-full bg-slate-800">
                  <div
                    className="h-1.5 rounded-full"
                    style={{
                      width: `${costData.reduce((sum, cost) => sum + cost.amount, 0) > 0
                        ? (item.amount /
                          costData.reduce((sum, cost) => sum + cost.amount, 0)) *
                        100
                        : 0
                        }%`,
                      backgroundColor: chartColours[index],
                    }}
                  />
                </div>
              </div>
            ))}
          </div>

          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={costData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                <XAxis dataKey="name" tick={{ fill: "#94a3b8" }} />
                <YAxis
                  tick={{ fill: "#94a3b8" }}
                  tickFormatter={(value) => `₦${Number(value).toLocaleString("en-NG")}`}
                />
                <Tooltip
                  formatter={(value) => formatCurrency(Number(value ?? 0))}
                  contentStyle={{
                    backgroundColor: "#0f172a",
                    border: "1px solid #334155",
                    borderRadius: 8,
                    color: "#fff",
                  }}
                />
                <Bar dataKey="amount" name="Cost" fill="#06b6d4" radius={[5, 5, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </section>

        <section className="report-pm-status-card rounded-xl border border-slate-800 bg-slate-900 p-5">
          <h2 className="mb-4 text-lg font-semibold">Preventive Maintenance Status</h2>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
            {Object.entries(summary.preventiveMaintenanceByStatus).map(
              ([status, value]) => (
                <div key={status} className="rounded-lg bg-slate-950 p-4">
                  <p className="text-sm capitalize text-slate-400">
                    {status.replace(/([A-Z])/g, " $1")}
                  </p>
                  <p className="mt-2 text-2xl font-bold">{value}</p>
                </div>
              )
            )}
          </div>
        </section>
      </div>
    </>
  );
};

export default Reports;
