"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { getUser, logout } from "../../auth";

type DocStatus = "Verified" | "Failed" | "Pending";

const docs = [
  { name: "Passport_Copy_V2.pdf", type: "Identification", citizen: "Ahmed Al-Mansouri", date: "Oct 24, 2024 • 14:22", status: "Verified" as DocStatus },
  { name: "Utility_Bill_Housing.jpg", type: "Proof of Residency", citizen: "Sarah Jenkins", date: "Oct 24, 2024 • 11:05", status: "Failed" as DocStatus },
  { name: "Degree_Certificate.pdf", type: "Educational Qualification", citizen: "Li Wei", date: "Oct 23, 2024 • 09:45", status: "Pending" as DocStatus },
  { name: "Marriage_License.pdf", type: "Legal Records", citizen: "Maria Garcia", date: "Oct 23, 2024 • 17:10", status: "Verified" as DocStatus },
];

const statusConfig: Record<DocStatus, { bg: string; text: string; icon: string }> = {
  Verified: { bg: "bg-secondary-container text-on-secondary-container", text: "Verified", icon: "check_circle" },
  Failed: { bg: "bg-error-container text-on-error-container", text: "Failed", icon: "error" },
  Pending: { bg: "bg-surface-container-high text-on-surface-variant", text: "Pending", icon: "sync" },
};

