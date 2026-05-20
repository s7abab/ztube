import { tmdbGenreMap } from "./constants";
import { Movie } from "@/types";

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

export function trackUserAction(movie: Pick<Movie, "genres" | "cast">, weight: number = 1) {
  if (typeof window === "undefined") return;
  try {
    const profileStr = localStorage.getItem("ztube_profile");
    const profile = profileStr ? JSON.parse(profileStr) : { genreWeights: {}, castWeights: {}, lastUpdate: Date.now() };
    
    // Apply time decay: 50% reduction if last update was more than 7 days ago
    const now = Date.now();
    const daysSince = (now - (profile.lastUpdate || now)) / (1000 * 60 * 60 * 24);
    if (daysSince > 7) {
      const decay = 0.5;
      for (const k in profile.genreWeights) profile.genreWeights[k] *= decay;
      for (const k in profile.castWeights) profile.castWeights[k] *= decay;
    }

    if (movie.genres) {
      movie.genres.forEach((genre) => {
        profile.genreWeights[genre] = (profile.genreWeights[genre] || 0) + weight;
      });
    }
    
    if (movie.cast) {
      movie.cast.forEach((actor) => {
        profile.castWeights[actor] = (profile.castWeights[actor] || 0) + weight;
      });
    }

    profile.lastUpdate = now;
    localStorage.setItem("ztube_profile", JSON.stringify(profile));
  } catch (e) {}
}

export function getTopGenres(count: number = 2): string {
  if (typeof window === "undefined") return "";
  try {
    const profileStr = localStorage.getItem("ztube_profile");
    if (!profileStr) return "";
    const profile = JSON.parse(profileStr);
    const sorted = Object.entries(profile.genreWeights || {})
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

export function getBehavioralContext(): string {
  if (typeof window === "undefined") return "";
  try {
    const profileStr = localStorage.getItem("ztube_profile");
    if (!profileStr) return "";
    const profile = JSON.parse(profileStr);
    
    const topGenres = Object.entries(profile.genreWeights || {})
      .sort((a: any, b: any) => b[1] - a[1])
      .slice(0, 3)
      .map((e) => e[0])
      .join(", ");
      
    const topCast = Object.entries(profile.castWeights || {})
      .sort((a: any, b: any) => b[1] - a[1])
      .slice(0, 3)
      .map((e) => e[0])
      .join(", ");
      
    let context = "";
    if (topGenres) context += `Implicit user preference - Top Genres: ${topGenres}. `;
    if (topCast) context += `Favorite Actors: ${topCast}. `;
    
    return context;
  } catch (e) {
    return "";
  }
}
