import { useState, type ReactNode } from "react";

import { Sidebar } from "./Sidebar";
import { Topbar } from "./Topbar";

type AppShellProps = {
  children: ReactNode;
  title?: string;
};

export function AppShell({ children, title = "Overview" }: AppShellProps) {
  const [isSidebarOpen, setSidebarOpen] = useState(() => window.innerWidth >= 1024);
  return (
    <div className="min-h-screen bg-[var(--color-canvas)] text-[var(--color-ink)]">
      <Sidebar isOpen={isSidebarOpen} onClose={() => setSidebarOpen(false)} onToggle={() => setSidebarOpen((isOpen) => !isOpen)} />
      <div className={`min-h-screen transition-[padding] duration-200 ${isSidebarOpen ? "lg:pl-72" : "pl-20 lg:pl-20"}`}>
        <Topbar title={title} />
        <main className="mx-auto w-full max-w-7xl px-5 py-8 sm:px-8 lg:px-10 lg:py-10">
          {children}
        </main>
      </div>
    </div>
  );
}
