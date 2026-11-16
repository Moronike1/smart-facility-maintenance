
import { useState } from "react";
import type { FormEvent } from "react";
import { Link } from "react-router-dom";
import { registerResident } from "../api/auth.api";

const ResidentRegister = () => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);

  const handleRegister = async (
    event: FormEvent<HTMLFormElement>
  ) => {
    event.preventDefault();

    setError("");
    setSuccess("");

    if (password.length < 8) {
      setError("Password must be at least 8 characters long.");
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    setLoading(true);

    try {
      const response = await registerResident({
        name: name.trim(),
        email: email.trim(),
        phone: phone.trim(),
        address: address.trim(),
        password,
      });

      setSuccess(response.message);

      // Clear the form after successful registration.
      setName("");
      setEmail("");
      setPhone("");
      setAddress("");
      setPassword("");
      setConfirmPassword("");
    } catch (err: any) {
      console.error("Resident registration failed:", err);

      setError(
        err?.response?.data?.message ||
        "Registration failed. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-950 px-4 py-10 text-white">
      <div className="w-full max-w-lg">

        {/* Header */}
        <header className="mb-8 text-center">
          <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-2xl border border-cyan-400/30 bg-cyan-400/10">
            <svg
              viewBox="0 0 24 24"
              fill="none"
              className="h-9 w-9 text-cyan-400"
              aria-hidden="true"
            >
              <path
                d="M3 21h18M5 21V7l7-4 7 4v14M9 10h2m2 0h2M9 14h2m2 0h2M10 21v-4h4v4"
                stroke="currentColor"
                strokeWidth="1.7"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </div>

          <h1 className="text-2xl font-bold sm:text-3xl">
            Smart Facility
            <span className="block text-cyan-400">
              Maintenance System
            </span>
          </h1>

          <p className="mt-3 text-sm text-slate-400">
            Resident Registration Portal
          </p>
        </header>

        {/* Registration Form */}
        <section className="rounded-2xl border border-slate-800 bg-slate-900/90 p-6 shadow-2xl sm:p-8">

          <div className="mb-7">
            <h2 className="text-xl font-semibold">
              Create Resident Account
            </h2>

            <p className="mt-2 text-sm text-slate-400">
              Register to report maintenance issues and track
              your requests.
            </p>
          </div>

          <form onSubmit={handleRegister} className="space-y-5">

            {/* Full Name */}
            <div>
              <label
                htmlFor="name"
                className="mb-2 block text-sm font-medium text-slate-200"
              >
                Full Name *
              </label>

              <input
                id="name"
                type="text"
                value={name}
                onChange={(event) => setName(event.target.value)}
                placeholder="Enter your full name"
                required
                autoComplete="name"
                className="w-full rounded-lg border border-slate-700 bg-slate-950 p-3 text-sm text-white outline-none placeholder:text-slate-500 focus:border-cyan-400 focus:ring-2 focus:ring-cyan-400/20"
              />
            </div>

            {/* Email */}
            <div>
              <label
                htmlFor="email"
                className="mb-2 block text-sm font-medium text-slate-200"
              >
                Email Address *
              </label>

              <input
                id="email"
                type="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                placeholder="you@example.com"
                required
                autoComplete="email"
                className="w-full rounded-lg border border-slate-700 bg-slate-950 p-3 text-sm text-white outline-none placeholder:text-slate-500 focus:border-cyan-400 focus:ring-2 focus:ring-cyan-400/20"
              />
            </div>

            {/* Phone */}
            <div>
              <label
                htmlFor="phone"
                className="mb-2 block text-sm font-medium text-slate-200"
              >
                Phone Number
              </label>

              <input
                id="phone"
                type="tel"
                value={phone}
                onChange={(event) => setPhone(event.target.value)}
                placeholder="Enter your phone number"
                autoComplete="tel"
                className="w-full rounded-lg border border-slate-700 bg-slate-950 p-3 text-sm text-white outline-none placeholder:text-slate-500 focus:border-cyan-400 focus:ring-2 focus:ring-cyan-400/20"
              />
            </div>

            {/* Address */}
            <div>
              <label
                htmlFor="address"
                className="mb-2 block text-sm font-medium text-slate-200"
              >
                Residential Address / Apartment
              </label>

              <input
                id="address"
                type="text"
                value={address}
                onChange={(event) => setAddress(event.target.value)}
                placeholder="e.g. Apartment 4, Block B"
                autoComplete="street-address"
                className="w-full rounded-lg border border-slate-700 bg-slate-950 p-3 text-sm text-white outline-none placeholder:text-slate-500 focus:border-cyan-400 focus:ring-2 focus:ring-cyan-400/20"
              />
            </div>

            {/* Password */}
            <div>
              <label
                htmlFor="password"
                className="mb-2 block text-sm font-medium text-slate-200"
              >
                Password *
              </label>

              <input
                id="password"
                type="password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                placeholder="Minimum 8 characters"
                required
                minLength={8}
                autoComplete="new-password"
                className="w-full rounded-lg border border-slate-700 bg-slate-950 p-3 text-sm text-white outline-none placeholder:text-slate-500 focus:border-cyan-400 focus:ring-2 focus:ring-cyan-400/20"
              />
            </div>

            {/* Confirm Password */}
            <div>
              <label
                htmlFor="confirmPassword"
                className="mb-2 block text-sm font-medium text-slate-200"
              >
                Confirm Password *
              </label>

              <input
                id="confirmPassword"
                type="password"
                value={confirmPassword}
                onChange={(event) =>
                  setConfirmPassword(event.target.value)
                }
                placeholder="Enter your password again"
                required
                autoComplete="new-password"
                className="w-full rounded-lg border border-slate-700 bg-slate-950 p-3 text-sm text-white outline-none placeholder:text-slate-500 focus:border-cyan-400 focus:ring-2 focus:ring-cyan-400/20"
              />
            </div>

            {/* Error Message */}
            {error && (
              <div
                role="alert"
                className="rounded-lg border border-red-500/30 bg-red-500/10 p-3 text-sm text-red-300"
              >
                {error}
              </div>
            )}

            {/* Success Message */}
            {success && (
              <div
                role="status"
                className="rounded-lg border border-green-500/30 bg-green-500/10 p-4 text-sm text-green-300"
              >
                <p className="font-semibold">
                  Registration submitted successfully!
                </p>

                <p className="mt-2">{success}</p>

                <p className="mt-2">
                  You can sign in once the Facility Manager
                  approves your account.
                </p>

                <Link
                  to="/login"
                  className="mt-4 inline-block font-semibold text-cyan-400 hover:text-cyan-300"
                >
                  Return to Login
                </Link>
              </div>
            )}

            {/* Submit */}
            {!success && (
              <button
                type="submit"
                disabled={loading}
                className="flex w-full items-center justify-center gap-2 rounded-lg bg-cyan-400 px-4 py-3 font-semibold text-slate-950 transition hover:bg-cyan-300 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {loading ? "Submitting..." : "Create Resident Account"}
              </button>
            )}
          </form>

          {!success && (
            <div className="mt-6 border-t border-slate-800 pt-5 text-center">
              <p className="text-sm text-slate-400">
                Already registered?{" "}
                <Link
                  to="/login"
                  className="font-semibold text-cyan-400 hover:text-cyan-300"
                >
                  Sign in
                </Link>
              </p>
            </div>
          )}

          <p className="mt-5 text-center text-xs text-slate-500">
            All resident registrations require Facility Manager approval.
          </p>
        </section>

        <footer className="mt-6 text-center text-xs text-slate-600">
          Smart Facility Maintenance System
        </footer>
      </div>
    </main>
  );
};

export default ResidentRegister;
