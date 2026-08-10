"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { getUser, logout } from "../auth";
import { getDashboardStats, getAgentLogs } from "../../lib/api";
import { AgentLog, StatsResponse } from "../../types";

export default function AdminDashboard() {
  const [authorized, setAuthorized] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [stats, setStats] = useState<StatsResponse | null>(null);
  const [activities, setActivities] = useState<AgentLog[]>([]);

  const loadData = async () => {
    try {
      const statsRes = await getDashboardStats();
      setStats(statsRes);

      const logsRes = await getAgentLogs(1, 50);
      setActivities(logsRes.logs);
    } catch (error) {
      console.error("Failed to load admin data", error);
    }
  };

  useEffect(() => {
    const user = getUser();
    if (!user || user.role !== "admin") {
      window.location.href = "/login";
    } else {
      setAuthorized(true);
      loadData();
    }
  }, []);

  // Auto-refresh stats every 30s
  useEffect(() => {
    if (!authorized) return;
    const interval = setInterval(loadData, 30000);
    return () => clearInterval(interval);
  }, [authorized]);

  const filteredActivities = activities.filter(
    (act) =>
      act.agent_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      act.request_id.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (!authorized) {
    return (
      <div className="min-h-screen bg-surface flex items-center justify-center">
        <span className="material-symbols-outlined animate-spin text-[40px] text-primary">progress_activity</span>
      </div>
    );
  }

  return (
    <div className="bg-surface text-on-surface min-h-screen flex font-body-md selection:bg-secondary-container selection:text-on-secondary-container">
      {/* Sidebar Navigation */}
      <aside className="h-screen w-64 fixed left-0 top-0 bg-surface-container-lowest border-e border-outline-variant flex flex-col p-stack-md z-50 shrink-0">
        <div className="mb-stack-lg">
          <Link href="/" className="font-headline-md text-headline-md font-bold text-primary hover:opacity-85">
            GovAssist AI
          </Link>
          <p className="font-label-sm text-label-sm text-on-surface-variant uppercase tracking-wider mt-1">
            Admin Portal
          </p>
        </div>
        <nav className="flex-1 space-y-1">
          {/* Active Item */}
          <Link
            className="flex items-center gap-3 px-4 py-3 bg-primary-fixed text-on-primary-fixed rounded-lg font-label-md text-label-md transition-all duration-200"
            href="/admin"
          >
            <span className="material-symbols-outlined">dashboard</span>
            <span>Dashboard</span>
          </Link>
          <Link
            className="flex items-center gap-3 px-4 py-3 text-on-surface-variant hover:bg-surface-container-high rounded-lg font-label-md text-label-md transition-all duration-200"
            href="/agents"
          >
            <span className="material-symbols-outlined">smart_toy</span>
            <span>AI Agents</span>
          </Link>
          <Link
            className="flex items-center gap-3 px-4 py-3 text-on-surface-variant hover:bg-surface-container-high rounded-lg font-label-md text-label-md transition-all duration-200"
            href="/admin/logs"
          >
            <span className="material-symbols-outlined">list_alt</span>
            <span>Activity Logs</span>
          </Link>
          <Link
            className="flex items-center gap-3 px-4 py-3 text-on-surface-variant hover:bg-surface-container-high rounded-lg font-label-md text-label-md transition-all duration-200"
            href="/settings"
          >
            <span className="material-symbols-outlined">settings</span>
            <span>Settings</span>
          </Link>
        </nav>
        {/* User Profile Footer in Sidebar */}
        <div className="mt-auto border-t border-outline-variant pt-stack-md space-y-1">
          {/* 
            Real user data dikhao:
            - avatar: Google se mila photo ya initials fallback
            - name: Google full name ya email prefix
            - role: "Administrator"
          */}
          <div className="flex items-center gap-3 px-4 py-3 mb-2">
            <div className="w-10 h-10 rounded-full bg-primary-container flex items-center justify-center text-white font-bold overflow-hidden shrink-0">
              {/* Google avatar ya initials */}
              {(() => {
                const u = getUser();
                if (u?.avatar) {
                  return <img className="w-full h-full object-cover" alt="Admin avatar" src={u.avatar} />;
                }
                // Initials fallback (pehle 2 letters)
                const initials = (u?.name || u?.email || "A")
                  .split(" ").slice(0, 2).map((n: string) => n[0]?.toUpperCase()).join("") || "A";
                return <span>{initials}</span>;
              })()}
            </div>
            <div className="flex flex-col overflow-hidden">
              {/* Real naam dikhao */}
              <span className="font-label-md text-label-md text-on-surface truncate">
                {(() => {
                  const u = getUser();
                  return u?.name || u?.email?.split("@")[0] || "Admin User";
                })()}
              </span>
              <span className="text-[10px] text-on-surface-variant">System Auditor</span>
            </div>
          </div>
          <Link className="flex items-center gap-3 px-4 py-3 text-on-surface-variant hover:bg-surface-container-high rounded-lg font-label-md text-label-md transition-all" href="/support">
            <span className="material-symbols-outlined">help</span>
            <span>Support</span>
          </Link>
          <Link onClick={() => logout()} className="flex items-center gap-3 px-4 py-3 text-error hover:bg-error-container/20 rounded-lg font-label-md text-label-md transition-all" href="/login">
            <span className="material-symbols-outlined">logout</span>
            <span>Logout</span>
          </Link>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="ml-64 min-h-screen flex flex-col flex-1">
        {/* Top Navigation Bar */}
        <header className="h-16 flex justify-between items-center px-margin-desktop bg-surface border-b border-outline-variant sticky top-0 z-40">
          <div className="flex items-center gap-4">
            <h2 className="font-headline-md text-headline-md font-bold text-primary">
              Admin Activity Overview
            </h2>
            <div className="h-6 w-[1px] bg-outline-variant"></div>
            <div className="flex items-center gap-2 px-3 py-1 bg-secondary-container text-on-secondary-container rounded-full">
              <span className="w-2 h-2 rounded-full bg-secondary animate-pulse"></span>
              <span className="font-label-sm text-label-sm">
                Live System Status
              </span>
            </div>
          </div>
          <div className="flex items-center gap-gutter">
            <div className="relative hidden lg:block">
              <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant">
                search
              </span>
              <input
                className="pl-10 pr-4 py-2 bg-surface-container-low border border-outline-variant rounded-lg text-body-sm font-body-sm focus:ring-2 focus:ring-primary focus:border-primary outline-none transition-all w-64"
                placeholder="Search logs..."
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <div className="flex items-center gap-stack-sm">
              <button className="p-2 text-on-surface-variant hover:bg-surface-container-high rounded-full transition-colors relative cursor-pointer active:opacity-85">
                <span className="material-symbols-outlined">notifications</span>
                <span className="absolute top-2 right-2 w-2 h-2 bg-error rounded-full border-2 border-surface"></span>
              </button>
              <button className="p-2 text-on-surface-variant hover:bg-surface-container-high rounded-full transition-colors cursor-pointer active:opacity-85">
                <span className="material-symbols-outlined">account_circle</span>
              </button>
            </div>
          </div>
        </header>

        {/* Content Canvas */}
        <div className="p-margin-desktop space-y-gutter flex-1">
          {/* Stats Row */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-gutter">
            {/* Stat Card 1 */}
            <div className="bg-surface-container-lowest border border-outline-variant p-stack-md rounded-lg flex flex-col">
              <div className="flex justify-between items-start mb-stack-sm">
                <span className="font-label-md text-label-md text-on-surface-variant uppercase tracking-tight">
                  Total Requests Today
                </span>
                <span className="material-symbols-outlined text-primary">
                  trending_up
                </span>
              </div>
              <div className="flex items-baseline gap-2">
                <span className="font-headline-xl text-headline-xl text-primary">
                  {stats?.requests_today ?? 0}
                </span>
              </div>
            </div>
            {/* Stat Card 2 */}
            <div className="bg-surface-container-lowest border border-outline-variant p-stack-md rounded-lg flex flex-col">
              <div className="flex justify-between items-start mb-stack-sm">
                <span className="font-label-md text-label-md text-on-surface-variant uppercase tracking-tight">
                  Average Confidence
                </span>
                <span className="material-symbols-outlined text-secondary">
                  verified
                </span>
              </div>
              <div className="flex items-baseline gap-2">
                <span className="font-headline-xl text-headline-xl text-primary">
                  {stats?.average_confidence ?? 0}
                </span>
              </div>
            </div>
            {/* Stat Card 3 */}
            <div className="bg-surface-container-lowest border border-outline-variant p-stack-md rounded-lg flex flex-col">
              <div className="flex justify-between items-start mb-stack-sm">
                <span className="font-label-md text-label-md text-on-surface-variant uppercase tracking-tight">
                  Escalation Rate
                </span>
                <span className="material-symbols-outlined text-error">
                  warning
                </span>
              </div>
              <div className="flex items-baseline gap-2">
                <span className="font-headline-xl text-headline-xl text-primary">
                  {stats?.escalation_rate_percent ?? 0}%
                </span>
              </div>
            </div>
          </div>

          {/* Agent Activity Log Table Section */}
          <section className="bg-surface-container-lowest border border-outline-variant rounded-lg overflow-hidden flex flex-col shadow-sm">
            <div className="px-margin-desktop py-4 border-b border-outline-variant flex justify-between items-center bg-surface-container-low/50">
              <div>
                <h3 className="font-headline-md text-headline-md text-primary">
                  Agent activity log
                </h3>
                <p className="text-body-sm font-body-sm text-on-surface-variant">
                  Real-time processing feed for all active AI entities.
                </p>
              </div>
              <div className="flex gap-2">
                <button className="flex items-center gap-2 px-4 py-2 border border-outline text-label-md font-label-md rounded-lg hover:bg-surface-container-high transition-colors cursor-pointer active:opacity-85">
                  <span className="material-symbols-outlined text-[18px]">
                    filter_list
                  </span>
                  Filter
                </button>
                <button className="flex items-center gap-2 px-4 py-2 bg-primary text-white text-label-md font-label-md rounded-lg hover:opacity-90 transition-opacity cursor-pointer active:opacity-85">
                  <span className="material-symbols-outlined text-[18px]">
                    download
                  </span>
                  Export CSV
                </button>
              </div>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-surface-container-low text-on-surface-variant font-label-md text-label-md uppercase tracking-wider">
                    <th className="px-margin-desktop py-4 font-semibold border-b border-outline-variant">
                      Timestamp
                    </th>
                    <th className="px-6 py-4 font-semibold border-b border-outline-variant">
                      Agent
                    </th>
                    <th className="px-6 py-4 font-semibold border-b border-outline-variant text-center">
                      Confidence
                    </th>
                    <th className="px-6 py-4 font-semibold border-b border-outline-variant text-right">
                      Latency (ms)
                    </th>
                    <th className="px-margin-desktop py-4 font-semibold border-b border-outline-variant text-right">
                      Action
                    </th>
                  </tr>
                </thead>
                <tbody className="text-body-sm font-body-sm text-on-surface divide-y divide-outline-variant">
                  {filteredActivities.map((act) => {
                    const isLowConfidence = act.confidence < 0.6;
                    return (
                      <tr
                        key={act.id}
                        className={`hover:bg-surface-container-low transition-colors ${
                          isLowConfidence ? "bg-error-container/20 hover:bg-error-container/30" : ""
                        }`}
                      >
                        <td className="px-margin-desktop py-4 font-mono text-[12px] text-on-surface-variant">
                          {new Date(act.created_at).toLocaleString()}
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded bg-primary-fixed flex items-center justify-center">
                              <span className="material-symbols-outlined text-primary text-[18px]">
                                smart_toy
                              </span>
                            </div>
                            <span className="font-medium">{act.agent_name}</span>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex justify-center">
                            <span
                              className={`px-2 py-1 rounded font-bold ${
                                isLowConfidence
                                  ? "bg-error-container text-on-error-container"
                                  : act.confidence > 0.9
                                  ? "bg-secondary-container text-on-secondary-container"
                                  : "bg-surface-container-high text-on-surface"
                              }`}
                            >
                              {act.confidence.toFixed(2)}
                            </span>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-right font-mono">
                          {act.latency_ms}ms
                        </td>
                        <td className="px-margin-desktop py-4 text-right">
                          <span
                            className={`px-3 py-1 rounded-full font-label-sm text-label-sm bg-surface-variant text-on-surface-variant`}
                          >
                            {act.output?.escalated ? "Escalated" : "Processed"}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                  {filteredActivities.length === 0 && (
                    <tr>
                      <td colSpan={5} className="px-margin-desktop py-8 text-center text-on-surface-variant">
                        No activities found.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
            {/* Pagination / Footer */}
            <div className="px-margin-desktop py-4 bg-surface border-t border-outline-variant flex justify-between items-center">
              <span className="text-body-sm font-body-sm text-on-surface-variant">
                Showing {filteredActivities.length} of {activities.length} requests
              </span>
              <div className="flex gap-2">
                <button className="p-2 border border-outline-variant rounded hover:bg-surface-container-high transition-colors disabled:opacity-50 cursor-pointer">
                  <span className="material-symbols-outlined">chevron_left</span>
                </button>
                <button className="p-2 border border-outline-variant rounded hover:bg-surface-container-high transition-colors cursor-pointer">
                  <span className="material-symbols-outlined">chevron_right</span>
                </button>
              </div>
            </div>
          </section>
        </div>

        {/* Footer */}
        <footer className="mt-auto border-t border-outline-variant py-stack-md px-margin-desktop flex flex-col md:flex-row justify-between items-center gap-stack-sm bg-surface-container text-on-surface-variant font-body-sm text-body-sm shrink-0">
          <span className="font-bold text-label-md text-label-md">GovAssist AI</span>
          <p>© 2026 GovAssist AI. Demo purpose only.</p>
          <div className="flex gap-stack-md">
            <Link className="hover:underline" href="/legal">Privacy Policy</Link>
            <Link className="hover:underline" href="/legal">Terms of Service</Link>
            <Link className="hover:underline" href="/support">Contact Support</Link>
          </div>
        </footer>
      </main>
    </div>
  );
}
