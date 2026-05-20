"use client";

import Image from "next/image";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";

type Movie = {
  id: number;
  title: string;
  year: string;
  genres: string[];
  rating: string;
  popularity: string;
  hook: string;
  description: string;
  poster: string;
  backdrop: string;
  trailer: string;
  trailerKey?: string;
  providers: string[];
  cast: string[];
  why: string;
  similar: string[];
  type: "movie" | "tv";
};

type TmdbMovie = {
  id: number;
  title?: string;
  name?: string;
  release_date?: string;
  first_air_date?: string;
  genre_ids?: number[];
  vote_average?: number;
  popularity?: number;
  overview?: string;
  poster_path?: string;
  backdrop_path?: string;
  media_type?: "movie" | "tv" | "person";
};

type TmdbMovieDetail = TmdbMovie & {
  genres?: { id: number; name: string }[];
  videos?: { results?: { key: string; site: string; type: string; official?: boolean }[] };
  credits?: { cast?: { name: string }[] };
  "watch/providers"?: { results?: { US?: { flatrate?: { provider_name: string }[]; rent?: { provider_name: string }[] } } };
  similar?: { results?: TmdbMovie[] };
};

const fallbackMovies: Movie[] = [
  {
    id: 1,
    type: "movie",
    title: "Dune: Part Two",
    year: "2024",
    genres: ["Sci-Fi", "Adventure"],
    rating: "8.5",
    popularity: "946.4",
    hook: "A desert prophecy turns into a war you can feel in your chest.",
    description:
      "Paul Atreides unites with Chani and the Fremen while seeking revenge against the conspirators who destroyed his family.",
    poster:
      "https://image.tmdb.org/t/p/w500/1pdfLvkbY9ohJlCjQH2CZjjYVvJ.jpg",
    backdrop:
      "https://image.tmdb.org/t/p/original/xOMo8BRK7PfcJv9JCnx7s5hj0PX.jpg",
    trailer:
      "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerMeltdowns.mp4",
    providers: ["Max", "Prime vibe", "Apple TV"],
    cast: ["Timothee Chalamet", "Zendaya", "Rebecca Ferguson", "Javier Bardem"],
    why: "Epic scale, political tension, and dreamlike sci-fi imagery make it perfect for immersive discovery.",
    similar: ["Blade Runner 2049", "Arrival", "Mad Max: Fury Road"],
  },
  {
    id: 2,
    type: "movie",
    title: "Challengers",
    year: "2024",
    genres: ["Drama", "Romance"],
    rating: "7.1",
    popularity: "412.7",
    hook: "A love triangle scored like a championship point.",
    description:
      "A former tennis prodigy turned coach transforms her husband into a champion, until the past walks onto the court.",
    poster:
      "https://image.tmdb.org/t/p/w500/H6vke7zGiuLsz4v4RPeReb9rsv.jpg",
    backdrop:
      "https://image.tmdb.org/t/p/original/4CcUgdiGe83MeqJW1NyJVmZqRrF.jpg",
    trailer:
      "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4",
    providers: ["MGM+", "Prime vibe", "Rental"],
    cast: ["Zendaya", "Josh O'Connor", "Mike Faist"],
    why: "Sharp chemistry, kinetic editing, and stylish tension make it feel like a pop-cultural pressure cooker.",
    similar: ["Match Point", "Past Lives", "The Social Network"],
  },
  {
    id: 3,
    type: "movie",
    title: "Civil War",
    year: "2024",
    genres: ["War", "Thriller"],
    rating: "6.9",
    popularity: "388.1",
    hook: "A road trip through the sound of a collapsing country.",
    description:
      "A group of journalists travel across a fractured America while racing toward Washington, D.C.",
    poster:
      "https://image.tmdb.org/t/p/w500/sh7Rg8Er3tFcN9BpKIPOMvALgZd.jpg",
    backdrop:
      "https://image.tmdb.org/t/p/original/z121dSTR7PY9KxKuvwiIFSYW8cf.jpg",
    trailer:
      "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/Sintel.mp4",
    providers: ["Max vibe", "A24", "Apple TV"],
    cast: ["Kirsten Dunst", "Wagner Moura", "Cailee Spaeny"],
    why: "A tense, image-first thriller with atmosphere, dread, and documentary-like immediacy.",
    similar: ["Children of Men", "Nightcrawler", "Zero Dark Thirty"],
  },
  {
    id: 4,
    type: "movie",
    title: "The Creator",
    year: "2023",
    genres: ["Sci-Fi", "Action"],
    rating: "7.0",
    popularity: "295.9",
    hook: "A human heart trapped inside a machine-war fairytale.",
    description:
      "An ex-special forces agent is recruited to hunt down the architect of advanced AI and the weapon that could end war.",
    poster:
      "https://image.tmdb.org/t/p/w500/vBZ0qvaRxqEhZwl6LWmruJqWE8Z.jpg",
    backdrop:
      "https://image.tmdb.org/t/p/original/iIvQnZyzgx9TkbrOgcXx0p7aLiq.jpg",
    trailer:
      "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/TearsOfSteel.mp4",
    providers: ["Hulu", "Disney+ vibe", "Rental"],
    cast: ["John David Washington", "Madeleine Yuna Voyles", "Gemma Chan"],
    why: "Big tactile sci-fi images, emotional AI themes, and grounded spectacle fit conversational recommendations.",
    similar: ["Ex Machina", "District 9", "Rogue One"],
  },
];

const tmdbGenreMap = new Map([
  [12, "Adventure"],
  [14, "Fantasy"],
  [16, "Animation"],
  [18, "Drama"],
  [27, "Horror"],
  [28, "Action"],
  [35, "Comedy"],
  [36, "History"],
  [37, "Western"],
  [53, "Thriller"],
  [80, "Crime"],
  [99, "Documentary"],
  [878, "Sci-Fi"],
  [9648, "Mystery"],
  [10402, "Music"],
  [10749, "Romance"],
  [10751, "Family"],
  [10752, "War"],
  [10770, "TV Movie"],
]);

