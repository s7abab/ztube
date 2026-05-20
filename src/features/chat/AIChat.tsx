import Image from "next/image";
import { Movie } from "@/types";
import { Icon } from "@/components/Icon";

interface AIChatProps {
  tmdbStatus: string;
  prompts: string[];
  ask: (prompt?: string) => void;
  messages: { role: string; text: string }[];
  thinking: boolean;
  recommendations: Movie[];
  openDetails: (movie: Movie) => void;
  chatSuggestions: Movie[];
  handleWatch: (movie: Movie) => void;
  input: string;
  setInput: (input: string) => void;
  isLoadingSuggestions: boolean;
  liveSuggestions: Movie[];
  setLiveSuggestions: (suggestions: Movie[]) => void;
  isVisible: boolean;
}

export function AIChat(props: AIChatProps) {
  if (!props.isVisible) return null;

  return (
    <section className="relative z-10 flex min-h-svh flex-col pb-28">
      <div className="sticky top-0 z-10 border-b border-white/10 bg-black/30 px-5 pb-4 pt-24 backdrop-blur-2xl">
        <div className="flex items-center gap-3">
          <div className="ai-orb grid h-11 w-11 place-items-center rounded-full">
            <Icon name="spark" />
          </div>
          <div>
            <p className="text-xs font-semibold uppercase tracking-[.28em] text-white/45">
              {props.tmdbStatus === "live" ? "ZTube AI assistant" : "AI Movie Assistant"}
            </p>
            <h2 className="text-xl font-black tracking-tight">Ask for a feeling</h2>
          </div>
        </div>
      </div>

      <div className="flex-1 space-y-5 overflow-y-auto px-4 py-5">
        <div className="flex gap-2 overflow-x-auto pb-1">
          {props.prompts.map((prompt) => (
            <button
              key={prompt}
              onClick={() => props.ask(prompt)}
              className="shrink-0 rounded-full border border-white/10 bg-white/8 px-4 py-2 text-sm text-white/78 backdrop-blur-xl transition active:scale-95"
            >
              {prompt}
            </button>
          ))}
        </div>

        {props.messages.map((message, index) => (
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

        {props.thinking && (
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
            {props.recommendations.map((movie) => (
              <button
                key={movie.id}
                onClick={() => props.openDetails(movie)}
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
                    {movie.rating} ZTube
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
            {props.chatSuggestions.map((movie) => (
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
                        {movie.year} · {movie.genres.join(" / ")} · {movie.rating} ZTube
                      </p>
                    </div>
                    <span className="shrink-0 rounded-full bg-emerald-300 px-2 py-1 text-xs font-black text-black">
                      {movie.rating}
                    </span>
                  </div>
                  <p className="mt-2 line-clamp-2 text-sm leading-5 text-white/68">{movie.why}</p>
                  <div className="mt-3 flex gap-2">
                    <button
                      onClick={() => props.handleWatch(movie)}
                      className="rounded-full bg-white px-4 py-2 text-xs font-black text-black transition active:scale-95"
                    >
                      <span className="inline-flex items-center gap-1.5">
                        <Icon name="play" /> Watch
                      </span>
                    </button>
                    <button
                      onClick={() => props.openDetails(movie)}
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

      <div className="fixed inset-x-0 bottom-6 z-20 px-4">
        {(props.input.trim().length >= 2 || props.isLoadingSuggestions) && (
          <div className="mx-auto mb-3 max-h-[42svh] max-w-xl overflow-y-auto rounded-[1.5rem] border border-white/12 bg-black/65 p-2 shadow-2xl shadow-black/60 backdrop-blur-2xl">
            {props.isLoadingSuggestions && (
              <div className="px-3 py-2 text-xs font-semibold text-white/50">
                Searching ZTube...
              </div>
            )}
            {!props.isLoadingSuggestions && props.liveSuggestions.length === 0 && (
              <div className="px-3 py-2 text-xs font-semibold text-white/50">
                No suggestions found
              </div>
            )}
            {props.liveSuggestions.map((movie) => (
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
                    props.openDetails(movie);
                    props.setInput("");
                    props.setLiveSuggestions([]);
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
                    props.handleWatch(movie);
                    props.setInput("");
                    props.setLiveSuggestions([]);
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
            props.ask();
          }}
          className="mx-auto flex max-w-xl items-center gap-2 rounded-full border border-white/12 bg-black/45 p-2 shadow-2xl shadow-black/50 backdrop-blur-2xl"
        >
          <input
            value={props.input}
            onChange={(event) => props.setInput(event.target.value)}
            placeholder="Ask for movies by mood, vibe, actor..."
            className="min-w-0 flex-1 bg-transparent px-4 py-3 text-sm text-white outline-none placeholder:text-white/36"
          />
          <button className="grid h-11 w-11 place-items-center rounded-full bg-white text-black transition active:scale-90">
            <Icon name="send" />
          </button>
        </form>
      </div>
    </section>
  );
}
