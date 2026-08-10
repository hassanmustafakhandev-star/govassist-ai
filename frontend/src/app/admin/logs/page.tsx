"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { getUser, logout } from "../../auth";

interface LogEntry {
  id: string;
  caseId: string;
  title: string;
  summary: string;
  status: "Resolved" | "Pending" | "Escalated";
  statusBg: string;
  statusColor: string;
  date: string;
  time: string;
  agent: string;
  agentColor: string;
}

export default function ActivityLogs() {
  const [authorized, setAuthorized] = useState(false);
  const [lang, setLang] = useState<"EN" | "AR">("EN");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedStatus, setSelectedStatus] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    const user = getUser();
    if (!user || user.role !== "admin") {
      window.location.href = "/login";
    } else {
      setAuthorized(true);
    }
  }, []);

  const logs: LogEntry[] = [
    {
      id: "1",
      caseId: "#78214",
      title: "Residency Visa Renewal",
      summary: "Initial document verification completed by autonomous agent.",
      status: "Resolved",
      statusBg: "bg-secondary-container text-on-secondary-container",
      statusColor: "text-secondary",
      date: "Oct 24, 2023",
      time: "14:22 PM",
      agent: "Nexus-04",
      agentColor: "bg-secondary",
    },
    {
      id: "2",
      caseId: "#78302",
      title: "Business License Inquiry",
      summary: "Awaiting secondary approval from Chamber of Commerce.",
      status: "Pending",
      statusBg: "bg-surface-container-high text-on-surface-variant border border-outline-variant",
      statusColor: "text-outline",
      date: "Oct 24, 2023",
      time: "11:05 AM",
      agent: "Atlas-01",
      agentColor: "bg-outline",
    },
    {
      id: "3",
      caseId: "#78455",
      title: "Tax Compliance Audit",
      summary: "Complexity threshold exceeded. Manual review initiated.",
      status: "Escalated",
      statusBg: "bg-error-container text-on-error-container",
      statusColor: "text-error",
      date: "Oct 23, 2023",
      time: "09:15 AM",
      agent: "Human Rep",
      agentColor: "bg-error",
    },
    {
      id: "4",
      caseId: "#78009",
      title: "ID Renewal (Fast-track)",
      summary: "Biometric data cross-referenced and validated.",
      status: "Resolved",
      statusBg: "bg-secondary-container text-on-secondary-container",
      statusColor: "text-secondary",
      date: "Oct 22, 2023",
      time: "16:45 PM",
      agent: "Nexus-04",
      agentColor: "bg-secondary",
    },
    {
      id: "5",
      caseId: "#78512",
      title: "Property Registration",
      summary: "Digital deed verification in progress.",
      status: "Pending",
      statusBg: "bg-surface-container-high text-on-surface-variant border border-outline-variant",
      statusColor: "text-outline",
      date: "Oct 22, 2023",
      time: "10:30 AM",
      agent: "Atlas-02",
      agentColor: "bg-outline",
    },
  ];

  const filteredLogs = logs.filter((log) => {
    const matchesSearch =
      log.caseId.toLowerCase().includes(searchQuery.toLowerCase()) ||
      log.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      log.summary.toLowerCase().includes(searchQuery.toLowerCase()) ||
      log.agent.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesStatus = selectedStatus ? log.status === selectedStatus : true;

    return matchesSearch && matchesStatus;
  });

  if (!authorized) {
    return (
      <div className="min-h-screen bg-surface flex items-center justify-center">
        <span className="material-symbols-outlined animate-spin text-[40px] text-primary">progress_activity</span>
      </div>
    );
  }

  return (
    <div className="bg-surface text-on-surface antialiased min-h-screen flex flex-col font-body-md selection:bg-secondary-container selection:text-on-secondary-container">
      {/* Sidebar Navigation */}
      <aside className="h-screen w-64 fixed left-0 top-0 bg-surface-container-lowest border-e border-outline-variant flex flex-col p-stack-md z-50 shrink-0">
        <div className="mb-stack-lg">
          <Link href="/" className="font-headline-md text-headline-md font-bold text-primary hover:opacity-85">
            Admin Portal
          </Link>
          <p className="font-label-sm text-label-sm text-on-surface-variant">
            Government Services
          </p>
        </div>
        <nav className="flex-grow space-y-1">
          <Link
            className="flex items-center gap-3 px-4 py-3 font-label-md text-label-md text-on-surface-variant hover:bg-surface-container-high transition-all duration-200 ease-in-out rounded-lg"
            href="/admin"
          >
            <span className="material-symbols-outlined">dashboard</span>
            Overview
          </Link>
          <Link
            className="flex items-center gap-3 px-4 py-3 font-label-md text-label-md text-on-surface-variant hover:bg-surface-container-high transition-all duration-200 ease-in-out rounded-lg"
            href="/agents"
          >
            <span className="material-symbols-outlined">smart_toy</span>
            AI Agents
          </Link>
          <Link
            className="flex items-center gap-3 px-4 py-3 font-label-md text-label-md text-on-surface-variant hover:bg-surface-container-high transition-all duration-200 ease-in-out rounded-lg"
            href="/chat"
          >
            <span className="material-symbols-outlined">verified_user</span>
            Verification
          </Link>
          <Link
            className="flex items-center gap-3 px-4 py-3 font-label-md text-label-md bg-primary-fixed text-on-primary-fixed rounded-lg transition-all duration-200 ease-in-out"
            href="/admin/logs"
          >
            <span className="material-symbols-outlined">list_alt</span>
            Activity Logs
          </Link>
          <Link
            className="flex items-center gap-3 px-4 py-3 font-label-md text-label-md text-on-surface-variant hover:bg-surface-container-high transition-all duration-200 ease-in-out rounded-lg"
            href="/settings"
          >
            <span className="material-symbols-outlined">settings</span>
            Settings
          </Link>
        </nav>
        <div className="mt-auto pt-stack-md border-t border-outline-variant shrink-0">
          <Link
            className="flex items-center gap-3 px-4 py-3 font-label-md text-label-md text-on-surface-variant hover:underline"
            href="#"
          >
            <span className="material-symbols-outlined">help</span>
            Support
          </Link>
          <Link
            onClick={() => logout()}
            className="flex items-center gap-3 px-4 py-3 font-label-md text-label-md text-on-surface-variant hover:underline"
            href="/login"
          >
            <span className="material-symbols-outlined">logout</span>
            Logout
          </Link>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="ml-64 min-h-screen flex flex-col flex-1">
        {/* Top Navigation Bar */}
        <header className="flex justify-between items-center px-margin-desktop h-16 w-full bg-surface border-b border-outline-variant sticky top-0 z-40 shrink-0">
          <div className="flex items-center gap-gutter">
            <Link href="/" className="font-headline-md text-headline-md font-bold text-primary hover:opacity-85">
              GovAssist AI
            </Link>
            <nav className="hidden md:flex items-center gap-stack-lg">
              <Link
                className="font-body-md text-body-md text-on-surface-variant hover:text-primary transition-colors"
                href="/admin"
              >
                Dashboard
              </Link>
              <Link
                className="font-body-md text-body-md text-on-surface-variant hover:text-primary transition-colors"
                href="/services"
              >
                Services
              </Link>
              <Link
                className="font-body-md text-body-md text-on-surface-variant hover:text-primary transition-colors"
                href="/chat"
              >
                Inquiry
              </Link>
            </nav>
          </div>
          <div className="flex items-center gap-stack-md">
            <button
              onClick={() => setLang(lang === "EN" ? "AR" : "EN")}
              className="font-label-md text-label-md text-primary font-bold px-3 py-1 border border-outline rounded hover:bg-surface-container-low transition-colors cursor-pointer"
            >
              {lang === "EN" ? "EN/AR" : "AR/EN"}
            </button>
            <button className="material-symbols-outlined text-on-surface-variant p-2 hover:bg-surface-container-low rounded-full transition-colors cursor-pointer">
              notifications
            </button>
            <div className="w-8 h-8 rounded-full overflow-hidden border border-outline-variant">
              <img
                className="w-full h-full object-cover"
                alt="Government official"
                src="https://lh3.googleusercontent.com/aida-public/AB6AXuAlz4Pt6JJoBmmWcmECECuM4vIKb3cQJMGUvcTvomuLobZItlRDmiewipKPlYoZk0abjk3nPseMR6t3aRnf0bDaaXk5MIXaKGE0Uo-Z02KEWHtxG8yc_lenEspVj5DNrDz3ppfgeuFazJL7tdR6OIZZcc0D9Vjhq6j93KEZUt0UETGV0rHYuu1ChAhghbeFI4AnuWwk-kMTNI9kvhloe3sn5SrkQS-DGxwrxzAHMajrBKvTE-EU0BKc4Lv_DwVmjhnAVZXurIgiLkz_"
              />
            </div>
          </div>
        </header>

        {/* Page Header */}
        <div className="px-margin-desktop py-stack-lg bg-surface shrink-0">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-stack-md">
            <div>
              <nav className="flex items-center gap-2 text-on-surface-variant mb-2">
                <span className="font-label-sm text-label-sm">Admin Portal</span>
                <span className="material-symbols-outlined text-[16px]">
                  chevron_right
                </span>
                <span className="font-label-sm text-label-sm font-bold text-primary">
                  Activity Logs
                </span>
              </nav>
              <h2 className="font-headline-xl text-headline-xl text-primary leading-tight">
                Activity Logs
              </h2>
              <p className="font-body-md text-body-md text-on-surface-variant mt-2">
                Comprehensive record of recent interactions and case lifecycle updates.
              </p>
            </div>
            <div className="flex items-center gap-stack-sm">
              <select
                value={selectedStatus || ""}
                onChange={(e) => setSelectedStatus(e.target.value || null)}
                className="px-4 py-2 border border-outline rounded-lg font-label-md text-label-md bg-white focus:ring-2 focus:ring-primary outline-none"
              >
                <option value="">All Statuses</option>
                <option value="Resolved">Resolved</option>
                <option value="Pending">Pending</option>
                <option value="Escalated">Escalated</option>
              </select>
              <button className="flex items-center gap-2 px-4 py-2 bg-primary text-on-primary font-label-md text-label-md rounded hover:opacity-90 transition-opacity cursor-pointer active:opacity-85">
                <span className="material-symbols-outlined text-[18px]">
                  download
                </span>
                Export Logs
              </button>
            </div>
          </div>
        </div>

        {/* Content Canvas */}
        <section className="px-margin-desktop pb-stack-lg flex-1 flex flex-col">
          <div className="bg-surface-container-lowest border border-outline-variant rounded shadow-sm overflow-hidden flex flex-col flex-1">
            {/* Search Input Bar inside canvas */}
            <div className="p-4 border-b border-outline-variant bg-white flex items-center">
              <div className="relative w-full max-w-md">
                <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant">
                  search
                </span>
                <input
                  className="w-full pl-10 pr-4 py-2 bg-surface-container-low border border-outline-variant rounded-lg text-body-sm font-body-sm focus:ring-2 focus:ring-primary focus:border-primary outline-none transition-all"
                  placeholder="Search logs by Case ID, Agent or Summary..."
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
            </div>

            {/* Table Header */}
            <div className="grid grid-cols-12 gap-gutter px-6 py-4 bg-surface-container-low border-b border-outline-variant shrink-0">
              <div className="col-span-1 font-label-md text-label-md text-on-surface-variant">
                Case ID
              </div>
              <div className="col-span-4 font-label-md text-label-md text-on-surface-variant">
                Interaction Summary
              </div>
              <div className="col-span-2 font-label-md text-label-md text-on-surface-variant">
                Status
              </div>
              <div className="col-span-2 font-label-md text-label-md text-on-surface-variant">
                Date &amp; Time
              </div>
              <div className="col-span-2 font-label-md text-label-md text-on-surface-variant">
                AI Agent
              </div>
              <div className="col-span-1"></div>
            </div>

            {/* Log List */}
            <div className="divide-y divide-outline-variant flex-1 overflow-y-auto">
              {filteredLogs.map((log) => (
                <div
                  key={log.id}
                  className="grid grid-cols-12 gap-gutter px-6 py-5 items-center hover:bg-surface-bright transition-all hover:translate-x-1 duration-200"
                >
                  <div className="col-span-1 font-label-md text-label-md text-primary font-bold">
                    {log.caseId}
                  </div>
                  <div className="col-span-4 pr-4">
                    <p className="font-body-md text-body-md text-primary font-semibold">
                      {log.title}
                    </p>
                    <p className="font-body-sm text-body-sm text-on-surface-variant">
                      {log.summary}
                    </p>
                  </div>
                  <div className="col-span-2">
                    <span
                      className={`inline-flex items-center px-2.5 py-0.5 rounded-full font-label-sm text-label-sm ${log.statusBg}`}
                    >
                      {log.status}
                    </span>
                  </div>
                  <div className="col-span-2">
                    <p className="font-body-sm text-body-sm text-on-surface-variant">
                      {log.date}
                    </p>
                    <p className="font-label-sm text-label-sm text-outline">
                      {log.time}
                    </p>
                  </div>
                  <div className="col-span-2 flex items-center gap-2">
                    <span className={`w-2 h-2 rounded-full ${log.agentColor}`}></span>
                    <span className="font-label-md text-label-md text-on-surface-variant">
                      {log.agent}
                    </span>
                  </div>
                  <div className="col-span-1 text-right">
                    <button className="material-symbols-outlined text-on-surface-variant hover:text-primary cursor-pointer active:opacity-85">
                      more_vert
                    </button>
                  </div>
                </div>
              ))}

              {filteredLogs.length === 0 && (
                <div className="py-12 text-center text-on-surface-variant">
                  No logs found matching "{searchQuery}"
                </div>
              )}
            </div>

            {/* Pagination */}
            <div className="px-6 py-4 bg-surface-container-low border-t border-outline-variant flex items-center justify-between shrink-0">
              <span className="font-body-sm text-body-sm text-on-surface-variant">
                Showing {filteredLogs.length} of {logs.length} logs
              </span>
              <div className="flex items-center gap-1">
                <button
                  className="p-1 rounded hover:bg-surface-container-high disabled:opacity-30 cursor-pointer"
                  disabled={currentPage === 1}
                  onClick={() => setCurrentPage(1)}
                >
                  <span className="material-symbols-outlined">chevron_left</span>
                </button>
                <button
                  onClick={() => setCurrentPage(1)}
                  className={`px-3 py-1 rounded font-label-sm text-label-sm cursor-pointer ${
                    currentPage === 1
                      ? "bg-primary text-on-primary"
                      : "hover:bg-surface-container-high"
                  }`}
                >
                  1
                </button>
                <button
                  onClick={() => setCurrentPage(2)}
                  className={`px-3 py-1 rounded font-label-sm text-label-sm cursor-pointer ${
                    currentPage === 2
                      ? "bg-primary text-on-primary"
                      : "hover:bg-surface-container-high"
                  }`}
                >
                  2
                </button>
                <button
                  onClick={() => setCurrentPage(3)}
                  className={`px-3 py-1 rounded font-label-sm text-label-sm cursor-pointer ${
                    currentPage === 3
                      ? "bg-primary text-on-primary"
                      : "hover:bg-surface-container-high"
                  }`}
                >
                  3
                </button>
                <button
                  className="p-1 rounded hover:bg-surface-container-high cursor-pointer"
                  onClick={() => setCurrentPage(Math.min(currentPage + 1, 3))}
                >
                  <span className="material-symbols-outlined">chevron_right</span>
                </button>
              </div>
            </div>
          </div>

          {/* Dashboard Analytics Sidebar-style Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-gutter mt-stack-lg shrink-0">
            <div className="p-stack-md bg-surface-container-lowest border border-outline-variant rounded bg-white">
              <div className="flex items-center justify-between mb-2">
                <span className="font-label-sm text-label-sm text-on-surface-variant">
                  Efficiency Rate
                </span>
                <span className="material-symbols-outlined text-secondary">
                  trending_up
                </span>
              </div>
              <div className="font-headline-md text-headline-md font-bold text-primary">
                98.2%
              </div>
              <p className="font-body-sm text-body-sm text-secondary mt-1">
                +1.4% from last month
              </p>
            </div>
            <div className="p-stack-md bg-surface-container-lowest border border-outline-variant rounded bg-white">
              <div className="flex items-center justify-between mb-2">
                <span className="font-label-sm text-label-sm text-on-surface-variant">
                  Pending Handover
                </span>
                <span className="material-symbols-outlined text-on-surface-variant">
                  hourglass_empty
                </span>
              </div>
              <div className="font-headline-md text-headline-md font-bold text-primary">
                12 Cases
              </div>
              <p className="font-body-sm text-body-sm text-on-surface-variant mt-1">
                Average wait: 4.2 mins
              </p>
            </div>
            <div className="p-stack-md bg-surface-container-lowest border border-outline-variant rounded bg-white">
              <div className="flex items-center justify-between mb-2">
                <span className="font-label-sm text-label-sm text-on-surface-variant">
                  Citizen Satisfaction
                </span>
                <span className="material-symbols-outlined text-primary">
                  verified
                </span>
              </div>
              <div className="font-headline-md text-headline-md font-bold text-primary">
                4.9/5.0
              </div>
              <p className="font-body-sm text-body-sm text-on-surface-variant mt-1">
                Based on 2,400 reviews
              </p>
            </div>
          </div>
        </section>

        {/* Footer */}
        <footer className="w-full py-stack-md bg-surface-container border-t border-outline-variant px-margin-desktop flex flex-col md:flex-row justify-between items-center gap-stack-sm shrink-0">
          <span className="font-label-md text-label-md font-bold text-primary">
            GovAssist AI
          </span>
          <div className="flex gap-stack-lg">
            <Link className="font-body-sm text-body-sm text-on-surface-variant hover:underline transition-all" href="/legal">Privacy Policy</Link>
            <Link className="font-body-sm text-body-sm text-on-surface-variant hover:underline transition-all" href="/legal">Terms of Service</Link>
            <Link className="font-body-sm text-body-sm text-on-surface-variant hover:underline transition-all" href="/support">Contact Support</Link>
          </div>
          <p className="font-body-sm text-body-sm text-on-surface-variant">
            © 2026 GovAssist AI. Demo purpose only.
          </p>
        </footer>
      </main>
    </div>
  );
}
