
import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  getMaintenanceRequests,
  type MaintenanceRequest,
} from "../api/maintenanceRequest.api";


const statusStyles: Record<string, string> = {
  PENDING: "bg-amber-950 text-amber-300 border-amber-800",
  APPROVED: "bg-blue-950 text-blue-300 border-blue-800",
  ASSIGNED: "bg-purple-950 text-purple-300 border-purple-800",
  IN_PROGRESS: "bg-cyan-950 text-cyan-300 border-cyan-800",
  COMPLETED: "bg-emerald-950 text-emerald-300 border-emerald-800",
  CANCELLED: "bg-red-950 text-red-300 border-red-800",
};

export default function MyRequests() {
  const [requests, setRequests] = useState<MaintenanceRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const loadRequests = async () => {
      try {
        setLoading(true);
        setError("");

        const data = await getMaintenanceRequests();
        setRequests(data);
      } catch (err: any) {
        setError(
          err?.response?.data?.message ||
          "Unable to load your maintenance requests."
        );
      } finally {
        setLoading(false);
      }
    };

    loadRequests();
  }, []);

  const formatStatus = (status: string) =>
    status.replaceAll("_", " ");

  const getStatusProgress = (status: string) => {
    const stages = [
      "PENDING",
      "APPROVED",
      "ASSIGNED",
      "IN_PROGRESS",
      "COMPLETED",
    ];

    if (status === "REJECTED" || status === "CANCELLED") {
      return {
        currentStage: -1,
        stages,
        terminalStatus: status,
      };
    }

    return {
      currentStage: stages.indexOf(status),
      stages,
      terminalStatus: null,
    };
  };


  return (
    <div className="min-h-screen bg-slate-950 px-4 py-8 sm:px-6 lg:px-10">
      <div className="mx-auto max-w-6xl">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <p className="text-sm font-semibold uppercase tracking-wider text-cyan-400">
              Resident Portal
            </p>

            <h1 className="mt-2 text-3xl font-bold text-white">
              My Maintenance Requests
            </h1>

            <p className="mt-2 text-sm text-slate-400">
              View and track the progress of your maintenance submissions.
            </p>
          </div>

          <Link
            to="/my-request"
            className="rounded-lg bg-cyan-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-cyan-500"
          >
            + New Request
          </Link>
        </div>

        {loading && (
          <div className="mt-8 rounded-xl border border-slate-800 bg-slate-900 p-8 text-center text-slate-400">
            Loading your maintenance requests...
          </div>
        )}

        {error && (
          <div className="mt-8 rounded-xl border border-red-800 bg-red-950/40 p-5 text-red-300">
            {error}
          </div>
        )}

        {!loading && !error && requests.length === 0 && (
          <div className="mt-8 rounded-xl border border-slate-800 bg-slate-900 p-10 text-center">
            <div className="text-4xl text-slate-500">☷</div>

            <h2 className="mt-4 text-xl font-semibold text-white">
              No Maintenance Requests Yet
            </h2>

            <p className="mt-2 text-sm text-slate-400">
              You haven't submitted any maintenance requests.
            </p>

            <Link
              to="/my-request"
              className="mt-6 inline-flex rounded-lg bg-cyan-600 px-5 py-3 text-sm font-semibold text-white hover:bg-cyan-500"
            >
              Report a Maintenance Issue
            </Link>
          </div>
        )}

        {!loading && !error && requests.length > 0 && (
          <>
            <div className="mt-8 grid gap-4 sm:grid-cols-3">
              <div className="rounded-xl border border-slate-800 bg-slate-900 p-5">
                <p className="text-sm text-slate-400">Total Requests</p>
                <p className="mt-2 text-3xl font-bold text-white">
                  {requests.length}
                </p>
              </div>

              <div className="rounded-xl border border-slate-800 bg-slate-900 p-5">
                <p className="text-sm text-slate-400">Pending</p>
                <p className="mt-2 text-3xl font-bold text-amber-400">
                  {requests.filter((r) => r.status === "PENDING").length}
                </p>
              </div>

              <div className="rounded-xl border border-slate-800 bg-slate-900 p-5">
                <p className="text-sm text-slate-400">Completed</p>
                <p className="mt-2 text-3xl font-bold text-emerald-400">
                  {requests.filter((r) => r.status === "COMPLETED").length}
                </p>
              </div>
            </div>

            <div className="mt-8 space-y-5">
              {requests.map((request) => (
                <article
                  key={request.id}
                  className="rounded-xl border border-slate-800 bg-slate-900 p-5 sm:p-6"
                >
                  <div className="flex flex-wrap items-start justify-between gap-4">
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-wider text-cyan-400">
                        {request.requestNumber}
                      </p>

                      <h2 className="mt-2 text-lg font-semibold text-white">
                        {request.category}
                      </h2>
                    </div>

                    <span
                      className={`rounded-full border px-3 py-1.5 text-xs font-semibold ${statusStyles[request.status] ||
                        "border-slate-700 bg-slate-800 text-slate-300"
                        }`}
                    >
                      {formatStatus(request.status)}
                    </span>
                  </div>

                  <p className="mt-4 text-sm leading-6 text-slate-300">
                    {request.description}
                  </p>


                  {(() => {
                    const progress = getStatusProgress(request.status);

                    if (progress.terminalStatus) {
                      return (
                        <div className="mt-5 rounded-lg border border-red-900/60 bg-red-950/30 p-4">
                          <p className="text-sm font-semibold text-red-400">
                            Request {progress.terminalStatus.toLowerCase()}
                          </p>
                          <p className="mt-1 text-xs text-slate-400">
                            {request.statusReason ||
                              (progress.terminalStatus === "REJECTED"
                                ? "This request was not approved."
                                : "This request has been cancelled.")}
                          </p>
                        </div>
                      );
                    }

                    return (
                      <div className="mt-6 rounded-lg border border-slate-800 bg-slate-950/50 p-4">
                        <h3 className="mb-4 text-sm font-semibold text-white">
                          Maintenance Progress
                        </h3>

                        <div className="flex items-center">
                          {progress.stages.map((stage, index) => {
                            const completed = index <= progress.currentStage;

                            return (
                              <React.Fragment key={stage}>
                                <div className="flex flex-col items-center">
                                  <div
                                    className={`flex h-7 w-7 items-center justify-center rounded-full text-xs font-bold ${completed
                                        ? "bg-cyan-500 text-slate-950"
                                        : "border border-slate-700 bg-slate-900 text-slate-500"
                                      }`}
                                  >
                                    {completed ? "✓" : index + 1}
                                  </div>

                                  <span className="mt-2 text-center text-[10px] text-slate-400 sm:text-xs">
                                    {formatStatus(stage)}
                                  </span>
                                </div>

                                {index < progress.stages.length - 1 && (
                                  <div
                                    className={`mx-1 mb-5 h-1 flex-1 rounded ${index < progress.currentStage
                                        ? "bg-cyan-500"
                                        : "bg-slate-700"
                                      }`}
                                  />
                                )}
                              </React.Fragment>
                            );
                          })}
                        </div>
                      </div>
                    );
                  })()}


                  <div className="mt-5 grid gap-4 border-t border-slate-800 pt-5 sm:grid-cols-2 lg:grid-cols-4">
                    <div>
                      <p className="text-xs text-slate-500">Location</p>
                      <p className="mt-1 text-sm text-slate-300">
                        {request.locationDescription || "Not specified"}
                      </p>
                    </div>

                    <div>
                      <p className="text-xs text-slate-500">Location Type</p>
                      <p className="mt-1 text-sm text-slate-300">
                        {request.locationType?.replaceAll("_", " ") || "Not specified"}
                      </p>
                    </div>

                    <div>
                      <p className="text-xs text-slate-500">Severity</p>
                      <p className="mt-1 text-sm text-slate-300">
                        {request.severity}
                      </p>
                    </div>

                    <div>
                      <p className="text-xs text-slate-500">Priority</p>
                      <p className="mt-1 text-sm text-slate-300">
                        {request.priority}
                      </p>
                    </div>
                  </div>

                  <div className="mt-5 flex flex-wrap items-center justify-between gap-3 border-t border-slate-800 pt-4">
                    <p className="text-xs text-slate-500">
                      Submitted:{" "}
                      {new Date(request.createdAt).toLocaleDateString()}
                    </p>

                    {request.workOrder && (
                      <p className="text-xs text-cyan-400">
                        Work order: {request.workOrder.status.replaceAll("_", " ")}
                      </p>
                    )}
                  </div>
                </article>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
