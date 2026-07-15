import {
  Bell,
  Heart,
  MessageCircle,
  UserPlus,
  Clapperboard,
  X,
} from "lucide-react";
import { NotificationItem } from "../types";

interface NotificationScreenProps {
  notifications: NotificationItem[];
  onClose: () => void;
}

const ICONS = {
  like: Heart,
  comment: MessageCircle,
  follow: UserPlus,
  post: Bell,
  reel: Clapperboard,
} as const;

export default function NotificationScreen({
  notifications,
  onClose,
}: NotificationScreenProps) {
  return (
    <div
      style={{
        flex: 1,
        overflowY: "auto",
        padding: 16,
        display: "flex",
        flexDirection: "column",
        gap: 14,
      }}
    >
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
        <div>
          <h2 style={{ fontWeight: 800, fontSize: 22, margin: 0 }}>
            notifications
          </h2>
          <div style={{ fontSize: 12, color: "var(--text-secondary)", marginTop: 4 }}>
            recent activity and updates
          </div>
        </div>
        <button onClick={onClose} style={{ background: "none", border: "none", color: "var(--text)", cursor: "pointer", padding: 4 }}>
          <X size={20} />
        </button>
      </div>

      {notifications.map((notification) => {
        const Icon = ICONS[notification.kind];
        return (
          <div
            key={notification.id}
            style={{
              display: "flex",
              gap: 12,
              background: "var(--bg-card)",
              borderRadius: 18,
              padding: 14,
              border: "0.5px solid var(--border)",
            }}
          >
            <div
              style={{
                width: 42,
                height: 42,
                borderRadius: 14,
                background: "var(--bg-card)",
                display: "grid",
                placeItems: "center",
                border: "0.5px solid var(--border)",
                flex: "0 0 auto",
              }}
            >
              <Icon size={18} />
            </div>
            <div style={{ minWidth: 0 }}>
              <div style={{ fontWeight: 700, fontSize: 14, marginBottom: 4 }}>
                {notification.title}
              </div>
              <div style={{ fontSize: 13, color: "var(--text-secondary)", lineHeight: 1.45 }}>
                {notification.message}
              </div>
            </div>
          </div>
        );
      })}

      {notifications.length === 0 && (
        <div style={{ color: "var(--text-secondary)", textAlign: "center", marginTop: 40 }}>
          no notifications yet
        </div>
      )}
    </div>
  );
}