export default function DocumentsPage() {
  const [authorized, setAuthorized] = useState(false);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);

  useEffect(() => {
    const user = getUser();
    if (!user || user.role !== "admin") {
      window.location.href = "/login";
    } else {
      setAuthorized(true);
    }
  }, []);

  const filtered = docs.filter(d =>
    d.name.toLowerCase().includes(search.toLowerCase()) ||
    d.citizen.toLowerCase().includes(search.toLowerCase())
  );

  if (!authorized) {
    return (
      <div className="min-h-screen bg-surface flex items-center justify-center">
        <span className="material-symbols-outlined animate-spin text-[40px] text-primary">progress_activity</span>
      </div>
    );
  }

  return (
    <div className="bg-surface text-on-surface min-h-screen flex">
      {/* Sidebar */}
      <aside className="h-screen w-64 fixed left-0 top-0 bg-surface-container-lowest border-e border-outline-variant flex flex-col p-stack-md z-50">
        <div className="mb-stack-lg">
          <h1 className="font-headline-md text-headline-md font-bold text-primary">GovAssist AI</h1>
          <p className="font-label-sm text-label-sm text-on-surface-variant opacity-70">Admin Portal</p>
        </div>
        <div className="flex items-center gap-3 p-3 mb-6 bg-surface-container rounded-lg border border-outline-variant">
          <div className="w-10 h-10 rounded-full bg-primary-fixed flex items-center justify-center text-on-primary-fixed font-bold text-headline-md">A</div>
          <div>
            <p className="font-label-md text-label-md text-primary">Admin User</p>
            <p className="font-label-sm text-label-sm text-on-surface-variant">Government Services</p>
          </div>
        </div>
        <nav className="flex-1 space-y-1 overflow-y-auto">
          {[
            { href: "/admin", icon: "dashboard", label: "Overview" },
            { href: "/agents", icon: "smart_toy", label: "AI Agents" },
            { href: "/admin/logs", icon: "list_alt", label: "Activity Logs" },
            { href: "/settings", icon: "settings", label: "Settings" },
          ].map(({ href, icon, label }) => (
            <Link key={label} href={href} className="flex items-center gap-3 px-4 py-3 font-label-md text-label-md text-on-surface-variant hover:bg-surface-container-high transition-all rounded-lg">
              <span className="material-symbols-outlined">{icon}</span>{label}
            </Link>
          ))}
          <Link href="/admin/documents" className="flex items-center gap-3 px-4 py-3 font-label-md text-label-md bg-primary-fixed text-on-primary-fixed rounded-lg">
            <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>verified_user</span>Verification
          </Link>
        </nav>
        <div className="mt-auto pt-4 border-t border-outline-variant space-y-1">
          <button className="w-full mb-2 bg-primary-container text-white py-2 rounded-lg font-label-md flex items-center justify-center gap-2 hover:opacity-90 transition-opacity">
            <span className="material-symbols-outlined text-sm">add</span>New Request
          </button>
          <Link href="/support" className="flex items-center gap-3 px-4 py-2 font-label-md text-label-md text-on-surface-variant hover:underline">
            <span className="material-symbols-outlined">help</span>Support
          </Link>
          <Link onClick={() => logout()} href="/login" className="flex items-center gap-3 px-4 py-2 font-label-md text-label-md text-on-surface-variant hover:underline">
            <span className="material-symbols-outlined">logout</span>Logout
          </Link>
        </div>
      </aside>

      {/* Main */}
      <main className="ml-64 min-h-screen flex flex-col w-full">
        {/* Header */}
        <header className="bg-surface border-b border-outline-variant sticky top-0 z-40 flex justify-between items-center px-margin-desktop h-16 w-full">
          <div className="flex items-center gap-gutter">
            <div className="relative w-64">
              <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant">search</span>
              <input value={search} onChange={e => setSearch(e.target.value)} className="w-full bg-surface-container-low border border-outline-variant rounded-full py-2 pl-10 pr-4 text-body-sm focus:outline-none focus:ring-2 focus:ring-primary-container" placeholder="Search documents..." type="text" />
            </div>
            <nav className="hidden md:flex gap-6">
              <Link href="/admin" className="font-body-md text-body-md text-on-surface-variant hover:text-primary transition-colors">Dashboard</Link>
              <Link href="/services" className="font-body-md text-body-md text-on-surface-variant hover:text-primary transition-colors">Services</Link>
              <Link href="/chat" className="font-body-md text-body-md text-on-surface-variant hover:text-primary transition-colors">Inquiry</Link>
            </nav>
          </div>
          <div className="flex items-center gap-4">
            <button className="font-label-md text-label-md text-primary font-bold">EN/AR</button>
            <button className="p-2 hover:bg-surface-container rounded-full text-on-surface-variant"><span className="material-symbols-outlined">notifications</span></button>
            <button className="p-2 hover:bg-surface-container rounded-full text-on-surface-variant"><span className="material-symbols-outlined">account_circle</span></button>
          </div>
        </header>

        <div className="p-margin-desktop flex-1">
          {/* Page Header */}
          <div className="mb-stack-lg flex justify-between items-end">
            <div>
              <h2 className="font-headline-lg text-headline-lg text-primary mb-1">Document Management</h2>
              <p className="font-body-md text-body-md text-on-surface-variant">Review and verify citizen-submitted documentation with AI-assisted verification.</p>
            </div>
            <div className="flex gap-stack-sm">
              <button className="bg-surface-container-highest border border-outline-variant px-4 py-2 rounded-lg font-label-md flex items-center gap-2 hover:bg-surface-variant transition-colors">
                <span className="material-symbols-outlined">filter_list</span>Filter
              </button>
              <button className="bg-primary text-white px-4 py-2 rounded-lg font-label-md flex items-center gap-2 hover:opacity-90 transition-opacity shadow-sm">
                <span className="material-symbols-outlined">download</span>Export Report
              </button>
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-gutter mb-stack-lg">
            {[
              { label: "Total Documents", value: "1,284", sub: "+12% vs last mo.", subColor: "text-secondary" },
              { label: "Pending Review", value: "42", sub: "Requires Attention", subColor: "text-error" },
              { label: "AI Verified", value: "96.4%", sub: "trending_up", isIcon: true },
              { label: "Manual Overrides", value: "18", sub: "Last 24 hrs", subColor: "text-on-surface-variant" },
            ].map(({ label, value, sub, subColor, isIcon }) => (
              <div key={label} className="bg-surface-container-lowest p-stack-md rounded-xl border border-outline-variant">
                <p className="font-label-sm text-label-sm text-on-surface-variant uppercase tracking-wider">{label}</p>
                <div className="flex items-end justify-between mt-2">
                  <h3 className="font-headline-lg text-headline-lg text-primary">{value}</h3>
                  {isIcon ? <span className="material-symbols-outlined text-secondary">{sub}</span> : <span className={`font-label-sm ${subColor}`}>{sub}</span>}
                </div>
              </div>
            ))}
          </div>

          {/* Table */}
          <div className="bg-surface-container-lowest border border-outline-variant rounded-xl overflow-hidden">
            <div className="px-6 py-4 border-b border-outline-variant bg-surface-container-low flex justify-between items-center">
              <h4 className="font-label-md text-label-md text-primary">Recent Submissions</h4>
              <div className="flex gap-4">
                <div className="flex items-center gap-2"><span className="w-2 h-2 rounded-full bg-secondary" /><span className="font-label-sm text-label-sm">Verified</span></div>
                <div className="flex items-center gap-2"><span className="w-2 h-2 rounded-full bg-error" /><span className="font-label-sm text-label-sm">Failed</span></div>
              </div>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead className="bg-surface-container-low border-b border-outline-variant">
                  <tr>
                    {["Document Name", "Citizen Name", "Date Uploaded", "AI Status", "Actions"].map((h, i) => (
                      <th key={h} className={`px-6 py-4 font-label-md text-label-md text-primary uppercase tracking-tight ${i === 4 ? "text-right" : ""}`}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-outline-variant">
                  {filtered.map((doc) => {
                    const s = statusConfig[doc.status];
                    const iconBg = doc.status === "Verified" ? "bg-primary-fixed text-on-primary-fixed" : doc.status === "Failed" ? "bg-error-container text-on-error-container" : "bg-surface-container-highest text-primary";
                    const docIcon = doc.name.endsWith(".pdf") ? "description" : "image";
                    return (
                      <tr key={doc.name} className="hover:bg-surface-container transition-colors group">
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <div className={`w-10 h-10 rounded flex items-center justify-center ${iconBg}`}>
                              <span className="material-symbols-outlined">{docIcon}</span>
                            </div>
                            <div>
                              <p className="font-label-md text-label-md text-primary">{doc.name}</p>
                              <p className="font-label-sm text-label-sm text-on-surface-variant">{doc.type}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 font-body-md text-body-md text-on-surface">{doc.citizen}</td>
                        <td className="px-6 py-4 font-body-sm text-body-sm text-on-surface-variant">{doc.date}</td>
                        <td className="px-6 py-4">
                          <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full font-label-sm text-label-sm ${s.bg}`}>
                            <span className={`material-symbols-outlined text-[14px] ${doc.status === "Pending" ? "animate-spin" : ""}`}>{s.icon}</span>
                            {s.text}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-right">
                          <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                            <button className="p-2 hover:bg-surface-container-highest rounded-lg text-primary transition-colors" title="View"><span className="material-symbols-outlined">visibility</span></button>
                            {doc.status === "Failed" ? (
                              <button className="px-3 py-1.5 bg-primary text-white rounded-lg font-label-sm flex items-center gap-2"><span className="material-symbols-outlined text-[16px]">edit_square</span>Override</button>
                            ) : (
                              <button className="p-2 hover:bg-surface-container-highest rounded-lg text-on-surface-variant transition-colors"><span className="material-symbols-outlined">edit_square</span></button>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
            {/* Pagination */}
            <div className="px-6 py-4 bg-surface-container-low border-t border-outline-variant flex justify-between items-center">
              <p className="font-body-sm text-body-sm text-on-surface-variant">Showing 1 to 10 of 1,284 documents</p>
              <div className="flex gap-2">
                <button disabled={page === 1} onClick={() => setPage(p => p - 1)} className="p-2 border border-outline-variant rounded-lg hover:bg-surface-container transition-colors disabled:opacity-50">
                  <span className="material-symbols-outlined">chevron_left</span>
                </button>
                {[1, 2, 3].map(n => (
                  <button key={n} onClick={() => setPage(n)} className={`w-10 h-10 rounded-lg font-label-md transition-colors ${page === n ? "bg-primary text-white" : "hover:bg-surface-container-high"}`}>{n}</button>
                ))}
                <span className="w-10 h-10 flex items-center justify-center">...</span>
                <button onClick={() => setPage(129)} className="w-10 h-10 hover:bg-surface-container-high rounded-lg font-label-md transition-colors">129</button>
                <button onClick={() => setPage(p => p + 1)} className="p-2 border border-outline-variant rounded-lg hover:bg-surface-container transition-colors">
                  <span className="material-symbols-outlined">chevron_right</span>
                </button>
              </div>
            </div>
          </div>

          {/* AI Insights Bento */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-gutter mt-stack-lg">
            <div className="md:col-span-2 bg-surface-container-lowest border border-outline-variant rounded-xl p-6 relative overflow-hidden group">
              <div className="relative z-10">
                <h4 className="font-headline-md text-headline-md text-primary mb-2">AI Verification Insights</h4>
                <p className="font-body-md text-body-md text-on-surface-variant mb-6 max-w-md">Our neural network flags documents with low confidence scores. Current throughput is 4.2 documents/second with a 98% first-pass accuracy rate.</p>
                <div className="flex gap-4">
                  {[{ label: "Optical Character Recognition (OCR)", pct: 92 }, { label: "Forgery Detection", pct: 99 }].map(({ label, pct }) => (
                    <div key={label} className="bg-surface p-4 rounded-lg border border-outline-variant flex-1">
                      <p className="font-label-sm text-label-sm text-on-surface-variant mb-1">{label}</p>
                      <div className="w-full bg-surface-container-highest h-2 rounded-full overflow-hidden">
                        <div className="bg-secondary h-full" style={{ width: `${pct}%` }} />
                      </div>
                      <p className="text-right font-label-sm text-label-sm mt-1 text-secondary">{pct}% Reliable</p>
                    </div>
                  ))}
                </div>
              </div>
              <div className="absolute -right-10 -bottom-10 opacity-5 group-hover:scale-110 transition-transform duration-700 pointer-events-none">
                <span className="material-symbols-outlined text-[240px]">query_stats</span>
              </div>
            </div>
            <div className="bg-primary-container text-white p-6 rounded-xl border border-primary relative overflow-hidden">
              <h4 className="font-headline-md text-headline-md text-white mb-2">System Alert</h4>
              <p className="font-body-sm text-body-sm text-white/80 mb-4">A high volume of &quot;Utility Bill&quot; uploads has been detected in the last hour. Manual review recommended for queue #4.</p>
              <button className="bg-white text-primary px-4 py-2 rounded-lg font-label-md text-label-md hover:opacity-90 transition-opacity">Review Queue</button>
              <div className="absolute -right-6 -bottom-6 opacity-10 pointer-events-none">
                <span className="material-symbols-outlined text-[160px]">warning</span>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
