
import { useEffect, useState } from "react";

import {
  getWorkOrders,
  createWorkOrder,
  assignWorkOrder,
  updateWorkOrderStatus,
  completeWorkOrder,
} from "../api/workOrder.api";
import type {
  WorkOrder,
  CompleteWorkOrderData,
} from "../api/workOrder.api";

import {
  getMaintenanceRequests,
} from "../api/maintenanceRequest.api";
import type {
  MaintenanceRequest,
} from "../api/maintenanceRequest.api";
import { getTechnicians } from "../api/user.api";
import type { Technician } from "../api/user.api";

const WorkOrders = () => {
  const [workOrders, setWorkOrders] = useState<WorkOrder[]>([]);
  const [requests, setRequests] = useState<MaintenanceRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [requestId, setRequestId] = useState("");
  const [dueDate, setDueDate] = useState("");
  const [notes, setNotes] = useState("");
  const [technicians, setTechnicians] = useState<Technician[]>([]);
  const [selectedTechnicians, setSelectedTechnicians] =
    useState<Record<number, string>>({});
  const [assigningId, setAssigningId] = useState<number | null>(null);
  const [completingId, setCompletingId] = useState<number | null>(null);
  const [completionOrderId, setCompletionOrderId] = useState<number | null>(null);
  const [labourCost, setLabourCost] = useState("");
  const [materialCost, setMaterialCost] = useState("");
  const [otherCost, setOtherCost] = useState("");
  const [completionNotes, setCompletionNotes] = useState("");

  const loadData = async () => {
    try {
      setError("");

      const [orders, maintenanceRequests, availableTechnicians] =
        await Promise.all([
          getWorkOrders(),
          getMaintenanceRequests(),
          getTechnicians(),
        ]);

      setWorkOrders(orders);
      setRequests(maintenanceRequests);
      setTechnicians(availableTechnicians);
    } catch (err) {
      console.error("Failed to load work orders:", err);
      setError("Unable to load work orders, requests or technicians.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void loadData();
  }, []);


  const eligibleRequests = requests.filter(
    (request) =>
      ["APPROVED", "ASSIGNED"].includes(request.status) &&
      !request.workOrder
  );

  const handleCreate = async (
    event: React.FormEvent<HTMLFormElement>
  ) => {
    event.preventDefault();
    setError("");
    setSuccess("");

    if (!requestId) {
      setError("Please select a maintenance request.");
      return;
    }

    setSubmitting(true);

    try {
      await createWorkOrder({
        requestId: Number(requestId),
        ...(dueDate ? { dueDate: new Date(dueDate).toISOString() } : {}),
        ...(notes.trim() ? { notes: notes.trim() } : {}),
      });

      setShowForm(false);
      setRequestId("");
      setDueDate("");
      setNotes("");
      setSuccess("Work order created successfully.");

      await loadData();
      setSuccess("Work order created successfully.");
    } catch (err: any) {
      console.error("Failed to create work order:", err);
      setError(
        err?.response?.data?.message ||
        "Failed to create the work order. Please try again."
      );
    } finally {
      setSubmitting(false);
    }
  };

  const handleAssign = async (workOrderId: number) => {
    const technicianId = selectedTechnicians[workOrderId];

    if (!technicianId) {
      setError("Please select a technician first.");
      return;
    }

    setError("");
    setSuccess("");
    setAssigningId(workOrderId);

    try {
      await assignWorkOrder(workOrderId, {
        technicianId: Number(technicianId),
      });

      await loadData();
      setSuccess("Technician assigned successfully.");
    } catch (err: any) {
      console.error("Failed to assign technician:", err);
      setError(
        err?.response?.data?.message ||
        "Failed to assign technician. Please try again."
      );
    } finally {
      setAssigningId(null);
    }
  };


  const handleStartWork = async (orderId: number) => {
    setError("");
    setSuccess("");
    setAssigningId(orderId);

    try {
      await updateWorkOrderStatus(orderId, "IN_PROGRESS");
      await loadData();
      setSuccess("Work order moved to In Progress.");
    } catch (err: any) {
      console.error("Failed to start work:", err);
      setError(
        err?.response?.data?.message ||
        "Unable to start this work order."
      );
    } finally {
      setAssigningId(null);
    }
  };


  const handleCompleteWork = async (
    event: React.FormEvent<HTMLFormElement>
  ) => {
    event.preventDefault();

    if (completionOrderId === null) return;

    const costs: CompleteWorkOrderData = {
      labourCost: Number(labourCost || 0),
      materialCost: Number(materialCost || 0),
      otherCost: Number(otherCost || 0),
      ...(completionNotes.trim()
        ? { notes: completionNotes.trim() }
        : {}),
    };

    if (
      [costs.labourCost, costs.materialCost, costs.otherCost].some(
        (cost) => !Number.isFinite(cost) || cost < 0
      )
    ) {
      setError("Costs must be valid, non-negative amounts.");
      return;
    }

    setError("");
    setSuccess("");
    setCompletingId(completionOrderId);

    try {
      await completeWorkOrder(completionOrderId, costs);
      setCompletionOrderId(null);
      setLabourCost("");
      setMaterialCost("");
      setOtherCost("");
      setCompletionNotes("");
      await loadData();
      setSuccess("Work order completed successfully.");
    } catch (err: any) {
      console.error("Failed to complete work order:", err);
      setError(
        err?.response?.data?.message ||
        "Unable to complete this work order."
      );
    } finally {
      setCompletingId(null);
    }
  };






  const formatDate = (date?: string | null) => {
    if (!date) return "—";

    return new Date(date).toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  const formatCost = (value?: number | string | null) => {
    if (value === null || value === undefined || value === "") {
      return "—";
    }

    const amount = Number(value);

    return Number.isFinite(amount)
      ? `₦${amount.toLocaleString("en-NG", {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      })}`
      : "—";
  };

  const statusStyle = (status: string) => {
    switch (status) {
      case "COMPLETED":
        return "bg-green-500/10 text-green-400 border-green-500/30";
      case "IN_PROGRESS":
        return "bg-blue-500/10 text-blue-400 border-blue-500/30";
      case "CANCELLED":
        return "bg-red-500/10 text-red-400 border-red-500/30";
      case "ASSIGNED":
        return "bg-cyan-500/10 text-cyan-400 border-cyan-500/30";
      default:
        return "bg-amber-500/10 text-amber-400 border-amber-500/30";
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 p-6 text-white">
        Loading work orders...
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 p-6 text-white">
      <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">Work Orders</h1>
          <p className="mt-1 text-sm text-slate-400">
            Track assigned maintenance jobs, progress and completion costs.
          </p>
        </div>

        <button
          type="button"
          onClick={() => {
            setShowForm(!showForm);
            setError("");
            setSuccess("");
          }}
          className="rounded-lg bg-cyan-400 px-4 py-2 font-semibold text-slate-950 hover:bg-cyan-300"
        >
          {showForm ? "Cancel" : "+ Create Work Order"}
        </button>
      </div>

      {error && (
        <div className="mb-4 rounded-lg border border-red-800 bg-red-950/50 p-3 text-red-300">
          {error}
        </div>
      )}

      {success && (
        <div className="mb-4 rounded-lg border border-green-800 bg-green-950/50 p-3 text-green-300">
          {success}
        </div>
      )}


      {completionOrderId !== null && (
        <form
          onSubmit={handleCompleteWork}
          className="mb-8 space-y-4 rounded-xl border border-slate-800 bg-slate-900 p-6"
        >
          <h2 className="text-lg font-semibold">Complete Work Order</h2>
          <p className="text-sm text-slate-400">
            Record the final maintenance costs. Enter 0 for costs that do not apply.
          </p>

          <div className="grid gap-4 sm:grid-cols-3">
            <div>
              <label htmlFor="labourCost" className="mb-2 block text-sm text-slate-300">
                Labour Cost (₦)
              </label>
              <input
                id="labourCost"
                type="number"
                min="0"
                step="0.01"
                required
                value={labourCost}
                onChange={(event) => setLabourCost(event.target.value)}
                className="w-full rounded-lg border border-slate-700 bg-slate-950 p-3 text-white"
              />
            </div>

            <div>
              <label htmlFor="materialCost" className="mb-2 block text-sm text-slate-300">
                Material Cost (₦)
              </label>
              <input
                id="materialCost"
                type="number"
                min="0"
                step="0.01"
                required
                value={materialCost}
                onChange={(event) => setMaterialCost(event.target.value)}
                className="w-full rounded-lg border border-slate-700 bg-slate-950 p-3 text-white"
              />
            </div>

            <div>
              <label htmlFor="otherCost" className="mb-2 block text-sm text-slate-300">
                Other Cost (₦)
              </label>
              <input
                id="otherCost"
                type="number"
                min="0"
                step="0.01"
                required
                value={otherCost}
                onChange={(event) => setOtherCost(event.target.value)}
                className="w-full rounded-lg border border-slate-700 bg-slate-950 p-3 text-white"
              />
            </div>
          </div>

          <div>
            <label htmlFor="completionNotes" className="mb-2 block text-sm text-slate-300">
              Completion Notes (optional)
            </label>
            <textarea
              id="completionNotes"
              rows={3}
              value={completionNotes}
              onChange={(event) => setCompletionNotes(event.target.value)}
              placeholder="Describe the work completed..."
              className="w-full rounded-lg border border-slate-700 bg-slate-950 p-3 text-white"
            />
          </div>

          <div className="flex gap-3">
            <button
              type="submit"
              disabled={completingId === completionOrderId}
              className="rounded-lg bg-green-500 px-5 py-3 font-semibold text-white disabled:opacity-50"
            >
              {completingId === completionOrderId ? "Saving..." : "Confirm Completion"}
            </button>

            <button
              type="button"
              onClick={() => setCompletionOrderId(null)}
              className="rounded-lg border border-slate-700 px-5 py-3 text-white"
            >
              Cancel
            </button>
          </div>
        </form>
      )}


      {showForm && (
        <form
          onSubmit={handleCreate}
          className="mb-8 space-y-5 rounded-xl border border-slate-800 bg-slate-900 p-6"
        >
          <h2 className="text-lg font-semibold">
            Create Work Order
          </h2>

          {eligibleRequests.length === 0 ? (
            <p className="text-sm text-amber-300">
              No eligible maintenance requests are available. A request
              must be approved or assigned and must not already have a work order.
            </p>
          ) : (
            <>
              <div>
                <label
                  htmlFor="requestId"
                  className="mb-2 block text-sm text-slate-300"
                >
                  Maintenance Request *
                </label>

                <select
                  id="requestId"
                  required
                  value={requestId}
                  onChange={(event) => setRequestId(event.target.value)}
                  className="w-full rounded-lg border border-slate-700 bg-slate-950 p-3 text-white"
                >
                  <option value="">Select a maintenance request</option>

                  {eligibleRequests.map((request) => (
                    <option key={request.id} value={request.id}>
                      {request.requestNumber} — {request.category} —{" "}
                      {request.description}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label
                  htmlFor="dueDate"
                  className="mb-2 block text-sm text-slate-300"
                >
                  Due Date (optional)
                </label>

                <input
                  id="dueDate"
                  type="date"
                  value={dueDate}
                  onChange={(event) => setDueDate(event.target.value)}
                  className="w-full rounded-lg border border-slate-700 bg-slate-950 p-3 text-white"
                />
              </div>

              <div>
                <label
                  htmlFor="notes"
                  className="mb-2 block text-sm text-slate-300"
                >
                  Notes (optional)
                </label>

                <textarea
                  id="notes"
                  rows={3}
                  value={notes}
                  onChange={(event) => setNotes(event.target.value)}
                  placeholder="Add job instructions or relevant notes..."
                  className="w-full rounded-lg border border-slate-700 bg-slate-950 p-3 text-white placeholder:text-slate-500"
                />
              </div>

              <button
                type="submit"
                disabled={submitting}
                className="rounded-lg bg-cyan-400 px-5 py-3 font-semibold text-slate-950 hover:bg-cyan-300 disabled:opacity-50"
              >
                {submitting ? "Creating..." : "Create Work Order"}
              </button>
            </>
          )}
        </form>
      )}

      <div className="mb-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {[
          { label: "Total Work Orders", value: workOrders.length },
          {
            label: "Assigned",
            value: workOrders.filter((order) => order.status === "ASSIGNED").length,
          },
          {
            label: "In Progress",
            value: workOrders.filter((order) => order.status === "IN_PROGRESS").length,
          },
          {
            label: "Completed",
            value: workOrders.filter((order) => order.status === "COMPLETED").length,
          },
        ].map((item) => (
          <div
            key={item.label}
            className="rounded-xl border border-slate-800 bg-slate-900 p-5"
          >
            <p className="text-sm text-slate-400">{item.label}</p>
            <p className="mt-2 text-3xl font-bold">{item.value}</p>
          </div>
        ))}
      </div>

      {workOrders.length === 0 ? (
        <div className="rounded-xl border border-slate-800 bg-slate-900 p-8 text-center">
          <h2 className="text-lg font-semibold">No work orders yet</h2>
          <p className="mt-2 text-sm text-slate-400">
            Create a work order from an approved or assigned maintenance request.
          </p>
        </div>
      ) : (
        <div className="overflow-x-auto rounded-xl border border-slate-800 bg-slate-900">
          <table className="w-full min-w-[1200px] text-left">
            <thead className="border-b border-slate-800 text-xs uppercase tracking-wide text-slate-400">
              <tr>
                <th className="px-4 py-4">Work Order</th>
                <th className="px-4 py-4">Maintenance Request</th>
                <th className="px-4 py-4">Asset / Facility</th>
                <th className="px-4 py-4">Assigned To</th>
                <th className="px-4 py-4">Assignment</th>
                <th className="px-4 py-4">Due Date</th>
                <th className="px-4 py-4">Status</th>
                <th className="px-4 py-4">Actions</th>
                <th className="px-4 py-4">Total Cost</th>
              </tr>
            </thead>

            <tbody>
              {workOrders.map((order) => (
                <tr
                  key={order.id}
                  className="border-b border-slate-800 last:border-b-0 hover:bg-slate-800/40"
                >
                  <td className="px-4 py-4">
                    <p className="font-semibold">{order.workOrderNumber}</p>
                    <p className="mt-1 text-xs text-slate-500">
                      Created {formatDate(order.createdAt)}
                    </p>
                  </td>

                  <td className="px-4 py-4">
                    <p className="font-medium">
                      {order.request?.requestNumber ?? `Request #${order.requestId}`}
                    </p>
                    <p className="mt-1 max-w-xs truncate text-sm text-slate-400">
                      {order.request?.description ?? "No description"}
                    </p>
                  </td>

                  <td className="px-4 py-4">
                    <p>{order.request?.asset?.name ?? "No asset linked"}</p>
                    <p className="mt-1 text-xs text-slate-400">
                      {order.request?.asset?.facility?.name ?? "—"}
                    </p>
                  </td>

                  <td className="px-4 py-4">
                    {order.technician ? (
                      <>
                        <p>{order.technician.name}</p>
                        <p className="text-xs text-slate-400">Technician</p>
                      </>
                    ) : order.serviceProvider ? (
                      <>
                        <p>{order.serviceProvider.name}</p>
                        <p className="text-xs text-slate-400">Service provider</p>
                      </>
                    ) : (
                      <span className="text-slate-500">Unassigned</span>
                    )}
                  </td>

                  <td className="px-4 py-4">
                    {!order.technician &&
                      !order.serviceProvider &&
                      ["ASSIGNED", "IN_PROGRESS"].includes(order.status) && (
                        <div className="flex min-w-48 flex-col gap-2">
                          <select
                            aria-label={`Select technician for ${order.workOrderNumber}`}
                            value={selectedTechnicians[order.id] ?? ""}
                            onChange={(event) =>
                              setSelectedTechnicians((previous) => ({
                                ...previous,
                                [order.id]: event.target.value,
                              }))
                            }
                            className="rounded-lg border border-slate-700 bg-slate-950 p-2 text-sm text-white"
                          >
                            <option value="">Select technician</option>
                            {technicians.map((technician) => (
                              <option key={technician.id} value={technician.id}>
                                {technician.name}
                              </option>
                            ))}
                          </select>

                          <button
                            type="button"
                            disabled={
                              assigningId === order.id ||
                              !selectedTechnicians[order.id]
                            }
                            onClick={() => void handleAssign(order.id)}
                            className="rounded-lg bg-cyan-400 px-3 py-2 text-sm font-semibold text-slate-950 hover:bg-cyan-300 disabled:cursor-not-allowed disabled:opacity-50"
                          >
                            {assigningId === order.id ? "Assigning..." : "Assign Technician"}
                          </button>

                          {technicians.length === 0 && (
                            <p className="text-xs text-amber-300">
                              No active technicians found.
                            </p>
                          )}
                        </div>
                      )}
                  </td>

                  <td className="px-4 py-4 text-sm text-slate-300">
                    {formatDate(order.dueDate)}
                  </td>

                  <td className="px-4 py-4">
                    <span
                      className={`inline-flex rounded-full border px-3 py-1 text-xs font-medium ${statusStyle(order.status)}`}
                    >
                      {order.status.replaceAll("_", " ")}
                    </span>
                  </td>


                  <td className="px-4 py-4">
                    {order.status === "ASSIGNED" && order.technician && (
                      <button
                        type="button"
                        disabled={assigningId === order.id}
                        onClick={() => void handleStartWork(order.id)}
                        className="rounded-lg bg-blue-500 px-3 py-2 text-sm font-semibold text-white disabled:opacity-50"
                      >
                        {assigningId === order.id ? "Starting..." : "Start Work"}
                      </button>
                    )}

                    {order.status === "IN_PROGRESS" && (
                      <button
                        type="button"
                        onClick={() => {
                          console.log("Complete Work clicked:", order.id);
                          setError("");
                          setSuccess("");
                          setCompletionOrderId(order.id);
                        }}
                        className="rounded-lg bg-green-500 px-3 py-2 text-sm font-semibold text-white"
                      >
                        Complete Work
                      </button>
                    )}

                    {["COMPLETED", "CANCELLED"].includes(order.status) && (
                      <span className="text-sm text-slate-500">No actions</span>
                    )}
                  </td>


                  <td className="px-4 py-4 font-medium">
                    {formatCost(order.totalCost)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default WorkOrders;
