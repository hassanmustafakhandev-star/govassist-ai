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
        {/* Hero Section with Saudi Cityscape Real Background */}
        <section className="relative min-h-[750px] lg:min-h-[820px] flex items-center overflow-hidden py-20 lg:py-28">
          {/* Real Saudi Cityscape Photo Background */}
          <div 
            className="absolute inset-0 z-0 bg-cover bg-center bg-no-repeat transform scale-105 transition-transform duration-1000 ease-out"
            style={{
              backgroundImage: "url('/images/saudi_cityscape.jpg')",
            }}
          >
            {/* Cinematic Gradient Overlays: Deep Slate, Royal Emerald & Twilight Vignette */}
            <div className="absolute inset-0 bg-gradient-to-r from-slate-950/95 via-slate-950/85 to-slate-900/60" />
            <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-transparent to-slate-950/40" />
            <div className="absolute inset-0 bg-emerald-950/20 mix-blend-overlay" />
          </div>

          <div className="container-max mx-auto px-margin-desktop relative z-10 w-full">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
              {/* Left Column: Headline and Call to Action */}
              <div className="lg:col-span-7 space-y-6">
                <div className="inline-flex items-center gap-2.5 px-4 py-1.5 bg-emerald-500/15 text-emerald-300 rounded-full border border-emerald-500/30 backdrop-blur-md shadow-lg shadow-emerald-950/30">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                  <span className="font-label-sm text-xs font-semibold uppercase tracking-wider">
                    Official Saudi Vision 2030 AI Advisor
                  </span>
                </div>

                <h1 className="font-headline-xl text-3xl sm:text-5xl lg:text-6xl font-extrabold text-white leading-tight tracking-tight">
                  Intelligent Public Services for the{" "}
                  <span className="bg-gradient-to-r from-emerald-400 via-teal-300 to-amber-200 bg-clip-text text-transparent">
                    Kingdom of Saudi Arabia
                  </span>
                </h1>

                <p className="font-body-lg text-lg text-slate-200/90 max-w-2xl leading-relaxed font-normal">
                  Empowering citizens, residents, and global enterprises with instant, authoritative guidance across Absher, Qiwa, MISA, and Vision 2030 digital transformations.
                </p>

                <div className="flex flex-wrap items-center gap-4 pt-2">
                  <Link href="/chat">
                    <button className="bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white px-8 py-3.5 rounded-xl font-label-md font-semibold flex items-center gap-2.5 shadow-lg shadow-emerald-900/40 hover:shadow-emerald-900/60 transition-all duration-200 cursor-pointer active:scale-98">
                      <span>Start AI Consultation</span>
                      <span className="material-symbols-outlined text-xl">arrow_forward</span>
                    </button>
                  </Link>
                  <Link href="/services">
                    <button className="text-white hover:text-emerald-300 px-7 py-3.5 rounded-xl font-label-md font-semibold flex items-center gap-2 bg-white/10 hover:bg-white/15 border border-white/20 backdrop-blur-md transition-all duration-200 cursor-pointer">
                      <span>Explore Services</span>
                      <span className="material-symbols-outlined text-lg">explore</span>
                    </button>
                  </Link>
                </div>

                {/* Trust Badges */}
                <div className="pt-6 flex flex-wrap items-center gap-6 text-xs text-slate-300 border-t border-white/10">
                  <div className="flex items-center gap-2">
                    <span className="material-symbols-outlined text-emerald-400 text-base">verified</span>
                    <span>Absher & Qiwa Integrated</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="material-symbols-outlined text-emerald-400 text-base">shield</span>
                    <span>Encrypted & Compliant</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="material-symbols-outlined text-emerald-400 text-base">bolt</span>
                    <span>Real-time Multi-Agent AI</span>
                  </div>
                </div>
              </div>

              {/* Right Column: Glassmorphic Live Agent Card */}
              <div className="hidden lg:block lg:col-span-5">
                <div className="relative rounded-2xl p-1 bg-gradient-to-b from-white/20 via-emerald-500/20 to-transparent shadow-2xl backdrop-blur-xl">
                  <div className="bg-slate-950/85 rounded-xl p-6 border border-white/10 text-white space-y-4">
                    <div className="flex items-center justify-between pb-3 border-b border-white/10">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-700 flex items-center justify-center text-white shadow-md">
                          <span className="material-symbols-outlined">smart_toy</span>
                        </div>
                        <div>
                          <p className="font-semibold text-sm text-white">GovAssist AI System</p>
                          <p className="text-xs text-emerald-400 flex items-center gap-1">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                            Multi-Agent Network Online
                          </p>
                        </div>
                      </div>
                      <span className="px-2.5 py-1 rounded-full bg-white/10 text-slate-300 text-[11px] font-mono">
                        v2.4 Live
                      </span>
                    </div>

                    <div className="space-y-3 font-sans text-xs">
                      <div className="p-3 rounded-lg bg-white/5 border border-white/5 flex items-start gap-2.5">
                        <span className="material-symbols-outlined text-emerald-400 text-base shrink-0 mt-0.5">account_balance</span>
                        <div>
                          <span className="font-semibold text-slate-200">Policy & Vision 2030:</span>
                          <p className="text-slate-400 mt-0.5">Instant guidance for Iqama, Absher, Qiwa & $100B AI investments.</p>
                        </div>
                      </div>

                      <div className="p-3 rounded-lg bg-white/5 border border-white/5 flex items-start gap-2.5">
                        <span className="material-symbols-outlined text-blue-400 text-base shrink-0 mt-0.5">verified</span>
                        <div>
                          <span className="font-semibold text-slate-200">Document Verification:</span>
                          <p className="text-slate-400 mt-0.5">Automated OCR inspection of Iqama, National ID & CR licenses.</p>
                        </div>
                      </div>

                      <div className="p-3 rounded-lg bg-white/5 border border-white/5 flex items-start gap-2.5">
                        <span className="material-symbols-outlined text-amber-400 text-base shrink-0 mt-0.5">report_problem</span>
                        <div>
                          <span className="font-semibold text-slate-200">Complaint Escalation:</span>
                          <p className="text-slate-400 mt-0.5">Automated ticket tracking and ministry dispute resolution.</p>
                        </div>
                      </div>
                    </div>

                    <div className="pt-2 flex justify-between items-center text-xs text-slate-400 border-t border-white/10">
                      <span>Response Latency: ~0.4s</span>
                      <span className="text-emerald-400 font-semibold">99.8% Accuracy</span>
                    </div>
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
              © 2026 GovAssist AI. All rights reserved.
            </span>
          </div>
          <div className="flex gap-gutter">
            <Link className="font-body-sm text-body-sm text-on-surface-variant hover:underline" href="/legal">Privacy Policy</Link>
            <Link className="font-body-sm text-body-sm text-on-surface-variant hover:underline" href="/legal">Terms of Service</Link>
            <Link className="font-body-sm text-body-sm text-on-surface-variant hover:underline" href="/support">Contact Support</Link>
          </div>
        </div>
        <div className="container-max mx-auto px-margin-desktop mt-stack-md text-center">
          <p className="font-body-sm text-body-sm text-on-surface-variant opacity-80">
            Autonomous Citizen & Expatriate Services Platform for the Kingdom of Saudi Arabia 🇸🇦
          </p>
        </div>
      </footer>
    </div>
  );
}
