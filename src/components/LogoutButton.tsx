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
        backgroundColor: "#3b82f6",
        border: "none",
        borderRadius: 6,
        color: "#fff",
        fontSize: 12,
        fontWeight: 600,
        cursor: "pointer",
        transition: "background-color 0.2s",
        zIndex: 10,
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.backgroundColor = "#2563eb";
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.backgroundColor = "#3b82f6";
      }}
      title="Sign out"
    >
      <LogOut size={14} />
      <span>Logout</span>
    </button>
  );
}
