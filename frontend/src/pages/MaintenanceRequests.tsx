
import { useEffect, useState } from "react";
import { getAssets } from "../api/asset.api";
import type { Asset } from "../api/asset.api";
import {
  getMaintenanceRequests,
  createMaintenanceRequest,
  updateMaintenanceRequest,
} from "../api/maintenanceRequest.api";
import type {
  MaintenanceRequest,
} from "../api/maintenanceRequest.api";

const MaintenanceRequests = () => {
  const [requests, setRequests] = useState<MaintenanceRequest[]>([]);
  const [assets, setAssets] = useState<Asset[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [approvingId, setApprovingId] = useState<number | null>(null);
  const [selectedRequest, setSelectedRequest] =
    useState<MaintenanceRequest | null>(null);

  const [actionType, setActionType] = useState<
    "REJECTED" | "CANCELLED" | null
  >(null);

  const [statusReason, setStatusReason] = useState("");
  const [updatingStatus, setUpdatingStatus] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [assetId, setAssetId] = useState("");
  const [category, setCategory] = useState("");
  const [description, setDescription] = useState("");
  const [severity, setSeverity] = useState("MEDIUM");
  const [operationalImpact, setOperationalImpact] = useState("3");
  const [urgency, setUrgency] = useState("3");

  const loadRequests = async () => {
    try {
      setError("");

      const data = await getMaintenanceRequests();
      setRequests(data);
    } catch (err) {
      console.error("Failed to load maintenance requests:", err);
      setError("Failed to load maintenance requests.");
    }
  };

  const loadInitialData = async () => {
    try {
      setLoading(true);
      setError("");

      const [requestData, assetData] = await Promise.all([
        getMaintenanceRequests(),
        getAssets(),
      ]);

      setRequests(requestData);
      setAssets(assetData);
    } catch (err) {
      console.error("Failed to load maintenance data:", err);
      setError("Failed to load maintenance requests or assets.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void loadInitialData();
  }, []);

  const handleSubmit = async (
    event: React.FormEvent<HTMLFormElement>
  ) => {
    event.preventDefault();
    setError("");
    setSuccess("");
    setSubmitting(true);

    try {
      await createMaintenanceRequest({
        ...(assetId ? { assetId: Number(assetId) } : {}),
        category,
        description,
        severity,
        operationalImpact: Number(operationalImpact),
        urgency: Number(urgency),
      });

      setCategory("");
      setDescription("");
      setSeverity("MEDIUM");
      setOperationalImpact("3");
      setUrgency("3");
      setAssetId("");
      setShowForm(false);

      await loadRequests();
      setSuccess("Maintenance request submitted successfully.");
    } catch (err: any) {
      console.error("Failed to submit maintenance request:", err);
      setError(
        err?.response?.data?.message ||
        "Failed to submit the maintenance request. Please try again."
      );
    } finally {
      setSubmitting(false);
    }
  };

  const handleApprove = async (id: number) => {
    setError("");
    setSuccess("");
    setApprovingId(id);

    try {
      await updateMaintenanceRequest(id, {
        status: "APPROVED",
      });

      await loadRequests();
      setSuccess("Maintenance request approved successfully.");
    } catch (err: any) {
      console.error("Failed to approve maintenance request:", err);
      setError(
        err?.response?.data?.message ||
        "Failed to approve the maintenance request."
      );
    } finally {
      setApprovingId(null);
    }
  };


  const handleStatusUpdate = async () => {
    if (!selectedRequest || !actionType) return;

    if (!statusReason.trim()) {
      setError("Please provide a reason before proceeding.");
      return;
    }

    setError("");
    setSuccess("");
    setUpdatingStatus(true);

    try {
      await updateMaintenanceRequest(selectedRequest.id, {
        status: actionType,
        statusReason: statusReason.trim(),
      });

      await loadRequests();

      setSuccess(
        actionType === "REJECTED"
          ? "Maintenance request rejected successfully."
          : "Maintenance request cancelled successfully."
      );

      setSelectedRequest(null);
      setActionType(null);
      setStatusReason("");
    } catch (err: any) {
      console.error("Failed to update maintenance request:", err);

      setError(
        err?.response?.data?.message ||
        "Failed to update the maintenance request."
      );
    } finally {
      setUpdatingStatus(false);
    }
  };


  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 p-6 text-white">
        Loading maintenance requests...
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 p-6 text-white">
      <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">
            Maintenance Requests
          </h1>

          <p className="mt-1 text-sm text-slate-400">
            Submit, review and manage facility maintenance requests.
          </p>
        </div>

        <button
          type="button"
          onClick={() => {
            setShowForm(!showForm);
            setError("");
            setSuccess("");
          }}
          className="rounded-lg bg-cyan-500 px-4 py-2 font-semibold text-slate-950 hover:bg-cyan-400"
        >
          {showForm ? "Cancel" : "+ New Maintenance Request"}
        </button>
      </div>

      {error && (
        <div
          role="alert"
          className="mb-4 rounded-lg border border-red-800 bg-red-950/50 p-3 text-red-300"
        >
          {error}
        </div>
      )}

      {success && (
        <div
          role="status"
          className="mb-4 rounded-lg border border-green-800 bg-green-950/50 p-3 text-green-300"
        >
          {success}
        </div>
      )}

      {showForm && (
        <form
          onSubmit={handleSubmit}
          className="mb-8 space-y-5 rounded-xl border border-slate-800 bg-slate-900 p-6"
        >
          <h2 className="text-lg font-semibold">
            Submit a Maintenance Request
          </h2>

          <div>
            <label
              htmlFor="assetId"
              className="mb-2 block text-sm text-slate-300"
            >
              Asset (optional)
            </label>

            <select
              id="assetId"
              value={assetId}
              onChange={(event) => setAssetId(event.target.value)}
              className="w-full rounded-lg border border-slate-700 bg-slate-950 p-3 text-white"
            >
              <option value="">No specific asset</option>

              {assets.map((asset) => (
                <option key={asset.id} value={asset.id}>
                  {asset.name} — {asset.category}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label
              htmlFor="category"
              className="mb-2 block text-sm text-slate-300"
            >
              Category *
            </label>

            <select
              id="category"
              required
              value={category}
              onChange={(event) => setCategory(event.target.value)}
              className="w-full rounded-lg border border-slate-700 bg-slate-950 p-3 text-white"
            >
              <option value="">Select category</option>
              <option value="ELECTRICAL">Electrical</option>
              <option value="PLUMBING">Plumbing</option>
              <option value="HVAC">HVAC / Air Conditioning</option>
              <option value="STRUCTURAL">Structural</option>
              <option value="SECURITY">Security</option>
              <option value="CLEANING">Cleaning</option>
              <option value="EQUIPMENT">Equipment</option>
              <option value="OTHER">Other</option>
            </select>
          </div>

          <div>
            <label
              htmlFor="description"
              className="mb-2 block text-sm text-slate-300"
            >
              Description *
            </label>

            <textarea
              id="description"
              required
              minLength={5}
              rows={4}
              value={description}
              onChange={(event) => setDescription(event.target.value)}
              placeholder="Describe the fault or maintenance issue..."
              className="w-full rounded-lg border border-slate-700 bg-slate-950 p-3 text-white placeholder:text-slate-500"
            />
          </div>

          <div className="grid gap-5 md:grid-cols-3">
            <div>
              <label
                htmlFor="severity"
                className="mb-2 block text-sm text-slate-300"
              >
                Severity *
              </label>

              <select
                id="severity"
                required
                value={severity}
                onChange={(event) => setSeverity(event.target.value)}
                className="w-full rounded-lg border border-slate-700 bg-slate-950 p-3 text-white"
              >
                <option value="LOW">Low</option>
                <option value="MEDIUM">Medium</option>
                <option value="HIGH">High</option>
                <option value="CRITICAL">Critical</option>
              </select>
            </div>

            <div>
              <label
                htmlFor="operationalImpact"
                className="mb-2 block text-sm text-slate-300"
              >
                Operational Impact (1–5)
              </label>

              <select
                id="operationalImpact"
                value={operationalImpact}
                onChange={(event) =>
                  setOperationalImpact(event.target.value)
                }
                className="w-full rounded-lg border border-slate-700 bg-slate-950 p-3 text-white"
              >
                {[1, 2, 3, 4, 5].map((value) => (
                  <option key={value} value={value}>
                    {value}
                    {value === 1
                      ? " — Minimal"
                      : value === 5
                        ? " — Severe"
                        : ""}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label
                htmlFor="urgency"
                className="mb-2 block text-sm text-slate-300"
              >
                Urgency (1–5)
              </label>

              <select
                id="urgency"
                value={urgency}
                onChange={(event) => setUrgency(event.target.value)}
                className="w-full rounded-lg border border-slate-700 bg-slate-950 p-3 text-white"
              >
                {[1, 2, 3, 4, 5].map((value) => (
                  <option key={value} value={value}>
                    {value}
                    {value === 1
                      ? " — Low"
                      : value === 5
                        ? " — Immediate"
                        : ""}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="rounded-lg bg-cyan-500 px-5 py-3 font-semibold text-slate-950 hover:bg-cyan-400 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {submitting ? "Submitting..." : "Submit Request"}
          </button>
        </form>
      )}

      {requests.length === 0 ? (
        <div className="rounded-xl border border-slate-800 bg-slate-900 p-6 text-slate-400">
          No maintenance requests found.
        </div>
      ) : (
        <div className="overflow-x-auto rounded-xl border border-slate-800 bg-slate-900">
          <table className="w-full min-w-[900px] text-left">
            <thead className="border-b border-slate-800 text-sm text-slate-400">
              <tr>
                <th className="px-4 py-3">Request No.</th>
                <th className="px-4 py-3">Category</th>
                <th className="px-4 py-3">Description</th>
                <th className="px-4 py-3">Priority</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3">Actions</th>
              </tr>
            </thead>

            <tbody>
              {requests.map((request) => (
                <tr
                  key={request.id}
                  className="border-b border-slate-800 last:border-b-0"
                >
                  <td className="px-4 py-4 font-medium">
                    {request.requestNumber}
                  </td>

                  <td className="px-4 py-4">
                    {request.category}
                  </td>

                  <td className="max-w-md px-4 py-4 text-slate-300">
                    {request.description}
                  </td>

                  <td className="px-4 py-4">
                    {request.priority}
                  </td>

                  <td className="px-4 py-4">
                    <span
                      className={`inline-flex rounded-full border px-3 py-1 text-xs font-medium ${request.status === "COMPLETED"
                        ? "border-green-500/30 bg-green-500/10 text-green-400"
                        : request.status === "APPROVED"
                          ? "border-cyan-500/30 bg-cyan-500/10 text-cyan-400"
                          : request.status === "IN_PROGRESS"
                            ? "border-blue-500/30 bg-blue-500/10 text-blue-400"
                            : request.status === "CANCELLED"
                              ? "border-red-500/30 bg-red-500/10 text-red-400"
                              : "border-amber-500/30 bg-amber-500/10 text-amber-400"
                        }`}
                    >
                      {request.status.replaceAll("_", " ")}
                    </span>
                  </td>

                  <td className="px-4 py-4">

                    <button
                      type="button"
                      onClick={() => setSelectedRequest(request)}
                      className="mb-2 rounded-lg border border-slate-600 px-3 py-2 text-sm text-slate-200 hover:bg-slate-800"
                    >
                      View Details
                    </button>

                    {request.status === "PENDING" && (
                      <div className="flex flex-wrap gap-2">
                        <button
                          type="button"
                          disabled={approvingId === request.id}
                          onClick={() => void handleApprove(request.id)}
                          className="rounded-lg bg-cyan-500 px-3 py-2 text-sm font-semibold text-slate-950 hover:bg-cyan-400 disabled:opacity-50"
                        >
                          {approvingId === request.id ? "Approving..." : "Approve"}
                        </button>

                        <button
                          type="button"
                          onClick={() => {
                            setSelectedRequest(request);
                            setActionType("REJECTED");
                            setStatusReason("");
                          }}
                          className="rounded-lg bg-red-600 px-3 py-2 text-sm font-semibold text-white hover:bg-red-500"
                        >
                          Reject
                        </button>
                      </div>
                    )}

                    {["APPROVED", "ASSIGNED", "IN_PROGRESS"].includes(request.status) && (
                      <button
                        type="button"
                        onClick={() => {
                          setSelectedRequest(request);
                          setActionType("CANCELLED");
                          setStatusReason("");
                        }}
                        className="rounded-lg border border-red-500 px-3 py-2 text-sm text-red-400 hover:bg-red-950"
                      >
                        Cancel Request
                      </button>
                    )}

                    {request.status === "APPROVED" && (
                      <a
                        href={`/work-orders?requestId=${request.id}`}
                        className="mt-2 inline-flex rounded-lg bg-cyan-500 px-3 py-2 text-sm font-semibold text-slate-950 hover:bg-cyan-400"
                      >
                        + Create Work Order
                      </a>
                    )}

                    {request.status === "ASSIGNED" && (
                      <p className="mt-2 text-sm text-blue-400">Work assigned</p>
                    )}

                    {request.status === "IN_PROGRESS" && (
                      <p className="mt-2 text-sm text-blue-400">In progress</p>
                    )}

                    {request.status === "COMPLETED" && (
                      <p className="mt-2 text-sm text-green-400">Completed</p>
                    )}

                    {request.status === "REJECTED" && (
                      <p className="mt-2 text-sm text-red-400">Rejected</p>
                    )}

                    {request.status === "CANCELLED" && (
                      <p className="mt-2 text-sm text-red-400">Cancelled</p>
                    )}


                    {request.status === "APPROVED" && (
                      <a
                        href={`/work-orders?requestId=${request.id}`}
                        className="inline-flex rounded-lg bg-cyan-500 px-3 py-2 text-sm font-semibold text-slate-950 hover:bg-cyan-400"
                      >
                        + Create Work Order
                      </a>
                    )}

                    {request.status === "ASSIGNED" && (
                      <span className="text-sm text-blue-400">
                        Work assigned
                      </span>
                    )}

                    {request.status === "IN_PROGRESS" && (
                      <span className="text-sm text-blue-400">
                        In progress
                      </span>
                    )}

                    {request.status === "COMPLETED" && (
                      <span className="text-sm text-green-400">
                        Completed
                      </span>
                    )}

                    {request.status === "CANCELLED" && (
                      <span className="text-sm text-red-400">
                        Cancelled
                      </span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Request Details Dialog */}
      {selectedRequest && !actionType && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4">
          <div className="w-full max-w-2xl rounded-xl border border-slate-700 bg-slate-900 p-6">
            <div className="mb-5 flex items-center justify-between">
              <h2 className="text-xl font-bold text-white">
                Maintenance Request Details
              </h2>

              <button
                type="button"
                onClick={() => setSelectedRequest(null)}
                className="text-slate-400 hover:text-white"
              >
                ✕
              </button>
            </div>

            <div className="space-y-4 text-sm">
              <p>
                <span className="text-slate-400">Request Number: </span>
                {selectedRequest.requestNumber}
              </p>

              <p>
                <span className="text-slate-400">Category: </span>
                {selectedRequest.category}
              </p>

              <p>
                <span className="text-slate-400">Description: </span>
                {selectedRequest.description}
              </p>

              <p>
                <span className="text-slate-400">Location: </span>
                {selectedRequest.locationDescription || "Not specified"}
              </p>

              <p>
                <span className="text-slate-400">Severity: </span>
                {selectedRequest.severity}
              </p>

              <p>
                <span className="text-slate-400">Priority: </span>
                {selectedRequest.priority}
              </p>

              <p>
                <span className="text-slate-400">Status: </span>
                {selectedRequest.status.replaceAll("_", " ")}
              </p>

              {selectedRequest.statusReason && (
                <p className="rounded-lg border border-red-800 bg-red-950/30 p-3 text-red-300">
                  <strong>Status explanation:</strong>{" "}
                  {selectedRequest.statusReason}
                </p>
              )}

              <p>
                <span className="text-slate-400">Submitted: </span>
                {new Date(selectedRequest.createdAt).toLocaleString()}
              </p>
            </div>

            <button
              type="button"
              onClick={() => setSelectedRequest(null)}
              className="mt-6 rounded-lg bg-slate-700 px-5 py-2 text-white hover:bg-slate-600"
            >
              Close
            </button>
          </div>
        </div>
      )}

      {/* Rejection / Cancellation Dialog */}
      {selectedRequest && actionType && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4">
          <div className="w-full max-w-lg rounded-xl border border-slate-700 bg-slate-900 p-6">
            <h2 className="text-xl font-bold text-white">
              {actionType === "REJECTED"
                ? "Reject Maintenance Request"
                : "Cancel Maintenance Request"}
            </h2>

            <p className="mt-2 text-sm text-slate-400">
              Request: {selectedRequest.requestNumber}
            </p>

            <label
              htmlFor="statusReason"
              className="mt-5 block text-sm font-medium text-slate-300"
            >
              {actionType === "REJECTED"
                ? "Reason for rejection"
                : "Reason for cancellation"}
            </label>

            <textarea
              id="statusReason"
              rows={4}
              required
              minLength={5}
              maxLength={1000}
              value={statusReason}
              onChange={(event) => setStatusReason(event.target.value)}
              placeholder="Explain why this maintenance request is being rejected or cancelled..."
              className="mt-2 w-full rounded-lg border border-slate-700 bg-slate-950 p-3 text-white placeholder:text-slate-500"
            />

            <p className="mt-1 text-xs text-slate-500">
              Minimum 5 characters. This explanation will be visible to the resident.
            </p>

            <div className="mt-6 flex flex-wrap justify-end gap-3">
              <button
                type="button"
                disabled={updatingStatus}
                onClick={() => {
                  setSelectedRequest(null);
                  setActionType(null);
                  setStatusReason("");
                }}
                className="rounded-lg bg-slate-700 px-4 py-2 text-white hover:bg-slate-600 disabled:opacity-50"
              >
                Back
              </button>

              <button
                type="button"
                disabled={updatingStatus || statusReason.trim().length < 5}
                onClick={() => void handleStatusUpdate()}
                className="rounded-lg bg-red-600 px-4 py-2 font-semibold text-white hover:bg-red-500 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {updatingStatus
                  ? "Processing..."
                  : actionType === "REJECTED"
                    ? "Confirm Rejection"
                    : "Confirm Cancellation"}
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default MaintenanceRequests;