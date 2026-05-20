import {
  Play,
  Sparkles,
  Heart,
  Share2,
  Bookmark,
  Film,
  MessageCircle,
  Send,
  X,
  Volume2,
  VolumeX,
  Zap,
} from "lucide-react";

export function Icon({
  name,
}: {
  name: "play" | "spark" | "heart" | "share" | "bookmark" | "film" | "chat" | "send" | "x" | "sound" | "mute" | "zap";
}) {
  const common = "h-5 w-5";
  
  switch (name) {
    case "play":
      return <Play className={common} />;
    case "spark":
      return <Sparkles className={common} />;
    case "heart":
      return <Heart className={common} />;
    case "share":
      return <Share2 className={common} />;
    case "bookmark":
      return <Bookmark className={common} />;
    case "film":
      return <Film className={common} />;
    case "chat":
      return <MessageCircle className={common} />;
    case "send":
      return <Send className={common} />;
    case "x":
      return <X className={common} />;
    case "sound":
      return <Volume2 className={common} />;
    case "mute":
      return <VolumeX className={common} />;
    case "zap":
      return <Zap className={common} />;
    default:
      return null;
  }
}