const posterUrl = (path?: string | null) =>
  path ? `https://image.tmdb.org/t/p/w500${path}` : fallbackMovies[0].poster;

const backdropUrl = (path?: string | null) =>
  path ? `https://image.tmdb.org/t/p/original${path}` : fallbackMovies[0].backdrop;

const sampleTrailers = fallbackMovies.map((movie) => movie.trailer);

function buildHook(movie: Pick<Movie, "title" | "genres" | "rating">) {
  const genre = movie.genres[0]?.toLowerCase() || "cinematic";
  return `${movie.title} carries a ${genre} pulse with a ${movie.rating} TMDB signal.`;
}

function tmdbHeaders(token: string): Record<string, string> {
  const headers: Record<string, string> = {
    "Content-Type": "application/json;charset=utf-8",
  };
  if (token.includes(".")) {
    headers.Authorization = `Bearer ${token}`;
  }
  return headers;
}

function tmdbUrl(path: string, token: string) {
  const url = new URL(`https://api.themoviedb.org/3${path}`);
  if (!token.includes(".")) {
    url.searchParams.set("api_key", token);
  }
  return url.toString();
}

async function tmdbFetch<T>(path: string, token: string): Promise<T> {
  const response = await fetch(tmdbUrl(path, token), {
    headers: tmdbHeaders(token),
  });
  if (!response.ok) {
    throw new Error(`TMDB request failed: ${response.status}`);
  }
  return response.json() as Promise<T>;
}

function mapTmdbMovie(movie: TmdbMovieDetail, index: number): Movie {
  const isTv = movie.media_type === "tv" || !!movie.name;
  const type = isTv ? "tv" : "movie";
  const genres =
    movie.genres?.map((genre) => genre.name).slice(0, 3) ||
    movie.genre_ids
      ?.map((id) => tmdbGenreMap.get(id))
      .filter((genre): genre is string => Boolean(genre))
      .slice(0, 3) ||
    [];
  const title = movie.title || movie.name || "Untitled";
  const year = (movie.release_date || movie.first_air_date || "2026").slice(0, 4);
  const trailerKey = movie.videos?.results?.find(
    (video) => video.site === "YouTube" && video.type === "Trailer" && video.official,
  )?.key || movie.videos?.results?.find((video) => video.site === "YouTube" && video.type === "Trailer")?.key;
  const providers = [
    ...(movie["watch/providers"]?.results?.US?.flatrate || []),
    ...(movie["watch/providers"]?.results?.US?.rent || []),
  ]
    .map((provider) => provider.provider_name)
    .filter((provider, providerIndex, all) => all.indexOf(provider) === providerIndex)
    .slice(0, 3);
  const mappedMovie: Movie = {
    id: movie.id,
    type,
    title,
    year,
    genres: genres.length ? genres : ["Cinema"],
    rating: (movie.vote_average || 0).toFixed(1),
    popularity: (movie.popularity || 0).toFixed(1),
    hook: "",
    description: movie.overview || "TMDB has not published a synopsis for this title yet.",
    poster: posterUrl(movie.poster_path),
    backdrop: backdropUrl(movie.backdrop_path),
    trailer: sampleTrailers[index % sampleTrailers.length],
    trailerKey,
    providers: providers.length ? providers : ["TMDB watchlist", "Trailer vibe", "Rental"],
    cast: movie.credits?.cast?.map((person) => person.name).slice(0, 8) || [],
    why: `This lands because it blends ${genres.slice(0, 2).join(" and ") || "cinematic"} energy with strong audience momentum.`,
    similar: movie.similar?.results?.map((similar) => similar.title || similar.name || "Untitled").slice(0, 8) || [],
  };
  return {
    ...mappedMovie,
    hook: buildHook(mappedMovie),
  };
}

async function hydrateTmdbMovies(movies: TmdbMovie[], token: string, offset = 0, requireTrailer = true) {
  const detailedMovies = await Promise.all(
    movies
      .filter((movie) => movie.poster_path && movie.backdrop_path)
      .slice(0, 20)
      .map((movie) => {
        const type = movie.media_type === "tv" || !!movie.name ? "tv" : "movie";
        return tmdbFetch<TmdbMovieDetail>(
          `/${type}/${movie.id}?language=en-US&append_to_response=videos,credits,watch/providers,similar`,
          token,
        );
      }),
  );
  return detailedMovies
    .map((movie, index) => mapTmdbMovie(movie, index + offset))
    .filter((movie) => !requireTrailer || movie.trailerKey);
}

function mapBasicTmdbMovie(movie: TmdbMovie, index: number): Movie {
  const isTv = movie.media_type === "tv" || !!movie.name;
  const type = isTv ? "tv" : "movie";
  const genres =
    movie.genre_ids
      ?.map((id) => tmdbGenreMap.get(id))
      .filter((genre): genre is string => Boolean(genre))
      .slice(0, 3) || [];
  const title = movie.title || movie.name || "Untitled";
  const year = (movie.release_date || movie.first_air_date || "2026").slice(0, 4);

  const mappedMovie: Movie = {
    id: movie.id,
    type,
    title,
    year,
    genres: genres.length ? genres : ["Cinema"],
    rating: (movie.vote_average || 0).toFixed(1),
    popularity: (movie.popularity || 0).toFixed(1),
    hook: "",
    description: movie.overview || "TMDB has not published a synopsis for this title yet.",
    poster: posterUrl(movie.poster_path),
    backdrop: backdropUrl(movie.backdrop_path),
    trailer: sampleTrailers[index % sampleTrailers.length],
    trailerKey: undefined,
    providers: ["TMDB watchlist", "Trailer vibe", "Rental"],
    cast: [],
    why: `This lands because it blends ${genres.slice(0, 2).join(" and ") || "cinematic"} energy with strong audience momentum.`,
    similar: [],
  };
  return {
    ...mappedMovie,
    hook: buildHook(mappedMovie),
  };
}

