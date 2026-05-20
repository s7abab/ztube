import { create } from "zustand";
import { Movie } from "@/types";

interface AppState {
  tab: "reels" | "chat";
  setTab: (tab: "reels" | "chat") => void;
  movies: Movie[];
  setMovies: (movies: Movie[] | ((prev: Movie[]) => Movie[])) => void;
  active: number;
  setActive: (active: number) => void;
  chatSuggestions: Movie[];
  setChatSuggestions: (chatSuggestions: Movie[] | ((prev: Movie[]) => Movie[])) => void;
  messages: { role: "user" | "ai"; text: string }[];
  setMessages: (messages: { role: "user" | "ai"; text: string }[] | ((prev: { role: "user" | "ai"; text: string }[]) => { role: "user" | "ai"; text: string }[])) => void;
  liveSuggestions: Movie[];
  setLiveSuggestions: (liveSuggestions: Movie[]) => void;
  thinking: boolean;
  setThinking: (thinking: boolean) => void;
  tmdbStatus: "missing-key" | "live" | "fallback";
  setTmdbStatus: (status: "missing-key" | "live" | "fallback") => void;
  isLoadingMoreReels: boolean;
  setIsLoadingMoreReels: (isLoading: boolean) => void;
  hasMoreReels: boolean;
  setHasMoreReels: (hasMore: boolean) => void;
  tmdbPage: number;
  setTmdbPage: (page: number) => void;
}

export const useAppStore = create<AppState>((set) => ({
  tab: "reels",
  setTab: (tab) => set({ tab }),
  movies: [],
  setMovies: (updater) => set((state) => ({ movies: typeof updater === "function" ? updater(state.movies) : updater })),
  active: 0,
  setActive: (active) => set({ active }),
  chatSuggestions: [],
  setChatSuggestions: (updater) => set((state) => ({ chatSuggestions: typeof updater === "function" ? updater(state.chatSuggestions) : updater })),
  messages: [],
  setMessages: (updater) => set((state) => ({ messages: typeof updater === "function" ? updater(state.messages) : updater })),
  liveSuggestions: [],
  setLiveSuggestions: (liveSuggestions) => set({ liveSuggestions }),
  thinking: false,
  setThinking: (thinking) => set({ thinking }),
  tmdbStatus: "live",
  setTmdbStatus: (tmdbStatus) => set({ tmdbStatus }),
  isLoadingMoreReels: false,
  setIsLoadingMoreReels: (isLoadingMoreReels) => set({ isLoadingMoreReels }),
  hasMoreReels: true,
  setHasMoreReels: (hasMoreReels) => set({ hasMoreReels }),
  tmdbPage: 1,
  setTmdbPage: (tmdbPage) => set({ tmdbPage }),
}));
