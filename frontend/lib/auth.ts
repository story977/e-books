// Admin auth helpers — localStorage-based JWT management

const TOKEN_KEY = "ebook_admin_token";
const EXPIRY_KEY = "ebook_admin_token_expiry";

export function saveAdminToken(token: string, expiresIn: number): void {
  if (typeof window === "undefined") return;
  const expiry = Date.now() + expiresIn * 1000;
  localStorage.setItem(TOKEN_KEY, token);
  localStorage.setItem(EXPIRY_KEY, String(expiry));
}

export function getAdminToken(): string | null {
  if (typeof window === "undefined") return null;
  const token = localStorage.getItem(TOKEN_KEY);
  const expiry = localStorage.getItem(EXPIRY_KEY);

  if (!token || !expiry) return null;

  if (Date.now() > Number(expiry)) {
    clearAdminToken();
    return null;
  }

  return token;
}

export function clearAdminToken(): void {
  if (typeof window === "undefined") return;
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(EXPIRY_KEY);
}

export function isAdminLoggedIn(): boolean {
  return getAdminToken() !== null;
}
