import { FormEvent, useEffect, useState } from "react";
import {
  createFacility,
  deleteFacility,
  getFacilities,
  updateFacility,
  type Facility,
} from "../api/facility.api";

const Facilities = () => {
  const [facilities, setFacilities] = useState<Facility[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [showForm, setShowForm] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [deletingId, setDeletingId] = useState<number | null>(null);

  const [editingFacilityId, setEditingFacilityId] = useState<number | null>(
    null
  );

  const [name, setName] = useState("");
  const [location, setLocation] = useState("");
  const [description, setDescription] = useState("");

  const loadFacilities = async () => {
    try {
      setError("");

      const data = await getFacilities();
      setFacilities(data);
    } catch (error) {
      console.error("Failed to load facilities:", error);
      setError("Failed to load facilities.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadFacilities();
  }, []);

  const resetForm = () => {
    setName("");
    setLocation("");
    setDescription("");
    setEditingFacilityId(null);
    setShowForm(false);
  };

  const handleCreateFacility = async (event: FormEvent) => {
    event.preventDefault();

    try {
      setSubmitting(true);
      setError("");

      const newFacility = await createFacility({
        name,
        location,
        description,
      });

      setFacilities((currentFacilities) => [
        newFacility,
        ...currentFacilities,
      ]);

      resetForm();
    } catch (error) {
      console.error("Failed to create facility:", error);
      setError("Failed to create facility.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleEditFacility = (facility: Facility) => {
    setEditingFacilityId(facility.id);
    setName(facility.name);
    setLocation(facility.location);
    setDescription(facility.description || "");
    setShowForm(true);
    setError("");
  };

  const handleUpdateFacility = async (event: FormEvent) => {
    event.preventDefault();

    if (editingFacilityId === null) {
      return;
    }

    try {
      setSubmitting(true);
      setError("");

      const updatedFacility = await updateFacility(
        editingFacilityId,
        {
          name,
          location,
          description,
        }
      );

      setFacilities((currentFacilities) =>
        currentFacilities.map((facility) =>
          facility.id === updatedFacility.id
            ? updatedFacility
            : facility
        )
      );

      resetForm();
    } catch (error) {
      console.error("Failed to update facility:", error);
      setError("Failed to update facility.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleSubmit = async (event: FormEvent) => {
    if (editingFacilityId !== null) {
      await handleUpdateFacility(event);
    } else {
      await handleCreateFacility(event);
    }
  };

  const handleDeleteFacility = async (facility: Facility) => {
    const confirmed = window.confirm(
      `Are you sure you want to delete "${facility.name}"? This action cannot be undone.`
    );

    if (!confirmed) {
      return;
    }

    try {
      setDeletingId(facility.id);
      setError("");

      await deleteFacility(facility.id);

      setFacilities((currentFacilities) =>
        currentFacilities.filter(
          (currentFacility) =>
            currentFacility.id !== facility.id
        )
      );
    } catch (error) {
      console.error("Failed to delete facility:", error);
      setError(
        "Failed to delete facility. It may have related records."
      );
    } finally {
      setDeletingId(null);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center text-white">
        <p className="text-slate-400">
          Loading facilities...
        </p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 text-white">
      {/* Header */}
      <header className="border-b border-slate-800">
        <div className="px-6 lg:px-8 py-5 flex items-center justify-between">
          <div>
            <p className="text-sm text-slate-500">
              Facility Management
            </p>

            <h1 className="text-2xl font-semibold mt-1">
              Facilities
            </h1>

            <p className="text-sm text-slate-500 mt-1">
              Manage facilities registered in the system.
            </p>
          </div>

          <button
            onClick={() => {
              if (showForm) {
                resetForm();
              } else {
                setShowForm(true);
              }
            }}
            className="px-5 py-3 rounded-xl bg-emerald-500 text-slate-950 font-semibold hover:bg-emerald-400 transition"
          >
            {showForm ? "Close Form" : "+ Add Facility"}
          </button>
        </div>
      </header>

      {/* Main Content */}
      <main className="p-6 lg:p-8">
        {/* Error */}
        {error && (
          <div className="mb-6 bg-red-500/10 border border-red-500/20 text-red-400 rounded-xl px-5 py-4">
            {error}
          </div>
        )}

        {/* Facility Form */}
        {showForm && (
          <div className="mb-6 bg-slate-900 border border-slate-800 rounded-2xl p-6">
            <div className="mb-6">
              <h2 className="text-lg font-semibold text-white">
                {editingFacilityId !== null
                  ? "Edit Facility"
                  : "Add New Facility"}
              </h2>

              <p className="text-sm text-slate-500 mt-1">
                {editingFacilityId !== null
                  ? "Update the facility information below."
                  : "Enter the details of the facility you want to register."}
              </p>
            </div>

            <form
              onSubmit={handleSubmit}
              className="space-y-5"
            >
              {/* Facility Name */}
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Facility Name
                </label>

                <input
                  type="text"
                  value={name}
                  onChange={(event) =>
                    setName(event.target.value)
                  }
                  placeholder="e.g. Main Estate Facility"
                  required
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-4 py-3 text-white placeholder:text-slate-600 focus:outline-none focus:border-emerald-500"
                />
              </div>

              {/* Location */}
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Location
                </label>

                <input
                  type="text"
                  value={location}
                  onChange={(event) =>
                    setLocation(event.target.value)
                  }
                  placeholder="e.g. Lekki Phase 1, Lagos"
                  required
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-4 py-3 text-white placeholder:text-slate-600 focus:outline-none focus:border-emerald-500"
                />
              </div>

              {/* Description */}
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Description
                </label>

                <textarea
                  value={description}
                  onChange={(event) =>
                    setDescription(event.target.value)
                  }
                  placeholder="Enter a brief description of the facility"
                  rows={4}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-4 py-3 text-white placeholder:text-slate-600 focus:outline-none focus:border-emerald-500 resize-none"
                />
              </div>

              {/* Buttons */}
              <div className="flex items-center gap-3">
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-5 py-3 rounded-xl bg-emerald-500 text-slate-950 font-semibold hover:bg-emerald-400 disabled:opacity-50 disabled:cursor-not-allowed transition"
                >
                  {submitting
                    ? editingFacilityId !== null
                      ? "Updating..."
                      : "Creating..."
                    : editingFacilityId !== null
                    ? "Update Facility"
                    : "Create Facility"}
                </button>

                <button
                  type="button"
                  onClick={resetForm}
                  className="px-5 py-3 rounded-xl bg-slate-800 text-slate-300 font-medium hover:bg-slate-700 transition"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Summary */}
        <div className="mb-6">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 w-fit">
            <p className="text-sm text-slate-500">
              Total Facilities
            </p>

            <p className="text-3xl font-bold mt-2">
              {facilities.length}
            </p>
          </div>
        </div>

        {/* Facilities Table */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden">
          <div className="p-6 border-b border-slate-800">
            <h2 className="font-semibold text-white">
              Registered Facilities
            </h2>

            <p className="text-sm text-slate-500 mt-1">
              Facilities currently available in the system.
            </p>
          </div>

          {facilities.length === 0 ? (
            <div className="p-10 text-center">
              <p className="text-slate-500">
                No facilities have been registered yet.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-slate-800 text-left">
                    <th className="px-6 py-4 text-sm font-medium text-slate-400">
                      Name
                    </th>

                    <th className="px-6 py-4 text-sm font-medium text-slate-400">
                      Location
                    </th>

                    <th className="px-6 py-4 text-sm font-medium text-slate-400">
                      Description
                    </th>

                    <th className="px-6 py-4 text-sm font-medium text-slate-400">
                      Created
                    </th>

                    <th className="px-6 py-4 text-sm font-medium text-slate-400">
                      Actions
                    </th>
                  </tr>
                </thead>

                <tbody>
                  {facilities.map((facility) => (
                    <tr
                      key={facility.id}
                      className="border-b border-slate-800 last:border-b-0 hover:bg-slate-800/40"
                    >
                      <td className="px-6 py-4">
                        <p className="font-medium text-white">
                          {facility.name}
                        </p>

                        <p className="text-xs text-slate-500 mt-1">
                          ID: {facility.id}
                        </p>
                      </td>

                      <td className="px-6 py-4 text-sm text-slate-300">
                        {facility.location}
                      </td>

                      <td className="px-6 py-4 text-sm text-slate-400">
                        {facility.description || "—"}
                      </td>

                      <td className="px-6 py-4 text-sm text-slate-400">
                        {new Date(
                          facility.createdAt
                        ).toLocaleDateString()}
                      </td>

                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() =>
                              handleEditFacility(facility)
                            }
                            className="px-4 py-2 rounded-lg bg-slate-800 text-emerald-400 hover:bg-emerald-500/10 transition"
                          >
                            Edit
                          </button>

                          <button
                            onClick={() =>
                              handleDeleteFacility(facility)
                            }
                            disabled={
                              deletingId === facility.id
                            }
                            className="px-4 py-2 rounded-lg bg-slate-800 text-red-400 hover:bg-red-500/10 disabled:opacity-50 disabled:cursor-not-allowed transition"
                          >
                            {deletingId === facility.id
                              ? "Deleting..."
                              : "Delete"}
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default Facilities;