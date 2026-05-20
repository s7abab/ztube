import { Movie } from "@/types";
import { Icon } from "@/components/Icon";

interface VidkingPlayerProps {
  watching: Movie;
  onClose: () => void;
}

export function VidkingPlayer({ watching, onClose }: VidkingPlayerProps) {
  return (
    <div className="fixed inset-0 z-[60] bg-black">
      <iframe
        src={`https://www.vidking.net/embed/${watching.type}/${watching.id}${watching.type === "tv" ? "/1/1" : ""}?color=a855f7&autoPlay=true&nextEpisode=true&episodeSelector=true`}
        title={`Watch ${watching.title}`}
        allow="autoplay; fullscreen; encrypted-media; picture-in-picture"
        allowFullScreen
        className="h-full w-full border-0"
      />
      <button
        onClick={onClose}
        className="fixed right-4 top-10 sm:right-8 sm:top-8 z-20 grid h-11 w-11 place-items-center rounded-full border border-white/15 bg-black/55 text-white shadow-2xl backdrop-blur-xl"
        aria-label="Close movie player"
      >
        <Icon name="x" />
      </button>
    </div>
  );
}
