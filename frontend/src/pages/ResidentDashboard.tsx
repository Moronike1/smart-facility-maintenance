
import { Link } from "react-router-dom";

export default function ResidentDashboard() {
  let user: { name?: string; email?: string } = {};

  try {
    const storedUser = localStorage.getItem("user");
    user = storedUser ? JSON.parse(storedUser) : {};
  } catch {
    user = {};
  }

  const quickActions = [
    {
      title: "Report a Problem",
      description: "Submit a maintenance request for your apartment or shared estate facilities.",
      link: "/my-requests",
      icon: "＋",
    },
    {
      title: "My Maintenance Requests",
      description: "View your submitted requests and monitor their progress.",
      link: "/my-requests",
      icon: "☷",
    },
  ];

  return (
    <div className="min-h-screen bg-slate-950 px-4 py-8 sm:px-6 lg:px-10">
      <div className="mx-auto max-w-6xl">

        <section className="rounded-2xl border border-slate-700 bg-gradient-to-r from-slate-900 to-blue-950 p-6 sm:p-8">
          <p className="text-sm font-semibold uppercase tracking-wider text-cyan-400">
            Resident Portal
          </p>

          <h1 className="mt-3 text-2xl font-bold text-white sm:text-3xl">
            Welcome, {user.name || "Resident"}
          </h1>

          <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-300">
            Manage your maintenance requests and stay informed
            about maintenance activities affecting your apartment
            and shared estate facilities.
          </p>

          {user.email && (
            <p className="mt-4 text-sm text-slate-400">
              {user.email}
            </p>
          )}
        </section>

        <section className="mt-8">
          <h2 className="text-xl font-bold text-white">
            Quick Actions
          </h2>

          <p className="mt-2 text-sm text-slate-400">
            What would you like to do today?
          </p>

          <div className="mt-5 grid gap-5 md:grid-cols-2">
            {quickActions.map((action) => (
              <Link
                key={action.title}
                to={action.link}
                className="group rounded-xl border border-slate-800 bg-slate-900 p-6 transition hover:border-cyan-500 hover:bg-slate-800"
              >
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-cyan-950 text-2xl font-bold text-cyan-400">
                  {action.icon}
                </div>

                <h3 className="mt-5 text-lg font-semibold text-white group-hover:text-cyan-400">
                  {action.title}
                </h3>

                <p className="mt-2 text-sm leading-6 text-slate-400">
                  {action.description}
                </p>

                <p className="mt-5 text-sm font-semibold text-cyan-400">
                  Get started →
                </p>
              </Link>
            ))}
          </div>
        </section>

        <section className="mt-8 rounded-xl border border-slate-800 bg-slate-900 p-6">
          <h2 className="text-lg font-semibold text-white">
            How Maintenance Requests Work
          </h2>

          <div className="mt-5 grid gap-5 sm:grid-cols-3">
            <div>
              <span className="text-sm font-bold text-cyan-400">01</span>
              <h3 className="mt-2 font-semibold text-white">
                Submit a Request
              </h3>
              <p className="mt-2 text-sm text-slate-400">
                Describe the problem and provide its location.
              </p>
            </div>

            <div>
              <span className="text-sm font-bold text-cyan-400">02</span>
              <h3 className="mt-2 font-semibold text-white">
                Management Review
              </h3>
              <p className="mt-2 text-sm text-slate-400">
                The Facility Manager reviews and processes your request.
              </p>
            </div>

            <div>
              <span className="text-sm font-bold text-cyan-400">03</span>
              <h3 className="mt-2 font-semibold text-white">
                Track Progress
              </h3>
              <p className="mt-2 text-sm text-slate-400">
                Follow your request until the maintenance work is completed.
              </p>
            </div>
          </div>
        </section>

      </div>
    </div>
  );
}
