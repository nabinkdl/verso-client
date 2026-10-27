import { ReactNode } from "react";
import { X } from "lucide-react";

interface DialogProps {
  open: boolean;
  onClose: () => void;
  children: ReactNode;
  width?: number;
  showClose?: boolean;
  variant?: "bottom" | "center";
}

export default function Dialog({
  open,
  onClose,
  children,
  width = 460,
  showClose = true,
  variant = "bottom",
}: DialogProps) {
  if (!open) return null;

  return (
    <div
      onClick={onClose}
      style={{
        position: "absolute",
        inset: 0,
        zIndex: 200,
        background: "rgba(0,0,0,0.75)",
        backdropFilter: "blur(12px)",
        WebkitBackdropFilter: "blur(12px)",
        display: "flex",
        animation: "dialogFade 0.2s ease",
      }}
    >
      <style>
        {`
          @keyframes dialogFade {
            from { opacity: 0; }
            to { opacity: 1; }
          }
          @keyframes dialogSlideUp {
            from { transform: translateY(40px); opacity: 0; }
            to { transform: translateY(0); opacity: 1; }
          }
          @keyframes dialogPop {
            from { transform: scale(0.95); opacity: 0; }
            to { transform: scale(1); opacity: 1; }
          }
        `}
      </style>

      {variant === "bottom" ? (
        <div
          onClick={(e) => e.stopPropagation()}
          style={{
            position: "absolute",
            bottom: 0,
            left: 0,
            right: 0,
            background: "var(--bg-app)",
            borderTopLeftRadius: 28,
            borderTopRightRadius: 28,
            border: "1px solid var(--border-subtle)",
            borderBottom: "none",
            maxWidth: width,
            margin: "0 auto",
            width: "100%",
            maxHeight: "92%",
            display: "flex",
            flexDirection: "column",
            animation: "dialogSlideUp 0.28s cubic-bezier(0.32, 0.72, 0, 1)",
            overflow: "hidden",
          }}
        >
          {showClose && (
            <button
              onClick={onClose}
              aria-label="Close dialog"
              style={{
                position: "absolute",
                top: 14,
                right: 14,
                width: 36,
                height: 36,
                borderRadius: 12,
                background: "var(--surface-subtle)",
                border: "1px solid var(--border-subtle)",
                color: "var(--text-muted)",
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                zIndex: 10,
                transition: "all 0.2s",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = "var(--surface-hover)";
                e.currentTarget.style.color = "var(--text)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = "var(--surface-subtle)";
                e.currentTarget.style.color = "var(--text-muted)";
              }}
            >
              <X size={18} />
            </button>
          )}
          {children}
        </div>
      ) : (
        <div
          onClick={(e) => e.stopPropagation()}
          style={{
            margin: "auto",
            background: "var(--bg-app)",
            borderRadius: 24,
            border: "1px solid var(--border-subtle)",
            maxWidth: width,
            width: "90%",
            display: "flex",
            flexDirection: "column",
            animation: "dialogPop 0.22s cubic-bezier(0.32, 0.72, 0, 1)",
            position: "relative",
            maxHeight: "90%",
            overflow: "auto",
          }}
        >
          {showClose && (
            <button
              onClick={onClose}
              aria-label="Close dialog"
              style={{
                position: "absolute",
                top: 14,
                right: 14,
                width: 36,
                height: 36,
                borderRadius: 12,
                background: "var(--surface-subtle)",
                border: "1px solid var(--border-subtle)",
                color: "var(--text-muted)",
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                zIndex: 10,
                transition: "all 0.2s",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = "var(--surface-hover)";
                e.currentTarget.style.color = "var(--text)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = "var(--surface-subtle)";
                e.currentTarget.style.color = "var(--text-muted)";
              }}
            >
              <X size={18} />
            </button>
          )}
          {children}
        </div>
      )}
    </div>
  );
}
