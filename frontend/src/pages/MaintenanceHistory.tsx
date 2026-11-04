
import { useCallback, useEffect, useMemo, useState } from "react";
import {
  getMaintenanceHistory,
  type MaintenanceHistoryRecord,
} from "../api/maintenanceHistory.api";

const formatDate = (value: string | null) => {
  if (!value) return "—";

  const date = new Date(value);

  return Number.isNaN(date.getTime())
    ? "—"
    : date.toLocaleDateString("en-GB", {
        day: "2-digit",
        month: "short",
        year: "numeric",
      });
};

const formatCurrency = (value: number | string | null) => {
  if (value === null || value === undefined || value === "") {
    return "—";
  }

  const amount = Number(value);

  if (!Number.isFinite(amount)) return "—";

  return new Intl.NumberFormat("en-NG", {
    style: "currency",
    currency: "NGN",
    maximumFractionDigits: 2,
  }).format(amount);
};

export default function MaintenanceHistory() {
  const [history, setHistory] = useState<MaintenanceHistoryRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");

  const loadHistory = useCallback(async () => {
    try {
      setLoading(true);
      setError("");

      const records = await getMaintenanceHistory();
      setHistory(records);
    } catch (err) {
      console.error("Failed to load maintenance history:", err);
      setError(
        "Unable to load maintenance history. Please check your connection and try again."
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadHistory();
  }, [loadHistory]);

  const filteredHistory = useMemo(() => {
    const query = search.trim().toLowerCase();

    if (!query) return history;

    return history.filter((record) =>
      [
        record.asset?.name,
        record.asset?.category,
        record.workOrder?.workOrderNumber,
        record.workOrder?.request?.requestNumber,
        record.description,
        record.remarks,
      ].some((value) => value?.toLowerCase().includes(query))
    );
  }, [history, search]);

  const totalCost = history.reduce(
    (total, record) => total + (Number(record.cost) || 0),
    0
  );

  return (
    <div className="min-h-screen space-y-6 bg-slate-950 p-4 text-white sm:p-6 lg:p-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-sm text-cyan-400">
            Maintenance Management
          </p>
          <h1 className="mt-1 text-2xl font-bold sm:text-3xl">
            Maintenance History
          </h1>
          <p className="mt-2 text-sm text-slate-400">
            Review previous maintenance activities, assets and recorded costs.
          </p>
        </div>

        <button
          type="button"
          onClick={() => void loadHistory()}
          disabled={loading}
          className="rounded-lg border border-slate-700 bg-slate-900 px-4 py-3 text-sm font-medium text-white hover:border-cyan-500 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {loading ? "Refreshing..." : "Refresh History"}
        </button>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="rounded-xl border border-slate-800 bg-slate-900 p-5">
          <p className="text-sm text-slate-400">History Records</p>
          <p className="mt-2 text-3xl font-bold">
            {history.length}
          </p>
        </div>

        <div className="rounded-xl border border-slate-800 bg-slate-900 p-5">
          <p className="text-sm text-slate-400">
            Total Recorded History Cost
          </p>
          <p className="mt-2 text-2xl font-bold text-cyan-400">
            {formatCurrency(totalCost)}
          </p>
          <p className="mt-1 text-xs text-slate-500">
            Based on costs stored in maintenance history.
          </p>
        </div>
      </div>

      <div className="rounded-xl border border-slate-800 bg-slate-900 p-4 sm:p-6">
        <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <h2 className="text-lg font-semibold">
            Maintenance Records
          </h2>

          <input
            type="search"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Search assets, work orders..."
            aria-label="Search maintenance history"
            className="w-full rounded-lg border border-slate-700 bg-slate-950 px-4 py-3 text-sm text-white outline-none placeholder:text-slate-500 focus:border-cyan-500 sm:max-w-sm"
          />
        </div>

        {error && (
          <div
            role="alert"
            className="mb-4 rounded-lg border border-red-800 bg-red-950/40 p-4 text-sm text-red-300"
          >
            {error}
            <button
              type="button"
              onClick={() => void loadHistory()}
              className="ml-2 font-semibold underline"
            >
              Try again
            </button>
          </div>
        )}

        {loading ? (
          <div className="py-12 text-center text-slate-400">
            Loading maintenance history...
          </div>
        ) : error ? null : filteredHistory.length === 0 ? (
          <div className="py-12 text-center">
            <p className="font-medium text-slate-300">
              {search
                ? "No matching maintenance records."
                : "No maintenance history found."}
            </p>
            <p className="mt-2 text-sm text-slate-500">
              {search
                ? "Try another search term."
                : "Completed maintenance records will appear here when saved."}
            </p>
          </div>
        ) : (
          <>
            <p className="mb-3 text-sm text-slate-400">
              Showing {filteredHistory.length} of {history.length} records
            </p>

            <div className="overflow-x-auto">
              <table className="w-full min-w-[850px] text-left text-sm">
                <thead>
                  <tr className="border-b border-slate-800 text-slate-400">
                    <th className="px-4 py-3 font-medium">Date</th>
                    <th className="px-4 py-3 font-medium">Asset</th>
                    <th className="px-4 py-3 font-medium">Work Order</th>
                    <th className="px-4 py-3 font-medium">Description</th>
                    <th className="px-4 py-3 font-medium">Cost</th>
                    <th className="px-4 py-3 font-medium">Remarks</th>
                  </tr>
                </thead>

                <tbody>
                  {filteredHistory.map((record) => (
                    <tr
                      key={record.id}
                      className="border-b border-slate-800/70 hover:bg-slate-800/40"
                    >
                      <td className="whitespace-nowrap px-4 py-4 text-slate-300">
                        {formatDate(record.maintenanceDate)}
                      </td>

                      <td className="px-4 py-4">
                        <p className="font-medium text-white">
                          {record.asset?.name ?? "Unknown asset"}
                        </p>
                        <p className="mt-1 text-xs text-slate-500">
                          {record.asset?.category ?? "—"}
                        </p>
                      </td>

                      <td className="whitespace-nowrap px-4 py-4">
                        <p className="font-medium text-cyan-400">
                          {record.workOrder?.workOrderNumber ??
                            `#${record.workOrderId}`}
                        </p>
                        <p className="mt-1 text-xs text-slate-500">
                          {record.workOrder?.request?.requestNumber ?? "—"}
                        </p>
                      </td>

                      <td className="max-w-xs px-4 py-4 text-slate-300">
                        {record.description}
                      </td>

                      <td className="whitespace-nowrap px-4 py-4 font-medium text-white">
                        {formatCurrency(record.cost)}
                      </td>

                      <td className="max-w-xs px-4 py-4 text-slate-400">
                        {record.remarks || "—"}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
