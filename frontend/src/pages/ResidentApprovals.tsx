
import { useCallback, useEffect, useState } from "react";
import {
  approveResident,
  getResidentsByStatus,
  rejectResident,
  type Resident,
} from "../api/user.api";

type ResidentStatus = "PENDING" | "ACTIVE" | "REJECTED";

const tabs: { label: string; status: ResidentStatus }[] = [
  { label: "Pending", status: "PENDING" },
  { label: "Approved", status: "ACTIVE" },
  { label: "Rejected", status: "REJECTED" },
];

const ResidentApprovals = () => {
  const [residents, setResidents] = useState<Resident[]>([]);
  const [activeStatus, setActiveStatus] =
    useState<ResidentStatus>("PENDING");
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [processingId, setProcessingId] = useState<number | null>(null);

  const loadResidents = useCallback(async () => {
    setLoading(true);
    setError("");

    try {
      const data = await getResidentsByStatus(activeStatus);
      setResidents(data);
    } catch (err: any) {
      console.error("Failed to load residents:", err);
      setError(
        err?.response?.data?.message ||
          "Unable to load resident records."
      );
    } finally {
      setLoading(false);
    }
  }, [activeStatus]);

  useEffect(() => {
    loadResidents();
  }, [loadResidents]);

  const handleApprove = async (id: number) => {
    setProcessingId(id);
    setError("");
    setSuccess("");

    try {
      await approveResident(id);
      setSuccess("Resident application approved successfully.");
      await loadResidents();
    } catch (err: any) {
      console.error("Failed to approve resident:", err);
      setError(
        err?.response?.data?.message ||
          "Unable to approve this resident application."
      );
    } finally {
      setProcessingId(null);
    }
  };

  const handleReject = async (id: number) => {
    const confirmed = window.confirm(
      "Are you sure you want to reject this resident application?"
    );

    if (!confirmed) return;

    setProcessingId(id);
    setError("");
    setSuccess("");

    try {
      await rejectResident(id);
      setSuccess("Resident application rejected successfully.");
      await loadResidents();
    } catch (err: any) {
      console.error("Failed to reject resident:", err);
      setError(
        err?.response?.data?.message ||
          "Unable to reject this resident application."
      );
    } finally {
      setProcessingId(null);
    }
  };

  const filteredResidents = residents.filter((resident) => {
    const search = searchTerm.toLowerCase().trim();

    return (
      resident.name.toLowerCase().includes(search) ||
      resident.email.toLowerCase().includes(search) ||
      (resident.phone || "").toLowerCase().includes(search) ||
      (resident.address || "").toLowerCase().includes(search)
    );
  });

  const currentTab = tabs.find(
    (tab) => tab.status === activeStatus
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            Resident Approvals
          </h1>
          <p className="mt-1 text-sm text-gray-500">
            Review and manage resident registration applications.
          </p>
        </div>

        <button
          onClick={loadResidents}
          disabled={loading}
          className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50"
        >
          {loading ? "Refreshing..." : "Refresh"}
        </button>
      </div>

      <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
        <p className="text-sm text-gray-500">
          {currentTab?.label} Residents
        </p>
        <p className="mt-2 text-3xl font-bold text-gray-900">
          {residents.length}
        </p>
      </div>

      <div className="border-b border-gray-200">
        <div className="flex gap-6 overflow-x-auto">
          {tabs.map((tab) => (
            <button
              key={tab.status}
              onClick={() => {
                setActiveStatus(tab.status);
                setSearchTerm("");
                setError("");
                setSuccess("");
              }}
              className={`whitespace-nowrap border-b-2 px-1 py-3 text-sm font-semibold transition-colors ${
                activeStatus === tab.status
                  ? "border-emerald-600 text-emerald-700"
                  : "border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      <div>
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="Search by name, email, phone or address..."
          className="w-full rounded-lg border border-gray-300 px-4 py-3 text-sm outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100"
        />
      </div>

      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700">
          {error}
        </div>
      )}

      {success && (
        <div className="rounded-lg border border-green-200 bg-green-50 p-4 text-sm text-green-700">
          {success}
        </div>
      )}

      <div className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
        {loading ? (
          <div className="p-10 text-center text-gray-500">
            Loading resident records...
          </div>
        ) : filteredResidents.length === 0 ? (
          <div className="p-10 text-center">
            <h3 className="text-lg font-semibold text-gray-800">
              {searchTerm
                ? "No Matching Residents"
                : `No ${currentTab?.label} Residents`}
            </h3>
            <p className="mt-2 text-sm text-gray-500">
              {searchTerm
                ? "Try a different search term."
                : "There are currently no resident records in this category."}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">
                    Resident
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">
                    Contact Details
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">
                    Address
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">
                    Registration Date
                  </th>
                  {activeStatus === "PENDING" && (
                    <th className="px-6 py-3 text-right text-xs font-semibold uppercase tracking-wider text-gray-500">
                      Actions
                    </th>
                  )}
                </tr>
              </thead>

              <tbody className="divide-y divide-gray-200 bg-white">
                {filteredResidents.map((resident) => (
                  <tr key={resident.id} className="hover:bg-gray-50">
                    <td className="whitespace-nowrap px-6 py-4">
                      <p className="font-medium text-gray-900">
                        {resident.name}
                      </p>
                      <p className="text-xs text-gray-500">
                        ID: {resident.id}
                      </p>
                    </td>

                    <td className="px-6 py-4">
                      <p className="text-sm text-gray-700">
                        {resident.email}
                      </p>
                      <p className="mt-1 text-sm text-gray-500">
                        {resident.phone || "No phone provided"}
                      </p>
                    </td>

                    <td className="px-6 py-4 text-sm text-gray-700">
                      {resident.address || "Not provided"}
                    </td>

                    <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-600">
                      {new Date(resident.createdAt).toLocaleDateString()}
                    </td>

                    {activeStatus === "PENDING" && (
                      <td className="whitespace-nowrap px-6 py-4 text-right">
                        <div className="flex justify-end gap-2">
                          <button
                            onClick={() => handleApprove(resident.id)}
                            disabled={processingId !== null}
                            className="rounded-lg bg-emerald-600 px-3 py-2 text-xs font-semibold text-white hover:bg-emerald-700 disabled:opacity-50"
                          >
                            {processingId === resident.id
                              ? "Processing..."
                              : "Approve"}
                          </button>

                          <button
                            onClick={() => handleReject(resident.id)}
                            disabled={processingId !== null}
                            className="rounded-lg border border-red-200 px-3 py-2 text-xs font-semibold text-red-600 hover:bg-red-50 disabled:opacity-50"
                          >
                            Reject
                          </button>
                        </div>
                      </td>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default ResidentApprovals;