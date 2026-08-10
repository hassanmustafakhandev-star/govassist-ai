"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { getUser, logout, isAdmin } from "../auth";

interface ServiceItem {
  name: string;
  desc: string;
}

interface Category {
  id: string;
  name: string;
  icon: string;
  services: ServiceItem[];
}

export default function ServicesDirectory() {
  const [authorized, setAuthorized] = useState(false);
  const [lang, setLang] = useState<"EN" | "AR">("EN");
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    const user = getUser();
    if (!user) {
      window.location.href = "/login";
    } else {
      setAuthorized(true);
    }
  }, []);

  const categories: Category[] = [
    {
      id: "identity",
      name: "Identity & Civil Status",
      icon: "fingerprint",
      services: [
        { name: "National ID Renewal", desc: "Standard process (5-7 days)" },
        { name: "Birth Certificate Request", desc: "Digital and physical copies" },
        { name: "Marriage Registration", desc: "Official civil documentation" },
      ],
    },
    {
      id: "labor",
      name: "Labor & Employment",
      icon: "work",
      services: [
        { name: "Work Permit Issuance", desc: "For expatriate residents" },
        { name: "Job Seekers Allowance", desc: "Social support program" },
        { name: "Pension Enrollment", desc: "Retirement fund planning" },
      ],
    },
    {
      id: "housing",
      name: "Housing",
      icon: "home",
      services: [
        { name: "Land Allotment Request", desc: "Residential development" },
        { name: "Housing Loan Subsidy", desc: "Interest rate reduction" },
        { name: "Renovation Permit", desc: "Structural modifications" },
      ],
    },
    {
      id: "transportation",
      name: "Transportation",
      icon: "directions_car",
      services: [
        { name: "Driving License Renewal", desc: "Includes vision test booking" },
        { name: "Vehicle Registration", desc: "Annual inspection & tabs" },
        { name: "Traffic Fine Payment", desc: "Instant digital clearance" },
      ],
    },
    {
      id: "education",
      name: "Education",
      icon: "school",
      services: [
        { name: "Public School Enrollment", desc: "For primary & secondary" },
        { name: "University Grants", desc: "Domestic and international" },
      ],
    },
  ];

  if (!authorized) {
    return (
      <div className="min-h-screen bg-surface flex items-center justify-center">
        <span className="material-symbols-outlined animate-spin text-[40px] text-primary">progress_activity</span>
      </div>
    );
  }

  return (
    <div className="bg-surface text-on-surface min-h-screen flex flex-col font-body-md selection:bg-secondary-container selection:text-on-secondary-container">
      {/* TopNavBar */}
      <header className="fixed top-0 w-full z-50 bg-surface/80 backdrop-blur-md border-b border-outline-variant shrink-0">
        <div className="flex justify-between items-center px-margin-desktop h-16 w-full">
          <div className="flex items-center gap-stack-lg">
            <Link href="/" className="font-headline-md text-headline-md font-bold text-primary hover:opacity-85">
              GovAssist AI
            </Link>
            <nav className="hidden md:flex gap-stack-md">
              <Link
                className="font-body-md text-body-md text-on-surface-variant hover:text-primary transition-colors"
                href={isAdmin() ? "/admin" : "/chat"}
              >
                {isAdmin() ? "Admin Portal" : "AI Assistant"}
              </Link>
              <Link
                className="font-body-md text-body-md text-primary border-b-2 border-primary pb-1"
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
              className="font-label-md text-label-md text-primary font-bold px-stack-md cursor-pointer hover:opacity-85"
            >
              {lang === "EN" ? "EN/AR" : "AR/EN"}
            </button>
            <div className="flex gap-stack-sm">
              <button className="p-2 text-on-surface-variant hover:bg-surface-container rounded-full transition-colors cursor-pointer active:opacity-80">
                <span className="material-symbols-outlined">notifications</span>
              </button>
              <button className="p-2 text-on-surface-variant hover:bg-surface-container rounded-full transition-colors cursor-pointer active:opacity-80">
                <span className="material-symbols-outlined">account_circle</span>
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="pt-32 pb-stack-lg px-margin-desktop max-w-container-max mx-auto flex-1 w-full">
        {/* Hero & Search */}
        <section className="mb-stack-lg text-center max-w-3xl mx-auto">
          <h1 className="font-headline-xl text-headline-xl text-primary mb-stack-sm leading-tight">
            Government Services Directory
          </h1>
          <p className="font-body-lg text-body-lg text-on-surface-variant mb-stack-lg">
            Access all essential public services in one place. Streamlined,
            verified, and always available.
          </p>
          <div className="relative group">
            <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none text-outline">
              <span className="material-symbols-outlined">search</span>
            </div>
            <input
              className="w-full pl-12 pr-24 py-4 bg-surface-container-lowest border border-outline-variant rounded-lg focus:ring-2 focus:ring-primary focus:border-primary outline-none transition-all font-body-md text-body-md shadow-sm"
              placeholder="Search for identity cards, housing grants, or labor permits..."
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            <div className="absolute right-3 inset-y-0 flex items-center">
              <button className="bg-primary text-on-primary px-stack-md py-2 rounded-lg font-label-md text-label-md hover:opacity-90 transition-opacity cursor-pointer active:opacity-80">
                Search
              </button>
            </div>
          </div>
        </section>

        {/* Services Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-gutter">
          {categories.map((category) => {
            const matchesCategory =
              category.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
              category.services.some(
                (s) =>
                  s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                  s.desc.toLowerCase().includes(searchQuery.toLowerCase())
              );

            const opacityClass =
              searchQuery && !matchesCategory ? "opacity-30 scale-98" : "opacity-100";

            return (
              <div
                key={category.id}
                className={`bg-surface-container-lowest border border-outline-variant rounded-xl overflow-hidden flex flex-col service-card transition-all duration-300 ${opacityClass}`}
              >
                <div className="p-stack-md bg-surface-container border-b border-outline-variant flex items-center justify-between">
                  <div className="flex items-center gap-stack-sm">
                    <span className="material-symbols-outlined text-secondary">
                      {category.icon}
                    </span>
                    <h2 className="font-headline-md text-headline-md text-primary">
                      {category.name}
                    </h2>
                  </div>
                  <span className="text-label-sm font-label-sm bg-secondary-container text-on-secondary-container px-2 py-0.5 rounded-full">
                    {category.services.length} Services
                  </span>
                </div>
                <div className="p-stack-md flex-grow space-y-stack-md">
                  {category.services.map((service, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between p-stack-sm hover:bg-surface-container-low rounded-lg transition-colors group"
                    >
                      <div className="pr-4">
                        <p className="font-label-md text-label-md text-primary">
                          {service.name}
                        </p>
                        <p className="font-body-sm text-body-sm text-on-surface-variant">
                          {service.desc}
                        </p>
                      </div>
                      <Link href="/chat">
                        <button className="bg-primary text-on-primary px-4 py-2 rounded font-label-sm text-label-sm hover:bg-primary-container transition-colors cursor-pointer active:opacity-80 shrink-0">
                          Apply
                        </button>
                      </Link>
                    </div>
                  ))}
                </div>
                <Link href="/chat" className="w-full">
                  <button className="p-stack-md text-secondary font-label-md text-label-md border-t border-outline-variant hover:bg-secondary-container transition-colors text-center w-full cursor-pointer active:opacity-80">
                    View All Services
                  </button>
                </Link>
              </div>
            );
          })}

          {/* Feature Card: AI Assistant */}
          <div className="lg:col-span-2 bg-primary-container rounded-xl p-stack-lg flex flex-col md:flex-row items-center gap-gutter relative overflow-hidden">
            {/* Subtle Mesh Background */}
            <div className="absolute inset-0 opacity-20 pointer-events-none">
              <div className="absolute top-0 right-0 w-64 h-64 bg-secondary rounded-full filter blur-[80px] -translate-y-1/2 translate-x-1/2"></div>
            </div>
            <div className="relative z-10 flex-1">
              <h2 className="font-headline-lg text-headline-lg text-white mb-stack-sm">
                Need help finding a service?
              </h2>
              <p className="font-body-md text-body-md text-on-primary-container mb-stack-md">
                Our GovAssist AI can guide you through the application process and
                determine your eligibility in seconds.
              </p>
              <Link href="/chat">
                <button className="bg-secondary text-on-secondary px-stack-lg py-3 rounded-lg font-label-md text-label-md flex items-center gap-stack-sm hover:opacity-90 transition-opacity cursor-pointer active:opacity-80">
                  <span className="material-symbols-outlined">smart_toy</span>
                  Ask GovAssist AI
                </button>
              </Link>
            </div>
            <div className="relative z-10 w-full md:w-1/3 aspect-video bg-surface/10 rounded-lg border border-white/10 backdrop-blur-md flex items-center justify-center overflow-hidden">
              <div
                className="bg-cover bg-center w-full h-full rounded-lg"
                style={{
                  backgroundImage:
                    "url('https://lh3.googleusercontent.com/aida-public/AB6AXuA1f5hLa6Y4BJKeg1brMENInpJ3QPDRSyNDd6xx7i10PuuohVxLnIsbcMP3eJ7LXLhNRLLlTLvjs27RkiTduepAEyfBe54rRm0XN0wy-aeanJFTr-SMPgRsVy4CKE5R_XXYVrdsx8VP3Eg9ewE92xNOa59AynkmnoK8g5NanKDcBsnwFKflxx5B9hXBNfG9h5diWU9ekNhdkAPpbjm3L1ij0Y9WoDVxRAnaBWbJFWSpSFOIcgwZEFgXsq-koLNz8vo87ovTAPoO4W0_')",
                }}
              ></div>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-surface-container border-t border-outline-variant mt-stack-lg shrink-0">
        <div className="flex flex-col md:flex-row justify-between items-center px-margin-desktop py-stack-md gap-stack-sm w-full">
          <div className="flex flex-col md:flex-row items-center gap-stack-md">
            <span className="font-label-md text-label-md font-bold text-primary">
              GovAssist AI
            </span>
            <span className="font-body-sm text-body-sm text-on-surface-variant">
              © 2026 GovAssist AI. Demo purpose only.
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
