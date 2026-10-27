import { Home, MessageCircle, User, PlaySquare, Layers, type LucideIcon } from "lucide-react";
import { Screen } from "../types";

interface BottomNavProps {
  active: Screen;
  onChange: (screen: Screen) => void;
}

const ITEMS: {
  screen: Screen;
  Icon: LucideIcon;
}[] = [
    { screen: "home", Icon: Home },
    { screen: "pages", Icon: Layers },
    { screen: "reels", Icon: PlaySquare },
    { screen: "chat", Icon: MessageCircle },
    { screen: "profile", Icon: User },
  ];

export default function BottomNav({ active, onChange }: BottomNavProps) {
  return (
    <div
      style={{
        display: "flex",
        justifyContent: "space-around",
        alignItems: "center",
        padding: "12px 16px 18px",
        background: "var(--bg)",
        borderTop: "0.5px solid var(--border-2)",
      }}
    >
      {ITEMS.map(({ screen, Icon }) => (
        <button
          key={screen}
          onClick={() => onChange(screen)}
          style={{
            background: "none",
            border: "none",
            color: active === screen ? "var(--text)" : "var(--text-tertiary)",
            cursor: "pointer",
            padding: 6,
            display: "flex",
            alignItems: "center",
            transition: "color 0.15s",
          }}
        >
          <Icon size={24} strokeWidth={active === screen ? 2.5 : 1.5} />
        </button>
      ))}
    </div>
  );
}