const prompts = [
  "Mind bending sci-fi",
  "Movies like Interstellar",
  "Best Korean thrillers",
  "Underrated A24 movies",
  "Feel-good movies for night",
];

const searchCache = new Map<string, TmdbMovie[]>();

let cachedRegion: string | null = null;
async function getUserRegion() {
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

function trackUserAction(genres: string[], weight: number = 1) {
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

function getTopGenres(count: number = 2): string {
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

function Icon({ name }: { name: "play" | "spark" | "heart" | "share" | "bookmark" | "film" | "chat" | "send" | "x" | "sound" | "mute" }) {
  const common = "h-5 w-5";
  if (name === "play") return <span className={common}>▶</span>;
  if (name === "spark") return <span className={common}>✦</span>;
  if (name === "heart") return <span className={common}>♡</span>;
  if (name === "share") return <span className={common}>↗</span>;
  if (name === "bookmark") return <span className={common}>⌑</span>;
  if (name === "chat") return <span className={common}>◐</span>;
  if (name === "send") return <span className={common}>➤</span>;
  if (name === "x") return <span className={common}>×</span>;
  if (name === "sound") {
    return (
      <svg className={common} fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" d="M19.114 5.636a9 9 0 0 1 0 12.728M16.463 8.288a5.25 5.25 0 0 1 0 7.424M6.75 8.25l4.72-4.72a.75.75 0 0 1 1.28.53v15.88a.75.75 0 0 1-1.28.53l-4.72-4.72H4.51c-.88 0-1.704-.507-1.938-1.354A9.009 9.009 0 0 1 2.25 12c0-.83.112-1.633.322-2.396C2.806 8.756 3.63 8.25 4.51 8.25H6.75Z" />
      </svg>
    );
  }
  if (name === "mute") {
    return (
      <svg className={common} fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" d="M17.25 9.75 19.5 12m0 0 2.25 2.25M19.5 12l2.25-2.25M19.5 12l-2.25 2.25m-10.5-6 4.72-4.72a.75.75 0 0 1 1.28.53v15.88a.75.75 0 0 1-1.28.53l-4.72-4.72H4.51c-.88 0-1.704-.507-1.938-1.354A9.009 9.009 0 0 1 2.25 12c0-.83.112-1.633.322-2.396C2.806 8.756 3.63 8.25 4.51 8.25H6.75Z" />
      </svg>
    );
  }
  return <span className={common}>▰</span>;
}

export default function Home() {
  const [tab, setTab] = useState<"reels" | "gpt">("reels");
  const [movies, setMovies] = useState<Movie[]>(fallbackMovies);
  const [isLoadingMovies, setIsLoadingMovies] = useState(() => Boolean(process.env.NEXT_PUBLIC_TMDB_API_KEY));
  const [isLoadingMoreReels, setIsLoadingMoreReels] = useState(false);
  const [tmdbPage, setTmdbPage] = useState(1);
  const [hasMoreReels, setHasMoreReels] = useState(true);
  const [tmdbStatus, setTmdbStatus] = useState<"live" | "fallback" | "missing-key">(() =>
    process.env.NEXT_PUBLIC_TMDB_API_KEY ? "fallback" : "missing-key",
  );
  const [active, setActive] = useState(0);
  const [expanded, setExpanded] = useState<number | null>(null);
  const [liked, setLiked] = useState<number | null>(null);
  const [soundOn, setSoundOn] = useState(true);
  const [selected, setSelected] = useState<Movie | null>(null);
  const [watching, setWatching] = useState<Movie | null>(null);

  const handleWatch = useCallback((movie: Movie) => {
    setWatching(movie);
    trackUserAction(movie.genres, 3);
  }, []);

  const handleLike = useCallback((movie: Movie) => {
    setLiked(movie.id);
    trackUserAction(movie.genres, 2);
  }, []);

  const [gptSuggestions, setGptSuggestions] = useState<Movie[]>(fallbackMovies.slice(0, 3));
  const [messages, setMessages] = useState([
    {
      role: "ai",
      text: "Tell me the mood, director, actor, or movie you want. I will turn it into a watchlist.",
    },
  ]);
  const [input, setInput] = useState("");
  const [thinking, setThinking] = useState(false);
  const [liveSuggestions, setLiveSuggestions] = useState<Movie[]>([]);
  const [isLoadingSuggestions, setIsLoadingSuggestions] = useState(false);
  const [isOpeningDetails, setIsOpeningDetails] = useState(false);
  const videoRefs = useRef<(HTMLVideoElement | null)[]>([]);
  const loadingMoreRef = useRef(false);

  const openDetails = useCallback(async (movie: Movie) => {
    if (movie.cast.length > 0) {
      setSelected(movie);
      return;
    }
    const token = process.env.NEXT_PUBLIC_TMDB_API_KEY;
    if (!token) {
      setSelected(movie);
      return;
    }
    setIsOpeningDetails(true);
    try {
      const detail = await tmdbFetch<TmdbMovieDetail>(
        `/${movie.type}/${movie.id}?language=en-US&append_to_response=videos,credits,watch/providers,similar`,
        token,
      );
      const fullMovie = mapTmdbMovie(detail, 0);
      fullMovie.trailer = movie.trailer; // preserve original fallback trailer
      setSelected(fullMovie);
    } catch (error) {
      console.error("Failed to load details:", error);
      setSelected(movie);
    } finally {
      setIsOpeningDetails(false);
    }
  }, []);

  const loadTmdbReelsPage = useCallback(
    async (page: number, mode: "replace" | "append") => {
      const token = process.env.NEXT_PUBLIC_TMDB_API_KEY;
      if (!token) {
        setTmdbStatus("missing-key");
        setIsLoadingMovies(false);
        return;
      }

      if (mode === "append") {
        if (loadingMoreRef.current || !hasMoreReels || tmdbStatus !== "live") return;
        loadingMoreRef.current = true;
        setIsLoadingMoreReels(true);
      } else {
        setIsLoadingMovies(true);
      }

      try {
        const region = await getUserRegion();
        const topGenres = getTopGenres(2);
        const fetchPage = mode === "replace" ? Math.floor(Math.random() * 5) + 1 : page;
        const genreParam = topGenres ? `&with_genres=${topGenres}` : "";

        const [trendingRes, discoverMoviesRes, discoverTvRes] = await Promise.all([
          tmdbFetch<{ page: number; total_pages: number; results: TmdbMovie[] }>(
            `/trending/all/day?language=en-US&page=${fetchPage}`,
            token,
          ),
          tmdbFetch<{ page: number; total_pages: number; results: TmdbMovie[] }>(
            `/discover/movie?language=en-US&sort_by=popularity.desc&page=${fetchPage}&region=${region}${genreParam}`,
            token,
          ),
          tmdbFetch<{ page: number; total_pages: number; results: TmdbMovie[] }>(
            `/discover/tv?language=en-US&sort_by=popularity.desc&page=${fetchPage}&with_origin_country=${region}${genreParam}`,
            token,
          ),
        ]);

        const combinedResults: TmdbMovie[] = [];
        const maxLen = Math.max(trendingRes.results.length, discoverMoviesRes.results.length, discoverTvRes.results.length);
        for (let i = 0; i < maxLen; i++) {
          if (trendingRes.results[i]) combinedResults.push(trendingRes.results[i]);
          if (discoverMoviesRes.results[i]) combinedResults.push({ ...discoverMoviesRes.results[i], media_type: "movie" });
          if (discoverTvRes.results[i]) combinedResults.push({ ...discoverTvRes.results[i], media_type: "tv" });
        }

        const uniqueResults: TmdbMovie[] = [];
        const seenIds = new Set();
        for (const m of combinedResults) {
          if (!seenIds.has(m.id)) {
            seenIds.add(m.id);
            uniqueResults.push(m);
          }
        }

        const hydratedMovies = await hydrateTmdbMovies(uniqueResults, token, fetchPage * 12);
        if (!hydratedMovies.length) {
          setTmdbPage(fetchPage);
          setHasMoreReels(fetchPage < trendingRes.total_pages);
          return;
        }

        setMovies((current) => {
          if (mode === "replace") return hydratedMovies;
          const existingIds = new Set(current.map((movie) => movie.id));
          return [...current, ...hydratedMovies.filter((movie) => !existingIds.has(movie.id))];
        });
        setTmdbPage(fetchPage);
        setHasMoreReels(fetchPage < trendingRes.total_pages);
        setTmdbStatus("live");
      } catch (error) {
        console.error(error);
        if (mode === "replace") {
          setMovies(fallbackMovies);
          setTmdbStatus("fallback");
        }
      } finally {
        if (mode === "append") {
          loadingMoreRef.current = false;
          setIsLoadingMoreReels(false);
        } else {
          setIsLoadingMovies(false);
        }
      }
    },
    [hasMoreReels, tmdbStatus],
  );

  useEffect(() => {
    let cancelled = false;

    async function loadMovies() {
      await loadTmdbReelsPage(1, "replace");
      if (cancelled) return;
    }

    loadMovies();

    return () => {
      cancelled = true;
    };
  }, [loadTmdbReelsPage]);

  useEffect(() => {
    videoRefs.current.forEach((video, index) => {
      if (!video) return;
      if (index === active && tab === "reels" && !watching) {
        video.play().catch(() => undefined);
      } else {
        video.pause();
      }
    });

    // Lazy hydrate active reel
    const currentMovie = movies[active];
    if (tab === "reels" && currentMovie && currentMovie.cast.length === 0) {
      const token = process.env.NEXT_PUBLIC_TMDB_API_KEY;
      if (token) {
        tmdbFetch<TmdbMovieDetail>(
          `/${currentMovie.type}/${currentMovie.id}?language=en-US&append_to_response=videos,credits,watch/providers,similar`,
          token,
        )
          .then((detail) => {
            const fullMovie = mapTmdbMovie(detail, active);
            fullMovie.trailer = currentMovie.trailer;
            setMovies((current) => {
              const next = [...current];
              if (next[active]?.id === fullMovie.id) {
                next[active] = fullMovie;
              }
              return next;
            });
          })
          .catch(() => undefined);
      }
    }
  }, [active, tab, watching, movies]);

  useEffect(() => {
    const token = process.env.NEXT_PUBLIC_TMDB_API_KEY;
    const query = input.trim();
    if (!token || tab !== "gpt" || query.length < 2) {
      const resetTimeout = window.setTimeout(() => {
        setLiveSuggestions([]);
        setIsLoadingSuggestions(false);
      }, 0);
      return () => window.clearTimeout(resetTimeout);
    }

    let cancelled = false;

    const timeout = window.setTimeout(async () => {
      try {
        setIsLoadingSuggestions(true);
        let results = searchCache.get(query);
        if (!results) {
          const search = await tmdbFetch<{ results: TmdbMovie[] }>(
            `/search/multi?query=${encodeURIComponent(query)}&include_adult=false&language=en-US&page=1`,
            token,
          );
          results = search.results;
          searchCache.set(query, results);
        }
        const suggestions = results
          .filter((m) => m.media_type !== "person" && m.poster_path && m.backdrop_path)
          .slice(0, 5)
          .map((m, index) => mapBasicTmdbMovie(m, index));
        if (!cancelled) {
          setLiveSuggestions(suggestions);
        }
      } catch (error) {
        console.error(error);
        if (!cancelled) {
          setLiveSuggestions([]);
        }
      } finally {
        if (!cancelled) {
          setIsLoadingSuggestions(false);
        }
      }
    }, 200);

    return () => {
      cancelled = true;
      window.clearTimeout(timeout);
    };
  }, [input, tab]);

  const recommendations = useMemo(() => movies.slice(0, 3), [movies]);

  async function ask(prompt?: string) {
    const text = (prompt || input).trim();
    if (!text) return;
    setMessages((current) => [...current, { role: "user", text }]);
    setInput("");
    setThinking(true);
    const token = process.env.NEXT_PUBLIC_TMDB_API_KEY;

    try {
      if (token) {
        let results = searchCache.get(text);
        if (!results) {
          const search = await tmdbFetch<{ results: TmdbMovie[] }>(
            `/search/multi?query=${encodeURIComponent(text)}&include_adult=false&language=en-US&page=1`,
            token,
          );
          results = search.results;
          searchCache.set(text, results);
        }
        const detailedMovies = results
          .filter((m) => m.media_type !== "person" && m.poster_path && m.backdrop_path)
          .slice(0, 20)
          .map((m, index) => mapBasicTmdbMovie(m, index));
        if (detailedMovies.length) {
          setMovies(detailedMovies);
          setGptSuggestions(detailedMovies.slice(0, 6));
          setActive(0);
          setTmdbPage(1);
          setHasMoreReels(false);
          setTmdbStatus("live");
        }
      }
      setMessages((current) => [
        ...current,
        {
          role: "ai",
          text: token
            ? "I found these matches on TMDB. Tap Watch to play one now, or open details for cast, providers, and similar movies."
            : "Add NEXT_PUBLIC_TMDB_API_KEY to make this search live against TMDB.",
        },
      ]);
    } catch (error) {
      console.error(error);
      setMessages((current) => [
        ...current,
        {
          role: "ai",
          text: "TMDB search did not respond, so I kept the current cinematic set on screen.",
        },
      ]);
    } finally {
      setThinking(false);
    }
  }

  return (
    <main className="min-h-svh overflow-hidden bg-[#050507] text-white">
      <div className="pointer-events-none fixed inset-0 z-0 bg-[radial-gradient(circle_at_20%_10%,rgba(120,64,255,.26),transparent_28%),radial-gradient(circle_at_80%_22%,rgba(255,32,96,.18),transparent_26%),linear-gradient(180deg,#06060a_0%,#07070a_48%,#030304_100%)]" />
      <div className="pointer-events-none fixed inset-0 z-0 opacity-[.18] [background-image:linear-gradient(rgba(255,255,255,.08)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,.08)_1px,transparent_1px)] [background-size:44px_44px]" />

      <section className={tab === "reels" ? "relative z-10 block" : "hidden"}>
        <div
          className="h-svh snap-y snap-mandatory overflow-y-auto overscroll-contain scroll-smooth"
          onScroll={(event) => {
            const next = Math.round(event.currentTarget.scrollTop / window.innerHeight);
            setActive(Math.min(Math.max(next, 0), movies.length - 1));
            if (next >= movies.length - 3) {
              loadTmdbReelsPage(tmdbPage + 1, "append");
            }
          }}
        >
          {movies.map((movie, index) => (
            <article
              key={movie.id}
              className="relative h-svh snap-start overflow-hidden"
              onDoubleClick={() => handleLike(movie)}
            >
              <div className="absolute inset-0">
                <Image
                  src={movie.backdrop}
                  alt=""
                  fill
                  priority={index === 0}
                  sizes="100vw"
                  className="scale-105 object-cover opacity-65 blur-sm"
                />
              </div>
              {movie.trailerKey && active === index && tab === "reels" && !watching ? (
                <iframe
                  key={`${movie.id}-${movie.trailerKey}-${soundOn ? "sound" : "muted"}`}
                  src={`https://www.youtube.com/embed/${movie.trailerKey}?autoplay=1&mute=${soundOn ? "0" : "1"}&controls=0&loop=1&playlist=${movie.trailerKey}&playsinline=1&rel=0&modestbranding=1`}
                  title={`${movie.title} trailer reel`}
                  allow="autoplay; encrypted-media; picture-in-picture"
                  className="pointer-events-none absolute left-1/2 top-1/2 h-[120svh] w-[213svh] min-h-full min-w-full -translate-x-1/2 -translate-y-1/2 border-0 opacity-80"
                />
              ) : !movie.trailerKey ? (
                <video
                  ref={(node) => {
                    videoRefs.current[index] = node;
                  }}
                  className="absolute inset-0 h-full w-full scale-105 object-cover opacity-70 blur-[1px] transition duration-700"
                  src={movie.trailer}
                  poster={movie.backdrop}
                  muted={!soundOn}
                  loop
                  playsInline
                />
              ) : null}
              <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(0,0,0,.1)_0%,rgba(0,0,0,.38)_46%,rgba(0,0,0,.94)_100%)]" />
              <div className="absolute inset-x-0 top-0 flex items-center justify-between px-5 pt-5">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[.32em] text-white/50">
                    {tmdbStatus === "live"
                      ? "Live TMDB Reels"
                      : tmdbStatus === "missing-key"
                        ? "Add TMDB key"
                        : "Fallback Reels"}
                  </p>
                  <h1 className="mt-1 text-2xl font-black tracking-tight">ztube</h1>
                </div>
                <button
                  onClick={() => openDetails(movie)}
                  className="rounded-full border border-white/15 bg-white/10 px-4 py-2 text-xs font-semibold shadow-2xl shadow-black/40 backdrop-blur-2xl transition hover:bg-white/20"
                >
                  Details
                </button>
              </div>


              {isLoadingMovies && index === 0 && (
                <div className="absolute left-5 top-24 z-20 rounded-full border border-white/10 bg-black/35 px-4 py-2 text-xs font-semibold text-white/70 backdrop-blur-2xl">
                  Loading TMDB movies...
                </div>
              )}



              {liked === movie.id && (
                <div className="pointer-events-none absolute inset-0 z-30 grid place-items-center">
                  <div className="like-burst text-8xl text-rose-400">♥</div>
                </div>
              )}

              <div className="absolute inset-x-0 bottom-24 z-10 px-4 sm:mx-auto sm:max-w-md">
                <div className="glass-panel reel-card rounded-[2rem] p-4 shadow-2xl shadow-black/50">
                  <div className="flex gap-3">
                    <Image
                      src={movie.poster}
                      alt=""
                      width={128}
                      height={192}
                      className="h-24 w-16 rounded-2xl object-cover shadow-lg"
                    />
                    <div className="min-w-0 flex-1">
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <h2 className="text-2xl font-black leading-none tracking-tight">
                            {movie.title}
                          </h2>
                          <p className="mt-1 text-sm text-white/62">
                            {movie.year} · {movie.genres.join(" / ")}
                          </p>
                        </div>
                        <span className="rounded-full bg-emerald-300 px-2.5 py-1 text-xs font-black text-black">
                          {movie.rating}
                        </span>
                      </div>
                      <p className="mt-3 text-sm font-medium text-white/88">{movie.hook}</p>
                    </div>
                  </div>
                  <div className="mt-4 flex gap-2 overflow-x-auto pb-1">
                    <span className="shrink-0 rounded-full bg-white/10 px-3 py-1.5 text-xs text-white/75">
                      Popularity {movie.popularity}
                    </span>
                    {movie.providers.map((provider) => (
                      <span
                        key={provider}
                        className="shrink-0 rounded-full border border-white/10 bg-white/8 px-3 py-1.5 text-xs text-white/75"
                      >
                        {provider}
                      </span>
                    ))}
                  </div>
                  <button
                    onClick={() => setExpanded(expanded === movie.id ? null : movie.id)}
                    className="mt-3 text-left text-sm leading-6 text-white/70"
                  >
                    {expanded === movie.id
                      ? movie.description
                      : `${movie.description.slice(0, 88)}...`}
                  </button>
                  <div className="mt-4 grid grid-cols-[1fr_auto] gap-2">
                    <button
                      onClick={() => {
                        handleWatch(movie);
                      }}
                      className="rounded-full bg-white px-4 py-3 text-sm font-black text-black transition active:scale-[.98]"
                    >
                      <span className="inline-flex items-center gap-2">
                        <Icon name="play" /> Watch
                      </span>
                    </button>
                    <button className="rounded-full border border-white/15 bg-white/10 px-4 py-3 text-sm font-bold backdrop-blur-xl transition active:scale-[.98]">
                      + Watchlist
                    </button>
                  </div>
                </div>
              </div>
            </article>
          ))}
          {isLoadingMoreReels && (
            <article className="relative grid h-svh snap-start place-items-center overflow-hidden">
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(168,85,247,.28),transparent_34%),#050507]" />
              <div className="glass-panel rounded-full px-5 py-3 text-sm font-semibold text-white/75">
                Loading more trailer reels...
              </div>
            </article>
          )}
        </div>
      </section>

      <section className={tab === "gpt" ? "relative z-10 flex min-h-svh flex-col pb-28" : "hidden"}>
        <div className="sticky top-0 z-10 border-b border-white/10 bg-black/30 px-5 py-4 backdrop-blur-2xl">
          <div className="flex items-center gap-3">
            <div className="ai-orb grid h-11 w-11 place-items-center rounded-full">
              <Icon name="spark" />
            </div>
            <div>
              <p className="text-xs font-semibold uppercase tracking-[.28em] text-white/45">
                {tmdbStatus === "live" ? "TMDB-aware assistant" : "AI Movie Assistant"}
              </p>
              <h2 className="text-xl font-black tracking-tight">Ask for a feeling</h2>
            </div>
          </div>
        </div>

        <div className="flex-1 space-y-5 overflow-y-auto px-4 py-5">
          <div className="flex gap-2 overflow-x-auto pb-1">
            {prompts.map((prompt) => (
              <button
                key={prompt}
                onClick={() => ask(prompt)}
                className="shrink-0 rounded-full border border-white/10 bg-white/8 px-4 py-2 text-sm text-white/78 backdrop-blur-xl transition active:scale-95"
              >
                {prompt}
              </button>
            ))}
          </div>

          {messages.map((message, index) => (
            <div
              key={`${message.role}-${index}`}
              className={`message-in flex ${message.role === "user" ? "justify-end" : "justify-start"}`}
            >
              <div
                className={`max-w-[86%] rounded-[1.5rem] px-4 py-3 text-sm leading-6 shadow-xl backdrop-blur-2xl ${
                  message.role === "user"
                    ? "bg-white text-black"
                    : "border border-white/10 bg-white/8 text-white/80"
                }`}
              >
                {message.text}
              </div>
            </div>
          ))}

          {thinking && (
            <div className="flex items-center gap-2 text-sm text-white/55">
              <span className="typing-dot" />
              <span className="typing-dot delay-100" />
              <span className="typing-dot delay-200" />
              Thinking through tone, pacing, and streaming fit
            </div>
          )}

          <div className="space-y-4">
            <p className="px-1 text-xs font-semibold uppercase tracking-[.28em] text-white/38">
              Recommended set
            </p>
            <div className="flex gap-4 overflow-x-auto pb-3">
              {recommendations.map((movie) => (
                <button
                  key={movie.id}
                  onClick={() => openDetails(movie)}
                  className="movie-card group relative h-[24rem] w-64 shrink-0 overflow-hidden rounded-[1.75rem] text-left shadow-2xl shadow-black/60 transition duration-300 active:scale-[.98]"
                >
                  <Image
                    src={movie.poster}
                    alt=""
                    fill
                    sizes="256px"
                    className="object-cover transition duration-500 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black via-black/20 to-transparent" />
                  <div className="absolute inset-x-0 bottom-0 p-4">
                    <div className="mb-3 inline-flex rounded-full bg-white/90 px-2.5 py-1 text-xs font-black text-black">
                      {movie.rating} TMDB
                    </div>
                    <h3 className="text-2xl font-black leading-none">{movie.title}</h3>
                    <p className="mt-2 text-sm text-white/70">{movie.why}</p>
                    <div className="mt-4 flex gap-2 overflow-hidden">
                      {movie.genres.map((genre) => (
                        <span key={genre} className="rounded-full bg-white/12 px-2.5 py-1 text-xs">
                          {genre}
                        </span>
                      ))}
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-4">
            <p className="px-1 text-xs font-semibold uppercase tracking-[.28em] text-white/38">
              Search suggestions
            </p>
            <div className="space-y-3">
              {gptSuggestions.map((movie) => (
                <div
                  key={`suggestion-${movie.id}`}
                  className="glass-panel message-in flex gap-3 rounded-[1.5rem] p-3 shadow-2xl shadow-black/30"
                >
                  <Image
                    src={movie.poster}
                    alt=""
                    width={96}
                    height={144}
                    className="h-28 w-20 shrink-0 rounded-2xl object-cover"
                  />
                  <div className="min-w-0 flex-1">
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <h3 className="truncate text-lg font-black leading-tight">{movie.title}</h3>
                        <p className="mt-1 text-xs text-white/55">
                          {movie.year} · {movie.genres.join(" / ")} · {movie.rating} TMDB
                        </p>
                      </div>
                      <span className="shrink-0 rounded-full bg-emerald-300 px-2 py-1 text-xs font-black text-black">
                        {movie.rating}
                      </span>
                    </div>
                    <p className="mt-2 line-clamp-2 text-sm leading-5 text-white/68">{movie.why}</p>
                    <div className="mt-3 flex gap-2">
                      <button
                        onClick={() => handleWatch(movie)}
                        className="rounded-full bg-white px-4 py-2 text-xs font-black text-black transition active:scale-95"
                      >
                        <span className="inline-flex items-center gap-1.5">
                          <Icon name="play" /> Watch
                        </span>
                      </button>
                      <button
                        onClick={() => openDetails(movie)}
                        className="rounded-full border border-white/12 bg-white/10 px-4 py-2 text-xs font-bold text-white/82 transition active:scale-95"
                      >
                        Details
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="fixed inset-x-0 bottom-24 z-20 px-4">
          {(input.trim().length >= 2 || isLoadingSuggestions) && (
            <div className="mx-auto mb-3 max-h-[42svh] max-w-xl overflow-y-auto rounded-[1.5rem] border border-white/12 bg-black/65 p-2 shadow-2xl shadow-black/60 backdrop-blur-2xl">
              {isLoadingSuggestions && (
                <div className="px-3 py-2 text-xs font-semibold text-white/50">
                  Searching TMDB...
                </div>
              )}
              {!isLoadingSuggestions && liveSuggestions.length === 0 && (
                <div className="px-3 py-2 text-xs font-semibold text-white/50">
                  No suggestions found
                </div>
              )}
              {liveSuggestions.map((movie) => (
                <div
                  key={`live-${movie.id}`}
                  className="flex items-center gap-3 rounded-[1.1rem] p-2 transition hover:bg-white/8"
                >
                  <Image
                    src={movie.poster}
                    alt=""
                    width={64}
                    height={96}
                    className="h-16 w-11 shrink-0 rounded-xl object-cover"
                  />
                  <button
                    type="button"
                    onClick={() => {
                      openDetails(movie);
                      setInput("");
                      setLiveSuggestions([]);
                    }}
                    className="min-w-0 flex-1 text-left"
                  >
                    <p className="truncate text-sm font-black">{movie.title}</p>
                    <p className="mt-0.5 truncate text-xs text-white/50">
                      {movie.year} · {movie.genres.join(" / ")}
                    </p>
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      handleWatch(movie);
                      setInput("");
                      setLiveSuggestions([]);
                    }}
                    className="rounded-full bg-white px-3 py-2 text-xs font-black text-black transition active:scale-95"
                  >
                    Watch
                  </button>
                </div>
              ))}
            </div>
          )}
          <form
            onSubmit={(event) => {
              event.preventDefault();
              ask();
            }}
            className="mx-auto flex max-w-xl items-center gap-2 rounded-full border border-white/12 bg-black/45 p-2 shadow-2xl shadow-black/50 backdrop-blur-2xl"
          >
            <input
              value={input}
              onChange={(event) => setInput(event.target.value)}
              placeholder="Ask for movies by mood, vibe, actor..."
              className="min-w-0 flex-1 bg-transparent px-4 py-3 text-sm text-white outline-none placeholder:text-white/36"
            />
            <button className="grid h-11 w-11 place-items-center rounded-full bg-white text-black transition active:scale-90">
              <Icon name="send" />
            </button>
          </form>
        </div>
      </section>

      <nav className="fixed inset-x-0 bottom-4 z-40 mx-auto grid w-[min(92vw,25rem)] grid-cols-2 rounded-full border border-white/12 bg-black/45 p-2 shadow-2xl shadow-black/60 backdrop-blur-2xl">
        {[
          ["reels", "Reels", "film"],
          ["gpt", "GPT", "chat"],
        ].map(([value, label, icon]) => (
          <button
            key={value}
            onClick={() => setTab(value as "reels" | "gpt")}
            className={`relative flex items-center justify-center gap-2 rounded-full px-4 py-3 text-sm font-bold transition duration-300 active:scale-95 ${
              tab === value ? "nav-active text-white" : "text-white/48"
            }`}
          >
            <Icon name={icon as "film" | "chat"} />
            {label}
          </button>
        ))}
      </nav>

      {selected && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-black/80 backdrop-blur-xl">
          <div className="relative min-h-svh pb-8">
            <div className="relative h-[48svh] w-full">
              <Image
                src={selected.backdrop}
                alt=""
                fill
                priority
                sizes="100vw"
                className="object-cover opacity-75"
              />
            </div>
            <div className="absolute inset-x-0 top-0 h-[55svh] bg-gradient-to-b from-black/20 via-black/30 to-black" />
            <button
              onClick={() => setSelected(null)}
              className="fixed right-4 top-4 z-20 grid h-11 w-11 place-items-center rounded-full border border-white/15 bg-black/45 backdrop-blur-xl"
              aria-label="Close details"
            >
              <Icon name="x" />
            </button>
            <div className="relative -mt-28 px-5">
              <div className="mx-auto max-w-3xl">
                <div className="flex items-end gap-4">
                  <Image
                    src={selected.poster}
                    alt=""
                    width={224}
                    height={352}
                    className="h-44 w-28 rounded-3xl object-cover shadow-2xl"
                  />
                  <div className="pb-2">
                    <p className="text-sm font-bold text-white/50">{selected.year} · {selected.genres.join(" / ")}</p>
                    <h2 className="mt-2 text-4xl font-black tracking-tight">{selected.title}</h2>
                    <p className="mt-2 inline-flex rounded-full bg-emerald-300 px-3 py-1 text-sm font-black text-black">
                      {selected.rating} TMDB
                    </p>
                  </div>
                </div>
                <p className="mt-6 text-lg leading-8 text-white/74">{selected.description}</p>
                <button
                  onClick={() => handleWatch(selected)}
                  className="mt-5 rounded-full bg-white px-5 py-3 text-sm font-black text-black shadow-2xl shadow-white/10 transition active:scale-[.98]"
                >
                  <span className="inline-flex items-center gap-2">
                    <Icon name="play" /> Watch
                  </span>
                </button>
                <div className="mt-6 overflow-hidden rounded-[1.75rem] border border-white/10 bg-white/8 p-2 backdrop-blur-2xl">
                  {selected.trailerKey ? (
                    <iframe
                      src={`https://www.youtube.com/embed/${selected.trailerKey}?autoplay=0&controls=0&rel=0&modestbranding=1`}
                      title={`${selected.title} trailer`}
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                      allowFullScreen
                      className="aspect-video w-full rounded-[1.35rem]"
                    />
                  ) : (
                    <video src={selected.trailer} poster={selected.backdrop} className="aspect-video w-full rounded-[1.35rem] object-cover" />
                  )}
                </div>
                <div className="mt-7 grid gap-4 sm:grid-cols-2">
                  <div className="rounded-[1.5rem] border border-white/10 bg-white/8 p-4 backdrop-blur-xl">
                    <h3 className="font-black">AI summary</h3>
                    <p className="mt-2 text-sm leading-6 text-white/65">{selected.why}</p>
                  </div>
                  <div className="rounded-[1.5rem] border border-white/10 bg-white/8 p-4 backdrop-blur-xl">
                    <h3 className="font-black">Watch providers</h3>
                    <div className="mt-3 flex flex-wrap gap-2">
                      {selected.providers.map((provider) => (
                        <span key={provider} className="rounded-full bg-white/12 px-3 py-1.5 text-sm text-white/75">
                          {provider}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
                <div className="mt-7">
                  <h3 className="font-black">Cast</h3>
                  <div className="mt-3 flex gap-3 overflow-x-auto pb-2">
                    {selected.cast.map((person) => (
                      <span key={person} className="shrink-0 rounded-full border border-white/10 bg-white/8 px-4 py-2 text-sm text-white/76">
                        {person}
                      </span>
                    ))}
                  </div>
                </div>
                <div className="mt-7">
                  <h3 className="font-black">Similar movies</h3>
                  <div className="mt-3 flex gap-3 overflow-x-auto pb-2">
                    {selected.similar.map((item) => (
                      <span key={item} className="shrink-0 rounded-2xl bg-white px-4 py-3 text-sm font-black text-black">
                        {item}
                      </span>
                    ))}
                  </div>
                </div>
                <div className="mt-7 rounded-[1.5rem] border border-white/10 bg-white/8 p-4 backdrop-blur-xl">
                  <h3 className="font-black">Reviews</h3>
                  <p className="mt-2 text-sm leading-6 text-white/65">
                    Viewers are saving this for its atmosphere, pacing, and high-impact visual moments.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {watching && (
        <div className="fixed inset-0 z-[60] bg-black">
          <iframe
            src={`https://www.vidking.net/embed/${watching.type}/${watching.id}${watching.type === "tv" ? "/1/1" : ""}?color=a855f7&autoPlay=true&nextEpisode=true&episodeSelector=true`}
            title={`Watch ${watching.title}`}
            allow="autoplay; fullscreen; encrypted-media; picture-in-picture"
            allowFullScreen
            className="h-full w-full border-0"
          />
          <button
            onClick={() => setWatching(null)}
            className="fixed right-4 top-4 z-20 grid h-11 w-11 place-items-center rounded-full border border-white/15 bg-black/55 text-white shadow-2xl backdrop-blur-xl"
            aria-label="Close movie player"
          >
            <Icon name="x" />
          </button>
        </div>
      )}
      {isOpeningDetails && (
        <div className="fixed inset-0 z-[70] grid place-items-center bg-black/60 backdrop-blur-sm">
          <div className="flex flex-col items-center gap-4">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-white/20 border-t-white" />
            <p className="text-sm font-bold text-white/70">Loading details...</p>
          </div>
        </div>
      )}
    </main>
  );
}
