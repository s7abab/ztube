"use client";

import Image from "next/image";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";

import { Movie, TmdbMovie, TmdbMovieDetail } from "@/types";
import { fallbackMovies, prompts } from "@/lib/constants";
import {
  tmdbFetch,
  hydrateTmdbMovies,
  mapTmdbMovie,
  mapBasicTmdbMovie,
  searchCache,
} from "@/lib/tmdb";
import { getUserRegion, trackUserAction, getTopGenres, getBehavioralContext } from "@/lib/profile";
import { Icon } from "@/components/Icon";
import { ReelsFeed } from "@/features/reels/ReelsFeed";
import { AIChat } from "@/features/chat/AIChat";
import { MovieDetails } from "@/features/details/MovieDetails";
import { VidkingPlayer } from "@/features/player/VidkingPlayer";

export default function Home() {
  const [tab, setTab] = useState<"reels" | "chat">("reels");
  const [movies, setMovies] = useState<Movie[]>(fallbackMovies);
  const [isLoadingMovies, setIsLoadingMovies] = useState(() =>
    Boolean(process.env.NEXT_PUBLIC_TMDB_API_KEY),
  );
  const [isLoadingMoreReels, setIsLoadingMoreReels] = useState(false);
  const [tmdbPage, setTmdbPage] = useState(1);
  const [hasMoreReels, setHasMoreReels] = useState(true);
  const [tmdbStatus, setTmdbStatus] = useState<
    "live" | "fallback" | "missing-key"
  >(() => (process.env.NEXT_PUBLIC_TMDB_API_KEY ? "fallback" : "missing-key"));
  const [active, setActive] = useState(0);
  const [expanded, setExpanded] = useState<number | null>(null);
  const [liked, setLiked] = useState<number | null>(null);
  const [soundOn, setSoundOn] = useState(true);
  const [selected, setSelected] = useState<Movie | null>(null);
  const [watching, setWatching] = useState<Movie | null>(null);

  const handleWatch = useCallback((movie: Movie) => {
    setWatching(movie);
    trackUserAction(movie, 3);
  }, []);

  const handleLike = useCallback((movie: Movie) => {
    setLiked(movie.id);
    trackUserAction(movie, 2);
  }, []);

  const [chatSuggestions, setChatSuggestions] = useState<Movie[]>(
    fallbackMovies.slice(0, 3),
  );
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
        if (loadingMoreRef.current || !hasMoreReels || tmdbStatus !== "live")
          return;
        loadingMoreRef.current = true;
        setIsLoadingMoreReels(true);
      } else {
        setIsLoadingMovies(true);
      }

      try {
        const region = await getUserRegion();
        const topGenres = getTopGenres(2);
        const fetchPage =
          mode === "replace" ? Math.floor(Math.random() * 5) + 1 : page;
        const genreParam = topGenres ? `&with_genres=${topGenres}` : "";

        const [trendingRes, discoverMoviesRes, discoverTvRes] =
          await Promise.all([
            tmdbFetch<{
              page: number;
              total_pages: number;
              results: TmdbMovie[];
            }>(`/trending/all/day?language=en-US&page=${fetchPage}`, token),
            tmdbFetch<{
              page: number;
              total_pages: number;
              results: TmdbMovie[];
            }>(
              `/discover/movie?language=en-US&sort_by=popularity.desc&page=${fetchPage}&region=${region}${genreParam}`,
              token,
            ),
            tmdbFetch<{
              page: number;
              total_pages: number;
              results: TmdbMovie[];
            }>(
              `/discover/tv?language=en-US&sort_by=popularity.desc&page=${fetchPage}&with_origin_country=${region}${genreParam}`,
              token,
            ),
          ]);

        const combinedResults: TmdbMovie[] = [];
        const maxLen = Math.max(
          trendingRes.results.length,
          discoverMoviesRes.results.length,
          discoverTvRes.results.length,
        );
        for (let i = 0; i < maxLen; i++) {
          if (trendingRes.results[i])
            combinedResults.push(trendingRes.results[i]);
          if (discoverMoviesRes.results[i])
            combinedResults.push({
              ...discoverMoviesRes.results[i],
              media_type: "movie",
            });
          if (discoverTvRes.results[i])
            combinedResults.push({
              ...discoverTvRes.results[i],
              media_type: "tv",
            });
        }

        const uniqueResults: TmdbMovie[] = [];
        const seenIds = new Set();
        for (const m of combinedResults) {
          if (!seenIds.has(m.id)) {
            seenIds.add(m.id);
            uniqueResults.push(m);
          }
        }

        const hydratedMovies = await hydrateTmdbMovies(
          uniqueResults,
          token,
          fetchPage * 12,
        );
        if (!hydratedMovies.length) {
          setTmdbPage(fetchPage);
          setHasMoreReels(fetchPage < trendingRes.total_pages);
          return;
        }

        setMovies((current) => {
          if (mode === "replace") return hydratedMovies;
          const existingIds = new Set(current.map((movie) => movie.id));
          return [
            ...current,
            ...hydratedMovies.filter((movie) => !existingIds.has(movie.id)),
          ];
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
    if (!token || tab !== "chat" || query.length < 2) {
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
          .filter(
            (m) =>
              m.media_type !== "person" && m.poster_path && m.backdrop_path,
          )
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
    const openRouterKey = process.env.NEXT_PUBLIC_OPEN_ROUTER_KEY;

    try {
      let searchQueries = [text];
      let aiMessage = "";

      if (openRouterKey) {
        let retries = 5;
        while (retries > 0) {
          try {
            const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
              method: "POST",
              headers: {
                Authorization: `Bearer ${openRouterKey}`,
                "Content-Type": "application/json",
              },
              body: JSON.stringify({
                model: "google/gemini-2.5-flash",
                max_tokens: 150,
                messages: [
                  {
                    role: "system",
                    content:
                      `You are a movie recommendation assistant. ${getBehavioralContext()}The user will ask for a recommendation. You must reply ONLY with a JSON array of up to 4 exact movie titles that match the query. Do not include markdown formatting, explanations, or any other text. Example: ["Inception", "Interstellar"]`,
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
            const parsed = JSON.parse(
              content.replace(/```json/g, "").replace(/```/g, ""),
            );
            
            if (Array.isArray(parsed) && parsed.length > 0) {
              searchQueries = parsed;
              aiMessage = `I found some perfect matches for "${text}". Tap Watch to play one now!`;
              break;
            } else {
              throw new Error("Response was not a valid array");
            }
          } catch (e) {
            console.error(`OpenRouter request failed. Retries left: ${retries - 1}`, e);
            retries--;
            if (retries > 0) {
              await new Promise((resolve) => setTimeout(resolve, 1000));
            }
          }
        }
      }

      if (token) {
        let allResults: TmdbMovie[] = [];

        for (const query of searchQueries) {
          let results = searchCache.get(query);
          if (!results) {
            const search = await tmdbFetch<{ results: TmdbMovie[] }>(
              `/search/multi?query=${encodeURIComponent(
                query,
              )}&include_adult=false&language=en-US&page=1`,
              token,
            );
            results = search.results;
            searchCache.set(query, results);
          }
          allResults = [...allResults, ...results];
        }

        const seenIds = new Set();
        const detailedMovies = allResults
          .filter((m) => {
            if (m.media_type === "person" || !m.poster_path || !m.backdrop_path)
              return false;
            if (seenIds.has(m.id)) return false;
            seenIds.add(m.id);
            return true;
          })
          .slice(0, 20)
          .map((m, index) => mapBasicTmdbMovie(m, index));

        if (detailedMovies.length) {
          setMovies(detailedMovies);
          setChatSuggestions(detailedMovies.slice(0, 6));
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
          text:
            aiMessage ||
            (token
              ? "I found these matches on ZTube. Tap Watch to play one now, or open details for cast, providers, and similar movies."
              : "Add NEXT_PUBLIC_TMDB_API_KEY to make this search live against ZTube."),
        },
      ]);
    } catch (error) {
      console.error(error);
      setMessages((current) => [
        ...current,
        {
          role: "ai",
          text: "ZTube search did not respond, so I kept the current cinematic set on screen.",
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

      <ReelsFeed
        movies={movies}
        active={active}
        setActive={setActive}
        loadTmdbReelsPage={loadTmdbReelsPage}
        tmdbPage={tmdbPage}
        handleLike={handleLike}
        liked={liked}
        soundOn={soundOn}
        watching={watching}
        openDetails={openDetails}
        expanded={expanded}
        setExpanded={setExpanded}
        handleWatch={handleWatch}
        isLoadingMovies={isLoadingMovies}
        isLoadingMoreReels={isLoadingMoreReels}
        tmdbStatus={tmdbStatus}
        videoRefs={videoRefs}
        isVisible={tab === "reels"}
      />

      <AIChat
        tmdbStatus={tmdbStatus}
        prompts={prompts}
        ask={ask}
        messages={messages}
        thinking={thinking}
        recommendations={recommendations}
        openDetails={openDetails}
        chatSuggestions={chatSuggestions}
        handleWatch={handleWatch}
        input={input}
        setInput={setInput}
        isLoadingSuggestions={isLoadingSuggestions}
        liveSuggestions={liveSuggestions}
        setLiveSuggestions={setLiveSuggestions}
        isVisible={tab === "chat"}
      />

      <nav className="fixed inset-x-0 top-2 sm:top-4 z-50 mx-auto grid w-[min(92vw,24rem)] grid-cols-2 gap-1 rounded-full border border-white/10 bg-black/50 p-1.5 shadow-2xl shadow-purple-900/10 backdrop-blur-3xl transition-all duration-500 hover:bg-black/60 hover:shadow-purple-900/20">
        {[
          ["reels", "Reels", "film"],
          ["chat", "Super Search", "zap"],
        ].map(([value, label, icon]) => (
          <button
            key={value}
            onClick={() => setTab(value as "reels" | "chat")}
            className={`relative flex items-center justify-center gap-2 rounded-full py-2.5 text-[15px] font-bold transition-all duration-300 active:scale-[0.97] ${
              tab === value
                ? "bg-white text-black shadow-lg shadow-white/20"
                : "text-white/60 hover:bg-white/10 hover:text-white"
            }`}
          >
            <span className={`scale-90 ${tab === value ? "opacity-100" : "opacity-80"}`}><Icon name={icon as "film" | "zap"} /></span>
            {label}
          </button>
        ))}
      </nav>

      {selected && (
        <MovieDetails
          selected={selected}
          onClose={() => setSelected(null)}
          onWatch={handleWatch}
        />
      )}

      {watching && (
        <VidkingPlayer watching={watching} onClose={() => setWatching(null)} />
      )}
      {isOpeningDetails && (
        <div className="fixed inset-0 z-[70] grid place-items-center bg-black/60 backdrop-blur-sm">
          <div className="flex flex-col items-center gap-4">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-white/20 border-t-white" />
            <p className="text-sm font-bold text-white/70">
              Loading details...
            </p>
          </div>
        </div>
      )}
    </main>
  );
}
