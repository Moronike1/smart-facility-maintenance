import { useEffect, useState } from "react";
import {
  getAssets,
  createAsset,
  updateAsset,
  deleteAsset,
  assessAssetRisk,
  type Asset,
} from "../api/asset.api";

import {
  getFacilities,
  type Facility,
} from "../api/facility.api";


const Assets = () => {
  const [assets, setAssets] = useState<Asset[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

const [facilities, setFacilities] = useState<Facility[]>([]);
const [showForm, setShowForm] = useState(false);
const [saving, setSaving] = useState(false);
const [editingAsset, setEditingAsset] = useState<Asset | null>(null);

const [formData, setFormData] = useState({
  facilityId: "",
  name: "",
  category: "",
  serialNumber: "",
  description: "",
  installationDate: "",
  condition: "GOOD",
  criticality: "3",
});

  const loadAssets = async () => {
    try {
      setError("");

      const data = await getAssets();
      setAssets(data);
    } catch (error) {
      console.error("Failed to load assets:", error);
      setError("Failed to load assets.");
    } finally {
      setLoading(false);
    }
  };

  const loadFacilities = async () => {
  try {
    const data = await getFacilities();
    setFacilities(data);
  } catch (error) {
    console.error("Failed to load facilities:", error);
  }
};

  useEffect(() => {
  loadAssets();
  loadFacilities();
}, []);

const handleSaveAsset = async (
  event: React.FormEvent<HTMLFormElement>
) => {
  event.preventDefault();

  try {
    setSaving(true);
    setError("");

    const data = {
      facilityId: Number(formData.facilityId),
      name: formData.name,
      category: formData.category,
      serialNumber: formData.serialNumber || undefined,
      description: formData.description || undefined,
      installationDate:
        formData.installationDate || undefined,
      condition: formData.condition,
      criticality: Number(formData.criticality),
    };

    if (editingAsset) {
      await updateAsset(editingAsset.id, data);
    } else {
      await createAsset(data);
    }

    setFormData({
      facilityId: "",
      name: "",
      category: "",
      serialNumber: "",
      description: "",
      installationDate: "",
      condition: "GOOD",
      criticality: "3",
    });

    setEditingAsset(null);
    setShowForm(false);

    await loadAssets();
  } catch (error) {
    console.error("Failed to save asset:", error);
    setError(
      editingAsset
        ? "Failed to update asset."
        : "Failed to create asset."
    );
  } finally {
    setSaving(false);
  }
};

const handleEditAsset = (asset: Asset) => {
  setEditingAsset(asset);

  setFormData({
    facilityId: String(asset.facilityId),
    name: asset.name,
    category: asset.category,
    serialNumber: asset.serialNumber || "",
    description: asset.description || "",
    installationDate: asset.installationDate
      ? asset.installationDate.substring(0, 10)
      : "",
    condition: asset.condition,
    criticality: String(asset.criticality),
  });

  setShowForm(true);
};

const handleDeleteAsset = async (asset: Asset) => {
  const confirmed = window.confirm(
    `Are you sure you want to delete "${asset.name}"?`
  );

  if (!confirmed) return;

  try {
    await deleteAsset(asset.id);
    await loadAssets();
  } catch (err) {
    console.error(err);
    setError("Failed to delete asset.");
  }
};

const handleAssessRisk = async (asset: Asset) => {
  try {
    await assessAssetRisk(asset.id);
    await loadAssets();
  } catch (err) {
    console.error(err);
    setError("Failed to assess asset risk.");
  }
};


  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center text-white">
        <p className="text-slate-400">
          Loading assets...
        </p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center text-white">
        <p className="text-red-400">{error}</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 text-white">
      {/* Header */}
      <header className="border-b border-slate-800">
        <div className="px-6 lg:px-8 py-5">
          <p className="text-sm text-slate-500">
            Facility Management
          </p>

          <h1 className="text-2xl font-semibold mt-1">
            Assets
          </h1>

          <p className="text-sm text-slate-500 mt-1">
            Manage equipment and assets registered in the system.
          </p>
        </div>
      </header>

      {/* Content */}
      <main className="p-6 lg:p-8">
<div className="flex items-center justify-between mb-6">
  <div>
    <h2 className="text-lg font-semibold text-white">
      Asset Management
    </h2>

    <p className="text-sm text-slate-500 mt-1">
      Register and manage facility assets.
    </p>
  </div>

  <button
    type="button"
    onClick={() => setShowForm(!showForm)}
    className="px-4 py-2 rounded-lg bg-emerald-500 text-slate-950 font-medium hover:bg-emerald-400 transition"
  >
    {showForm ? "Close Form" : "+ Add Asset"}
  </button>
</div>

{showForm && (
  <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 mb-6">
    <div className="mb-6">
      <h2 className="text-lg font-semibold text-white">
  {editingAsset ? "Edit Asset" : "Register New Asset"}
</h2>

      <p className="text-sm text-slate-500 mt-1">
        {editingAsset
  ? "Update the details of this facility asset."
  : "Enter the details of the facility asset."}
      </p>
    </div>

    <form
      onSubmit={handleSaveAsset}
      className="grid grid-cols-1 md:grid-cols-2 gap-5"
    >
      {/* Facility */}
      <div>
        <label className="block text-sm text-slate-400 mb-2">
          Facility
        </label>

        <select
          required
          value={formData.facilityId}
          onChange={(e) =>
            setFormData({
              ...formData,
              facilityId: e.target.value,
            })
          }
          className="w-full rounded-lg bg-slate-950 border border-slate-700 px-4 py-3 text-white focus:outline-none focus:border-emerald-500"
        >
          <option value="">Select facility</option>

          {facilities.map((facility) => (
            <option
              key={facility.id}
              value={facility.id}
            >
              {facility.name}
            </option>
          ))}
        </select>
      </div>

      {/* Asset Name */}
      <div>
        <label className="block text-sm text-slate-400 mb-2">
          Asset Name
        </label>

        <input
          type="text"
          required
          value={formData.name}
          onChange={(e) =>
            setFormData({
              ...formData,
              name: e.target.value,
            })
          }
          placeholder="e.g. Diesel Generator"
          className="w-full rounded-lg bg-slate-950 border border-slate-700 px-4 py-3 text-white placeholder-slate-600 focus:outline-none focus:border-emerald-500"
        />
      </div>

      {/* Category */}
      <div>
        <label className="block text-sm text-slate-400 mb-2">
          Category
        </label>

        <input
          type="text"
          required
          value={formData.category}
          onChange={(e) =>
            setFormData({
              ...formData,
              category: e.target.value,
            })
          }
          placeholder="e.g. Power Equipment"
          className="w-full rounded-lg bg-slate-950 border border-slate-700 px-4 py-3 text-white placeholder-slate-600 focus:outline-none focus:border-emerald-500"
        />
      </div>

      {/* Serial Number */}
      <div>
        <label className="block text-sm text-slate-400 mb-2">
          Serial Number
        </label>

        <input
          type="text"
          value={formData.serialNumber}
          onChange={(e) =>
            setFormData({
              ...formData,
              serialNumber: e.target.value,
            })
          }
          placeholder="e.g. GEN-002"
          className="w-full rounded-lg bg-slate-950 border border-slate-700 px-4 py-3 text-white placeholder-slate-600 focus:outline-none focus:border-emerald-500"
        />
      </div>

      {/* Installation Date */}
      <div>
        <label className="block text-sm text-slate-400 mb-2">
          Installation Date
        </label>

        <input
          type="date"
          value={formData.installationDate}
          onChange={(e) =>
            setFormData({
              ...formData,
              installationDate: e.target.value,
            })
          }
          className="w-full rounded-lg bg-slate-950 border border-slate-700 px-4 py-3 text-white focus:outline-none focus:border-emerald-500"
        />
      </div>

      {/* Condition */}
      <div>
        <label className="block text-sm text-slate-400 mb-2">
          Condition
        </label>

        <select
          value={formData.condition}
          onChange={(e) =>
            setFormData({
              ...formData,
              condition: e.target.value,
            })
          }
          className="w-full rounded-lg bg-slate-950 border border-slate-700 px-4 py-3 text-white focus:outline-none focus:border-emerald-500"
        >
          <option value="GOOD">Good</option>
          <option value="FAIR">Fair</option>
          <option value="POOR">Poor</option>
          <option value="CRITICAL">Critical</option>
        </select>
      </div>

      {/* Criticality */}
      <div>
        <label className="block text-sm text-slate-400 mb-2">
          Criticality (1–5)
        </label>

        <select
          value={formData.criticality}
          onChange={(e) =>
            setFormData({
              ...formData,
              criticality: e.target.value,
            })
          }
          className="w-full rounded-lg bg-slate-950 border border-slate-700 px-4 py-3 text-white focus:outline-none focus:border-emerald-500"
        >
          <option value="1">1 — Very Low</option>
          <option value="2">2 — Low</option>
          <option value="3">3 — Moderate</option>
          <option value="4">4 — High</option>
          <option value="5">5 — Very High</option>
        </select>
      </div>

      {/* Description */}
      <div className="md:col-span-2">
        <label className="block text-sm text-slate-400 mb-2">
          Description
        </label>

        <textarea
          rows={4}
          value={formData.description}
          onChange={(e) =>
            setFormData({
              ...formData,
              description: e.target.value,
            })
          }
          placeholder="Describe the asset..."
          className="w-full rounded-lg bg-slate-950 border border-slate-700 px-4 py-3 text-white placeholder-slate-600 focus:outline-none focus:border-emerald-500 resize-none"
        />
      </div>

      {/* Actions */}
      <div className="md:col-span-2 flex justify-end gap-3 pt-2">
        <button
          type="button"
          onClick={() => setShowForm(false)}
          className="px-4 py-2 rounded-lg border border-slate-700 text-slate-300 hover:bg-slate-800 transition"
        >
          Cancel
        </button>

        <button
          type="submit"
          disabled={saving}
          className="px-5 py-2 rounded-lg bg-emerald-500 text-slate-950 font-medium hover:bg-emerald-400 disabled:opacity-50 transition"
        >
{saving
  ? "Saving..."
  : editingAsset
    ? "Update Asset"
    : "Save Asset"}
        </button>
      </div>
    </form>
  </div>
)}

        {/* Summary */}
        <div className="mb-6">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 w-fit">
            <p className="text-sm text-slate-500">
              Total Assets
            </p>

            <p className="text-3xl font-bold mt-2">
              {assets.length}
            </p>
          </div>
        </div>

        {/* Assets Table */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden">
          <div className="p-6 border-b border-slate-800">
            <h2 className="font-semibold text-white">
              Registered Assets
            </h2>

            <p className="text-sm text-slate-500 mt-1">
              Assets currently registered in the system.
            </p>
          </div>

          {assets.length === 0 ? (
            <div className="p-10 text-center">
              <p className="text-slate-500">
                No assets have been registered yet.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-slate-800 text-left">
                    <th className="px-6 py-4 text-sm font-medium text-slate-400">
                      Asset
                    </th>

                    <th className="px-6 py-4 text-sm font-medium text-slate-400">
                      Category
                    </th>

                    <th className="px-6 py-4 text-sm font-medium text-slate-400">
                      Facility
                    </th>

                    <th className="px-6 py-4 text-sm font-medium text-slate-400">
                      Condition
                    </th>

                    <th className="px-6 py-4 text-sm font-medium text-slate-400">
                      Risk
                    </th>

                    <th className="px-6 py-4 text-sm font-medium text-slate-400">
                      Criticality
                    </th>

                    <th className="px-6 py-4 text-sm font-medium text-slate-400">
  Actions
</th>
                  </tr>
                </thead>

                <tbody>
                  {assets.map((asset) => (
                    <tr
                      key={asset.id}
                      className="border-b border-slate-800 last:border-b-0 hover:bg-slate-800/40"
                    >
                      <td className="px-6 py-4">
                        <p className="font-medium text-white">
                          {asset.name}
                        </p>

                        <p className="text-xs text-slate-500 mt-1">
                          ID: {asset.id}
                        </p>

                        {asset.serialNumber && (
                          <p className="text-xs text-slate-500">
                            Serial: {asset.serialNumber}
                          </p>
                        )}
                      </td>

                      <td className="px-6 py-4 text-sm text-slate-300">
                        {asset.category}
                      </td>

                      <td className="px-6 py-4 text-sm text-slate-300">
                        {asset.facility?.name || "—"}
                      </td>

                      <td className="px-6 py-4">
                        <span className="text-sm text-slate-300">
                          {asset.condition}
                        </span>
                      </td>

                      <td className="px-6 py-4">
                        <span className="text-sm text-slate-300">
                          {asset.riskLevel}
                        </span>
                      </td>

                      <td className="px-6 py-4 text-sm text-slate-300">
                        {asset.criticality}/5
                      </td>
                     <td className="px-6 py-4">
  <div className="flex gap-2">
    <button
      type="button"
      onClick={() => handleEditAsset(asset)}
      className="px-3 py-1.5 rounded-lg border border-slate-700 text-sm text-slate-300 hover:bg-slate-800 hover:text-white transition"
    >
      Edit
    </button>

    <button
      type="button"
      onClick={() => handleDeleteAsset(asset)}
      className="px-3 py-1.5 rounded-lg border border-red-900 text-sm text-red-400 hover:bg-red-950 hover:text-red-300 transition"
    >
      Delete
    </button>
    <button
  type="button"
  onClick={() => handleAssessRisk(asset)}
  className="px-3 py-1.5 rounded-lg border border-blue-900 text-sm text-blue-400 hover:bg-blue-950 hover:text-blue-300 transition"
>
  Assess Risk
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

export default Assets;