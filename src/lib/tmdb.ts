import { Movie, TmdbMovie, TmdbMovieDetail } from "@/types";
import { fallbackMovies, tmdbGenreMap } from "./constants";

export const posterUrl = (path?: string | null) =>
  path ? `https://image.tmdb.org/t/p/w500${path}` : fallbackMovies[0].poster;

export const backdropUrl = (path?: string | null) =>
  path ? `https://image.tmdb.org/t/p/original${path}` : fallbackMovies[0].backdrop;

export const sampleTrailers = fallbackMovies.map((movie) => movie.trailer);

export function buildHook(movie: Pick<Movie, "title" | "genres" | "rating">) {
  const genre = movie.genres[0]?.toLowerCase() || "cinematic";
  return `${movie.title} carries a ${genre} pulse with a ${movie.rating} ZTube signal.`;
}

export function tmdbHeaders(token: string): Record<string, string> {
  const headers: Record<string, string> = {
    "Content-Type": "application/json;charset=utf-8",
  };
  if (token.includes(".")) {
    headers.Authorization = `Bearer ${token}`;
  }
  return headers;
}

export function tmdbUrl(path: string, token: string) {
  const url = new URL(`https://api.themoviedb.org/3${path}`);
  if (!token.includes(".")) {
    url.searchParams.set("api_key", token);
  }
  return url.toString();
}

export async function tmdbFetch<T>(path: string, token: string): Promise<T> {
  const response = await fetch(tmdbUrl(path, token), {
    headers: tmdbHeaders(token),
  });
  if (!response.ok) {
    throw new Error(`TMDB request failed: ${response.status}`);
  }
  return response.json() as Promise<T>;
}

export function mapTmdbMovie(movie: TmdbMovieDetail, index: number): Movie {
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
    description: movie.overview || "ZTube has not published a synopsis for this title yet.",
    poster: posterUrl(movie.poster_path),
    backdrop: backdropUrl(movie.backdrop_path),
    trailer: sampleTrailers[index % sampleTrailers.length],
    trailerKey,
    providers: providers.length ? providers : ["ZTube watchlist", "Trailer vibe", "Rental"],
    cast: movie.credits?.cast?.map((person) => person.name).slice(0, 8) || [],
    why: `This lands because it blends ${genres.slice(0, 2).join(" and ") || "cinematic"} energy with strong audience momentum.`,
    similar: movie.similar?.results?.map((similar) => similar.title || similar.name || "Untitled").slice(0, 8) || [],
  };
  return {
    ...mappedMovie,
    hook: buildHook(mappedMovie),
  };
}

export async function hydrateTmdbMovies(movies: TmdbMovie[], token: string, offset = 0, requireTrailer = true) {
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

export function mapBasicTmdbMovie(movie: TmdbMovie, index: number): Movie {
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
    description: movie.overview || "ZTube has not published a synopsis for this title yet.",
    poster: posterUrl(movie.poster_path),
    backdrop: backdropUrl(movie.backdrop_path),
    trailer: sampleTrailers[index % sampleTrailers.length],
    trailerKey: undefined,
    providers: ["ZTube watchlist", "Trailer vibe", "Rental"],
    cast: [],
    why: `This lands because it blends ${genres.slice(0, 2).join(" and ") || "cinematic"} energy with strong audience momentum.`,
    similar: [],
  };
  return {
    ...mappedMovie,
    hook: buildHook(mappedMovie),
  };
}

export const searchCache = new Map<string, TmdbMovie[]>();
