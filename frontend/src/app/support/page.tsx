"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { getUser, logout, isAdmin } from "../auth";

export default function SupportPage() {
  const [authorized, setAuthorized] = useState(false);
  const [chatOpen, setChatOpen] = useState(false);
  const [ticketForm, setTicketForm] = useState({ priority: "Low - General Inquiry", department: "Verification & Identity", subject: "", description: "" });

  useEffect(() => {
    const user = getUser();
    if (!user) {
      window.location.href = "/login";
    } else {
      setAuthorized(true);
    }
  }, []);

  const handleTicketSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    alert("Ticket submitted successfully!");
    setTicketForm({ priority: "Low - General Inquiry", department: "Verification & Identity", subject: "", description: "" });
  };

  if (!authorized) {
    return (
      <div className="min-h-screen bg-surface flex items-center justify-center">
        <span className="material-symbols-outlined animate-spin text-[40px] text-primary">progress_activity</span>
      </div>
    );
  }

  return (
    <div className="bg-surface text-on-surface antialiased overflow-x-hidden min-h-screen flex">
      {/* Sidebar */}
      <aside className="h-screen w-64 fixed left-0 top-0 bg-surface-container-lowest border-e border-outline-variant flex flex-col p-stack-md z-50">
        <div className="mb-stack-lg">
          <h1 className="font-headline-md text-headline-md font-bold text-primary">
            {isAdmin() ? "Admin Portal" : "Citizen Portal"}
          </h1>
          <p className="font-label-md text-label-md text-on-surface-variant">
            {isAdmin() ? "Government Administration" : "Saudi Government Services"}
          </p>
        </div>
        <nav className="flex-grow space-y-1">
          {isAdmin() ? (
            [
              { href: "/admin", icon: "dashboard", label: "Overview" },
              { href: "/agents", icon: "smart_toy", label: "AI Agents" },
              { href: "/admin/documents", icon: "verified_user", label: "Verification" },
              { href: "/admin/logs", icon: "list_alt", label: "Activity Logs" },
              { href: "/settings", icon: "settings", label: "Settings" },
            ].map(({ href, icon, label }) => (
              <Link key={label} href={href} className="flex items-center gap-3 px-4 py-3 text-on-surface-variant hover:bg-surface-container-high transition-all duration-200 font-label-md text-label-md rounded-lg">
                <span className="material-symbols-outlined">{icon}</span> {label}
              </Link>
            ))
          ) : (
            [
              { href: "/chat", icon: "chat", label: "AI Assistant" },
              { href: "/services", icon: "grid_view", label: "Services Catalog" },
              { href: "/settings", icon: "settings", label: "Account Settings" },
            ].map(({ href, icon, label }) => (
              <Link key={label} href={href} className="flex items-center gap-3 px-4 py-3 text-on-surface-variant hover:bg-surface-container-high transition-all duration-200 font-label-md text-label-md rounded-lg">
                <span className="material-symbols-outlined">{icon}</span> {label}
              </Link>
            ))
          )}
        </nav>
        <div className="pt-4 border-t border-outline-variant mt-auto space-y-1">
          <Link href="/support" className="flex items-center gap-3 px-4 py-3 bg-primary-fixed text-on-primary-fixed rounded-lg font-label-md text-label-md font-semibold">
            <span className="material-symbols-outlined">help</span> Support
          </Link>
          <Link onClick={() => logout()} href="/login" className="flex items-center gap-3 px-4 py-3 text-error hover:bg-error-container font-label-md text-label-md rounded-lg">
            <span className="material-symbols-outlined">logout</span> Logout
          </Link>
        </div>
      </aside>

      {/* Main */}
      <main className="ml-64 min-h-screen flex flex-col w-full">
        {/* Header */}
        <header className="flex justify-between items-center px-margin-desktop h-16 w-full bg-surface border-b border-outline-variant sticky top-0 z-40">
          <div className="flex items-center gap-gutter flex-1">
            <span className="font-headline-md text-headline-md font-bold text-primary">GovAssist AI</span>
            <div className="relative w-full max-w-md hidden md:block">
              <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant">search</span>
              <input className="w-full pl-10 pr-4 py-2 bg-surface-container-low border border-outline-variant rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 text-body-sm" placeholder="Search support documents..." type="text" />
            </div>
          </div>
          <div className="flex items-center gap-6">
            <nav className="hidden lg:flex items-center gap-8">
              <Link href="/admin" className="font-body-md text-body-md text-on-surface-variant hover:text-primary transition-colors">Dashboard</Link>
              <Link href="/services" className="font-body-md text-body-md text-on-surface-variant hover:text-primary transition-colors">Services</Link>
              <Link href="/chat" className="font-body-md text-body-md text-on-surface-variant hover:text-primary transition-colors">Inquiry</Link>
            </nav>
            <div className="h-6 w-px bg-outline-variant mx-2" />
            <button className="font-label-md text-label-md text-primary font-bold">EN/AR</button>
            <div className="flex items-center gap-4">
              <button className="material-symbols-outlined text-on-surface-variant hover:text-primary">notifications</button>
              <button className="material-symbols-outlined text-on-surface-variant hover:text-primary">account_circle</button>
            </div>
          </div>
        </header>

        {/* Hero */}
        <section className="relative py-16 px-margin-desktop overflow-hidden">
          <div className="absolute inset-0 -z-10 bg-gradient-to-br from-primary-container/5 to-secondary-container/5" />
          <div className="max-w-container-max mx-auto text-center">
            <h2 className="font-headline-xl text-headline-xl text-primary mb-4">How can we assist you today?</h2>
            <p className="font-body-lg text-body-lg text-on-surface-variant mb-10 max-w-2xl mx-auto">Explore our knowledge base or reach out to our dedicated support agents for personalized assistance.</p>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-gutter max-w-4xl mx-auto">
              {[
                { icon: "article", label: "Getting Started" },
                { icon: "payments", label: "Billing & Plans" },
                { icon: "security", label: "Security & Access" },
                { icon: "api", label: "API Reference" },
              ].map(({ icon, label }) => (
                <button key={label} className="flex flex-col items-center gap-3 p-6 bg-surface-container-lowest border border-outline-variant rounded-xl hover:border-primary transition-all group">
                  <span className="material-symbols-outlined text-primary text-3xl group-hover:scale-110 transition-transform">{icon}</span>
                  <span className="font-label-md text-label-md">{label}</span>
                </button>
              ))}
            </div>
          </div>
        </section>

        {/* Content Grid */}
        <section className="px-margin-desktop py-stack-lg max-w-container-max mx-auto w-full grid grid-cols-12 gap-gutter">
          {/* Left: FAQ + Featured */}
          <div className="col-span-12 lg:col-span-8 space-y-gutter">
            <div className="bg-surface-container-lowest border border-outline-variant rounded-xl overflow-hidden" style={{ boxShadow: "0px 1px 3px rgba(0,0,0,0.05)" }}>
              <div className="px-6 py-4 border-b border-outline-variant flex justify-between items-center bg-surface-container-low/30">
                <h3 className="font-headline-md text-headline-md text-primary">Frequently Asked Questions</h3>
                <a className="text-secondary font-label-md text-label-md hover:underline" href="#">View All</a>
              </div>
              <div className="divide-y divide-outline-variant">
                {[
                  { q: "How do I verify my digital government identity?", a: "Our platform utilizes high-security biometric scanning and cross-referenced database verification. Navigate to the 'Verification' tab in your portal and follow the step-by-step instructions for document upload and facial matching." },
                  { q: "What AI agents are available for public services?", a: "GovAssist AI provides agents for Visa Processing, Tax Assistance, Municipal Permitting, and Healthcare Scheduling. Each agent is trained on specific regional regulations to ensure 100% compliance." },
                  { q: "Is my data shared with third-party vendors?", a: "No. GovAssist AI operates on a sovereign cloud infrastructure. Your data is encrypted at rest and in transit, and access is strictly limited to authorized government officials and your own account." },
                ].map(({ q, a }) => (
                  <details key={q} className="group">
                    <summary className="flex justify-between items-center p-6 cursor-pointer hover:bg-surface-container-low/50 transition-colors list-none">
                      <span className="font-body-md text-body-md font-semibold text-primary">{q}</span>
                      <span className="material-symbols-outlined transition-transform group-open:rotate-180">expand_more</span>
                    </summary>
                    <div className="px-6 pb-6 text-on-surface-variant font-body-sm text-body-sm leading-relaxed">{a}</div>
                  </details>
                ))}
              </div>
            </div>

            {/* Featured Article */}
            <div className="relative rounded-xl overflow-hidden h-64 group cursor-pointer border border-outline-variant">
              <div className="absolute inset-0 bg-cover bg-center transition-transform duration-700 group-hover:scale-105" style={{ backgroundImage: "url('https://images.unsplash.com/photo-1550751827-4bd374c3f58b?w=800&q=80')" }} />
              <div className="absolute inset-0 bg-gradient-to-t from-primary/90 to-transparent" />
              <div className="absolute bottom-0 left-0 p-8 text-white">
                <span className="px-3 py-1 bg-secondary text-[10px] font-bold uppercase rounded mb-3 inline-block">Security Update</span>
                <h4 className="font-headline-lg text-headline-lg mb-2">The Future of GovTech: End-to-End AI Integration</h4>
                <p className="font-body-sm text-body-sm opacity-80 line-clamp-2">Learn how our latest security protocols ensure that every citizen interaction is shielded by state-of-the-art encryption models.</p>
              </div>
            </div>
          </div>

          {/* Right: Channels + Ticket */}
          <div className="col-span-12 lg:col-span-4 space-y-gutter">
            <div className="bg-surface-container-lowest border border-outline-variant rounded-xl p-6" style={{ boxShadow: "0px 1px 3px rgba(0,0,0,0.05)" }}>
              <h3 className="font-headline-md text-headline-md text-primary mb-6">Support Channels</h3>
              <div className="space-y-4">
                {[
                  { icon: "forum", label: "Live Chat", sub: "Average response: 2 mins", color: "secondary" },
                  { icon: "mail", label: "Email Support", sub: "24-hour turnaround", color: "primary" },
                  { icon: "call", label: "Phone Hotline", sub: "Available 9am - 6pm EST", color: "primary" },
                ].map(({ icon, label, sub, color }) => (
                  <button key={label} className="w-full flex items-center gap-4 p-4 border border-outline-variant rounded-lg hover:border-secondary hover:bg-secondary/5 transition-all text-left">
                    <div className={`w-10 h-10 bg-${color}/10 rounded-full flex items-center justify-center`}>
                      <span className={`material-symbols-outlined text-${color}`}>{icon}</span>
                    </div>
                    <div>
                      <p className="font-label-md text-label-md text-primary">{label}</p>
                      <p className="font-body-sm text-body-sm text-on-surface-variant">{sub}</p>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            <div className="bg-surface-container-lowest border border-outline-variant rounded-xl overflow-hidden" style={{ boxShadow: "0px 1px 3px rgba(0,0,0,0.05)" }}>
              <div className="px-6 py-4 border-b border-outline-variant bg-surface-container-low/30">
                <h3 className="font-headline-md text-headline-md text-primary">Submit a Ticket</h3>
              </div>
              <form className="p-6 space-y-4" onSubmit={handleTicketSubmit}>
                <div>
                  <label className="block font-label-md text-label-md text-on-surface-variant mb-2">Priority Level</label>
                  <select value={ticketForm.priority} onChange={e => setTicketForm(f => ({ ...f, priority: e.target.value }))} className="w-full px-4 py-2 bg-surface border border-outline-variant rounded-lg focus:ring-2 focus:ring-primary/20 font-body-sm">
                    {["Low - General Inquiry", "Medium - Service Issues", "High - Urgent Access Problem", "Critical - Security Concern"].map(o => <option key={o}>{o}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block font-label-md text-label-md text-on-surface-variant mb-2">Department</label>
                  <select value={ticketForm.department} onChange={e => setTicketForm(f => ({ ...f, department: e.target.value }))} className="w-full px-4 py-2 bg-surface border border-outline-variant rounded-lg focus:ring-2 focus:ring-primary/20 font-body-sm">
                    {["Verification & Identity", "AI Agent Configuration", "Billing & Payments", "Technical Support"].map(o => <option key={o}>{o}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block font-label-md text-label-md text-on-surface-variant mb-2">Subject</label>
                  <input value={ticketForm.subject} onChange={e => setTicketForm(f => ({ ...f, subject: e.target.value }))} className="w-full px-4 py-2 bg-surface border border-outline-variant rounded-lg focus:ring-2 focus:ring-primary/20 font-body-sm" placeholder="Brief summary of the issue" type="text" />
                </div>
                <div>
                  <label className="block font-label-md text-label-md text-on-surface-variant mb-2">Description</label>
                  <textarea value={ticketForm.description} onChange={e => setTicketForm(f => ({ ...f, description: e.target.value }))} className="w-full px-4 py-2 bg-surface border border-outline-variant rounded-lg focus:ring-2 focus:ring-primary/20 font-body-sm resize-none" placeholder="Provide detailed information..." rows={4} />
                </div>
                <button className="w-full py-3 bg-primary text-white font-label-md text-label-md rounded-lg hover:opacity-90 transition-opacity" type="submit">Submit Ticket</button>
              </form>
            </div>
          </div>
        </section>

        {/* Footer */}
        <footer className="mt-auto border-t border-outline-variant bg-surface-container py-stack-md">
          <div className="px-margin-desktop flex flex-col md:flex-row justify-between items-center gap-stack-sm max-w-container-max mx-auto w-full">
            <span className="font-label-md text-label-md font-bold text-on-surface-variant">GovAssist AI</span>
            <p className="font-body-sm text-body-sm text-on-surface-variant">© 2026 GovAssist AI. Demo purpose only.</p>
            <div className="flex gap-6">
              <Link href="/legal" className="font-body-sm text-body-sm text-on-surface-variant hover:underline">Privacy Policy</Link>
              <Link href="/legal" className="font-body-sm text-body-sm text-on-surface-variant hover:underline">Terms of Service</Link>
              <Link href="/support" className="font-body-sm text-body-sm text-on-surface-variant hover:underline">Contact Support</Link>
            </div>
          </div>
        </footer>
      </main>

      {/* Chat FAB */}
      <button onClick={() => setChatOpen(o => !o)} className="fixed bottom-8 right-8 w-14 h-14 bg-secondary text-white rounded-full shadow-lg flex items-center justify-center hover:scale-110 transition-transform z-50">
        <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>chat</span>
      </button>

      {/* Chat Widget */}
      {chatOpen && (
        <div className="fixed bottom-24 right-8 w-80 bg-surface-container-lowest border border-outline-variant rounded-xl shadow-xl overflow-hidden z-50">
          <div className="bg-primary p-4 text-white flex justify-between items-center">
            <div className="flex items-center gap-3">
              <div className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse" />
              <span className="font-label-md text-label-md">Support Agent Online</span>
            </div>
            <button className="material-symbols-outlined text-sm" onClick={() => setChatOpen(false)}>close</button>
          </div>
          <div className="h-64 p-4 overflow-y-auto flex flex-col gap-3">
            <div className="bg-surface-container-low p-3 rounded-lg rounded-tl-none self-start max-w-[85%]">
              <p className="text-xs text-on-surface-variant">Hello! I&apos;m your GovAssist AI concierge. How can I help you navigate our portal today?</p>
            </div>
          </div>
          <div className="p-3 border-t border-outline-variant bg-surface flex gap-2">
            <input className="flex-grow px-3 py-2 bg-surface-container-low border border-outline-variant rounded-lg text-xs focus:outline-none" placeholder="Type message..." type="text" />
            <button className="material-symbols-outlined text-primary">send</button>
          </div>
        </div>
      )}
    </div>
  );
}
