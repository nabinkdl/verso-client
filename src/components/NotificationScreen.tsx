import {
  Bell,
  Heart,
  MessageCircle,
  UserPlus,
  Clapperboard,
} from "lucide-react";
import { NotificationItem } from "../types";

interface NotificationScreenProps {
  notifications: NotificationItem[];
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
      <div>
        <h2 style={{ fontWeight: 800, fontSize: 22, margin: 0 }}>
          notifications
        </h2>
        <div style={{ fontSize: 12, color: "#777", marginTop: 4 }}>
          recent activity and updates
        </div>
      </div>

      {notifications.map((notification) => {
        const Icon = ICONS[notification.kind];
        return (
          <div
            key={notification.id}
            style={{
              display: "flex",
              gap: 12,
              background: "#0c0c0c",
              borderRadius: 18,
              padding: 14,
              border: "0.5px solid #2a2a2a",
            }}
          >
            <div
              style={{
                width: 42,
                height: 42,
                borderRadius: 14,
                background: "#111",
                display: "grid",
                placeItems: "center",
                border: "0.5px solid #2c2c2c",
                flex: "0 0 auto",
              }}
            >
              <Icon size={18} />
            </div>
            <div style={{ minWidth: 0 }}>
              <div style={{ fontWeight: 700, fontSize: 14, marginBottom: 4 }}>
                {notification.title}
              </div>
              <div style={{ fontSize: 13, color: "#9b9b9b", lineHeight: 1.45 }}>
                {notification.message}
              </div>
            </div>
          </div>
        );
      })}

      {notifications.length === 0 && (
        <div style={{ color: "#666", textAlign: "center", marginTop: 40 }}>
          no notifications yet
        </div>
      )}
    </div>
  );
}
