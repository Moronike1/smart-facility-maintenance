
import { useCallback, useEffect, useMemo, useState } from "react";
import api from "../api/axios";
import { getAssets, type Asset } from "../api/asset.api";
import {
  checkOverduePreventiveMaintenance,
  createPreventiveMaintenance,
  getPreventiveMaintenances,
  updatePreventiveMaintenanceStatus,
  type PreventiveMaintenanceRecord,
  type PreventiveMaintenanceStatus,
} from "../api/preventiveMaintenance.api";

const statusStyles: Record<PreventiveMaintenanceStatus, string> = {
  SCHEDULED: "bg-blue-100 text-blue-800",
  IN_PROGRESS: "bg-amber-100 text-amber-800",
  COMPLETED: "bg-green-100 text-green-800",
  OVERDUE: "bg-red-100 text-red-800",
  CANCELLED: "bg-slate-200 text-slate-700",
};

const formatDate = (value: string | null) => {
  if (!value) return "—";
  const date = new Date(value);
  return Number.isNaN(date.getTime())
    ? "—"
    : date.toLocaleDateString("en-GB");
};

const PreventiveMaintenance = () => {
  const [records, setRecords] = useState<PreventiveMaintenanceRecord[]>([]);
  const [assets, setAssets] = useState<Asset[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [search, setSearch] = useState("");

  const [assetId, setAssetId] = useState("");
  const [scheduledDate, setScheduledDate] = useState("");
  const [frequency, setFrequency] = useState("MONTHLY");
  const [description, setDescription] = useState("");

  const loadData = useCallback(async () => {
    setLoading(true);
    setError("");

    try {
      const [maintenanceData, assetData] = await Promise.all([
        getPreventiveMaintenances(),
        getAssets(),
      ]);

      setRecords(maintenanceData);
      setAssets(assetData);
    } catch (err) {
      console.error("Failed to load preventive maintenance:", err);
      setError("Unable to load preventive maintenance. Check your connection and sign-in status.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadData();
  }, [loadData]);

  const filteredRecords = useMemo(() => {
    const query = search.trim().toLowerCase();

    return records.filter((record) => {
      const matchesStatus =
        statusFilter === "ALL" || record.status === statusFilter;

      const matchesSearch =
        !query ||
        record.description.toLowerCase().includes(query) ||
        (record.asset?.name ?? "").toLowerCase().includes(query) ||
        (record.asset?.facility?.name ?? "").toLowerCase().includes(query);

      return matchesStatus && matchesSearch;
    });
  }, [records, statusFilter, search]);

  const counts = useMemo(() => ({
    total: records.length,
    scheduled: records.filter((r) => r.status === "SCHEDULED").length,
    inProgress: records.filter((r) => r.status === "IN_PROGRESS").length,
    overdue: records.filter((r) => r.status === "OVERDUE").length,
    completed: records.filter((r) => r.status === "COMPLETED").length,
  }), [records]);

  const handleCreate = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError("");
    setMessage("");

    if (!assetId || !scheduledDate || !frequency.trim() || !description.trim()) {
      setError("Please complete all schedule fields.");
      return;
    }

    setSaving(true);

    try {
      await createPreventiveMaintenance({
        assetId: Number(assetId),
        scheduledDate: new Date(`${scheduledDate}T12:00:00`).toISOString(),
        frequency,
        description: description.trim(),
      });

      setAssetId("");
      setScheduledDate("");
      setFrequency("MONTHLY");
      setDescription("");
      setMessage("Preventive maintenance scheduled successfully.");
      await loadData();
    } catch (err) {
      console.error("Failed to create schedule:", err);
      setError("Could not create the schedule. Check the details and try again.");
    } finally {
      setSaving(false);
    }
  };

  const handleStatusChange = async (
    record: PreventiveMaintenanceRecord,
    status: PreventiveMaintenanceStatus
  ) => {
    setError("");
    setMessage("");

    try {
      await updatePreventiveMaintenanceStatus(record.id, status);
      setMessage(`Schedule #${record.id} updated to ${status.replace("_", " ")}.`);
      await loadData();
    } catch (err) {
      console.error("Failed to update maintenance status:", err);
      setError("Could not update the status. Check whether this status transition is allowed.");
    }
  };

  const handleOverdueCheck = async () => {
    setError("");
    setMessage("");

    try {
      const result = await checkOverduePreventiveMaintenance();
      setMessage(`Overdue check complete. ${result.overdueCount} schedule(s) newly marked overdue.`);
      await loadData();
    } catch (err) {
      console.error("Failed to check overdue schedules:", err);
      setError("Unable to check overdue schedules. You may need administrator or facility manager access.");
    }
  };

  return (
    <main className="min-h-screen space-y-6 bg-slate-950 p-4 text-white sm:p-6 lg:p-8">
      <header className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-sm text-cyan-400">Facility Management</p>
          <h1 className="mt-1 text-2xl font-bold sm:text-3xl">
            Preventive Maintenance
          </h1>
          <p className="mt-2 text-sm text-slate-400">
            Schedule routine servicing and monitor maintenance due dates.
          </p>
        </div>

        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => void loadData()}
            disabled={loading}
            className="rounded-lg border border-slate-700 px-4 py-2 text-sm hover:border-cyan-500 disabled:opacity-50"
          >
            Refresh
          </button>
          <button
            type="button"
            onClick={() => void handleOverdueCheck()}
            className="rounded-lg bg-red-600 px-4 py-2 text-sm font-semibold hover:bg-red-500"
          >
            Check Overdue
          </button>
        </div>
      </header>

      {error && (
        <p role="alert" className="rounded-lg border border-red-900 bg-red-950/40 p-3 text-sm text-red-300">
          {error}
        </p>
      )}

      {message && (
        <p role="status" className="rounded-lg border border-green-900 bg-green-950/40 p-3 text-sm text-green-300">
          {message}
        </p>
      )}

      <section className="grid grid-cols-2 gap-3 lg:grid-cols-5">
        {[
          { label: "Total Plans", value: counts.total },
          { label: "Scheduled", value: counts.scheduled },
          { label: "In Progress", value: counts.inProgress },
          { label: "Overdue", value: counts.overdue },
          { label: "Completed", value: counts.completed },
        ].map((card) => (
          <div key={card.label} className="rounded-xl border border-slate-800 bg-slate-900 p-4">
            <p className="text-sm text-slate-400">{card.label}</p>
            <p className="mt-2 text-2xl font-bold">{card.value}</p>
          </div>
        ))}
      </section>

      <section className="rounded-xl border border-slate-800 bg-slate-900 p-5">
        <h2 className="mb-4 text-lg font-semibold">Schedule Maintenance</h2>

        <form onSubmit={handleCreate} className="grid gap-4 md:grid-cols-2">
          <div>
            <label htmlFor="pmAsset" className="mb-2 block text-sm text-slate-300">
              Asset
            </label>
            <select
              id="pmAsset"
              required
              value={assetId}
              onChange={(event) => setAssetId(event.target.value)}
              className="w-full rounded-lg border border-slate-700 bg-slate-950 p-3 text-white"
            >
              <option value="">Select an asset</option>
              {assets.map((asset) => (
                <option key={asset.id} value={asset.id}>
                  {asset.name}{asset.facility?.name ? ` — ${asset.facility.name}` : ""}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label htmlFor="pmDate" className="mb-2 block text-sm text-slate-300">
              Scheduled Date
            </label>
            <input
              id="pmDate"
              type="date"
              required
              value={scheduledDate}
              onChange={(event) => setScheduledDate(event.target.value)}
              className="w-full rounded-lg border border-slate-700 bg-slate-950 p-3 text-white"
            />
          </div>

          <div>
            <label htmlFor="pmFrequency" className="mb-2 block text-sm text-slate-300">
              Service Frequency
            </label>
            <select
              id="pmFrequency"
              value={frequency}
              onChange={(event) => setFrequency(event.target.value)}
              className="w-full rounded-lg border border-slate-700 bg-slate-950 p-3 text-white"
            >
              <option value="WEEKLY">Weekly</option>
              <option value="MONTHLY">Monthly</option>
              <option value="QUARTERLY">Every 3 months</option>
              <option value="BIANNUALLY">Every 6 months</option>
              <option value="ANNUALLY">Annually</option>
            </select>
          </div>

          <div>
            <label htmlFor="pmDescription" className="mb-2 block text-sm text-slate-300">
              Maintenance Task
            </label>
            <input
              id="pmDescription"
              type="text"
              required
              value={description}
              onChange={(event) => setDescription(event.target.value)}
              placeholder="e.g. Generator servicing and oil change"
              className="w-full rounded-lg border border-slate-700 bg-slate-950 p-3 text-white"
            />
          </div>

          <div className="md:col-span-2">
            <button
              type="submit"
              disabled={saving || assets.length === 0}
              className="rounded-lg bg-cyan-600 px-5 py-3 text-sm font-semibold hover:bg-cyan-500 disabled:opacity-50"
            >
              {saving ? "Scheduling..." : "Schedule Maintenance"}
            </button>
            {assets.length === 0 && (
              <p className="mt-2 text-sm text-amber-300">
                Add an asset before scheduling preventive maintenance.
              </p>
            )}
          </div>
        </form>
      </section>

      <section className="rounded-xl border border-slate-800 bg-slate-900 p-5">
        <div className="mb-4 flex flex-col gap-3 sm:flex-row">
          <input
            type="search"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Search task, asset or facility..."
            aria-label="Search preventive maintenance"
            className="flex-1 rounded-lg border border-slate-700 bg-slate-950 p-3 text-white"
          />
          <select
            value={statusFilter}
            onChange={(event) => setStatusFilter(event.target.value)}
            aria-label="Filter by maintenance status"
            className="rounded-lg border border-slate-700 bg-slate-950 p-3 text-white"
          >
            <option value="ALL">All statuses</option>
            <option value="SCHEDULED">Scheduled</option>
            <option value="IN_PROGRESS">In Progress</option>
            <option value="OVERDUE">Overdue</option>
            <option value="COMPLETED">Completed</option>
            <option value="CANCELLED">Cancelled</option>
          </select>
        </div>

        {loading ? (
          <p className="py-8 text-center text-slate-400">Loading maintenance schedules...</p>
        ) : filteredRecords.length === 0 ? (
          <p className="py-8 text-center text-slate-400">
            No maintenance schedules match your filters.
          </p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[850px] text-left text-sm">
              <thead>
                <tr className="border-b border-slate-800 text-slate-400">
                  <th className="px-3 py-3">Task</th>
                  <th className="px-3 py-3">Asset / Facility</th>
                  <th className="px-3 py-3">Due Date</th>
                  <th className="px-3 py-3">Frequency</th>
                  <th className="px-3 py-3">Status</th>
                  <th className="px-3 py-3">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredRecords.map((record) => (
                  <tr key={record.id} className="border-b border-slate-800/70 align-top">
                    <td className="px-3 py-4">
                      <p className="font-medium">{record.description}</p>
                      <p className="mt-1 text-xs text-slate-500">Plan #{record.id}</p>
                    </td>
                    <td className="px-3 py-4">
                      <p>{record.asset?.name ?? `Asset #${record.assetId}`}</p>
                      <p className="mt-1 text-xs text-slate-400">
                        {record.asset?.facility?.name ?? "Facility not specified"}
                      </p>
                    </td>
                    <td className="whitespace-nowrap px-3 py-4">
                      {formatDate(record.scheduledDate)}
                      {record.status === "OVERDUE" && (
                        <p className="mt-1 text-xs font-semibold text-red-400">Past due</p>
                      )}
                    </td>
                    <td className="px-3 py-4">{record.frequency}</td>
                    <td className="px-3 py-4">
                      <span className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ${statusStyles[record.status]}`}>
                        {record.status.replace("_", " ")}
                      </span>
                      {record.completedDate && (
                        <p className="mt-1 text-xs text-slate-400">
                          Completed {formatDate(record.completedDate)}
                        </p>
                      )}
                    </td>
                    <td className="px-3 py-4">
                      <div className="flex flex-wrap gap-2">
                        {record.status === "SCHEDULED" && (
                          <button
                            type="button"
                            onClick={() => void handleStatusChange(record, "IN_PROGRESS")}
                            className="rounded-md bg-amber-600 px-3 py-1.5 text-xs font-semibold hover:bg-amber-500"
                          >
                            Start
                          </button>
                        )}
                        {(record.status === "IN_PROGRESS" || record.status === "OVERDUE") && (
                          <button
                            type="button"
                            onClick={() => void handleStatusChange(record, "COMPLETED")}
                            className="rounded-md bg-green-600 px-3 py-1.5 text-xs font-semibold hover:bg-green-500"
                          >
                            Complete
                          </button>
                        )}
                        {(record.status === "SCHEDULED" || record.status === "OVERDUE") && (
                          <button
                            type="button"
                            onClick={() => void handleStatusChange(record, "CANCELLED")}
                            className="rounded-md border border-slate-700 px-3 py-1.5 text-xs hover:border-red-500"
                          >
                            Cancel
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </main>
  );
};

export default PreventiveMaintenance;
