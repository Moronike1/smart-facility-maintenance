
import { useState } from "react";
import {
  createMaintenanceRequest,
  type CreateMaintenanceRequestData,
} from "../api/maintenanceRequest.api";

export default function ResidentRequests() {
  const [formData, setFormData] = useState<CreateMaintenanceRequestData>({
    locationType: "PRIVATE_UNIT",
    locationDescription: "",
    category: "PLUMBING",
    description: "",
    severity: "MEDIUM",
    operationalImpact: 1,
    urgency: 1,
  });

  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState("");
  const [error, setError] = useState("");

  const handleChange = (
    event: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    const { name, value } = event.target;

    setFormData((previous) => ({
      ...previous,
      [name]:
        name === "operationalImpact" || name === "urgency"
          ? Number(value)
          : value,
    }));
  };

  const handleSubmit = async (
    event: React.FormEvent<HTMLFormElement>
  ) => {
    event.preventDefault();

    setLoading(true);
    setSuccess("");
    setError("");

    try {
      const response = await createMaintenanceRequest(formData);

      setSuccess(
        `Your maintenance request ${response.requestNumber} was submitted successfully.`
      );

      setFormData({
        locationType: "PRIVATE_UNIT",
        locationDescription: "",
        category: "PLUMBING",
        description: "",
        severity: "MEDIUM",
        operationalImpact: 1,
        urgency: 1,
      });
    } catch (err: any) {
      setError(
        err?.response?.data?.message ||
          "Unable to submit your maintenance request. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 px-4 py-8 sm:px-6 lg:px-10">
      <div className="mx-auto max-w-4xl">
        <div className="mb-8">
          <p className="text-sm font-semibold uppercase tracking-wider text-cyan-400">
            Resident Portal
          </p>

          <h1 className="mt-2 text-3xl font-bold text-white">
            Report a Maintenance Issue
          </h1>

          <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-400">
            Report a maintenance problem in your apartment or anywhere
            within the shared estate facilities. Your Facility Manager
            will review your submission.
          </p>
        </div>

        <form
          onSubmit={handleSubmit}
          className="space-y-7 rounded-2xl border border-slate-800 bg-slate-900 p-5 shadow-xl sm:p-8"
        >
          {success && (
            <div className="rounded-lg border border-emerald-700 bg-emerald-950/50 p-4 text-sm text-emerald-300">
              {success}
            </div>
          )}

          {error && (
            <div className="rounded-lg border border-red-700 bg-red-950/50 p-4 text-sm text-red-300">
              {error}
            </div>
          )}

          <section>
            <h2 className="mb-4 text-lg font-semibold text-white">
              1. Where is the problem?
            </h2>

            <label className="mb-2 block text-sm font-medium text-slate-300">
              Location Type
            </label>

            <select
              name="locationType"
              value={formData.locationType}
              onChange={handleChange}
              className="w-full rounded-lg border border-slate-700 bg-slate-800 px-4 py-3 text-white outline-none focus:border-cyan-500"
              required
            >
              <option value="PRIVATE_UNIT">Private Unit / Apartment</option>
              <option value="SHARED_FACILITY">Shared Estate Facility</option>
            </select>

            <label className="mb-2 mt-5 block text-sm font-medium text-slate-300">
              {formData.locationType === "PRIVATE_UNIT"
                ? "Apartment / Unit Location"
                : "Facility / Problem Location"}
            </label>

            <input
              type="text"
              name="locationDescription"
              value={formData.locationDescription}
              onChange={handleChange}
              placeholder={
                formData.locationType === "PRIVATE_UNIT"
                  ? "e.g. Block B, Apartment 5, Kitchen"
                  : "e.g. Road C streetlight, main drainage, generator house"
              }
              className="w-full rounded-lg border border-slate-700 bg-slate-800 px-4 py-3 text-white outline-none placeholder:text-slate-500 focus:border-cyan-500"
              required
            />
          </section>

          <div className="border-t border-slate-800" />

          <section>
            <h2 className="mb-4 text-lg font-semibold text-white">
              2. Maintenance Details
            </h2>

            <label className="mb-2 block text-sm font-medium text-slate-300">
              Maintenance Category
            </label>

            <select
              name="category"
              value={formData.category}
              onChange={handleChange}
              className="w-full rounded-lg border border-slate-700 bg-slate-800 px-4 py-3 text-white outline-none focus:border-cyan-500"
              required
            >
              <option value="ELECTRICAL">Electrical</option>
              <option value="PLUMBING">Plumbing</option>
              <option value="HVAC">HVAC / Air Conditioning</option>
              <option value="STRUCTURAL">Structural / Building</option>
              <option value="SECURITY">Security</option>
              <option value="CLEANING">Cleaning / Sanitation</option>
              <option value="EQUIPMENT">Equipment / Machinery</option>
              <option value="OTHER">Other</option>
            </select>

            <label className="mb-2 mt-5 block text-sm font-medium text-slate-300">
              Describe the Problem
            </label>

            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              rows={5}
              placeholder="Describe the maintenance issue, when it started and any other useful details..."
              className="w-full resize-y rounded-lg border border-slate-700 bg-slate-800 px-4 py-3 text-white outline-none placeholder:text-slate-500 focus:border-cyan-500"
              required
            />
          </section>

          <div className="border-t border-slate-800" />

          <section>
            <h2 className="mb-4 text-lg font-semibold text-white">
              3. Assess the Problem
            </h2>

            <label className="mb-2 block text-sm font-medium text-slate-300">
              Severity
            </label>

            <select
              name="severity"
              value={formData.severity}
              onChange={handleChange}
              className="w-full rounded-lg border border-slate-700 bg-slate-800 px-4 py-3 text-white outline-none focus:border-cyan-500"
              required
            >
              <option value="LOW">Low</option>
              <option value="MEDIUM">Medium</option>
              <option value="HIGH">High</option>
              <option value="CRITICAL">Critical</option>
            </select>

            <div className="mt-6 grid gap-6 sm:grid-cols-2">
              <div>
                <label className="mb-2 block text-sm font-medium text-slate-300">
                  Operational Impact (1–5)
                </label>

                <select
                  name="operationalImpact"
                  value={formData.operationalImpact}
                  onChange={handleChange}
                  className="w-full rounded-lg border border-slate-700 bg-slate-800 px-4 py-3 text-white outline-none focus:border-cyan-500"
                >
                  <option value={1}>1 - Minimal</option>
                  <option value={2}>2 - Low</option>
                  <option value={3}>3 - Moderate</option>
                  <option value={4}>4 - High</option>
                  <option value={5}>5 - Severe</option>
                </select>
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-slate-300">
                  Urgency (1–5)
                </label>

                <select
                  name="urgency"
                  value={formData.urgency}
                  onChange={handleChange}
                  className="w-full rounded-lg border border-slate-700 bg-slate-800 px-4 py-3 text-white outline-none focus:border-cyan-500"
                >
                  <option value={1}>1 - Can Wait</option>
                  <option value={2}>2 - Low</option>
                  <option value={3}>3 - Normal</option>
                  <option value={4}>4 - Urgent</option>
                  <option value={5}>5 - Immediate Attention</option>
                </select>
              </div>
            </div>
          </section>

          <div className="border-t border-slate-800" />

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-lg bg-cyan-600 px-6 py-3.5 font-semibold text-white transition hover:bg-cyan-500 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {loading ? "Submitting Request..." : "Submit Maintenance Request"}
          </button>

          <p className="text-center text-xs text-slate-500">
            Your request will be linked automatically to your resident account.
          </p>
        </form>
      </div>
    </div>
  );
}
