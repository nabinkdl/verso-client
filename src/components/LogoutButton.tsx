import { LogOut } from "lucide-react";

interface LogoutButtonProps {
  onLogout: () => void;
}

export default function LogoutButton({ onLogout }: LogoutButtonProps) {
  return (
    <button
      onClick={onLogout}
      style={{
        position: "absolute",
        top: 16,
        right: 16,
        display: "flex",
        alignItems: "center",
        gap: 6,
        padding: "8px 12px",
        backgroundColor: "var(--accent)",
        border: "none",
        borderRadius: 6,
        color: "var(--text)",
        fontSize: 12,
        fontWeight: 600,
        cursor: "pointer",
        transition: "color 0.2s",
        zIndex: 10,
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.color = "var(--danger)";
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.color = "var(--text)";
      }}
      title="Sign out"
    >
      <LogOut size={14} />
      <span>Logout</span>
    </button>
  );
}
