"use server";

import { tmdbFetch, hydrateTmdbMovies } from "@/lib/tmdb";
import { Movie, TmdbMovie } from "@/types";

export async function getTmdbReels(page: number, region: string, genreParam: string): Promise<{ movies: Movie[], totalPages: number }> {
  const token = process.env.NEXT_PUBLIC_TMDB_API_KEY || process.env.TMDB_API_KEY || "";
  
  if (!token) {
    throw new Error("Missing TMDB key");
  }

  let trendingRes;
  try {
    if (page === 1) {
      trendingRes = await tmdbFetch<{
        results: TmdbMovie[];
        total_pages: number;
      }>(`/trending/all/day?language=en-US&page=${page}`, token);
    } else {
      trendingRes = await tmdbFetch<{
        results: TmdbMovie[];
        total_pages: number;
      }>(
        `/discover/movie?language=en-US&sort_by=popularity.desc&page=${page}&region=${region}${genreParam}`,
        token,
      );
    }
  } catch (e) {
     trendingRes = await tmdbFetch<{
        results: TmdbMovie[];
        total_pages: number;
      }>(
        `/discover/tv?language=en-US&sort_by=popularity.desc&page=${page}&with_origin_country=${region}${genreParam}`,
        token,
      );
  }

  const movies = await hydrateTmdbMovies(trendingRes.results, token, page * 12, true);
  return { movies, totalPages: trendingRes.total_pages };
}

export async function askOpenRouter(text: string, behavioralContext: string): Promise<string[]> {
  const token = process.env.NEXT_PUBLIC_OPENROUTER_API_KEY || process.env.OPENROUTER_API_KEY || "";
  if (!token) throw new Error("Missing OpenRouter key");

  const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: "meta-llama/llama-3.1-8b-instruct:free",
      messages: [
        {
          role: "system",
          content: `You are a movie recommendation assistant. ${behavioralContext}The user will ask for a recommendation. You must reply ONLY with a JSON array of up to 4 exact movie titles that match the query. Do not include markdown formatting, explanations, or any other text. Example: ["Inception", "Interstellar"]`,
        },
        { role: "user", content: text },
      ],
    }),
  });

  if (!response.ok) {
    throw new Error(`OpenRouter HTTP error: ${response.status}`);
  }

  const data = await response.json();
  const content = data.choices[0].message.content.trim();
  const parsed = JSON.parse(content.replace(/```json/g, "").replace(/```/g, ""));
  
  if (Array.isArray(parsed) && parsed.length > 0) {
    return parsed;
  } else {
    throw new Error("Response was not a valid array");
  }
}

export async function searchTmdbMovies(queries: string[]): Promise<Movie[]> {
  const token = process.env.NEXT_PUBLIC_TMDB_API_KEY || process.env.TMDB_API_KEY || "";
  const finalMovies: Movie[] = [];
  
  for (const query of queries) {
    const search = await tmdbFetch<{ results: TmdbMovie[] }>(
      `/search/multi?query=${encodeURIComponent(query)}&include_adult=false&language=en-US&page=1`,
      token,
    );
    if (search.results.length > 0) {
      const detailed = await hydrateTmdbMovies([search.results[0]], token, 0, false);
      if (detailed.length > 0) finalMovies.push(detailed[0]);
    }
  }
  return finalMovies;
}

export async function searchLiveTmdbMovies(query: string): Promise<Movie[]> {
  const token = process.env.NEXT_PUBLIC_TMDB_API_KEY || process.env.TMDB_API_KEY || "";
  const search = await tmdbFetch<{ results: TmdbMovie[] }>(
    `/search/multi?query=${encodeURIComponent(query)}&include_adult=false&language=en-US&page=1`,
    token,
  );
  if (search.results.length > 0) {
    return await hydrateTmdbMovies(search.results.slice(0, 4), token, 0, false);
  }
  return [];
}
