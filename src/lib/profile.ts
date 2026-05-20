import { tmdbGenreMap } from "./constants";

let cachedRegion: string | null = null;
export async function getUserRegion() {
  if (cachedRegion) return cachedRegion;
  try {
    const res = await fetch("https://ipapi.co/json/");
    if (!res.ok) throw new Error();
    const data = await res.json();
    cachedRegion = data.country_code || data.country || "US";
  } catch (e) {
    try {
      const res2 = await fetch("https://ipinfo.io/json");
      const data2 = await res2.json();
      cachedRegion = data2.country || "US";
    } catch (e2) {
      cachedRegion = "US";
    }
  }
  return cachedRegion;
}

export function trackUserAction(genres: string[], weight: number = 1) {
  if (typeof window === "undefined") return;
  try {
    const profileStr = localStorage.getItem("ztube_profile");
    const profile = profileStr ? JSON.parse(profileStr) : { genreWeights: {} };
    genres.forEach((genre) => {
      profile.genreWeights[genre] = (profile.genreWeights[genre] || 0) + weight;
    });
    localStorage.setItem("ztube_profile", JSON.stringify(profile));
  } catch (e) {}
}

export function getTopGenres(count: number = 2): string {
  if (typeof window === "undefined") return "";
  try {
    const profileStr = localStorage.getItem("ztube_profile");
    if (!profileStr) return "";
    const profile = JSON.parse(profileStr);
    const sorted = Object.entries(profile.genreWeights)
      .sort((a: any, b: any) => b[1] - a[1])
      .slice(0, count)
      .map((entry) => entry[0] as string);
      
    const ids = sorted
      .map((name) => {
        for (const [id, val] of tmdbGenreMap.entries()) {
          if (val === name) return id;
        }
        return null;
      })
      .filter(Boolean);
      
    return ids.join(",");
  } catch (e) {
    return "";
  }
}
