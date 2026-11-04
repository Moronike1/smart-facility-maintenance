
import type { ReactNode } from "react";
import { NavLink } from "react-router-dom";

interface AppLayoutProps {
  children: ReactNode;
}

const navigationItems = [
  { label: "Dashboard", path: "/dashboard", icon: "▦" },
  { label: "Facilities", path: "/facilities", icon: "▤" },
  { label: "Assets", path: "/assets", icon: "▣" },
  { label: "Maintenance Requests", path: "/maintenance-requests", icon: "☷" },
  { label: "Work Orders", path: "/work-orders", icon: "⚒" },
  { label: "Preventive Maintenance", path: "/preventive-maintenance", icon: "◷" },
  { label: "Reports", path: "/reports", icon: "▥" },
  { label: "Maintenance History", path: "/maintenance-history", icon: "↶" },
];

export default function AppLayout({ children }: AppLayoutProps) {
  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    window.dispatchEvent(new Event("auth-changed"));
  };

  return (
    <div className="min-h-screen w-full overflow-x-hidden bg-slate-950">
      {/* Full-width top header */}
      <header className="sticky top-0 z-50 flex h-16 w-full items-center justify-between border-b border-slate-200 bg-white px-4 shadow-sm sm:px-6">
        <div className="flex min-w-0 items-center gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-blue-900 text-sm font-bold text-white">
            SF
          </div>
          <div className="min-w-0">
            <h1 className="truncate text-sm font-bold leading-5 text-slate-900 sm:text-base">
              Smart Facility
            </h1>
            <p className="hidden text-xs leading-4 text-slate-500 sm:block">
              Maintenance &amp; Service Management
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={handleLogout}
          className="ml-4 inline-flex shrink-0 items-center gap-2 rounded-lg border border-red-100 bg-red-50 px-3 py-2 text-sm font-semibold text-red-700 transition hover:bg-red-100 focus:outline-none focus:ring-2 focus:ring-red-400"
          aria-label="Log out"
        >
          <svg
            aria-hidden="true"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            className="h-4 w-4"
          >
            <path d="M10 17l5-5-5-5" />
            <path d="M15 12H3" />
            <path d="M12 3h6a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-6" />
          </svg>
          <span>Logout</span>
        </button>
      </header>

      <div className="flex min-h-[calc(100vh-4rem)] w-full items-stretch">
        {/* Desktop sidebar */}
        <aside className="sticky top-16 hidden h-[calc(100vh-4rem)] w-64 shrink-0 overflow-y-auto bg-slate-900 p-4 md:block">
          <p className="mb-4 px-3 text-xs font-semibold uppercase tracking-wider text-slate-400">
            Main Menu
          </p>

          <nav className="space-y-1" aria-label="Main navigation">
            {navigationItems.map((item) => (
              <NavLink
                key={item.path}
                to={item.path}
                end
                className={({ isActive }) =>
                  `flex items-center gap-3 rounded-lg px-3 py-3 text-sm font-medium transition ${
                    isActive
                      ? "bg-blue-600 text-white shadow-md"
                      : "text-slate-300 hover:bg-slate-800 hover:text-white"
                  }`
                }
              >
                <span className="w-5 shrink-0 text-center text-lg" aria-hidden="true">
                  {item.icon}
                </span>
                <span>{item.label}</span>
              </NavLink>
            ))}
          </nav>
        </aside>

        {/* Main page content */}
        <main className="min-w-0 flex-1 bg-slate-950 text-white">
          {/* Mobile navigation */}
          <nav
            className="flex gap-2 overflow-x-auto border-b border-slate-800 bg-slate-900 p-3 md:hidden"
            aria-label="Mobile navigation"
          >
            {navigationItems.map((item) => (
              <NavLink
                key={item.path}
                to={item.path}
                end
                className={({ isActive }) =>
                  `shrink-0 rounded-lg px-3 py-2 text-sm font-medium ${
                    isActive
                      ? "bg-blue-600 text-white"
                      : "bg-slate-800 text-slate-300 hover:text-white"
                  }`
                }
              >
                {item.label}
              </NavLink>
            ))}
          </nav>

          {children}
        </main>
      </div>
    </div>
  );
}
