export function getCookie(name: string): string | null {
  if (typeof document === "undefined") return null

  const value = `; ${document.cookie}`
  const parts = value.split(`; ${name}=`)
  if (parts.length === 2) return parts.pop()?.split(";").shift() || null
  return null
}

export function setCookie(name: string, value: string, days = 30): void {
  if (typeof document === "undefined") return

  const expires = new Date()
  expires.setTime(expires.getTime() + days * 24 * 60 * 60 * 1000)
  document.cookie = `${name}=${value};expires=${expires.toUTCString()};path=/`
}

export function deleteCookie(name: string): void {
  if (typeof document === "undefined") return

  document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;`
}

// utils/getUserFromCookie.ts

type UserData = {
  id: number;
  nom: string;
  email: string;
  role: string;
  photo_profil: string;
};

export default function getUserFromCookie(): UserData | null {
  if (typeof document === "undefined") return null; // Protection SSR

  const cookies = document.cookie.split("; ");
  const userCookie = cookies.find((cookie) => cookie.startsWith("user="));
  if (!userCookie) return null;

  try {
    const rawValue = userCookie.split("=")[1];
    const parsed = JSON.parse(decodeURIComponent(rawValue));

    // Vérification de structure minimale
    if (
      typeof parsed.id === "number" &&
      typeof parsed.nom === "string" &&
      typeof parsed.email === "string" &&
      typeof parsed.role === "string" &&
      typeof parsed.photo_profil === "string"
    ) {
      return parsed as UserData;
    }

    return null;
  } catch (error) {
    console.error("Erreur lors du parsing du cookie utilisateur :", error);
    return null;
  }
}

 