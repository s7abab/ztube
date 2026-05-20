import Image from "next/image";
import { MutableRefObject, useEffect } from "react";
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

  useEffect(() => {
    const iframe = document.querySelector(".reel-video-container iframe") as HTMLIFrameElement | null;
    if (iframe && iframe.contentWindow) {
      const command = props.soundOn ? "unMute" : "mute";
      iframe.contentWindow.postMessage(
        JSON.stringify({ event: "command", func: command, args: "" }),
        "*"
      );
    }
  }, [props.soundOn, props.active]);

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
                className="scale-105 object-cover opacity-50 blur-sm"
              />
            </div>
            <div className="reel-video-container">
              {movie.trailerKey && props.active === index && !props.watching ? (
                <iframe
                  key={`${movie.id}-${movie.trailerKey}`}
                  src={`https://www.youtube.com/embed/${movie.trailerKey}?autoplay=1&mute=${props.soundOn ? "0" : "1"}&controls=0&loop=1&playlist=${movie.trailerKey}&playsinline=1&rel=0&modestbranding=1&iv_load_policy=3&enablejsapi=1`}
                  title={`${movie.title} trailer reel`}
                  allow="autoplay; encrypted-media; picture-in-picture"
                  className="pointer-events-none absolute left-1/2 top-1/2 h-full w-full -translate-x-1/2 -translate-y-1/2 scale-[1.25] border-0"
                />
              ) : !movie.trailerKey ? (
                <video
                  ref={(node) => {
                    props.videoRefs.current[index] = node;
                  }}
                  className="h-full w-full object-contain transition duration-700"
                  src={movie.trailer}
                  poster={movie.backdrop}
                  muted={!props.soundOn}
                  loop
                  playsInline
                />
              ) : null}
            </div>

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
              className={`absolute inset-x-0 bottom-8 z-10 px-6 max-w-5xl mx-auto w-full transition-opacity duration-300 ${props.active === index ? "opacity-100" : "opacity-0 pointer-events-none"}`}
            >
              <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
                <div className="min-w-0 max-w-xl text-left">
                  <h2 className="text-3xl font-black tracking-tight text-white drop-shadow-[0_2px_8px_rgba(0,0,0,0.85)]">
                    {movie.title}
                  </h2>
                  <p className="mt-1.5 text-sm font-semibold text-white/80 drop-shadow-[0_1.5px_4px_rgba(0,0,0,0.7)]">
                    {movie.year} · {movie.genres.join(" / ")} · <span className="text-emerald-400 font-bold">{movie.rating} ZTube</span>
                  </p>
                  <p className="mt-2 text-sm text-white/70 line-clamp-2 drop-shadow-[0_1px_3px_rgba(0,0,0,0.6)]">
                    {movie.hook}
                  </p>
                </div>
                <div className="flex items-center gap-2.5 shrink-0">
                  <button
                    onClick={() => props.handleWatch(movie)}
                    className="flex items-center gap-2 rounded-full bg-white px-5 py-3 text-sm font-black text-black shadow-2xl hover:scale-[1.03] active:scale-[.98] transition duration-300"
                  >
                    <Icon name="play" /> Watch
                  </button>
                  <button
                    onClick={() => props.openDetails(movie)}
                    className="rounded-full border border-white/15 bg-white/10 px-5 py-3 text-sm font-semibold text-white shadow-2xl backdrop-blur-xl hover:bg-white/20 active:scale-[.98] transition duration-300"
                  >
                    Details
                  </button>
                  <button
                    onClick={props.toggleSound}
                    className="grid h-11 w-11 place-items-center rounded-full border border-white/15 bg-black/40 text-white shadow-2xl backdrop-blur-xl hover:bg-white/20 active:scale-[.98] transition duration-300"
                  >
                    <Icon name={props.soundOn ? "sound" : "mute"} />
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
