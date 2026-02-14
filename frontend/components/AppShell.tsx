"use client";

import { useState } from "react";
import WorkspaceSidebar from "./WorkspaceSidebar";
import { Toaster } from "react-hot-toast";

export default function AppShell({
  children,
}: {
  children: React.ReactNode;
}) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <div className="min-h-screen flex bg-[#fafafa] text-black">

      <Toaster position="top-center" toastOptions={{ duration: 3000 }} />

      <aside className="hidden md:flex w-75 border-r border-neutral-200 bg-white p-6 flex-col shrink-0 z-20">
        <div className="mb-10">
          <h1 className="text-xl font-mono tracking-tight text-neutral-900">
            Paper Trace
          </h1>
          <p className="text-xs font-mono uppercase text-neutral-400 mt-1">
            Private knowledge workspace
          </p>
        </div>
        <WorkspaceSidebar />
      </aside>

      {mobileMenuOpen && (
        <div className="fixed inset-0 z-50 bg-white flex flex-col p-6 animate-in fade-in duration-200">
          <div className="flex items-center justify-between mb-8">
            <span className="text-sm font-mono text-neutral-500 uppercase tracking-wider">
              Menu
            </span>

            <button
              onClick={() => setMobileMenuOpen(false)}
              className="text-neutral-900 hover:text-neutral-500 transition p-2 -mr-2"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={1.5}
                stroke="currentColor"
                className="w-6 h-6"
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          <div className="flex-1 overflow-y-auto">
            <WorkspaceSidebar />
          </div>
        </div>
      )}

      <main className="flex-1 flex flex-col h-dvh relative">
        <header className="md:hidden h-14 border-b border-neutral-200 bg-white flex items-center justify-between px-4 shrink-0 z-10">
          <h1 className="text-sm font-mono tracking-tight text-neutral-900 font-semibold">
            Paper Trace
          </h1>
          <button
            onClick={() => setMobileMenuOpen(true)}
            className="text-sm font-mono text-neutral-600 hover:text-neutral-900 transition"
          >
            Menu
          </button>
        </header>

        <div className="flex-1 flex flex-col min-h-0 relative">
          {children}
        </div>
      </main>

    </div>
  );
}