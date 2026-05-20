import Image from "next/image";
import { MutableRefObject } from "react";
import { Movie } from "@/types";
import { Icon } from "@/components/Icon";

interface ReelsFeedProps {
  movies: Movie[];
  active: number;
  setActive: (index: number) => void;
  loadTmdbReelsPage: (page: number, mode: "append") => void;
  tmdbPage: number;
  handleLike: (movie: Movie) => void;
  liked: number | null;
  soundOn: boolean;
  toggleSound: () => void;
  watching: Movie | null;
  openDetails: (movie: Movie) => void;
  expanded: number | null;
  setExpanded: (id: number | null) => void;
  handleWatch: (movie: Movie) => void;
  isLoadingMovies: boolean;
  isLoadingMoreReels: boolean;
  tmdbStatus: string;
  videoRefs: MutableRefObject<(HTMLVideoElement | null)[]>;
  isVisible: boolean;
}

export function ReelsFeed(props: ReelsFeedProps) {
  if (!props.isVisible) return null;

  return (
    <section className="relative z-10 block">
      <div
        className="h-svh snap-y snap-mandatory overflow-y-auto overscroll-contain"
        onScroll={(event) => {
          const next = Math.round(event.currentTarget.scrollTop / window.innerHeight);
          props.setActive(Math.min(Math.max(next, 0), props.movies.length - 1));
          if (next >= props.movies.length - 3) {
            props.loadTmdbReelsPage(props.tmdbPage + 1, "append");
          }
        }}
      >
        {props.movies.map((movie, index) => (
          <article
            key={movie.id}
            className="relative h-svh snap-start snap-always overflow-hidden"
            onDoubleClick={() => props.handleLike(movie)}
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
            {movie.trailerKey && props.active === index && !props.watching ? (
              <iframe
                key={`${movie.id}-${movie.trailerKey}-${props.soundOn ? "sound" : "muted"}`}
                src={`https://www.youtube.com/embed/${movie.trailerKey}?autoplay=1&mute=${props.soundOn ? "0" : "1"}&controls=0&loop=1&playlist=${movie.trailerKey}&playsinline=1&rel=0&modestbranding=1`}
                title={`${movie.title} trailer reel`}
                allow="autoplay; encrypted-media; picture-in-picture"
                className="pointer-events-none absolute left-1/2 top-1/2 h-[120svh] w-[213svh] min-h-full min-w-full -translate-x-1/2 -translate-y-1/2 border-0 opacity-80"
              />
            ) : !movie.trailerKey ? (
              <video
                ref={(node) => {
                  props.videoRefs.current[index] = node;
                }}
                className="absolute inset-0 h-full w-full scale-105 object-cover opacity-70 blur-[1px] transition duration-700"
                src={movie.trailer}
                poster={movie.backdrop}
                muted={!props.soundOn}
                loop
                playsInline
              />
            ) : null}
            <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(0,0,0,.1)_0%,rgba(0,0,0,.38)_46%,rgba(0,0,0,.94)_100%)]" />
            <div className="absolute inset-x-0 top-0 flex items-center justify-between px-5 pt-[112px]">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[.32em] text-white/50">
                  {props.tmdbStatus === "live"
                    ? "Live ZTube Reels"
                    : props.tmdbStatus === "missing-key"
                      ? "Add API key"
                      : "Fallback Reels"}
                </p>
                <h1 className="mt-1 text-2xl font-black tracking-tight">Z Tube</h1>
              </div>
              <div className="flex flex-col items-end gap-3">
                <button
                  onClick={() => props.openDetails(movie)}
                  className="rounded-full border border-white/15 bg-white/10 px-4 py-2 text-xs font-semibold shadow-2xl shadow-black/40 backdrop-blur-2xl transition hover:bg-white/20"
                >
                  Details
                </button>
                <button
                  onClick={props.toggleSound}
                  className="grid h-10 w-10 place-items-center rounded-full border border-white/15 bg-black/40 text-white shadow-2xl backdrop-blur-2xl transition hover:bg-white/20"
                >
                  <Icon name={props.soundOn ? "sound" : "mute"} />
                </button>
              </div>
            </div>

            {props.isLoadingMovies && index === 0 && (
              <div className="absolute left-5 top-[112px] z-20 rounded-full border border-white/10 bg-black/35 px-4 py-2 text-xs font-semibold text-white/70 backdrop-blur-2xl">
                Loading ZTube movies...
              </div>
            )}

            {props.liked === movie.id && (
              <div className="pointer-events-none absolute inset-0 z-30 grid place-items-center">
                <div className="like-burst text-8xl text-rose-400">♥</div>
              </div>
            )}

            <div 
              className={`absolute inset-x-0 bottom-6 z-10 px-4 sm:mx-auto sm:max-w-md transition-opacity duration-700 ${props.active === index ? "opacity-100" : "opacity-0 pointer-events-none"}`}
              style={{ transitionDelay: props.active === index ? "10s" : "0s" }}
            >
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
                  onClick={() => props.setExpanded(props.expanded === movie.id ? null : movie.id)}
                  className="mt-3 text-left text-[13px] leading-snug text-white/70 transition-all duration-300 active:text-white"
                >
                  {props.expanded === movie.id
                    ? movie.description
                    : `${movie.description.slice(0, 88)}...`}
                </button>
                <div className="mt-4 grid gap-2">
                  <button
                    onClick={() => {
                      props.handleWatch(movie);
                    }}
                    className="rounded-full bg-white px-4 py-3 text-sm font-black text-black transition active:scale-[.98]"
                  >
                    <span className="flex items-center justify-center gap-2">
                      <Icon name="play" /> Watch
                    </span>
                  </button>
                </div>
              </div>
            </div>
          </article>
        ))}
        {props.isLoadingMoreReels && (
          <article className="relative grid h-svh snap-start place-items-center overflow-hidden">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(168,85,247,.28),transparent_34%),#050507]" />
            <div className="glass-panel rounded-full px-5 py-3 text-sm font-semibold text-white/75">
              Loading more trailer reels...
            </div>
          </article>
        )}
      </div>
    </section>
  );
}
