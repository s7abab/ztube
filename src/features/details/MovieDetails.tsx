import Image from "next/image";
import { Movie } from "@/types";
import { Icon } from "@/components/Icon";

interface MovieDetailsProps {
  selected: Movie;
  onClose: () => void;
  onWatch: (movie: Movie) => void;
}

export function MovieDetails({ selected, onClose, onWatch }: MovieDetailsProps) {
  return (
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
          onClick={onClose}
          className="fixed right-4 top-10 sm:right-8 sm:top-8 z-20 grid h-11 w-11 place-items-center rounded-full border border-white/15 bg-black/45 backdrop-blur-xl"
          aria-label="Close details"
        >
          <Icon name="x" />
        </button>
        <div className="relative -mt-24 px-4 sm:px-5">
          <div className="mx-auto max-w-3xl">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-end">
              <Image
                src={selected.poster}
                alt=""
                width={224}
                height={352}
                className="h-40 w-28 shrink-0 rounded-3xl object-cover shadow-2xl sm:h-44"
              />
              <div className="pb-1 sm:pb-2">
                <p className="text-xs font-bold text-white/50 sm:text-sm">
                  {selected.year} · {selected.genres.join(" / ")}
                </p>
                <h2 className="mt-1.5 text-2xl font-black tracking-tight sm:mt-2 sm:text-4xl">
                  {selected.title}
                </h2>
                <p className="mt-2 inline-flex rounded-full bg-emerald-300 px-3 py-1 text-sm font-black text-black">
                  {selected.rating} ZTube
                </p>
              </div>
            </div>
            <p className="mt-5 text-base leading-7 text-white/75 sm:mt-6 sm:text-lg sm:leading-8">{selected.description}</p>
            <button
              onClick={() => onWatch(selected)}
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
  );
}
