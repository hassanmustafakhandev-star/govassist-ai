/**
 * auth.ts - Client-side authentication helper
 *
 * Purpose:
 *   - User session ko localStorage aur cookie mein store karta hai
 *   - Supabase Auth session ke sath sync karta hai
 *   - getUser() se poora application user data read karta hai
 *
 * User interface:
 *   email  - logged-in user ka email (Google ya custom)
 *   role   - "citizen" ya "admin"
 *   name   - display naam (Google profile se milta hai)
 *   avatar - profile picture URL (Google se milta hai)
 */

// ======= EXPORTS =======
export interface User {
  email: string;
  role: "citizen" | "admin";
  name?: string;    // Google account se milne wala naam
  avatar?: string;  // Google account se milne wali photo URL
}

// LocalStorage key - user object yahan store hota hai
const STORAGE_KEY = "govassist_user";

// Cookie key - middleware is cookie se role check karta hai
const COOKIE_KEY = "govassist_role";

/**
 * getUser()
 * Purpose: LocalStorage se logged-in user ka data return karta hai
 * Returns: User object ya null agar koi login nahi hua
 *
 * Usage:
 *   const user = getUser();
 *   if (!user) redirect("/login");
 *   console.log(user.email); // "hassan@gmail.com"
 */
export function getUser(): User | null {
  // Server-side rendering mein window nahi hota, isliye null return
  if (typeof window === "undefined") return null;

  const userStr = localStorage.getItem(STORAGE_KEY);
  if (!userStr) return null;

  try {
    // JSON string ko User object mein convert karo
    return JSON.parse(userStr) as User;
  } catch {
    // Corrupt data hone par null return karo
    return null;
  }
}

/**
 * login()
 * Purpose: User ko login karata hai - session localStorage + cookie mein save karta hai
 *
 * Parameters:
 *   role        - "citizen" | "admin"
 *   customEmail - optional: custom email (agar google ya form se aaye)
 *   name        - optional: display naam (Google se)
 *   avatar      - optional: profile photo URL (Google se)
 *
 * Usage:
 *   login("citizen", "hassan@gmail.com", "Hassan Khan", "https://...photo.jpg")
 */
export function login(
  role: "citizen" | "admin",
  customEmail?: string,
  name?: string,
  avatar?: string
): User {
  // User object banao - email default fallback ke sath
  const user: User = {
    email: customEmail || (role === "admin" ? "admin@govassist.ai" : "citizen@govassist.ai"),
    role,
    name: name || undefined,
    avatar: avatar || undefined,
  };

  if (typeof window !== "undefined") {
    // User object ko JSON mein convert karke localStorage mein save karo
    localStorage.setItem(STORAGE_KEY, JSON.stringify(user));

    // Cookie set karo taake middleware server-side bhi role check kar sake
    // max-age=86400 = 1 din (24 hours)
    document.cookie = `${COOKIE_KEY}=${role}; path=/; max-age=86400; SameSite=Lax`;
  }

  return user;
}

/**
 * logout()
 * Purpose: Session clear karta hai - localStorage aur cookie dono se
 *
 * Usage:
 *   logout(); // session khatam
 *   window.location.href = "/login"; // login page par bhejo
 */
export function logout(): void {
  if (typeof window !== "undefined") {
    // LocalStorage se user data hatao
    localStorage.removeItem(STORAGE_KEY);

    // Cookie expire karo (max-age=0 means turant delete)
    document.cookie = `${COOKIE_KEY}=; path=/; max-age=0`;
  }
}

/**
 * isAuthenticated()
 * Purpose: Check karo ke koi user login hai ya nahi
 * Returns: true | false
 */
export function isAuthenticated(): boolean {
  return getUser() !== null;
}

/**
 * isAdmin()
 * Purpose: Check karo ke logged-in user admin hai ya nahi
 * Returns: true agar role === "admin", warna false
 */
export function isAdmin(): boolean {
  const user = getUser();
  return user?.role === "admin";
}
