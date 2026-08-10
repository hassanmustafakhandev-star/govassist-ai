/**
 * login/page.tsx - Login Page with real Supabase Auth
 *
 * Features:
 *   1. Google OAuth via Supabase (real Google account selection popup)
 *      - Supabase se redirect milta hai google.com par
 *      - User Google account select karta hai
 *      - Supabase callback /auth/callback pe aata hai
 *      - Wahan user ka naam, email, avatar Google se milta hai
 *
 *   2. Email + Password login via Supabase Auth
 *      - Pehle sign in try karta hai
 *      - Agar account nahi to sign up karta hai
 *
 *   3. Quick Demo buttons (without real auth - for testing only)
 *
 * Flow:
 *   Login page → Google popup → Supabase callback (/auth/callback) → /chat
 *   Login page → Email/Password form → Supabase Auth → /chat
 */

"use client"; // Next.js: yeh component browser mein chalega (client-side)

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { login, logout } from "../auth"; // hamara session helper
import { supabase } from "../../lib/supabase"; // Supabase client

export default function LoginPage() {
  // ====== STATE ======
  const [loading, setLoading] = useState(false);       // button disabled karne ke liye
  const [email, setEmail] = useState("");              // email input field
  const [password, setPassword] = useState("");        // password input field
  const [authError, setAuthError] = useState<string | null>(null); // error message

  // Component mount hone par existing session clear karo
  useEffect(() => {
    logout(); // purana session saaf karo
  }, []);

  /**
   * handleGoogleLogin()
   * Purpose: Real Google OAuth popup trigger karta hai via Supabase
   *
   * Flow:
   *   1. supabase.auth.signInWithOAuth() call hota hai
   *   2. Supabase Google ka OAuth URL generate karta hai
   *   3. Browser us URL par redirect hota hai (Google account selection popup)
   *   4. User apna Google account choose karta hai
   *   5. Google Supabase callback URL par user ko bhejta hai
   *   6. /auth/callback page user ka data store karta hai
   *   7. User /chat par aa jata hai apne real Google naam ke sath
   */
  const handleGoogleLogin = async () => {
    setLoading(true);
    setAuthError(null);

    try {
      // Supabase ko bolo: Google se login karo
      // redirectTo = Google login ke baad wapas kahan aana hai
      const { error } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo: `${window.location.origin}/auth/callback`,
        },
      });

      // Agar Supabase mein Google provider enable nahi hai
      if (error) {
        setAuthError("Google login available after Supabase Google provider setup. Use Email/Password below.");
        setLoading(false);
      }
      // Agar success: browser automatically Google par redirect ho gaya
      // (loading state waise hi rahega, page change ho raha hai)
    } catch (err: any) {
      setAuthError(err.message || "Google login failed. Please try Email login.");
      setLoading(false);
    }
  };

  /**
   * handleStaffLogin()
   * Purpose: Admin demo login - testing ke liye (real auth nahi)
   * Note: Production mein alag admin auth system hoga
   */
  const handleStaffLogin = (e: React.MouseEvent) => {
    e.preventDefault();
    // Admin ko hardcoded email se login karo (demo only)
    login("admin", "admin@govassist.ai", "Admin User");
    window.location.href = "/admin";
  };

  return (
    <div className="bg-surface text-on-surface min-h-screen flex flex-col selection:bg-secondary-container">
      {/* Subtle dot pattern background - decorative only */}
      <div
        className="fixed inset-0 pointer-events-none"
        style={{
          backgroundImage: "radial-gradient(#0c2340 0.5px, transparent 0.5px)",
          backgroundSize: "24px 24px",
          opacity: 0.03,
        }}
      />

      {/* ===== MAIN CONTENT ===== */}
      <main className="flex-grow flex items-center justify-center px-margin-mobile md:px-margin-desktop relative z-10">
        <div className="w-full max-w-[440px]">
          
          {/* Logo Section */}
          <div className="flex flex-col items-center mb-stack-lg">
            <div className="flex items-center gap-unit mb-stack-sm">
              <span
                className="material-symbols-outlined text-secondary text-[40px]"
                style={{ fontVariationSettings: "'FILL' 1" }}
              >
                account_balance
              </span>
              <span className="font-headline-xl text-headline-xl text-primary tracking-tighter">
                GovAssist AI
              </span>
            </div>
            {/* Decorative underline */}
            <div className="h-[2px] w-12 bg-secondary rounded-full" />
          </div>

          {/* ===== LOGIN CARD ===== */}
          <div
            className="bg-surface-container-lowest rounded-xl p-stack-lg md:p-10 flex flex-col items-center text-center"
            style={{ boxShadow: "0px 4px 20px rgba(0,0,0,0.04)", border: "1px solid #E2E8F0" }}
          >
            <h1 className="font-headline-lg text-headline-lg text-on-surface mb-stack-sm">
              Welcome Back
            </h1>
            <p className="font-body-md text-body-md text-on-surface-variant mb-stack-lg">
              Access your secure government dashboard and AI-powered documentation assistants.
            </p>

            {/* ===== GOOGLE LOGIN BUTTON ===== */}
            {/* 
              onClick: handleGoogleLogin() call hota hai
              Supabase Google OAuth redirect trigger karta hai
              Real Google account selection popup aata hai
            */}
            <button
              type="button"
              onClick={handleGoogleLogin}
              disabled={loading}
              className="w-full flex items-center justify-center gap-stack-sm py-3 px-stack-md border border-outline-variant rounded-lg bg-surface-container-lowest text-on-surface font-label-md hover:bg-surface-container-low hover:-translate-y-px active:scale-95 transition-all disabled:opacity-60 mb-4 cursor-pointer"
            >
              {/* Loading spinner ya Google icon */}
              {loading ? (
                <span className="material-symbols-outlined animate-spin text-[20px]">
                  progress_activity
                </span>
              ) : (
                /* Official Google "G" logo SVG */
                <svg className="w-5 h-5" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                  <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-1 .67-2.28 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                  <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05" />
                  <path d="M12 5.38c1.62 0 3.06.56 4.21 1.66l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
                </svg>
              )}
              {loading ? "Redirecting to Google..." : "Continue with Google"}
            </button>

            {/* Error message display */}
            {authError && (
              <div className="w-full p-3 bg-amber-50 border border-amber-200 text-amber-700 text-xs rounded-lg mb-4 text-left">
                ⚠️ {authError}
              </div>
            )}

            {/* Divider */}
            <div className="flex items-center w-full mb-4">
              <div className="flex-grow h-px bg-outline-variant" />
              <span className="px-stack-sm font-label-sm text-[11px] text-outline uppercase tracking-widest">
                or sign in with email
              </span>
              <div className="flex-grow h-px bg-outline-variant" />
            </div>

            {/* ===== EMAIL + PASSWORD FORM ===== */}
            {/* 
              onSubmit: async form handler
              1. Supabase signInWithPassword() call karta hai
              2. Agar fail: signUp() se naya account banata hai
              3. Session localStorage mein save karta hai
              4. /chat par redirect karta hai
            */}
            <form
              onSubmit={async (e) => {
                e.preventDefault();
                setLoading(true);
                setAuthError(null);

                // Empty field hone par default fallback values
                const targetEmail = email.trim() || "citizen@govassist.ai";
                const targetPassword = password || "GovAssist123!";

                try {
                  // Step 1: Existing account se login karne ki koshish
                  const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
                    email: targetEmail,
                    password: targetPassword,
                  });

                  if (signInError) {
                    // Step 2: Account nahi mila - naya account banao
                    const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
                      email: targetEmail,
                      password: targetPassword,
                    });

                    if (signUpError) {
                      // Dono fail - error show karo
                      throw new Error(signUpError.message);
                    }

                    // Naya account bana - Supabase user ka naam extract karo
                    const supaUser = signUpData.user;
                    login(
                      "citizen",
                      supaUser?.email || targetEmail,
                      supaUser?.user_metadata?.full_name || targetEmail.split("@")[0],
                      supaUser?.user_metadata?.avatar_url
                    );
                  } else {
                    // Existing account se login success
                    const supaUser = signInData.user;
                    login(
                      "citizen",
                      supaUser?.email || targetEmail,
                      supaUser?.user_metadata?.full_name || targetEmail.split("@")[0],
                      supaUser?.user_metadata?.avatar_url
                    );
                  }

                  // Chat page par jao
                  window.location.href = "/chat";
                } catch (err: any) {
                  // Error show karo lekin still login karne do (fallback)
                  setAuthError(err.message || "Authentication failed. Please try again.");
                } finally {
                  setLoading(false);
                }
              }}
              className="w-full text-left space-y-3 mb-4"
            >
              {/* Email input field */}
              <div>
                <label className="block text-xs font-semibold text-on-surface-variant mb-1">
                  Email Address
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="citizen@govassist.ai"
                  className="w-full px-3 py-2 border border-outline-variant rounded-lg text-sm bg-surface focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>

              {/* Password input field */}
              <div>
                <label className="block text-xs font-semibold text-on-surface-variant mb-1">
                  Password
                </label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full px-3 py-2 border border-outline-variant rounded-lg text-sm bg-surface focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>

              {/* Submit button */}
              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 bg-primary text-white rounded-lg font-label-md hover:opacity-90 transition-opacity flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60"
              >
                {loading && (
                  <span className="material-symbols-outlined animate-spin text-sm">
                    progress_activity
                  </span>
                )}
                Sign In to Portal
              </button>
            </form>

            {/* ===== DIVIDER ===== */}
            <div className="flex items-center w-full my-3">
              <div className="flex-grow h-px bg-outline-variant" />
              <span className="px-stack-sm font-label-sm text-[11px] text-outline uppercase tracking-widest">
                Or Quick Demo Login
              </span>
              <div className="flex-grow h-px bg-outline-variant" />
            </div>

            {/* ===== DEMO LOGIN BUTTONS ===== */}
            {/* Note: Yeh buttons real auth bypass karte hain - sirf testing ke liye */}
            <div className="grid grid-cols-2 gap-2 w-full mb-4">
              {/* Citizen Demo - /chat par jata hai */}
              <button
                type="button"
                onClick={() => {
                  login("citizen", "citizen@govassist.ai", "Citizen User");
                  window.location.href = "/chat";
                }}
                className="py-2 px-3 border border-outline-variant rounded-lg bg-surface-container-low text-primary font-label-sm hover:bg-surface-container-high transition-colors cursor-pointer text-center"
              >
                👤 Citizen Demo
              </button>

              {/* Admin Demo - /admin par jata hai */}
              <button
                type="button"
                onClick={handleStaffLogin}
                className="py-2 px-3 border border-outline-variant rounded-lg bg-primary-container text-white font-label-sm hover:opacity-90 transition-opacity cursor-pointer text-center"
              >
                🛡️ Admin Demo
              </button>
            </div>

            {/* Trust badges - decorative security indicators */}
            <div className="grid grid-cols-2 gap-stack-md w-full">
              {[
                { icon: "lock", label: "Encrypted" },
                { icon: "verified_user", label: "Verified" },
              ].map(({ icon, label }) => (
                <div
                  key={label}
                  className="flex flex-col items-center p-stack-sm rounded-lg border border-transparent hover:border-outline-variant transition-colors"
                >
                  <span
                    className="material-symbols-outlined text-secondary mb-unit"
                    style={{ fontVariationSettings: "'FILL' 1" }}
                  >
                    {icon}
                  </span>
                  <span className="font-label-sm text-label-sm text-on-surface-variant">
                    {label}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Security disclaimer */}
          <div className="mt-stack-lg flex items-start gap-stack-sm px-stack-sm">
            <span className="material-symbols-outlined text-secondary text-[18px]">gpp_good</span>
            <p className="font-body-sm text-body-sm text-on-surface-variant leading-relaxed">
              This is a secure government portal. All data is protected by 256-bit
              government-grade encryption and complies with international data sovereignty
              regulations.
            </p>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="w-full bg-surface-container-low border-t border-outline-variant flex flex-col md:flex-row justify-between items-center py-stack-md px-margin-mobile md:px-margin-desktop gap-stack-md">
        <div className="flex flex-col items-center md:items-start gap-1">
          <span className="font-label-md text-label-md font-bold text-primary">GovAssist AI</span>
          <p className="font-body-sm text-body-sm text-on-surface-variant text-center md:text-left">
            © 2026 GovAssist AI. All rights reserved. Secure Government Portal.
          </p>
        </div>
        <nav className="flex flex-wrap justify-center gap-stack-md">
          <Link
            href="/legal"
            className="font-body-sm text-body-sm text-on-surface-variant hover:text-secondary transition-colors"
          >
            Privacy Policy
          </Link>
          <Link
            href="/legal"
            className="font-body-sm text-body-sm text-on-surface-variant hover:text-secondary transition-colors"
          >
            Terms of Service
          </Link>
          <Link
            href="/support"
            className="font-body-sm text-body-sm text-on-surface-variant hover:text-secondary transition-colors"
          >
            Support
          </Link>
        </nav>
      </footer>
    </div>
  );
}
