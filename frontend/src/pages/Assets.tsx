import { useEffect, useState } from "react";
import {
  getAssets,
  type Asset,
} from "../api/asset.api";

const Assets = () => {
  const [assets, setAssets] = useState<Asset[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

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

  useEffect(() => {
    loadAssets();
  }, []);

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