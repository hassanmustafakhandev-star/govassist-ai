"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";

export default function LegalPage() {
  const [activeTab, setActiveTab] = useState<"privacy" | "terms">("privacy");
  const [showBackToTop, setShowBackToTop] = useState(false);
  const privacyRef = useRef<HTMLElement>(null);
  const termsRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const handleScroll = () => setShowBackToTop(window.scrollY > 300);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach(e => { if (e.isIntersecting) setActiveTab(e.target.id as "privacy" | "terms"); });
      },
      { rootMargin: "-80px 0px -80% 0px", threshold: 0 }
    );
    if (privacyRef.current) observer.observe(privacyRef.current);
    if (termsRef.current) observer.observe(termsRef.current);
    return () => observer.disconnect();
  }, []);

  const scrollTo = (id: "privacy" | "terms") => {
    setActiveTab(id);
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
  };

  const tabCls = (id: "privacy" | "terms") =>
    `font-label-md text-label-md pb-stack-sm transition-all border-b-2 ${
      activeTab === id ? "text-primary border-primary" : "text-on-surface-variant border-transparent hover:text-primary"
    }`;

  return (
    <div className="bg-surface text-on-surface min-h-screen">
      {/* Header */}
      <header className="bg-surface sticky top-0 z-50 w-full border-b border-outline-variant flex justify-between items-center px-margin-desktop h-16">
        <div className="flex items-center gap-gutter">
          <Link href="/" className="font-headline-md text-headline-md font-bold text-primary">GovAssist AI</Link>
          <nav className="hidden md:flex gap-stack-lg items-center">
            <Link href="/admin" className="font-body-md text-body-md text-on-surface-variant hover:text-primary transition-colors">Dashboard</Link>
            <Link href="/services" className="font-body-md text-body-md text-on-surface-variant hover:text-primary transition-colors">Services</Link>
            <Link href="/chat" className="font-body-md text-body-md text-on-surface-variant hover:text-primary transition-colors">Inquiry</Link>
          </nav>
        </div>
        <div className="flex items-center gap-stack-md">
          <button className="font-body-md text-body-md text-primary font-bold">EN/AR</button>
          <div className="flex items-center gap-stack-sm">
            <span className="material-symbols-outlined text-on-surface-variant cursor-pointer">notifications</span>
            <span className="material-symbols-outlined text-on-surface-variant cursor-pointer">account_circle</span>
          </div>
        </div>
      </header>

      <main className="max-w-[800px] mx-auto px-margin-mobile md:px-0 py-stack-lg min-h-screen">
        {/* Breadcrumbs */}
        <nav className="flex items-center gap-unit text-on-surface-variant mb-stack-lg">
          <Link href="/" className="font-label-sm text-label-sm hover:underline">Home</Link>
          <span className="material-symbols-outlined text-[14px]">chevron_right</span>
          <span className="font-label-sm text-label-sm font-bold text-primary">Legal Center</span>
        </nav>

        {/* Page Header */}
        <div className="border-b border-outline-variant pb-stack-lg mb-stack-lg">
          <h1 className="font-headline-xl text-headline-xl text-primary mb-unit">Legal Documentation</h1>
          <p className="font-body-lg text-body-lg text-on-surface-variant">Last updated: May 24, 2026. Please review our governing policies carefully.</p>
        </div>

        {/* Sticky Tabs */}
        <div className="flex gap-stack-lg border-b border-outline-variant mb-stack-lg sticky top-16 bg-surface z-40 py-stack-sm">
          <button className={tabCls("privacy")} onClick={() => scrollTo("privacy")}>Privacy Policy</button>
          <button className={tabCls("terms")} onClick={() => scrollTo("terms")}>Terms of Service</button>
        </div>

        {/* Privacy Policy */}
        <section ref={privacyRef} id="privacy" className="mb-24" style={{ scrollMarginTop: "80px" }}>
          <div className="bg-surface-container-lowest border border-outline-variant p-stack-lg rounded-lg space-y-4">
            <h2 className="font-headline-lg text-headline-lg text-primary">Privacy Policy</h2>
            <p className="font-body-md text-body-md text-on-surface-variant">At GovAssist AI, your privacy is our primary concern. This policy outlines how we collect, use, and safeguard your personal information when you interact with our digital government assistance platform.</p>

            <h3 className="font-label-md text-label-md text-primary mt-stack-lg">1. Information Collection</h3>
            <p className="font-body-md text-body-md text-on-surface-variant">We collect information that you provide directly to us, including your full name, national identification details, contact information, and specific service requests. Automated data collection may include IP addresses and interaction logs for security and performance monitoring.</p>

            <h3 className="font-label-md text-label-md text-primary mt-stack-lg">2. Use of Data</h3>
            <p className="font-body-md text-body-md text-on-surface-variant">Data collected is used exclusively for:</p>
            <ul className="font-body-md text-body-md text-on-surface-variant list-disc pl-6 space-y-2">
              {["Facilitating government service applications.", "Verifying identity through official channels.", "Improving the GovAssist AI agent accuracy.", "Notifying users of status updates or security alerts."].map(i => <li key={i}>{i}</li>)}
            </ul>

            <h3 className="font-label-md text-label-md text-primary mt-stack-lg">3. Data Security</h3>
            <p className="font-body-md text-body-md text-on-surface-variant">GovAssist AI implements state-of-the-art encryption standards (AES-256) and adheres to international data protection regulations. We maintain strict access controls and conduct regular security audits to prevent unauthorized access or disclosure.</p>

            <div className="bg-primary-container text-white p-stack-md rounded-lg mt-stack-lg flex gap-stack-sm">
              <span className="material-symbols-outlined flex-shrink-0">info</span>
              <div>
                <span className="font-label-md text-label-md block mb-1">Important Note</span>
                <p className="font-body-sm text-body-sm text-white/80">We never sell your personal data to third-party advertisers. All data sharing is strictly limited to authorized government departments required for your specific inquiry.</p>
              </div>
            </div>
          </div>
        </section>

        {/* Divider */}
        <div className="flex items-center gap-gutter mb-24">
          <div className="h-px bg-outline-variant flex-1" />
          <span className="material-symbols-outlined text-outline">gavel</span>
          <div className="h-px bg-outline-variant flex-1" />
        </div>

        {/* Terms of Service */}
        <section ref={termsRef} id="terms" style={{ scrollMarginTop: "80px" }}>
          <div className="bg-surface-container-lowest border border-outline-variant p-stack-lg rounded-lg space-y-4">
            <h2 className="font-headline-lg text-headline-lg text-primary">Terms of Service</h2>
            <p className="font-body-md text-body-md text-on-surface-variant">By accessing or using GovAssist AI, you agree to be bound by these Terms of Service. If you do not agree, please refrain from using our platform.</p>

            <h3 className="font-label-md text-label-md text-primary mt-stack-lg">1. User Eligibility</h3>
            <p className="font-body-md text-body-md text-on-surface-variant">Users must be at least 18 years of age and possess the legal authority to enter into these terms. You are responsible for maintaining the confidentiality of your account credentials.</p>

            <h3 className="font-label-md text-label-md text-primary mt-stack-lg">2. AI-Assisted Guidance</h3>
            <p className="font-body-md text-body-md text-on-surface-variant">GovAssist AI provides automated assistance based on available government data. While we strive for absolute accuracy, the AI&apos;s output should be considered advisory. Final decisions remain with the respective government agencies.</p>

            <h3 className="font-label-md text-label-md text-primary mt-stack-lg">3. Prohibited Conduct</h3>
            <p className="font-body-md text-body-md text-on-surface-variant">Users agree not to:</p>
            <ul className="font-body-md text-body-md text-on-surface-variant list-disc pl-6 space-y-2">
              {["Submit fraudulent or misleading information.", "Attempt to bypass security features or \"scrape\" platform data.", "Use the platform for any unlawful purpose."].map(i => <li key={i}>{i}</li>)}
            </ul>

            <h3 className="font-label-md text-label-md text-primary mt-stack-lg">4. Limitation of Liability</h3>
            <p className="font-body-md text-body-md text-on-surface-variant">GovAssist AI is not liable for delays caused by government processing times or inaccuracies in information provided by external government databases.</p>
          </div>
        </section>

        {/* Help CTA */}
        <div className="mt-stack-lg p-stack-lg border border-primary/20 bg-primary/5 rounded-xl text-center">
          <h4 className="font-headline-md text-headline-md text-primary mb-stack-sm">Questions about our policies?</h4>
          <p className="font-body-md text-body-md text-on-surface-variant mb-stack-md">Our legal compliance team is available to clarify any sections of these documents.</p>
          <Link href="/support" className="bg-primary text-white px-stack-lg py-stack-sm rounded-lg font-label-md text-label-md hover:opacity-90 transition-opacity inline-flex items-center gap-stack-sm">
            <span className="material-symbols-outlined text-[18px]">mail</span>Contact Support
          </Link>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-surface-container border-t border-outline-variant w-full py-stack-md mt-24">
        <div className="flex flex-col md:flex-row justify-between items-center px-margin-desktop gap-stack-sm">
          <span className="font-label-md text-label-md font-bold text-on-surface-variant">© 2026 GovAssist AI. Demo purpose only.</span>
          <div className="flex gap-stack-md">
            <Link href="/legal" className="font-body-sm text-body-sm text-primary font-bold hover:underline">Privacy Policy</Link>
            <Link href="/legal" className="font-body-sm text-body-sm text-on-surface-variant hover:underline">Terms of Service</Link>
            <Link href="/support" className="font-body-sm text-body-sm text-on-surface-variant hover:underline">Contact Support</Link>
          </div>
        </div>
      </footer>

      {/* Back to Top */}
      <button
        onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
        className={`fixed bottom-8 right-8 bg-primary text-white w-12 h-12 rounded-full shadow-lg flex items-center justify-center hover:opacity-90 transition-all z-50 ${showBackToTop ? "opacity-100 visible" : "opacity-0 invisible"}`}
      >
        <span className="material-symbols-outlined">arrow_upward</span>
      </button>
    </div>
  );
}
