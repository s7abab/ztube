import { Movie } from "@/types";

export const fallbackMovies: Movie[] = [
  {
    id: 1,
    type: "movie",
    title: "Dune: Part Two",
    year: "2024",
    genres: ["Sci-Fi", "Adventure"],
    rating: "8.5",
    popularity: "946.4",
    hook: "A desert prophecy turns into a war you can feel in your chest.",
    description:
      "Paul Atreides unites with Chani and the Fremen while seeking revenge against the conspirators who destroyed his family.",
    poster:
      "https://image.tmdb.org/t/p/w500/1pdfLvkbY9ohJlCjQH2CZjjYVvJ.jpg",
    backdrop:
      "https://image.tmdb.org/t/p/original/xOMo8BRK7PfcJv9JCnx7s5hj0PX.jpg",
    trailer:
      "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerMeltdowns.mp4",
    providers: ["Max", "Prime vibe", "Apple TV"],
    cast: ["Timothee Chalamet", "Zendaya", "Rebecca Ferguson", "Javier Bardem"],
    why: "Epic scale, political tension, and dreamlike sci-fi imagery make it perfect for immersive discovery.",
    similar: ["Blade Runner 2049", "Arrival", "Mad Max: Fury Road"],
  },
  {
    id: 2,
    type: "movie",
    title: "Challengers",
    year: "2024",
    genres: ["Drama", "Romance"],
    rating: "7.1",
    popularity: "412.7",
    hook: "A love triangle scored like a championship point.",
    description:
      "A former tennis prodigy turned coach transforms her husband into a champion, until the past walks onto the court.",
    poster:
      "https://image.tmdb.org/t/p/w500/H6vke7zGiuLsz4v4RPeReb9rsv.jpg",
    backdrop:
      "https://image.tmdb.org/t/p/original/4CcUgdiGe83MeqJW1NyJVmZqRrF.jpg",
    trailer:
      "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4",
    providers: ["MGM+", "Prime vibe", "Rental"],
    cast: ["Zendaya", "Josh O'Connor", "Mike Faist"],
    why: "Sharp chemistry, kinetic editing, and stylish tension make it feel like a pop-cultural pressure cooker.",
    similar: ["Match Point", "Past Lives", "The Social Network"],
  },
  {
    id: 3,
    type: "movie",
    title: "Civil War",
    year: "2024",
    genres: ["War", "Thriller"],
    rating: "6.9",
    popularity: "388.1",
    hook: "A road trip through the sound of a collapsing country.",
    description:
      "A group of journalists travel across a fractured America while racing toward Washington, D.C.",
    poster:
      "https://image.tmdb.org/t/p/w500/sh7Rg8Er3tFcN9BpKIPOMvALgZd.jpg",
    backdrop:
      "https://image.tmdb.org/t/p/original/z121dSTR7PY9KxKuvwiIFSYW8cf.jpg",
    trailer:
      "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/Sintel.mp4",
    providers: ["Max vibe", "A24", "Apple TV"],
    cast: ["Kirsten Dunst", "Wagner Moura", "Cailee Spaeny"],
    why: "A tense, image-first thriller with atmosphere, dread, and documentary-like immediacy.",
    similar: ["Children of Men", "Nightcrawler", "Zero Dark Thirty"],
  },
  {
    id: 4,
    type: "movie",
    title: "The Creator",
    year: "2023",
    genres: ["Sci-Fi", "Action"],
    rating: "7.0",
    popularity: "295.9",
    hook: "A human heart trapped inside a machine-war fairytale.",
    description:
      "An ex-special forces agent is recruited to hunt down the architect of advanced AI and the weapon that could end war.",
    poster:
      "https://image.tmdb.org/t/p/w500/vBZ0qvaRxqEhZwl6LWmruJqWE8Z.jpg",
    backdrop:
      "https://image.tmdb.org/t/p/original/iIvQnZyzgx9TkbrOgcXx0p7aLiq.jpg",
    trailer:
      "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/TearsOfSteel.mp4",
    providers: ["Hulu", "Disney+ vibe", "Rental"],
    cast: ["John David Washington", "Madeleine Yuna Voyles", "Gemma Chan"],
    why: "Big tactile sci-fi images, emotional AI themes, and grounded spectacle fit conversational recommendations.",
    similar: ["Ex Machina", "District 9", "Rogue One"],
  },
];

export const tmdbGenreMap = new Map([
  [12, "Adventure"],
  [14, "Fantasy"],
  [16, "Animation"],
  [18, "Drama"],
  [27, "Horror"],
  [28, "Action"],
  [35, "Comedy"],
  [36, "History"],
  [37, "Western"],
  [53, "Thriller"],
  [80, "Crime"],
  [99, "Documentary"],
  [878, "Sci-Fi"],
  [9648, "Mystery"],
  [10402, "Music"],
  [10749, "Romance"],
  [10751, "Family"],
  [10752, "War"],
  [10770, "TV Movie"],
]);

export const prompts = [
  "Mind bending sci-fi",
  "Movies like Interstellar",
  "Best Korean thrillers",
  "Underrated A24 movies",
  "Feel-good movies for night",
];
