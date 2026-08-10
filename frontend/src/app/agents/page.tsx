"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { getUser, logout } from "../auth";

interface Agent {
  id: string;
  name: string;
  description: string;
  icon: string;
  iconBg: string;
  iconColor: string;
  status: "Online" | "Busy";
  statusBg: string;
  statusColor: string;
  dotColor: string;
  tags: string[];
  actionText: string;
  actionClass: string;
}

export default function AgentsPortal() {
  const [authorized, setAuthorized] = useState(false);
  const [lang, setLang] = useState<"EN" | "AR">("EN");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedTag, setSelectedTag] = useState<string | null>(null);

  useEffect(() => {
    const user = getUser();
    if (!user || user.role !== "admin") {
      window.location.href = "/login";
    } else {
      setAuthorized(true);
    }
  }, []);
  const [statusFilter, setStatusFilter] = useState<"All" | "Online" | "Busy">("All");

  const [agents] = useState<Agent[]>([
    {
      id: "1",
      name: "Policy Expert",
      description:
        "Specialized in national housing regulations, city zoning laws, and municipal administrative procedures. Up to date with 2026 legislative changes.",
      icon: "gavel",
      iconBg: "bg-primary-fixed",
      iconColor: "text-primary",
      status: "Online",
      statusBg: "bg-secondary-container text-on-secondary-container",
      statusColor: "text-secondary",
      dotColor: "bg-secondary",
      tags: ["Zoning", "Compliance"],
      actionText: "Start Chat",
      actionClass: "bg-primary text-on-primary hover:opacity-90 active:opacity-80 cursor-pointer",
    },
    {
      id: "2",
      name: "Document Verifier",
      description:
        "AI-powered authenticity verification for identity documents, property deeds, and academic certifications. Rapid scanning and cross-referencing.",
      icon: "description",
      iconBg: "bg-tertiary-fixed",
      iconColor: "text-tertiary",
      status: "Online",
      statusBg: "bg-secondary-container text-on-secondary-container",
      statusColor: "text-secondary",
      dotColor: "bg-secondary",
      tags: ["ID Check", "Certificates"],
      actionText: "Start Chat",
      actionClass: "bg-primary text-on-primary hover:opacity-90 active:opacity-80 cursor-pointer",
    },
    {
      id: "3",
      name: "Legal Assistant",
      description:
        "Guidance on civil litigation, family law documentation, and notary services. Helping citizens navigate judicial administrative workflows.",
      icon: "balance",
      iconBg: "bg-surface-container-highest",
      iconColor: "text-on-surface-variant",
      status: "Busy",
      statusBg: "bg-surface-variant text-on-surface-variant",
      statusColor: "text-outline",
      dotColor: "bg-outline",
      tags: ["Civil Law", "Notary"],
      actionText: "Waitlist (2m)",
      actionClass: "bg-surface-container-high text-on-surface-variant cursor-not-allowed",
    },
    {
      id: "4",
      name: "Tax Advisory",
      description:
        "Assistance with annual tax filings, corporate rebates, and VAT compliance for small to medium enterprises.",
      icon: "payments",
      iconBg: "bg-secondary-fixed",
      iconColor: "text-secondary",
      status: "Online",
      statusBg: "bg-secondary-container text-on-secondary-container",
      statusColor: "text-secondary",
      dotColor: "bg-secondary",
      tags: ["Tax Prep", "VAT"],
      actionText: "Start Chat",
      actionClass: "bg-primary text-on-primary hover:opacity-90 active:opacity-80 cursor-pointer",
    },
  ]);

  const filteredAgents = agents.filter((agent) => {
    const matchesSearch =
      agent.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      agent.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      agent.tags.some((tag) => tag.toLowerCase().includes(searchQuery.toLowerCase()));

    const matchesTag = selectedTag ? agent.tags.includes(selectedTag) : true;
    const matchesStatus =
      statusFilter === "All" ? true : agent.status === statusFilter;

    return matchesSearch && matchesTag && matchesStatus;
  });

  if (!authorized) {
    return (
      <div className="min-h-screen bg-surface flex items-center justify-center">
        <span className="material-symbols-outlined animate-spin text-[40px] text-primary">progress_activity</span>
      </div>
    );
  }

  return (
    <div className="bg-background text-on-surface min-h-screen flex flex-col font-body-md selection:bg-secondary-container selection:text-on-secondary-container">
      {/* SideNavBar Component */}
      <nav className="h-screen w-64 fixed left-0 top-0 bg-surface-container-lowest border-e border-outline-variant flex flex-col p-stack-md z-50 shrink-0">
        <div className="mb-stack-lg">
          <Link href="/" className="font-headline-md text-headline-md font-bold text-primary hover:opacity-85">
            Admin Portal
          </Link>
          <p className="font-label-sm text-label-sm text-on-surface-variant mt-1">
            Government Services
          </p>
        </div>
        <div className="mb-stack-md">
          <Link href="/chat">
            <button className="w-full bg-primary text-on-primary py-2 px-4 rounded-lg font-label-md text-label-md flex items-center justify-center gap-2 hover:opacity-90 transition-opacity cursor-pointer">
              <span className="material-symbols-outlined text-[18px]">add</span>
              New Request
            </button>
          </Link>
        </div>
        <div className="flex-1 space-y-1">
          {/* Navigation Links */}
          <Link
            className="flex items-center gap-3 px-3 py-2 text-on-surface-variant hover:bg-surface-container-high rounded-lg transition-all duration-200"
            href="/admin"
          >
            <span className="material-symbols-outlined">dashboard</span>
            <span className="font-label-md text-label-md">Overview</span>
          </Link>
          {/* Active State: AI Agents */}
          <Link
            className="flex items-center gap-3 px-3 py-2 bg-primary-fixed text-on-primary-fixed rounded-lg transition-all duration-200"
            href="/agents"
          >
            <span className="material-symbols-outlined">smart_toy</span>
            <span className="font-label-md text-label-md">AI Agents</span>
          </Link>
          <Link
            className="flex items-center gap-3 px-3 py-2 text-on-surface-variant hover:bg-surface-container-high rounded-lg transition-all duration-200"
            href="/chat"
          >
            <span className="material-symbols-outlined">verified_user</span>
            <span className="font-label-md text-label-md">Verification</span>
          </Link>
          <Link
            className="flex items-center gap-3 px-3 py-2 text-on-surface-variant hover:bg-surface-container-high rounded-lg transition-all duration-200"
            href="/admin/logs"
          >
            <span className="material-symbols-outlined">list_alt</span>
            <span className="font-label-md text-label-md">Activity Logs</span>
          </Link>
          <Link
            className="flex items-center gap-3 px-3 py-2 text-on-surface-variant hover:bg-surface-container-high rounded-lg transition-all duration-200"
            href="/settings"
          >
            <span className="material-symbols-outlined">settings</span>
            <span className="font-label-md text-label-md">Settings</span>
          </Link>
        </div>
        <div className="border-t border-outline-variant pt-stack-md space-y-1">
          <Link
            className="flex items-center gap-3 px-3 py-2 text-on-surface-variant hover:bg-surface-container-high rounded-lg transition-all duration-200"
            href="#"
          >
            <span className="material-symbols-outlined">help</span>
            <span className="font-label-md text-label-md">Support</span>
          </Link>
          <Link
            onClick={() => logout()}
            className="flex items-center gap-3 px-3 py-2 text-on-surface-variant hover:bg-surface-container-high rounded-lg transition-all duration-200"
            href="/login"
          >
            <span className="material-symbols-outlined">logout</span>
            <span className="font-label-md text-label-md">Logout</span>
          </Link>
        </div>
      </nav>

      {/* TopNavBar */}
      <header className="ml-64 bg-surface border-b border-outline-variant h-16 flex justify-between items-center px-margin-desktop sticky top-0 z-40 shrink-0">
        <div className="flex items-center gap-stack-md">
          <Link href="/" className="font-headline-md text-headline-md font-bold text-primary hover:opacity-85">
            GovAssist AI
          </Link>
          <div className="h-6 w-[1px] bg-outline-variant mx-2"></div>
          <nav className="hidden md:flex gap-stack-lg">
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
            className="font-label-md text-label-md text-primary px-3 py-1 border border-outline-variant rounded-lg hover:bg-surface-container-low cursor-pointer"
          >
            {lang === "EN" ? "EN/AR" : "AR/EN"}
          </button>
          <span className="material-symbols-outlined text-on-surface-variant cursor-pointer hover:text-primary">
            notifications
          </span>
          <span className="material-symbols-outlined text-on-surface-variant cursor-pointer hover:text-primary">
            account_circle
          </span>
        </div>
      </header>

      {/* Main Content Canvas */}
      <main className="ml-64 p-margin-desktop min-h-[calc(100vh-64px)] bg-surface-bright flex-1">
        {/* Hero Section for Agents Portal */}
        <section className="mb-stack-lg relative rounded-xl overflow-hidden h-48 flex items-center bg-primary-container">
          <div className="absolute inset-0 z-0 opacity-10 pointer-events-none">
            <div
              className="absolute top-0 left-0 w-full h-full"
              style={{
                backgroundImage: "radial-gradient(#ffffff 1px, transparent 1px)",
                backgroundSize: "45px 45px",
              }}
            ></div>
          </div>
          <div className="relative z-10 px-stack-lg text-white">
            <h2 className="font-headline-xl text-headline-xl mb-2">
              AI Assistants Portal
            </h2>
            <p className="font-body-lg text-body-lg text-on-primary-container max-w-2xl">
              Expert-level government support available 24/7. Connect with
              specialized AI agents to handle complex regulatory tasks and document
              verification.
            </p>
          </div>
        </section>

        {/* Search and Filter Bar */}
        <div className="flex justify-between items-center mb-stack-lg gap-gutter">
          <div className="relative flex-1 max-w-md">
            <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant">
              search
            </span>
            <input
              className="w-full pl-10 pr-4 py-2 bg-surface-container-lowest border border-outline-variant rounded-lg focus:ring-2 focus:ring-primary focus:border-primary font-body-md outline-none"
              placeholder="Search specialized agents..."
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <div className="flex gap-stack-sm">
            <select
              value={selectedTag || ""}
              onChange={(e) => setSelectedTag(e.target.value || null)}
              className="px-4 py-2 border border-outline-variant rounded-lg font-label-md text-label-md bg-surface-container-lowest focus:ring-2 focus:ring-primary focus:outline-none"
            >
              <option value="">All Expertise</option>
              <option value="Zoning">Zoning</option>
              <option value="Compliance">Compliance</option>
              <option value="ID Check">ID Check</option>
              <option value="Certificates">Certificates</option>
              <option value="Civil Law">Civil Law</option>
              <option value="Notary">Notary</option>
              <option value="Tax Prep">Tax Prep</option>
              <option value="VAT">VAT</option>
            </select>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as any)}
              className="px-4 py-2 border border-outline-variant rounded-lg font-label-md text-label-md bg-surface-container-lowest focus:ring-2 focus:ring-primary focus:outline-none"
            >
              <option value="All">All Statuses</option>
              <option value="Online">Online</option>
              <option value="Busy">Busy</option>
            </select>
          </div>
        </div>

        {/* Bento Grid for AI Agents */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-gutter">
          {filteredAgents.map((agent) => {
            const isOnline = agent.status === "Online";
            return (
              <div
                key={agent.id}
                className="bg-surface-container-lowest border border-outline-variant rounded-xl p-stack-md flex flex-col agent-card-hover group"
              >
                <div className="flex justify-between items-start mb-stack-md">
                  <div
                    className={`w-12 h-12 rounded-lg ${agent.iconBg} flex items-center justify-center`}
                  >
                    <span className={`material-symbols-outlined ${agent.iconColor} text-[28px]`}>
                      {agent.icon}
                    </span>
                  </div>
                  <span
                    className={`flex items-center gap-1 px-2 py-1 rounded-full text-label-sm font-label-sm ${agent.statusBg} ${agent.statusColor}`}
                  >
                    <span className={`w-1.5 h-1.5 rounded-full ${agent.dotColor}`}></span>
                    {agent.status}
                  </span>
                </div>
                <h3 className="font-headline-md text-headline-md mb-2">
                  {agent.name}
                </h3>
                <p className="font-body-md text-body-md text-on-surface-variant flex-1 mb-stack-md">
                  {agent.description}
                </p>
                <div className="flex flex-wrap gap-2 mb-stack-lg">
                  {agent.tags.map((tag) => (
                    <span
                      key={tag}
                      className="px-2 py-0.5 bg-surface-container text-on-surface-variant rounded-lg text-label-sm font-label-sm border border-outline-variant"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
                {isOnline ? (
                  <Link href="/chat" className="w-full">
                    <button className={`w-full py-3 rounded-lg font-label-md text-label-md flex items-center justify-center gap-2 transition-all ${agent.actionClass}`}>
                      {agent.actionText}
                      <span className="material-symbols-outlined text-[18px] group-hover:translate-x-1 transition-transform">
                        send
                      </span>
                    </button>
                  </Link>
                ) : (
                  <button
                    disabled
                    className={`w-full py-3 rounded-lg font-label-md text-label-md flex items-center justify-center gap-2 transition-all ${agent.actionClass}`}
                  >
                    {agent.actionText}
                    <span className="material-symbols-outlined text-[18px]">
                      hourglass_empty
                    </span>
                  </button>
                )}
              </div>
            );
          })}
          {filteredAgents.length === 0 && (
            <div className="col-span-full py-12 text-center text-on-surface-variant">
              No agents found matching your search.
            </div>
          )}

          {/* Feature Card: Custom Agent */}
          <div className="col-span-1 md:col-span-2 bg-gradient-to-br from-primary-container to-tertiary-container text-white border border-outline-variant rounded-xl p-stack-md flex items-center justify-between overflow-hidden relative">
            {/* Subtle Mesh Background */}
            <div className="absolute inset-0 opacity-20 pointer-events-none">
              <div className="absolute top-0 right-0 w-64 h-64 bg-secondary rounded-full filter blur-[80px] -translate-y-1/2 translate-x-1/2"></div>
            </div>
            <div className="relative z-10 max-w-md">
              <h3 className="font-headline-lg text-headline-lg mb-stack-sm">
                Need a Custom Agent?
              </h3>
              <p className="font-body-md text-body-md text-on-primary-container mb-stack-md">
                For corporate partners and government departments, we provide
                tailored AI model training based on your specific documentation.
              </p>
              <button className="px-6 py-2 bg-white text-primary rounded-lg font-label-md text-label-md hover:bg-opacity-90 transition-opacity cursor-pointer">
                Request Enterprise Solution
              </button>
            </div>
            <div className="hidden md:block w-1/3 relative h-32"></div>
          </div>
        </div>

        {/* Recent Activity Logs Integrated */}
        <section className="mt-stack-lg bg-surface-container-lowest border border-outline-variant rounded-xl p-stack-md">
          <div className="flex justify-between items-center mb-stack-md border-b border-outline-variant pb-stack-sm">
            <h3 className="font-headline-md text-headline-md">
              Recent Agent Sessions
            </h3>
            <Link className="text-primary font-label-md text-label-md hover:underline" href="/admin">
              View All History
            </Link>
          </div>
          <div className="space-y-4">
            <div className="flex items-center justify-between py-2 border-b border-outline-variant last:border-0">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded bg-surface-container flex items-center justify-center">
                  <span className="material-symbols-outlined text-on-surface-variant">
                    description
                  </span>
                </div>
                <div>
                  <p className="font-label-md text-label-md">
                    Document Verifier Session
                  </p>
                  <p className="font-body-sm text-body-sm text-on-surface-variant">
                    ID: #4492 • 3 documents processed
                  </p>
                </div>
              </div>
              <div className="text-right">
                <p className="font-label-md text-label-md text-secondary">
                  Completed
                </p>
                <p className="font-label-sm text-label-sm text-on-surface-variant">
                  Today, 10:24 AM
                </p>
              </div>
            </div>
            <div className="flex items-center justify-between py-2 border-b border-outline-variant last:border-0">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded bg-surface-container flex items-center justify-center">
                  <span className="material-symbols-outlined text-on-surface-variant">
                    gavel
                  </span>
                </div>
                <div>
                  <p className="font-label-md text-label-md font-medium">
                    Policy Expert Inquiry
                  </p>
                  <p className="font-body-sm text-body-sm text-on-surface-variant">
                    Subject: Residential Zoning Laws
                  </p>
                </div>
              </div>
              <div className="text-right">
                <p className="font-label-md text-label-md text-on-surface-variant">
                  Archived
                </p>
                <p className="font-label-sm text-label-sm text-on-surface-variant">
                  Yesterday, 4:15 PM
                </p>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* Footer Component */}
      <footer className="ml-64 bg-surface-container border-t border-outline-variant py-stack-md shrink-0">
        <div className="flex flex-col md:flex-row justify-between items-center px-margin-desktop gap-stack-sm">
          <div className="flex items-center gap-2">
            <span className="font-label-md text-label-md font-bold text-primary">
              GovAssist AI
            </span>
            <span className="font-body-sm text-body-sm text-on-surface-variant">
              © 2026. Demo purpose only.
            </span>
          </div>
          <div className="flex gap-stack-md">
            <Link className="font-body-sm text-body-sm text-on-surface-variant hover:underline" href="/legal">Privacy Policy</Link>
            <Link className="font-body-sm text-body-sm text-on-surface-variant hover:underline" href="/legal">Terms of Service</Link>
            <Link className="font-body-sm text-body-sm text-on-surface-variant hover:underline" href="/support">Contact Support</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
