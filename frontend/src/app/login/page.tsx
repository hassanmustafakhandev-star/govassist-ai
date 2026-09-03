/**
 * login/page.tsx - Official Google-Only Authentication Portal
 *
 * Exclusively provides Google OAuth authentication via Supabase.
 * All demo credentials and legacy email forms have been completely removed.
 */

"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { logout } from "../auth";
import { supabase } from "../../lib/supabase";

export default function LoginPage() {
  const [loading, setLoading] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);

  // Clear any existing stale session on mount
  useEffect(() => {
    logout();
  }, []);

  /**
   * handleGoogleLogin()
   * Initiates authentic Google OAuth via Supabase
   */
  const handleGoogleLogin = async () => {
    setLoading(true);
    setAuthError(null);

    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo: `${window.location.origin}/auth/callback`,
          queryParams: {
            access_type: "offline",
            prompt: "consent",
          },
        },
      });

      if (error) {
        setAuthError(error.message || "Google authentication failed. Please verify Supabase settings.");
        setLoading(false);
      }
    } catch (err: any) {
      setAuthError(err.message || "Unable to reach Google OAuth service. Please try again.");
      setLoading(false);
    }
  };

  return (
    <div className="bg-surface text-on-surface min-h-screen flex flex-col selection:bg-secondary-container">
      {/* Subtle geometric dot pattern */}
      <div
        className="fixed inset-0 pointer-events-none"
        style={{
          backgroundImage: "radial-gradient(#0c2340 0.6px, transparent 0.6px)",
          backgroundSize: "28px 28px",
          opacity: 0.04,
        }}
      />

      {/* Main Container */}
      <main className="flex-grow flex items-center justify-center px-4 md:px-8 relative z-10 py-12">
        <div className="w-full max-w-[460px]">
          
          {/* Official Emblem & Branding */}
          <div className="flex flex-col items-center mb-8 text-center">
            <div className="w-16 h-16 rounded-2xl bg-primary flex items-center justify-center text-white mb-4 shadow-lg shadow-primary/20 border border-primary-container">
              <span
                className="material-symbols-outlined text-[36px]"
                style={{ fontVariationSettings: "'FILL' 1" }}
              >
                account_balance
              </span>
            </div>
            
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-secondary-container text-on-secondary-container rounded-full mb-2 border border-secondary/20">
              <span className="w-2 h-2 rounded-full bg-secondary animate-pulse" />
              <span className="font-label-sm text-[11px] font-semibold uppercase tracking-wider">
                Official Saudi Digital Services
              </span>
            </div>

            <h1 className="font-headline-xl text-headline-xl text-primary font-bold tracking-tight">
              GovAssist AI
            </h1>
            <p className="font-body-sm text-body-sm text-on-surface-variant max-w-sm mt-1">
              Autonomous Government Services & Policy Advisory Ecosystem
            </p>
          </div>

          {/* Secure Login Card */}
          <div
            className="bg-surface-container-lowest rounded-2xl p-8 md:p-10 flex flex-col items-center text-center shadow-xl border border-outline-variant/60 relative overflow-hidden backdrop-blur-sm"
          >
            {/* Top decorative accent line */}
            <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-primary via-secondary to-primary" />

            <div className="w-12 h-12 rounded-full bg-surface-container flex items-center justify-center mb-4 text-primary border border-outline-variant">
              <span className="material-symbols-outlined text-[24px]">
                verified_user
              </span>
            </div>

            <h2 className="font-headline-md text-headline-md text-on-surface font-bold mb-2">
              Citizen & Resident Sign In
            </h2>
            <p className="font-body-md text-body-md text-on-surface-variant mb-8 text-sm leading-relaxed">
              Authenticate securely with your verified Google account to access your personalized government dashboard, 
              policy advisory, and document verification records.
            </p>

            {/* Error Notification */}
            {authError && (
              <div className="w-full p-3.5 bg-red-50 border border-red-200 text-red-700 text-xs rounded-xl mb-6 text-left flex items-start gap-2.5">
                <span className="material-symbols-outlined text-[18px] text-red-600 shrink-0">
                  error
                </span>
                <span className="leading-snug">{authError}</span>
              </div>
            )}

            {/* Single Official Google Sign-In Button */}
            <button
              type="button"
              onClick={handleGoogleLogin}
              disabled={loading}
              className="w-full flex items-center justify-center gap-3 py-3.5 px-6 border border-outline-variant rounded-xl bg-white hover:bg-surface-container-lowest text-on-surface font-label-md font-semibold hover:border-primary/50 hover:shadow-md active:scale-[0.98] transition-all disabled:opacity-60 cursor-pointer mb-6"
            >
              {loading ? (
                <span className="material-symbols-outlined animate-spin text-[22px] text-primary">
                  progress_activity
                </span>
              ) : (
                <svg className="w-5 h-5 shrink-0" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                  <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-1 .67-2.28 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                  <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05" />
                  <path d="M12 5.38c1.62 0 3.06.56 4.21 1.66l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
                </svg>
              )}
              <span className="text-sm">
                {loading ? "Redirecting to Google..." : "Continue with Google"}
              </span>
            </button>

            {/* Trust & Security Indicators */}
            <div className="w-full pt-6 border-t border-outline-variant/60 flex items-center justify-around text-on-surface-variant">
              <div className="flex items-center gap-1.5">
                <span className="material-symbols-outlined text-secondary text-[18px]">
                  lock
                </span>
                <span className="font-label-sm text-[11px] font-medium">
                  256-Bit SSL Encrypted
                </span>
              </div>
              <div className="h-4 w-px bg-outline-variant" />
              <div className="flex items-center gap-1.5">
                <span className="material-symbols-outlined text-secondary text-[18px]">
                  shield
                </span>
                <span className="font-label-sm text-[11px] font-medium">
                  OAuth 2.0 PKCE Protected
                </span>
              </div>
            </div>
          </div>

          {/* Privacy & Compliance Footnote */}
          <div className="mt-8 text-center">
            <p className="font-body-sm text-xs text-on-surface-variant/80 max-w-sm mx-auto leading-relaxed">
              By proceeding, you agree to the GovAssist AI{" "}
              <Link href="/legal" className="text-primary hover:underline font-medium">
                Terms of Service
              </Link>{" "}
              and{" "}
              <Link href="/legal" className="text-primary hover:underline font-medium">
                Privacy Policy
              </Link>. Data is securely processed under applicable digital privacy standards.
            </p>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="w-full bg-surface-container-low border-t border-outline-variant py-4 px-6 md:px-12 flex flex-col md:flex-row justify-between items-center gap-2 text-xs text-on-surface-variant">
        <span>© 2026 GovAssist AI. All rights reserved.</span>
        <div className="flex gap-6">
          <Link href="/legal" className="hover:text-primary transition-colors">Privacy Policy</Link>
          <Link href="/legal" className="hover:text-primary transition-colors">Terms of Service</Link>
          <Link href="/support" className="hover:text-primary transition-colors">Contact Support</Link>
        </div>
      </footer>
    </div>
  );
}
