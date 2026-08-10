/**
 * supabase.ts - Supabase Browser Client
 *
 * Purpose:
 *   - Frontend mein Supabase se connect karna
 *   - Google OAuth, email login, session management sab yahan se hota hai
 *
 * PKCE Flow (Proof Key for Code Exchange):
 *   - Google OAuth ke liye PKCE flow zaruri hai
 *   - Yeh ek secure method hai OAuth code exchange karne ka
 *   - flowType: "pkce" enable karne se /auth/callback par code exchange properly kaam karta hai
 *
 * Environment Variables (.env.local se aate hain):
 *   NEXT_PUBLIC_SUPABASE_URL     - Supabase project URL
 *   NEXT_PUBLIC_SUPABASE_ANON_KEY - Public anonymous key
 */

import { createClient } from "@supabase/supabase-js";

// Supabase project URL - dashboard se milta hai
// Environment variable se pehle try karo, phir hardcoded fallback
const supabaseUrl =
  process.env.NEXT_PUBLIC_SUPABASE_URL ||
  "https://wvwuxiplbsipkhtucyml.supabase.co";

// Anonymous (public) key - browser mein safe hai expose karna
const supabaseAnonKey =
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Ind2d3V4aXBsYnNpcGtodHVjeW1sIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODQwMjU4MzgsImV4cCI6MjA5OTYwMTgzOH0.vfJjgTj5Z8UmsGIMnxvBKHoEXnpIu0Z5vMFNiHY26Es";

/**
 * Supabase client instance
 *
 * auth.flowType: "pkce"
 *   - PKCE = Proof Key for Code Exchange
 *   - Google OAuth callback ke liye required
 *   - Bina PKCE ke exchangeCodeForSession() fail ho jaata hai
 *
 * auth.detectSessionInUrl: true
 *   - URL mein agar #access_token ya ?code= ho toh automatically handle karta hai
 *
 * auth.persistSession: true
 *   - Session localStorage mein save rehta hai (page refresh ke baad bhi)
 */
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    flowType: "pkce",          // Google OAuth ke liye zaruri
    detectSessionInUrl: true,  // URL se automatically session detect karo
    persistSession: true,      // Session browser mein save raho
  },
});

