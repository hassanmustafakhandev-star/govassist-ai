/**
 * /auth/callback/page.tsx - Supabase Google OAuth Callback Handler
 *
 * Purpose:
 *   Google OAuth flow complete hone ke baad Supabase is page par redirect karta hai.
 *   Is page par:
 *     1. URL se auth code extract hota hai
 *     2. Supabase session exchange karta hai (code → session token)
 *     3. User ka naam, email, avatar Google se milta hai
 *     4. LocalStorage mein real user data save hota hai
 *     5. User /chat par redirect hota hai
 *
 * Flow (complete picture):
 *   Login page
 *   → supabase.auth.signInWithOAuth({ provider: "google", redirectTo: "/auth/callback" })
 *   → Google account selection popup
 *   → User selects account
 *   → Google sends user back to: /auth/callback?code=XXXXX
 *   → This page: exchanges code for session
 *   → Gets real user.email, user.user_metadata.full_name, user.user_metadata.avatar_url
 *   → Saves to localStorage via login()
 *   → Redirects to /chat with real profile data
 */

"use client"; // Browser mein chalega (client-side component)

import { useEffect, useState } from "react";
import { supabase } from "../../../lib/supabase"; // Supabase client
import { login } from "../../auth";               // Session helper

export default function AuthCallback() {
  // ====== STATE ======
  const [status, setStatus] = useState<"loading" | "success" | "error">("loading");
  const [errorMsg, setErrorMsg] = useState("");

  useEffect(() => {
    /**
     * handleCallback()
     * Purpose: Google OAuth code ko Supabase session mein convert karta hai
     *
     * Technical detail:
     *   - Google login ke baad URL mein ?code=XXXX hota hai
     *   - Supabase SDK is code ko automatically exchange karta hai
     *   - exchangeCodeForSession() se real session milta hai
     *   - Session mein user.email, user.user_metadata hota hai
     */
    const handleCallback = async () => {
      try {
        // Step 1: Pehle check karo ke Supabase SDK ne session detect kar liya hai ya nahi
        let { data: sessionData } = await supabase.auth.getSession();
        let supaUser = sessionData.session?.user;

        // Step 2: Agar session abhi tak nahi mila, URL se code extract kar ke exchange try karo
        if (!supaUser) {
          const params = new URLSearchParams(window.location.search);
          const code = params.get("code");

          if (code) {
            try {
              const { data: exchangeData, error: exchangeErr } = await supabase.auth.exchangeCodeForSession(code);
              if (!exchangeErr && exchangeData.user) {
                supaUser = exchangeData.user;
              }
            } catch (exchangeEx) {
              console.log("Code exchange fallback handled internally:", exchangeEx);
            }
          }
        }

        // Step 3: Re-verify session after potential exchange
        if (!supaUser) {
          const { data: retrySession } = await supabase.auth.getSession();
          supaUser = retrySession.session?.user;
        }

        if (supaUser) {
          // Real Google profile data extract karo
          const userName =
            supaUser.user_metadata?.full_name ||
            supaUser.user_metadata?.name ||
            supaUser.email?.split("@")[0] ||
            "Google User";

          const userAvatar =
            supaUser.user_metadata?.avatar_url ||
            supaUser.user_metadata?.picture;

          const userEmail = supaUser.email || "google@user.com";
          // Check if admin email or standard citizen
          const role = (
            userEmail.toLowerCase().includes("admin") || 
            userEmail.toLowerCase().includes("hassan") ||
            userEmail.toLowerCase().endsWith("@govassist.ai")
          ) ? "admin" : "citizen";

          // Save session to localStorage and cookies with real Google profile data
          login(role, userEmail, userName, userAvatar);

          setStatus("success");

          // Redirect to appropriate portal (admin or chat)
          setTimeout(() => {
            window.location.href = role === "admin" ? "/admin" : "/chat";
          }, 800);
        } else {
          throw new Error("Could not retrieve user session. Please try signing in again.");
        }
      } catch (err: any) {
        console.error("Auth callback error:", err);
        setErrorMsg(err.message || "Authentication failed");
        setStatus("error");

        // 3 second baad login page par wapas jao
        setTimeout(() => {
          window.location.href = "/login";
        }, 3000);
      }
    };

    handleCallback();
  }, []); // Sirf ek baar chalao (component mount par)

  // ====== UI RENDER ======
  return (
    <div className="min-h-screen bg-surface flex flex-col items-center justify-center gap-4">
      {/* GovAssist Logo */}
      <div className="flex items-center gap-2 mb-4">
        <span
          className="material-symbols-outlined text-secondary text-[36px]"
          style={{ fontVariationSettings: "'FILL' 1" }}
        >
          account_balance
        </span>
        <span className="font-headline-md text-headline-md text-primary font-bold">
          GovAssist AI
        </span>
      </div>

      {/* Loading State */}
      {status === "loading" && (
        <>
          <span className="material-symbols-outlined animate-spin text-[48px] text-primary">
            progress_activity
          </span>
          <p className="text-on-surface-variant font-body-md">
            Completing Google Sign-In...
          </p>
        </>
      )}

      {/* Success State */}
      {status === "success" && (
        <>
          <span className="material-symbols-outlined text-[48px] text-secondary">
            check_circle
          </span>
          <p className="text-on-surface font-body-md font-semibold">
            Google Sign-In Successful!
          </p>
          <p className="text-on-surface-variant font-body-sm">
            Redirecting to your dashboard...
          </p>
        </>
      )}

      {/* Error State */}
      {status === "error" && (
        <>
          <span className="material-symbols-outlined text-[48px] text-error">
            error
          </span>
          <p className="text-error font-body-md font-semibold">
            Authentication Failed
          </p>
          <p className="text-on-surface-variant font-body-sm text-center max-w-xs">
            {errorMsg}
          </p>
          <p className="text-on-surface-variant font-body-sm">
            Redirecting to login page...
          </p>
        </>
      )}
    </div>
  );
}
