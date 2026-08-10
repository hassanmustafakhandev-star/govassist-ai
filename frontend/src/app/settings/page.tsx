"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { getUser, logout, isAdmin } from "../auth";

export default function AccountSettings() {
  const [authorized, setAuthorized] = useState(false);
  const [lang, setLang] = useState<"EN" | "AR">("EN");
  const [profile, setProfile] = useState({
    name: "Abdullah Al-Farsi",
    email: "a.alfarsi@govassist.ai",
    phone: "+971 50 123 4567",
    role: "Administrator",
  });
  const [notifications, setNotifications] = useState({
    email: true,
    sms: true,
    statusReports: false,
  });
  const [password, setPassword] = useState({
    current: "",
    new: "",
    confirm: "",
  });
  const [saveStatus, setSaveStatus] = useState<string | null>(null);
  // User ka Google profile picture URL (agar Google se login kiya hai)
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);

  useEffect(() => {
    const user = getUser();
    if (!user) {
      // Koi user login nahi - login page par bhejo
      window.location.href = "/login";
    } else {
      setAuthorized(true);

      /**
       * Real user data load karo jo Google OAuth ya email login se aaya tha
       * user.name  - Google se milne wala full name
       * user.email - Google ya custom email
       * user.role  - "citizen" | "admin"
       *
       * Name display logic:
       *   - Agar Google login: "Hassan Mustafa Khan" (Google name)
       *   - Agar email login: email ke @ se pehle ka part (e.g. "hassan.mustafa")
       *   - Agar demo login: "Citizen User" ya "Admin User"
       */
      const displayName = user.name ||
        (user.email.includes("@") ? user.email.split("@")[0].replace(/[._]/g, " ") : user.email);

      // Role badge: admin = "Administrator", citizen = "Citizen"
      const displayRole = user.role === "admin" ? "Administrator" : "Citizen";

      setProfile({
        name: displayName,
        email: user.email,
        phone: "",       // Phone number real Supabase profile se nahi aata - user edit kar sakta hai
        role: displayRole,
      });

      // Agar Google avatar hai toh set karo
      if (user.avatar) {
        setAvatarUrl(user.avatar);
      }
    }
  }, []);

  const handleProfileSave = (e: React.FormEvent) => {
    e.preventDefault();
    setSaveStatus("Profile changes saved successfully.");
    setTimeout(() => setSaveStatus(null), 4000);
  };

  const handlePasswordUpdate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!password.current || !password.new || !password.confirm) {
      setSaveStatus("Please fill out all password fields.");
      setTimeout(() => setSaveStatus(null), 4000);
      return;
    }
    if (password.new !== password.confirm) {
      setSaveStatus("New passwords do not match.");
      setTimeout(() => setSaveStatus(null), 4000);
      return;
    }
    setSaveStatus("Password updated successfully.");
    setPassword({ current: "", new: "", confirm: "" });
    setTimeout(() => setSaveStatus(null), 4000);
  };

  if (!authorized) {
    return (
      <div className="min-h-screen bg-surface flex items-center justify-center">
        <span className="material-symbols-outlined animate-spin text-[40px] text-primary">progress_activity</span>
      </div>
    );
  }

  return (
    <div className="bg-surface text-on-surface min-h-screen flex flex-col font-body-md selection:bg-secondary-container selection:text-on-secondary-container">
      {/* Top Navigation Bar */}
      <header className="bg-surface border-b border-outline-variant w-full fixed top-0 z-50 h-16 flex justify-between items-center px-margin-desktop shrink-0">
        <div className="flex items-center gap-stack-lg">
          <Link href="/" className="font-headline-md text-headline-md font-bold text-primary hover:opacity-85">
            GovAssist AI
          </Link>
          <nav className="hidden md:flex gap-stack-md">
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
            className="font-body-md text-body-md text-primary font-bold cursor-pointer hover:opacity-85"
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

      <div className="flex pt-16 min-h-screen flex-1">
        {/* Sidebar Navigation */}
        <aside className="hidden md:flex flex-col h-full w-64 fixed left-0 bg-surface-container-lowest border-e border-outline-variant p-stack-md shrink-0">
          <div className="mb-stack-lg px-2">
            <Link href="/" className="font-headline-md text-headline-md font-bold text-primary hover:opacity-85">
              {isAdmin() ? "Admin Portal" : "Citizen Portal"}
            </Link>
            <p className="font-label-md text-label-md text-on-surface-variant">
              {isAdmin() ? "Government Administration" : "Saudi Government Services"}
            </p>
          </div>
          <nav className="flex-1 flex flex-col gap-unit">
            {isAdmin() ? (
              <>
                <Link
                  className="flex items-center gap-stack-sm p-3 text-on-surface-variant hover:bg-surface-container-high rounded-lg transition-all"
                  href="/admin"
                >
                  <span className="material-symbols-outlined">dashboard</span>
                  <span className="font-label-md text-label-md">Overview</span>
                </Link>
                <Link
                  className="flex items-center gap-stack-sm p-3 text-on-surface-variant hover:bg-surface-container-high rounded-lg transition-all"
                  href="/agents"
                >
                  <span className="material-symbols-outlined">smart_toy</span>
                  <span className="font-label-md text-label-md">AI Agents</span>
                </Link>
                <Link
                  className="flex items-center gap-stack-sm p-3 text-on-surface-variant hover:bg-surface-container-high rounded-lg transition-all"
                  href="/chat"
                >
                  <span className="material-symbols-outlined">chat</span>
                  <span className="font-label-md text-label-md">AI Assistant</span>
                </Link>
                <Link
                  className="flex items-center gap-stack-sm p-3 text-on-surface-variant hover:bg-surface-container-high rounded-lg transition-all"
                  href="/admin/logs"
                >
                  <span className="material-symbols-outlined">list_alt</span>
                  <span className="font-label-md text-label-md">Activity Logs</span>
                </Link>
                <Link
                  className="flex items-center gap-stack-sm p-3 bg-primary-fixed text-on-primary-fixed rounded-lg transition-all font-semibold"
                  href="/settings"
                >
                  <span className="material-symbols-outlined">settings</span>
                  <span className="font-label-md text-label-md">Settings</span>
                </Link>
              </>
            ) : (
              <>
                <Link
                  className="flex items-center gap-stack-sm p-3 text-on-surface-variant hover:bg-surface-container-high rounded-lg transition-all"
                  href="/chat"
                >
                  <span className="material-symbols-outlined">chat</span>
                  <span className="font-label-md text-label-md">AI Assistant</span>
                </Link>
                <Link
                  className="flex items-center gap-stack-sm p-3 text-on-surface-variant hover:bg-surface-container-high rounded-lg transition-all"
                  href="/services"
                >
                  <span className="material-symbols-outlined">grid_view</span>
                  <span className="font-label-md text-label-md">Services Catalog</span>
                </Link>
                <Link
                  className="flex items-center gap-stack-sm p-3 bg-primary-fixed text-on-primary-fixed rounded-lg transition-all font-semibold"
                  href="/settings"
                >
                  <span className="material-symbols-outlined">settings</span>
                  <span className="font-label-md text-label-md">Account Settings</span>
                </Link>
              </>
            )}
          </nav>
          <div className="mt-auto pt-stack-md border-t border-outline-variant flex flex-col gap-unit">
            <Link
              className="flex items-center gap-stack-sm p-3 text-on-surface-variant hover:bg-surface-container-high rounded-lg transition-all"
              href="#"
            >
              <span className="material-symbols-outlined">help</span>
              <span className="font-label-md text-label-md">Support</span>
            </Link>
            <Link
              onClick={() => logout()}
              className="flex items-center gap-stack-sm p-3 text-on-surface-variant hover:bg-surface-container-high rounded-lg transition-all"
              href="/login"
            >
              <span className="material-symbols-outlined">logout</span>
              <span className="font-label-md text-label-md">Logout</span>
            </Link>
          </div>
        </aside>

        {/* Main Content Area */}
        <main className="flex-1 md:ml-64 p-stack-lg max-w-container-max mx-auto w-full">
          {saveStatus && (
            <div className="mb-4 p-4 bg-primary text-white rounded shadow animate-pulse">
              {saveStatus}
            </div>
          )}

          <header className="mb-stack-lg">
            <h1 className="font-headline-xl text-headline-xl text-primary leading-tight">
              Account Settings
            </h1>
            <p className="font-body-lg text-body-lg text-on-surface-variant">
              Manage your personal information, security preferences, and
              notification alerts.
            </p>
          </header>
          <div className="grid grid-cols-1 xl:grid-cols-12 gap-gutter">
            {/* Left Column: Navigation / Profile Summary */}
            <div className="xl:col-span-4 flex flex-col gap-gutter">
              {/* Profile Card Summary */}
              <section className="settings-card p-stack-md flex flex-col items-center text-center bg-white border border-outline-variant rounded">
                {/* 
                  Profile Avatar:
                  - Agar Google login tha: asli Google photo dikhao
                  - Agar koi avatar nahi: naam ke first letters (initials) dikhao
                */}
                <div className="w-24 h-24 rounded-full overflow-hidden mb-stack-sm border border-outline-variant bg-primary-container flex items-center justify-center">
                  {avatarUrl ? (
                    // Real Google profile picture
                    <img
                      className="w-full h-full object-cover"
                      alt={`${profile.name} profile photo`}
                      src={avatarUrl}
                    />
                  ) : (
                    // Fallback: naam ke pehle 2 letters (initials)
                    <span className="text-2xl font-bold text-white">
                      {profile.name
                        .split(" ")
                        .slice(0, 2)
                        .map((n) => n[0]?.toUpperCase())
                        .join("") || "U"}
                    </span>
                  )}
                </div>
                <h2 className="font-headline-md text-headline-md text-primary">
                  {profile.name}
                </h2>
                <p className="font-body-sm text-body-sm text-on-surface-variant mb-stack-md">
                  {profile.phone}
                </p>
                <button className="w-full bg-primary-container text-white py-2 font-label-md text-label-md rounded hover:opacity-90 transition-opacity cursor-pointer active:opacity-80">
                  Change Avatar
                </button>
              </section>
              {/* Language Switcher Card */}
              <section className="settings-card bg-white border border-outline-variant rounded">
                <div className="p-stack-md border-b border-outline-variant bg-surface-container-low">
                  <h3 className="font-label-md text-label-md text-primary uppercase tracking-wider">
                    Language Preference
                  </h3>
                </div>
                <div className="p-stack-md">
                  <div className="flex flex-col gap-stack-sm">
                    <label
                      onClick={() => setLang("EN")}
                      className={`flex items-center justify-between p-3 border rounded cursor-pointer transition-all ${
                        lang === "EN"
                          ? "border-primary bg-primary-fixed text-primary font-semibold"
                          : "border-outline-variant hover:bg-surface-container-high text-on-surface-variant"
                      }`}
                    >
                      <div className="flex items-center gap-stack-sm">
                        <span className="material-symbols-outlined">language</span>
                        <span className="font-body-md text-body-md">English (US)</span>
                      </div>
                      <span className="material-symbols-outlined">
                        {lang === "EN" ? "radio_button_checked" : "radio_button_unchecked"}
                      </span>
                    </label>
                    <label
                      onClick={() => setLang("AR")}
                      className={`flex items-center justify-between p-3 border rounded cursor-pointer transition-all ${
                        lang === "AR"
                          ? "border-primary bg-primary-fixed text-primary font-semibold"
                          : "border-outline-variant hover:bg-surface-container-high text-on-surface-variant"
                      }`}
                    >
                      <div className="flex items-center gap-stack-sm">
                        <span className="material-symbols-outlined">language</span>
                        <span className="font-body-md text-body-md">العربية (Arabic)</span>
                      </div>
                      <span className="material-symbols-outlined">
                        {lang === "AR" ? "radio_button_checked" : "radio_button_unchecked"}
                      </span>
                    </label>
                  </div>
                </div>
              </section>
            </div>

            {/* Right Column: Settings Sections */}
            <div className="xl:col-span-8 flex flex-col gap-gutter">
              {/* Profile Section */}
              <section className="settings-card bg-white border border-outline-variant rounded">
                <div className="p-stack-md border-b border-outline-variant flex items-center justify-between">
                  <h3 className="font-headline-md text-headline-md text-primary">
                    Profile Information
                  </h3>
                  <span className="material-symbols-outlined text-on-surface-variant">
                    person
                  </span>
                </div>
                <form onSubmit={handleProfileSave} className="p-stack-md grid grid-cols-1 md:grid-cols-2 gap-gutter">
                  <div className="flex flex-col gap-unit">
                    <label className="font-label-md text-label-md text-on-surface-variant">
                      Full Name
                    </label>
                    <input
                      className="form-input p-3 font-body-md text-body-md text-primary bg-surface-container-lowest border border-outline-variant rounded focus:ring-2 focus:ring-primary focus:border-primary outline-none transition-all"
                      type="text"
                      value={profile.name}
                      onChange={(e) => setProfile({ ...profile, name: e.target.value })}
                    />
                  </div>
                  <div className="flex flex-col gap-unit">
                    <label className="font-label-md text-label-md text-on-surface-variant">
                      Email Address
                    </label>
                    <input
                      className="form-input p-3 font-body-md text-body-md text-primary bg-surface-container-lowest border border-outline-variant rounded focus:ring-2 focus:ring-primary focus:border-primary outline-none transition-all"
                      type="email"
                      value={profile.email}
                      onChange={(e) => setProfile({ ...profile, email: e.target.value })}
                    />
                  </div>
                  <div className="flex flex-col gap-unit">
                    <label className="font-label-md text-label-md text-on-surface-variant">
                      Phone Number
                    </label>
                    <input
                      className="form-input p-3 font-body-md text-body-md text-primary bg-surface-container-lowest border border-outline-variant rounded focus:ring-2 focus:ring-primary focus:border-primary outline-none transition-all"
                      type="tel"
                      value={profile.phone}
                      onChange={(e) => setProfile({ ...profile, phone: e.target.value })}
                    />
                  </div>
                  <div className="flex flex-col gap-unit">
                    <label className="font-label-md text-label-md text-on-surface-variant">
                      Role
                    </label>
                    <input
                      className="form-input p-3 font-body-md text-body-md text-on-surface-variant bg-surface-container-low border border-outline-variant rounded cursor-not-allowed outline-none"
                      disabled
                      type="text"
                      value={profile.role}
                    />
                  </div>
                  <div className="md:col-span-2 flex justify-end mt-stack-sm">
                    <button type="submit" className="bg-primary text-white px-stack-lg py-3 font-label-md text-label-md hover:bg-tertiary transition-all cursor-pointer rounded active:opacity-80">
                      Save Changes
                    </button>
                  </div>
                </form>
              </section>

              {/* Notifications Section */}
              <section className="settings-card bg-white border border-outline-variant rounded">
                <div className="p-stack-md border-b border-outline-variant flex items-center justify-between">
                  <h3 className="font-headline-md text-headline-md text-primary">
                    Notification Alerts
                  </h3>
                  <span className="material-symbols-outlined text-on-surface-variant">
                    notifications_active
                  </span>
                </div>
                <div className="p-stack-md flex flex-col gap-stack-md">
                  <div className="flex items-center justify-between py-2 border-b border-outline-variant">
                    <div>
                      <p className="font-label-md text-label-md text-primary">
                        Email Notifications
                      </p>
                      <p className="font-body-sm text-body-sm text-on-surface-variant">
                        Receive alerts about new requests and portal activity via
                        email.
                      </p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={notifications.email}
                        onChange={(e) =>
                          setNotifications({ ...notifications, email: e.target.checked })
                        }
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-surface-container-highest rounded-full peer peer-focus:ring-2 peer-focus:ring-primary/20 peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-secondary"></div>
                    </label>
                  </div>
                  <div className="flex items-center justify-between py-2 border-b border-outline-variant">
                    <div>
                      <p className="font-label-md text-label-md text-primary">
                        SMS Alerts
                      </p>
                      <p className="font-body-sm text-body-sm text-on-surface-variant">
                        Critical security alerts and MFA codes sent to your phone.
                      </p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={notifications.sms}
                        onChange={(e) =>
                          setNotifications({ ...notifications, sms: e.target.checked })
                        }
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-surface-container-highest rounded-full peer peer-focus:ring-2 peer-focus:ring-primary/20 peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-secondary"></div>
                    </label>
                  </div>
                  <div className="flex items-center justify-between py-2">
                    <div>
                      <p className="font-label-md text-label-md text-primary">
                        System Status Reports
                      </p>
                      <p className="font-body-sm text-body-sm text-on-surface-variant">
                        Weekly digest of AI agent performance and service uptime.
                      </p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={notifications.statusReports}
                        onChange={(e) =>
                          setNotifications({
                            ...notifications,
                            statusReports: e.target.checked,
                          })
                        }
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-surface-container-highest rounded-full peer peer-focus:ring-2 peer-focus:ring-primary/20 peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-secondary"></div>
                    </label>
                  </div>
                </div>
              </section>

              {/* Security Section */}
              <section className="settings-card bg-white border border-outline-variant rounded">
                <div className="p-stack-md border-b border-outline-variant flex items-center justify-between">
                  <h3 className="font-headline-md text-headline-md text-primary">
                    Security &amp; Access
                  </h3>
                  <span className="material-symbols-outlined text-on-surface-variant">
                    shield
                  </span>
                </div>
                <div className="p-stack-md flex flex-col gap-gutter">
                  {/* Password Change */}
                  <form onSubmit={handlePasswordUpdate} className="grid grid-cols-1 md:grid-cols-3 gap-gutter items-start">
                    <div className="md:col-span-1">
                      <p className="font-label-md text-label-md text-primary">
                        Change Password
                      </p>
                      <p className="font-body-sm text-body-sm text-on-surface-variant">
                        Ensure your account stays secure with a unique password.
                      </p>
                    </div>
                    <div className="md:col-span-2 flex flex-col gap-stack-sm">
                      <input
                        className="form-input p-3 font-body-md text-body-md bg-surface-container-lowest border border-outline-variant rounded focus:ring-2 focus:ring-primary focus:border-primary outline-none transition-all"
                        placeholder="Current Password"
                        type="password"
                        value={password.current}
                        onChange={(e) => setPassword({ ...password, current: e.target.value })}
                      />
                      <input
                        className="form-input p-3 font-body-md text-body-md bg-surface-container-lowest border border-outline-variant rounded focus:ring-2 focus:ring-primary focus:border-primary outline-none transition-all"
                        placeholder="New Password"
                        type="password"
                        value={password.new}
                        onChange={(e) => setPassword({ ...password, new: e.target.value })}
                      />
                      <input
                        className="form-input p-3 font-body-md text-body-md bg-surface-container-lowest border border-outline-variant rounded focus:ring-2 focus:ring-primary focus:border-primary outline-none transition-all"
                        placeholder="Confirm New Password"
                        type="password"
                        value={password.confirm}
                        onChange={(e) => setPassword({ ...password, confirm: e.target.value })}
                      />
                      <div className="flex justify-start">
                        <button type="submit" className="text-secondary border border-secondary px-stack-md py-2 font-label-md text-label-md hover:bg-secondary-container transition-colors cursor-pointer rounded active:opacity-80">
                          Update Password
                        </button>
                      </div>
                    </div>
                  </form>
                  {/* 2FA */}
                  <div className="flex items-center justify-between p-stack-md bg-surface-container rounded-lg">
                    <div className="flex items-center gap-stack-md">
                      <div className="w-10 h-10 bg-secondary-container rounded flex items-center justify-center">
                        <span className="material-symbols-outlined text-on-secondary-container">
                          vibration
                        </span>
                      </div>
                      <div>
                        <p className="font-label-md text-label-md text-primary">
                          Two-Factor Authentication (2FA)
                        </p>
                        <p className="font-body-sm text-body-sm text-on-surface-variant">
                          Active: Codes sent to +971 •••• 567
                        </p>
                      </div>
                    </div>
                    <button className="bg-primary-container text-white px-stack-md py-2 font-label-md text-label-md hover:opacity-90 cursor-pointer rounded active:opacity-80">
                      Manage 2FA
                    </button>
                  </div>
                </div>
              </section>
            </div>
          </div>
        </main>
      </div>

      {/* Footer */}
      <footer className="bg-surface-container border-t border-outline-variant w-full py-stack-md mt-stack-lg shrink-0">
        <div className="flex flex-col md:flex-row justify-between items-center px-margin-desktop gap-stack-sm">
          <span className="font-label-md text-label-md font-bold">GovAssist AI</span>
          <div className="flex gap-stack-md">
            <Link className="font-body-sm text-body-sm text-on-surface-variant hover:underline" href="/legal">Privacy Policy</Link>
            <Link className="font-body-sm text-body-sm text-on-surface-variant hover:underline" href="/legal">Terms of Service</Link>
            <Link className="font-body-sm text-body-sm text-on-surface-variant hover:underline" href="/support">Contact Support</Link>
          </div>
          <p className="font-body-sm text-body-sm text-on-surface-variant">
            © 2026 GovAssist AI. Demo purpose only.
          </p>
        </div>
      </footer>
    </div>
  );
}
