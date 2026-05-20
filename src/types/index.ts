export type Movie = {
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

export type TmdbMovie = {
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

export type TmdbMovieDetail = TmdbMovie & {
  genres?: { id: number; name: string }[];
  videos?: { results?: { key: string; site: string; type: string; official?: boolean }[] };
  credits?: { cast?: { name: string }[] };
  "watch/providers"?: { results?: { US?: { flatrate?: { provider_name: string }[]; rent?: { provider_name: string }[] } } };
  similar?: { results?: TmdbMovie[] };
};
