import { useState, type ReactNode } from "react";

import { Sidebar } from "./Sidebar";
import { Topbar } from "./Topbar";
import { Link } from "react-router-dom";

type AppShellProps = {
  children: ReactNode;
  title?: string;
};

export function AppShell({ children, title = "Overview" }: AppShellProps) {
  const [isSidebarOpen, setSidebarOpen] = useState(() => sessionStorage.getItem("hiring-compass-sidebar") !== "collapsed" && window.innerWidth >= 1024);
  const toggleSidebar = () => setSidebarOpen((open) => { const next = !open; sessionStorage.setItem("hiring-compass-sidebar", next ? "open" : "collapsed"); return next; });
  return (
    <div className="min-h-screen bg-[var(--color-canvas)] text-[var(--color-ink)]">
      <Sidebar isOpen={isSidebarOpen} onClose={() => setSidebarOpen(false)} onToggle={toggleSidebar} />
      <div className={`min-h-screen transition-[padding] duration-200 ${isSidebarOpen ? "lg:pl-64" : "pl-20 lg:pl-20"}`}>
        <Topbar title={title} />
        <main className="hc-portal-main mx-auto w-full max-w-7xl px-5 py-8 sm:px-8 lg:px-10 lg:py-10">
          {title === "Job details" && <Link to="/hiring?tab=jobs" className="mb-6 inline-block text-sm font-semibold">← Back to Jobs</Link>}
          {children}
        </main>
      </div>
    </div>
  );
}
