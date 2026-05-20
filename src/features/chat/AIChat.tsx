import Image from "next/image";
import { Movie } from "@/types";
import { Icon } from "@/components/Icon";
import { useEffect, useRef } from "react";

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
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [props.messages, props.thinking, props.chatSuggestions]);

  if (!props.isVisible) return null;

  const hasChatStarted = props.messages.length > 0;

  return (
    <section className="relative z-10 flex min-h-svh flex-col pb-28">
      <div ref={scrollRef} className="flex-1 space-y-6 overflow-y-auto px-4 pb-6 pt-28 scroll-smooth">
        {!hasChatStarted && (
          <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
            <div className="text-center mt-6">
              <h1 className="text-3xl font-black tracking-tight bg-gradient-to-br from-white to-white/40 bg-clip-text text-transparent">
                What are you in the mood for?
              </h1>
              <p className="mt-2 text-sm text-white/50">
                Describe a feeling, an actor, or a genre.
              </p>
            </div>

            <div className="flex flex-wrap justify-center gap-2 px-2">
              {props.prompts.map((prompt) => (
                <button
                  key={prompt}
                  onClick={() => props.ask(prompt)}
                  className="rounded-full border border-white/10 bg-white/5 px-4 py-2.5 text-sm font-medium text-white/80 backdrop-blur-xl transition hover:bg-white/10 active:scale-95"
                >
                  {prompt}
                </button>
              ))}
            </div>

            <div className="space-y-4 pt-4">
              <div className="flex items-center justify-between px-2">
                <p className="text-xs font-bold uppercase tracking-widest text-white/40">
                  Trending Now
                </p>
              </div>
              <div className="flex gap-4 overflow-x-auto pb-4 snap-x snap-mandatory">
                {props.recommendations.map((movie) => (
                  <button
                    key={movie.id}
                    onClick={() => props.openDetails(movie)}
                    className="group relative h-[22rem] w-60 shrink-0 snap-start overflow-hidden rounded-[2rem] text-left shadow-2xl transition duration-500 hover:scale-[1.02] active:scale-[0.98]"
                  >
                    <Image
                      src={movie.poster}
                      alt=""
                      fill
                      sizes="240px"
                      className="object-cover transition duration-700 group-hover:scale-105"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent" />
                    <div className="absolute inset-x-0 bottom-0 p-5">
                      <div className="mb-3 inline-flex rounded-full bg-purple-500/90 px-2.5 py-1 text-xs font-black text-white shadow-lg shadow-purple-500/20 backdrop-blur-md">
                        {movie.rating} ZTube
                      </div>
                      <h3 className="text-2xl font-black leading-tight text-white">{movie.title}</h3>
                      <div className="mt-3 flex gap-2 overflow-hidden">
                        {movie.genres.map((genre) => (
                          <span key={genre} className="rounded-full bg-white/20 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-white backdrop-blur-md">
                            {genre}
                          </span>
                        ))}
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {props.messages.map((message, index) => (
          <div
            key={`${message.role}-${index}`}
            className={`flex w-full ${message.role === "user" ? "justify-end" : "justify-start"} animate-in fade-in slide-in-from-bottom-2`}
          >
            <div
              className={`relative max-w-[85%] rounded-[2rem] px-5 py-4 text-[15px] leading-relaxed shadow-2xl backdrop-blur-2xl ${
                message.role === "user"
                  ? "bg-gradient-to-br from-white to-gray-200 text-black rounded-br-sm"
                  : "bg-white/10 text-white/90 border border-white/10 rounded-bl-sm"
              }`}
            >
              {message.role === "ai" && (
                <div className="absolute -left-2 -top-2 grid h-6 w-6 place-items-center rounded-full bg-purple-500 shadow-lg">
                  <Icon name="spark" />
                </div>
              )}
              {message.text}
            </div>
          </div>
        ))}

        {props.thinking && (
          <div className="flex w-full justify-start animate-in fade-in">
            <div className="relative max-w-[85%] rounded-[2rem] rounded-bl-sm border border-white/10 bg-white/5 px-5 py-4 text-sm text-white/60 shadow-xl backdrop-blur-2xl">
              <div className="flex items-center gap-2">
                <span className="flex gap-1">
                  <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-purple-400"></span>
                  <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-purple-400 [animation-delay:0.2s]"></span>
                  <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-purple-400 [animation-delay:0.4s]"></span>
                </span>
                <span className="ml-2 font-medium">Curating your movies...</span>
              </div>
            </div>
          </div>
        )}

        {hasChatStarted && props.chatSuggestions.length > 0 && !props.thinking && (
          <div className="space-y-4 pt-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <p className="px-2 text-xs font-bold uppercase tracking-widest text-purple-300/60">
              Recommended
            </p>
            <div className="grid gap-3 sm:grid-cols-2">
              {props.chatSuggestions.map((movie) => (
                <div
                  key={`suggestion-${movie.id}`}
                  className="group relative flex gap-4 rounded-[1.75rem] border border-white/5 bg-white/5 p-3 shadow-xl transition hover:bg-white/10 hover:shadow-purple-500/10"
                >
                  <div className="relative h-32 w-24 shrink-0 overflow-hidden rounded-2xl shadow-lg">
                    <Image
                      src={movie.poster}
                      alt=""
                      fill
                      sizes="96px"
                      className="object-cover transition duration-500 group-hover:scale-105"
                    />
                  </div>
                  <div className="flex min-w-0 flex-1 flex-col py-1">
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0">
                        <h3 className="truncate text-[17px] font-black text-white">{movie.title}</h3>
                        <p className="mt-0.5 truncate text-xs font-medium text-white/50">
                          {movie.year} · {movie.genres[0]}
                        </p>
                      </div>
                      <span className="shrink-0 rounded-full bg-purple-500/20 px-2 py-1 text-[10px] font-black text-purple-300">
                        {movie.rating}
                      </span>
                    </div>
                    <p className="mt-2 line-clamp-2 text-[13px] leading-snug text-white/70">{movie.why}</p>
                    <div className="mt-auto flex gap-2 pt-3">
                      <button
                        onClick={() => props.handleWatch(movie)}
                        className="flex flex-1 items-center justify-center gap-1.5 rounded-full bg-white px-3 py-2 text-xs font-black text-black shadow-lg transition active:scale-95"
                      >
                        <Icon name="play" /> Watch
                      </button>
                      <button
                        onClick={() => props.openDetails(movie)}
                        className="flex flex-1 items-center justify-center rounded-full border border-white/20 bg-black/40 px-3 py-2 text-xs font-bold text-white transition hover:bg-white/10 active:scale-95"
                      >
                        Details
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      <div className="fixed inset-x-0 bottom-6 z-20 px-4">
        {(props.input.trim().length >= 2 || props.isLoadingSuggestions) && (
          <div className="mx-auto mb-3 max-h-[42svh] max-w-xl overflow-y-auto rounded-[1.5rem] border border-white/10 bg-black/80 p-2 shadow-2xl shadow-black backdrop-blur-3xl">
            {props.isLoadingSuggestions && (
              <div className="px-4 py-3 text-sm font-medium text-white/50">
                Searching ZTube...
              </div>
            )}
            {!props.isLoadingSuggestions && props.liveSuggestions.length === 0 && (
              <div className="px-4 py-3 text-sm font-medium text-white/50">
                No matching movies found
              </div>
            )}
            {props.liveSuggestions.map((movie) => (
              <div
                key={`live-${movie.id}`}
                className="group flex items-center gap-3 rounded-xl p-2 transition hover:bg-white/10"
              >
                <div className="relative h-14 w-10 shrink-0 overflow-hidden rounded-lg shadow-md">
                  <Image
                    src={movie.poster}
                    alt=""
                    fill
                    sizes="40px"
                    className="object-cover transition group-hover:scale-105"
                  />
                </div>
                <button
                  type="button"
                  onClick={() => {
                    props.openDetails(movie);
                    props.setInput("");
                    props.setLiveSuggestions([]);
                  }}
                  className="min-w-0 flex-1 text-left"
                >
                  <p className="truncate text-[15px] font-bold text-white">{movie.title}</p>
                  <p className="mt-0.5 truncate text-xs font-medium text-white/50">
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
                  className="rounded-full bg-purple-500 px-4 py-2 text-xs font-black text-white shadow-lg transition hover:bg-purple-400 active:scale-95"
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
          className="mx-auto flex max-w-xl items-center gap-2 rounded-full border border-white/20 bg-black/60 p-2 shadow-2xl shadow-purple-900/20 backdrop-blur-3xl focus-within:border-purple-500/50 focus-within:shadow-purple-500/20 transition-all duration-300"
        >
          <input
            value={props.input}
            onChange={(event) => props.setInput(event.target.value)}
            placeholder="Search movie name, actor name, or describe something..."
            className="min-w-0 flex-1 bg-transparent px-4 py-3 text-[15px] font-medium text-white outline-none placeholder:text-white/40"
          />
          <button 
            type="submit"
            disabled={!props.input.trim() && !props.thinking}
            className="grid h-12 w-12 place-items-center rounded-full bg-white text-black shadow-lg transition active:scale-90 disabled:opacity-50 disabled:active:scale-100"
          >
            <Icon name="send" />
          </button>
        </form>
      </div>
    </section>
  );
}
