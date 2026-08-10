"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { getUser, logout, User } from "./auth";

export default function Home() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [lang, setLang] = useState<"EN" | "AR">("EN");
  const [user, setUser] = useState<User | null>(null);
  const [showNotifications, setShowNotifications] = useState(false);
  const [showProfile, setShowProfile] = useState(false);
  const [hasUnread, setHasUnread] = useState(true);

  useEffect(() => {
    setUser(getUser());
    const handleScroll = () => {
      if (window.scrollY > 20) {
        setIsScrolled(true);
      } else {
        setIsScrolled(false);
      }
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <div className="bg-surface text-on-surface font-body-md selection:bg-secondary-container selection:text-on-secondary-container min-h-screen flex flex-col">
      {/* Top Navigation Bar */}
      <nav
        className={`sticky top-0 z-50 w-full border-b border-outline-variant flex justify-between items-center px-margin-desktop h-16 transition-all duration-200 ${
          isScrolled
            ? "shadow-sm bg-white/95 backdrop-blur-md"
            : "bg-surface"
        }`}
      >
        <div className="flex items-center gap-stack-sm">
          <span className="material-symbols-outlined text-primary text-3xl">
            account_balance
          </span>
          <span className="font-headline-md text-headline-md font-bold text-primary">
            GovAssist AI
          </span>
        </div>
        <div className="hidden md:flex items-center gap-gutter">
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
            className="font-body-md text-body-md text-primary border-b-2 border-primary pb-1 transition-colors"
            href="/chat"
          >
            Inquiry
          </Link>
        </div>
        <div className="flex items-center gap-stack-md">
          <button
            onClick={() => setLang(lang === "EN" ? "AR" : "EN")}
            className="font-label-md text-label-md text-primary px-3 py-1.5 border border-outline-variant hover:bg-surface-container-low transition-colors rounded-lg flex items-center gap-2 cursor-pointer active:opacity-80"
          >
            <span className="material-symbols-outlined text-[18px]">
              language
            </span>
            {lang === "EN" ? "EN/AR" : "AR/EN"}
          </button>
          <div className="flex items-center gap-stack-sm border-s border-outline-variant ps-stack-md relative">
            {/* Notifications Button */}
            <div className="relative flex items-center">
              <button 
                onClick={() => {
                  setShowNotifications(!showNotifications);
                  setShowProfile(false);
                  setHasUnread(false);
                }}
                className="material-symbols-outlined text-on-surface-variant hover:text-primary transition-colors cursor-pointer active:opacity-80 relative"
              >
                notifications
                {hasUnread && (
                  <span className="absolute top-0 right-0 w-2 h-2 bg-red-600 rounded-full border border-white"></span>
                )}
              </button>
              
              {showNotifications && (
                <div className="absolute right-0 mt-3 top-6 w-80 bg-white border border-outline-variant rounded-xl shadow-lg p-4 z-50 text-left">
                  <div className="flex justify-between items-center mb-3 pb-2 border-b border-outline-variant">
                    <span className="font-label-md text-label-md font-bold text-primary">Notifications</span>
                    <button 
                      onClick={() => setHasUnread(false)}
                      className="text-[11px] text-secondary hover:underline cursor-pointer"
                    >
                      Clear
                    </button>
                  </div>
                  <div className="space-y-3 max-h-64 overflow-y-auto">
                    <div className="p-2 hover:bg-surface-container rounded-lg transition-colors border-l-4 border-emerald-600 pl-3">
                      <p className="font-label-sm text-label-sm text-primary font-bold">Identity Verification Approved</p>
                      <p className="font-body-sm text-body-sm text-on-surface-variant mt-0.5">Your passport copy has been successfully verified.</p>
                      <span className="text-[10px] text-outline mt-1 block text-gray-400">10 mins ago</span>
                    </div>
                    <div className="p-2 hover:bg-surface-container rounded-lg transition-colors border-l-4 border-blue-600 pl-3">
                      <p className="font-label-sm text-label-sm text-primary font-bold">New Agent Assigned</p>
                      <p className="font-body-sm text-body-sm text-on-surface-variant mt-0.5">VisaProcessor_v4 is now handling your renewal request.</p>
                      <span className="text-[10px] text-outline mt-1 block text-gray-400">2 hours ago</span>
                    </div>
                    <div className="p-2 hover:bg-surface-container rounded-lg transition-colors border-l-4 border-gray-400 pl-3">
                      <p className="font-label-sm text-label-sm text-primary font-bold">Inquiry Status: Active</p>
                      <p className="font-body-sm text-body-sm text-on-surface-variant mt-0.5">Your citizenship ticket is currently active.</p>
                      <span className="text-[10px] text-outline mt-1 block text-gray-400">1 day ago</span>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Profile Button */}
            <div className="relative flex items-center ms-2">
              <button 
                onClick={() => {
                  setShowProfile(!showProfile);
                  setShowNotifications(false);
                }}
                className="material-symbols-outlined text-on-surface-variant hover:text-primary transition-colors cursor-pointer active:opacity-80"
              >
                account_circle
              </button>
              
              {showProfile && (
                <div className="absolute right-0 mt-3 top-6 w-56 bg-white border border-outline-variant rounded-xl shadow-lg p-4 z-50 text-left">
                  {user ? (
                    <div className="space-y-3">
                      <div>
                        <p className="font-label-md text-label-md font-bold text-primary">Logged In</p>
                        <p className="font-body-sm text-body-sm text-on-surface-variant truncate">{user.email}</p>
                        <span className="inline-block mt-1 px-2 py-0.5 bg-emerald-100 text-emerald-800 text-[11px] rounded-full capitalize">{user.role}</span>
                      </div>
                      <div className="border-t border-outline-variant pt-2 space-y-1">
                        <Link href={user.role === 'admin' ? '/admin' : '/chat'} className="block px-2 py-1.5 hover:bg-gray-100 rounded text-body-md text-on-surface hover:text-primary transition-colors">
                          Portal Dashboard
                        </Link>
                        <Link href="/settings" className="block px-2 py-1.5 hover:bg-gray-100 rounded text-body-md text-on-surface hover:text-primary transition-colors">
                          Account Settings
                        </Link>
                        <button 
                          onClick={() => {
                            logout();
                            setUser(null);
                            setShowProfile(false);
                          }}
                          className="w-full text-left px-2 py-1.5 hover:bg-red-50 rounded text-body-md text-red-600 transition-colors cursor-pointer"
                        >
                          Sign Out
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-3 text-center">
                      <p className="font-label-md text-label-md text-on-surface-variant">Access your portal</p>
                      <Link href="/login" className="block w-full text-center bg-primary text-white py-2 rounded-lg font-label-md hover:bg-opacity-95 transition-colors shadow-sm">
                        Sign In
                      </Link>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </nav>

      <main className="flex-1">
        {/* Hero Section */}
        <section className="relative min-h-[819px] flex items-center overflow-hidden bg-surface-container-lowest py-24">
          <div className="absolute inset-0 z-0 opacity-10 pointer-events-none">
            {/* Abstract geometric background pattern */}
            <div
              className="absolute top-0 left-0 w-full h-full"
              style={{
                backgroundImage: "radial-gradient(#0c2340 1px, transparent 1px)",
                backgroundSize: "40px 40px",
              }}
            ></div>
          </div>
          <div className="container-max mx-auto px-margin-desktop relative z-10 w-full">
            <div className="max-w-3xl">
              <div className="inline-flex items-center gap-2 px-3 py-1 bg-secondary-container text-on-secondary-container rounded-full mb-stack-md border border-secondary">
                <span
                  className="material-symbols-outlined text-[16px]"
                  style={{ fontVariationSettings: "'FILL' 1" }}
                >
                  verified
                </span>
                <span className="font-label-sm text-label-sm uppercase tracking-wider">
                  Official AI Ecosystem
                </span>
              </div>
              <h1 className="font-headline-xl text-headline-xl text-primary mb-stack-md leading-tight">
                AI-Powered Citizen Services for a{" "}
                <span className="text-secondary">Modern Nation</span>
              </h1>
              <p className="font-body-lg text-body-lg text-on-surface-variant mb-stack-lg max-w-2xl">
                Streamline your government requests with our intelligent assistant
                ecosystem. Experience rapid document processing and expert
                regulatory guidance in one unified portal.
              </p>
              <div className="flex flex-col sm:flex-row items-center gap-stack-md">
                <Link href="/chat">
                  <button className="bg-primary-container text-white px-8 py-3 rounded-lg font-label-md text-label-md flex items-center gap-2 hover:bg-primary transition-all shadow-sm cursor-pointer active:opacity-80">
                    Start a request
                    <span className="material-symbols-outlined">
                      arrow_forward
                    </span>
                  </button>
                </Link>
                <Link href="/chat">
                  <button className="text-primary px-8 py-3 rounded-lg font-label-md text-label-md flex items-center gap-2 hover:bg-surface-container-low border border-outline-variant transition-all cursor-pointer active:opacity-80">
                    Explore Services
                  </button>
                </Link>
              </div>
            </div>
          </div>
          {/* Hero Image/Asset - Abstract Representation of Digital Governance */}
          <div className="hidden lg:block absolute right-0 top-1/2 -translate-y-1/2 w-1/3 h-4/5 mr-margin-desktop">
            <div className="w-full h-full relative">
              <div className="absolute inset-0 bg-secondary rounded-full blur-[120px] opacity-10 animate-pulse"></div>
              <div className="relative w-full h-full border border-outline-variant bg-white p-6 rounded-xl shadow-lg">
                <div className="w-full h-full overflow-hidden rounded-lg bg-surface-container">
                  <img
                    className="w-full h-full object-cover grayscale-[0.2] hover:grayscale-0 transition-all duration-700"
                    alt="A sophisticated, high-tech interface representing government digital services. The image features clean data visualizations, holographic document icons, and abstract networking lines in a palette of deep navy, white, and emerald green. The lighting is soft and professional, reflecting a reliable and authoritative institutional environment. Minimalist architectural elements suggest a futuristic city or government center."
                    src="https://lh3.googleusercontent.com/aida-public/AB6AXuC8I2myez663qFHZj6eR2XSm4RcUGb8OcMCgUpHCfsSJ6l-_oMcKfZQDHSgUraUgNui5DfBTX7w-YU9ScSQ9kux9--pvKI0j3ZJWHRw2tJtYrDDAEyhQHVouCf1T-WkqUUffPzTKaMiICSGAeh264YVR29wL-ZHeasaq6GoBWUNgn91YjTtz4aCyCewskISHIhCa0MI2fMw7SSKIli5brMCOEQTmwiRypDa3SoDcY4x7fvO7nfZgG8v1RvvB-gVPd7DxFeN5ET8Oe5v"
                  />
                </div>
                <div className="absolute -bottom-6 -left-6 bg-white p-4 border border-outline-variant rounded-lg shadow-md max-w-[200px]">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="w-2 h-2 bg-secondary rounded-full animate-ping"></span>
                    <span className="font-label-sm text-label-sm text-on-surface-variant">
                      Live Analysis
                    </span>
                  </div>
                  <div className="h-2 w-full bg-surface-container rounded-full overflow-hidden">
                    <div className="h-full bg-secondary w-2/3"></div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Stats / Trust Bar */}
        <div className="bg-primary-container py-stack-lg border-y border-outline">
          <div className="container-max mx-auto px-margin-desktop flex flex-wrap justify-center md:justify-between items-center gap-gutter text-white">
            <div className="flex flex-col items-center md:items-start">
              <span className="font-headline-md text-headline-md font-bold">
                2.4M+
              </span>
              <span className="font-label-sm text-label-sm text-on-primary-container">
                Requests Processed
              </span>
            </div>
            <div className="h-8 w-px bg-on-primary-container/20 hidden md:block"></div>
            <div className="flex flex-col items-center md:items-start">
              <span className="font-headline-md text-headline-md font-bold">
                98%
              </span>
              <span className="font-label-sm text-label-sm text-on-primary-container">
                Accuracy Rate
              </span>
            </div>
            <div className="h-8 w-px bg-on-primary-container/20 hidden md:block"></div>
            <div className="flex flex-col items-center md:items-start">
              <span className="font-headline-md text-headline-md font-bold">
                &lt; 30s
              </span>
              <span className="font-label-sm text-label-sm text-on-primary-container">
                Response Time
              </span>
            </div>
            <div className="h-8 w-px bg-on-primary-container/20 hidden md:block"></div>
            <div className="flex flex-col items-center md:items-start">
              <span className="font-headline-md text-headline-md font-bold">
                24/7
              </span>
              <span className="font-label-sm text-label-sm text-on-primary-container">
                Agent Availability
              </span>
            </div>
          </div>
        </div>

        {/* Features Section */}
        <section className="py-24 bg-surface">
          <div className="container-max mx-auto px-margin-desktop">
            <div className="text-center mb-16">
              <h2 className="font-headline-lg text-headline-lg text-primary mb-stack-sm">
                Intelligent Public Service Ecosystem
              </h2>
              <p className="font-body-md text-body-md text-on-surface-variant max-w-xl mx-auto">
                Leverage cutting-edge artificial intelligence to navigate the
                complexities of government administration with speed and precision.
              </p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-gutter">
              {/* Feature 1: Policy Questions */}
              <div className="bg-white border border-outline-variant p-8 rounded-lg hover-card-elevation group">
                <div className="w-12 h-12 bg-surface-container-low rounded-lg flex items-center justify-center mb-6 text-primary group-hover:bg-primary-container group-hover:text-white transition-colors">
                  <span className="material-symbols-outlined text-[28px]">
                    policy
                  </span>
                </div>
                <h3 className="font-headline-md text-headline-md text-primary mb-stack-sm">
                  Policy questions
                </h3>
                <p className="font-body-md text-body-md text-on-surface-variant mb-6">
                  Instant answers to complex regulatory queries. Our AI parses
                  thousands of documents to provide you with accurate, up-to-date
                  policy guidance.
                </p>
                <Link
                  className="inline-flex items-center gap-2 font-label-md text-label-md text-secondary hover:underline"
                  href="/chat"
                >
                  Ask a question
                  <span className="material-symbols-outlined text-[18px]">
                    chevron_right
                  </span>
                </Link>
              </div>

              {/* Feature 2: Document Verification */}
              <div className="bg-white border border-outline-variant p-8 rounded-lg hover-card-elevation group">
                <div className="w-12 h-12 bg-surface-container-low rounded-lg flex items-center justify-center mb-6 text-primary group-hover:bg-primary-container group-hover:text-white transition-colors">
                  <span className="material-symbols-outlined text-[28px]">
                    verified_user
                  </span>
                </div>
                <h3 className="font-headline-md text-headline-md text-primary mb-stack-sm">
                  Document verification
                </h3>
                <p className="font-body-md text-body-md text-on-surface-variant mb-6">
                  AI-driven validation of official credentials. Securely upload
                  and verify certificates, licenses, and permits in real-time
                  with biometric-grade precision.
                </p>
                <Link
                  className="inline-flex items-center gap-2 font-label-md text-label-md text-secondary hover:underline"
                  href="/chat"
                >
                  Verify documents
                  <span className="material-symbols-outlined text-[18px]">
                    chevron_right
                  </span>
                </Link>
              </div>

              {/* Feature 3: Track Request */}
              <div className="bg-white border border-outline-variant p-8 rounded-lg hover-card-elevation group">
                <div className="w-12 h-12 bg-surface-container-low rounded-lg flex items-center justify-center mb-6 text-primary group-hover:bg-primary-container group-hover:text-white transition-colors">
                  <span className="material-symbols-outlined text-[28px]">
                    monitoring
                  </span>
                </div>
                <h3 className="font-headline-md text-headline-md text-primary mb-stack-sm">
                  Track your request
                </h3>
                <p className="font-body-md text-body-md text-on-surface-variant mb-6">
                  Real-time monitoring of application status. Get proactive
                  notifications and milestone updates as your requests move
                  through the government pipeline.
                </p>
                <Link
                  className="inline-flex items-center gap-2 font-label-md text-label-md text-secondary hover:underline"
                  href="/chat"
                >
                  Check status
                  <span className="material-symbols-outlined text-[18px]">
                    chevron_right
                  </span>
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-20">
          <div className="container-max mx-auto px-margin-desktop">
            <div className="bg-primary-container rounded-xl p-stack-lg md:p-24 relative overflow-hidden text-center md:text-left flex flex-col md:flex-row items-center justify-between gap-12">
              <div className="absolute inset-0 z-0 opacity-20 pointer-events-none">
                <div className="absolute right-0 bottom-0 w-96 h-96 bg-secondary blur-[150px] rounded-full translate-x-1/2 translate-y-1/2"></div>
              </div>
              <div className="relative z-10 max-w-xl">
                <h2 className="font-headline-lg text-headline-lg text-white mb-stack-md">
                  Ready to modernize your government experience?
                </h2>
                <p className="font-body-md text-body-md text-on-primary-container">
                  Join thousands of citizens using GovAssist AI to handle
                  regulatory tasks with ease and speed.
                </p>
              </div>
              <div className="relative z-10">
                <Link href="/chat">
                  <button className="bg-white text-primary-container px-10 py-4 rounded-lg font-label-md text-label-md hover:bg-surface-container-low transition-colors shadow-xl cursor-pointer active:opacity-80">
                    Initialize Secure Portal
                  </button>
                </Link>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="bg-surface-container border-t border-outline-variant py-stack-md mt-12">
        <div className="container-max mx-auto px-margin-desktop flex flex-col md:flex-row justify-between items-center gap-stack-sm">
          <div className="flex flex-col md:flex-row items-center gap-stack-md">
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-primary text-[20px]">
                account_balance
              </span>
              <span className="font-label-md text-label-md font-bold text-primary">
                GovAssist AI
              </span>
            </div>
            <span className="font-body-sm text-body-sm text-on-surface-variant">
              © 2026 GovAssist AI. Demo purpose only.
            </span>
          </div>
          <div className="flex gap-gutter">
            <Link className="font-body-sm text-body-sm text-on-surface-variant hover:underline" href="/legal">Privacy Policy</Link>
            <Link className="font-body-sm text-body-sm text-on-surface-variant hover:underline" href="/legal">Terms of Service</Link>
            <Link className="font-body-sm text-body-sm text-on-surface-variant hover:underline" href="/support">Contact Support</Link>
          </div>
        </div>
        <div className="container-max mx-auto px-margin-desktop mt-stack-md text-center">
          <p className="font-body-sm text-body-sm text-on-surface-variant italic opacity-75">
            Demo project — not affiliated with any government entity. This is a
            conceptual application showcasing AI in public services.
          </p>
        </div>
      </footer>
    </div>
  );
}
